import { Router } from 'express';
import { db, OrderRecord, OrderItemRecord, OrderStatusHistoryRecord, OrderStatus } from '../db';
import { authenticate, requireRole, AuthenticatedRequest } from '../auth';
import { z } from 'zod';

const router = Router();

const orderItemInputSchema = z.object({
  productId: z.string().min(1, 'ต้องระบุรหัสสินค้า'),
  quantity: z.number().positive('จำนวนสินค้าต้องมากกว่า 0'),
});

const createOrderSchema = z.object({
  items: z.array(orderItemInputSchema).min(1, 'กรุณาเลือกสินค้าอย่างน้อย 1 รายการ'),
  note: z.string().optional().default(''),
  pickupDate: z.string().optional(),
});

// POST /api/orders (Create order with atomic stock check & transaction)
router.post('/', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const parseResult = createOrderSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues[0].message });
    }

    const { items: rawItems, note, pickupDate } = parseResult.data;
    const userId = req.user!.userId;
    const user = db.getUsers().find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลผู้ใช้งาน' });
    }

    // Execute atomic transaction
    const createdOrder = await db.transaction(async () => {
      const allProducts = db.getProducts();
      const validatedItems: {
        product: typeof allProducts[0];
        quantity: number;
        subtotal: number;
      }[] = [];

      let orderSubtotal = 0;

      // 1. Validate all products and stock availability
      for (const item of rawItems) {
        const product = allProducts.find((p) => p.id === item.productId);
        if (!product) {
          throw new Error(`ไม่พบสินค้าผลไม้รหัส ${item.productId} ในระบบ`);
        }

        if (!product.isAvailable) {
          throw new Error(`สินค้า "${product.name}" ปิดการจำหน่ายชั่วคราว`);
        }

        const qty = Math.round(item.quantity * 100) / 100;
        if (product.stock < qty) {
          throw new Error(
            `สินค้า "${product.name}" มีสต็อกคงเหลือ ${product.stock} ${product.unit} (ไม่เพียงพอสำหรับจำนวน ${qty} ${product.unit})`
          );
        }

        // Server-side authoritative price calculation (Never trust client prices)
        const itemSubtotal = Math.round(product.price * qty * 100) / 100;
        orderSubtotal += itemSubtotal;

        validatedItems.push({
          product,
          quantity: qty,
          subtotal: itemSubtotal,
        });
      }

      orderSubtotal = Math.round(orderSubtotal * 100) / 100;
      const discount = 0;
      const total = orderSubtotal - discount;

      // 2. Generate atomic unique Order Number
      const orderNumber = db.getNextOrderNumber();
      const orderId = `order-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();

      // 3. Deduct stock atomically
      for (const validItem of validatedItems) {
        validItem.product.stock = Math.round((validItem.product.stock - validItem.quantity) * 100) / 100;
        validItem.product.updatedAt = now;
      }

      // 4. Create Order Record
      const newOrder: OrderRecord = {
        id: orderId,
        orderNumber,
        userId,
        status: 'PENDING',
        subtotal: orderSubtotal,
        discount,
        total,
        note: note ? note.trim() : 'สั่งจองผลไม้สดผ่านระบบ FactFruit',
        pickupDate: pickupDate || new Date(Date.now() + 24 * 3600000).toISOString(),
        createdAt: now,
        updatedAt: now,
      };

      db.getOrders().unshift(newOrder);

      // 5. Create Order Items
      const createdOrderItems: OrderItemRecord[] = [];
      for (const validItem of validatedItems) {
        const orderItem: OrderItemRecord = {
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          orderId,
          productId: validItem.product.id,
          productName: validItem.product.name,
          unitPrice: validItem.product.price,
          quantity: validItem.quantity,
          unit: validItem.product.unit,
          subtotal: validItem.subtotal,
        };
        db.getOrderItems().push(orderItem);
        createdOrderItems.push(orderItem);
      }

      // 6. Create Initial Status History
      const statusHistory: OrderStatusHistoryRecord = {
        id: `hist-${Date.now()}-1`,
        orderId,
        status: 'PENDING',
        note: 'ลูกค้าทำรายการสั่งจองผลไม้เข้าระบบ',
        changedById: userId,
        changedByName: `${user.firstName} ${user.lastName}`,
        createdAt: now,
      };
      db.getOrderStatusHistories().push(statusHistory);

      // 7. Dispatch Notifications
      // Notify Admin
      const admins = db.getUsers().filter((u) => u.role === 'ADMIN');
      for (const admin of admins) {
        db.addNotification({
          userId: admin.id,
          title: 'มีคำสั่งซื้อใหม่เข้าระบบ',
          message: `มีคำสั่งซื้อใหม่ ${orderNumber} จากคุณ ${user.firstName} ${user.lastName} ยอดรวม ฿${total.toLocaleString()}`,
          link: `/admin/orders/${orderId}`,
        });
      }

      // Notify User
      db.addNotification({
        userId,
        title: 'สั่งจองผลไม้สำเร็จ',
        message: `คำสั่งซื้อของคุณ ${orderNumber} ได้รับการบันทึกแล้ว อยู่ระหว่างรอตรวจสอบ`,
        link: `/my-orders/${orderId}`,
      });

      // 8. Audit Log
      db.addAuditLog({
        userId,
        userName: `${user.firstName} ${user.lastName}`,
        action: 'Create Order',
        entity: 'Order',
        entityId: orderId,
        description: `ลูกค้าสั่งจองผลไม้ Order: ${orderNumber} จำนวน ${validatedItems.length} รายการ ยอดรวม ฿${total}`,
      });

      return {
        ...newOrder,
        items: createdOrderItems,
        statusHistory: [statusHistory],
      };
    });

    return res.status(201).json({
      message: 'สั่งจองสินค้าเรียบร้อยแล้ว',
      order: createdOrder,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return res.status(400).json({ error: error.message || 'เกิดข้อผิดพลาดในการสั่งจองสินค้า' });
  }
});

// GET /api/orders (List orders for current user or admin)
router.get('/', authenticate, (req: AuthenticatedRequest, res) => {
  try {
    const {
      status,
      search,
      page = '1',
      limit = '20',
      startDate,
      endDate,
    } = req.query as Record<string, string>;

    const currentUser = req.user!;
    let orders = db.getOrders();
    const users = db.getUsers();
    const orderItems = db.getOrderItems();

    // If regular user: MUST ONLY see their own orders
    if (currentUser.role !== 'ADMIN') {
      orders = orders.filter((o) => o.userId === currentUser.userId);
    }

    // Status filter
    if (status && status !== 'ALL') {
      orders = orders.filter((o) => o.status === status);
    }

    // Search filter (Order number, customer name, email, phone)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      orders = orders.filter((o) => {
        const u = users.find((user) => user.id === o.userId);
        const matchNumber = o.orderNumber.toLowerCase().includes(q);
        const matchCustomer = u ? `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) : false;
        const matchEmail = u ? u.email.toLowerCase().includes(q) : false;
        const matchPhone = u ? u.phone.includes(q) : false;
        return matchNumber || matchCustomer || matchEmail || matchPhone;
      });
    }

    // Date range filter
    if (startDate) {
      orders = orders.filter((o) => new Date(o.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      orders = orders.filter((o) => new Date(o.createdAt) <= new Date(endDate));
    }

    // Sort newest first
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const total = orders.length;
    const totalPages = Math.ceil(total / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedOrders = orders.slice(startIndex, startIndex + limitNum);

    // Enrich with user and items
    const enriched = paginatedOrders.map((order) => {
      const u = users.find((user) => user.id === order.userId);
      const items = orderItems.filter((item) => item.orderId === order.id);
      return {
        ...order,
        user: u ? {
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          phone: u.phone,
        } : undefined,
        items,
      };
    });

    return res.json({
      data: enriched,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    });
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    return res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลรายการสั่งซื้อได้' });
  }
});

// GET /api/orders/:id (Detail of single order)
router.get('/:id', authenticate, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const order = db.getOrders().find((o) => o.id === id || o.orderNumber === id);

  if (!order) {
    return res.status(404).json({ error: 'ไม่พบข้อมูลคำสั่งซื้อ' });
  }

  // Access control check: User can only access their own order
  if (req.user!.role !== 'ADMIN' && order.userId !== req.user!.userId) {
    return res.status(403).json({ error: 'คุณไม่มีสิทธิ์เข้าถึงคำสั่งซื้อนี้' });
  }

  const u = db.getUsers().find((user) => user.id === order.userId);
  const items = db.getOrderItems().filter((item) => item.orderId === order.id);
  const products = db.getProducts();

  const enrichedItems = items.map((item) => ({
    ...item,
    product: products.find((p) => p.id === item.productId),
  }));

  const statusHistory = db
    .getOrderStatusHistories()
    .filter((h) => h.orderId === order.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return res.json({
    ...order,
    user: u ? {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
    } : undefined,
    items: enrichedItems,
    statusHistory,
  });
});

// PATCH /api/orders/:id/status (Admin change status)
router.patch('/:id/status', authenticate, requireRole('ADMIN'), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body as { status: OrderStatus; note?: string };

    const validStatuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'สถานะคำสั่งซื้อไม่ถูกต้อง' });
    }

    const order = db.getOrders().find((o) => o.id === id);
    if (!order) {
      return res.status(404).json({ error: 'ไม่พบคำสั่งซื้อ' });
    }

    const prevStatus = order.status;
    if (prevStatus === status) {
      return res.json({ message: 'สถานะตรงกับปัจจุบันอยู่แล้ว', order });
    }

    const adminUser = db.getUsers().find((u) => u.id === req.user!.userId);
    const now = new Date().toISOString();

    // If changing to CANCELLED, restore product stock
    if (status === 'CANCELLED' && prevStatus !== 'CANCELLED') {
      const items = db.getOrderItems().filter((item) => item.orderId === order.id);
      for (const item of items) {
        const prod = db.getProducts().find((p) => p.id === item.productId);
        if (prod) {
          prod.stock = Math.round((prod.stock + item.quantity) * 100) / 100;
          prod.updatedAt = now;
        }
      }
    }

    order.status = status;
    order.updatedAt = now;
    db.save();

    // Add Status History
    const statusNoteMap: Record<OrderStatus, string> = {
      PENDING: 'สถานะรอดำเนินการตรวจสอบ',
      CONFIRMED: 'แอดมินยืนยันคำสั่งซื้อเรียบร้อย',
      PREPARING: 'กำลังจัดเตรียมและคัดสรรผลไม้',
      READY: 'ผลไม้จัดเตรียมเสร็จแล้ว พร้อมให้มารับที่ร้าน',
      COMPLETED: 'ลูกค้ารับสินค้าเรียบร้อยแล้ว รายการเสร็จสมบูรณ์',
      CANCELLED: note || 'แอดมินยกเลิกคำสั่งซื้อ และคืนสต็อกผลไม้',
    };

    const historyRecord: OrderStatusHistoryRecord = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderId: order.id,
      status,
      note: note || statusNoteMap[status],
      changedById: req.user!.userId,
      changedByName: adminUser ? `${adminUser.firstName} ${adminUser.lastName}` : 'ผู้ดูแลระบบ',
      createdAt: now,
    };
    db.getOrderStatusHistories().push(historyRecord);

    // Notify Customer
    const statusTitles: Record<OrderStatus, string> = {
      PENDING: 'สถานะคำสั่งซื้อ: รอดำเนินการ',
      CONFIRMED: 'คำสั่งซื้อได้รับการยืนยันแล้ว!',
      PREPARING: 'กำลังจัดเตรียมผลไม้ของคุณ',
      READY: 'ผลไม้ของคุณพร้อมรับแล้ว!',
      COMPLETED: 'คำสั่งซื้อเสร็จสมบูรณ์',
      CANCELLED: 'คำสั่งซื้อถูกยกเลิก',
    };

    db.addNotification({
      userId: order.userId,
      title: statusTitles[status],
      message: `คำสั่งซื้อ ${order.orderNumber} เปลี่ยนสถานะเป็น ${status} (${statusNoteMap[status]})`,
      link: `/my-orders/${order.id}`,
    });

    // Audit log
    db.addAuditLog({
      userId: req.user!.userId,
      userName: adminUser ? `${adminUser.firstName} ${adminUser.lastName}` : 'Admin',
      action: 'Change Order Status',
      entity: 'Order',
      entityId: order.id,
      description: `เปลี่ยนสถานะออเดอร์ ${order.orderNumber} จาก ${prevStatus} เป็น ${status}`,
    });

    return res.json({
      message: `อัปเดตสถานะคำสั่งซื้อเป็น ${status} เรียบร้อยแล้ว`,
      order,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะคำสั่งซื้อ' });
  }
});

// POST /api/orders/:id/cancel (User cancel own order - allowed ONLY if status === 'PENDING')
router.post('/:id/cancel', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = db.getOrders().find((o) => o.id === id);
    if (!order) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลคำสั่งซื้อ' });
    }

    // Access control: User can only cancel their own order, Admin can also call this
    if (req.user!.role !== 'ADMIN' && order.userId !== req.user!.userId) {
      return res.status(403).json({ error: 'คุณไม่มีสิทธิ์ยกเลิกคำสั่งซื้อนี้' });
    }

    // Rule: ONLY PENDING orders can be cancelled by user
    if (order.status !== 'PENDING' && req.user!.role !== 'ADMIN') {
      return res.status(400).json({
        error: 'ไม่สามารถยกเลิกรายการนี้ได้ เนื่องจากคำสั่งซื้อได้รับการยืนยันหรืออยู่ระหว่างจัดเตรียมแล้ว',
      });
    }

    if (order.status === 'CANCELLED') {
      return res.status(400).json({ error: 'คำสั่งซื้อนี้ถูกยกเลิกไปแล้ว' });
    }

    const now = new Date().toISOString();
    const user = db.getUsers().find((u) => u.id === req.user!.userId);

    // Restore stock
    const items = db.getOrderItems().filter((item) => item.orderId === order.id);
    for (const item of items) {
      const prod = db.getProducts().find((p) => p.id === item.productId);
      if (prod) {
        prod.stock = Math.round((prod.stock + item.quantity) * 100) / 100;
        prod.updatedAt = now;
      }
    }

    order.status = 'CANCELLED';
    order.updatedAt = now;
    db.save();

    // History record
    const historyRecord: OrderStatusHistoryRecord = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderId: order.id,
      status: 'CANCELLED',
      note: reason ? `ลูกค้ายกเลิกคำสั่งซื้อ: ${reason}` : 'ลูกค้ายกเลิกคำสั่งซื้อในสถานะรอดำเนินการ',
      changedById: req.user!.userId,
      changedByName: user ? `${user.firstName} ${user.lastName}` : 'ลูกค้า',
      createdAt: now,
    };
    db.getOrderStatusHistories().push(historyRecord);

    // Notify Admin
    const admins = db.getUsers().filter((u) => u.role === 'ADMIN');
    for (const admin of admins) {
      db.addNotification({
        userId: admin.id,
        title: 'คำสั่งซื้อถูกยกเลิก',
        message: `คำสั่งซื้อ ${order.orderNumber} ถูกยกเลิกโดยลูกค้า คืนสต็อกเรียบร้อยแล้ว`,
        link: `/admin/orders/${order.id}`,
      });
    }

    // Audit log
    db.addAuditLog({
      userId: req.user!.userId,
      userName: user ? `${user.firstName} ${user.lastName}` : 'User',
      action: 'Cancel Order',
      entity: 'Order',
      entityId: order.id,
      description: `ลูกค้ายกเลิกคำสั่งซื้อ ${order.orderNumber} และคืนสต็อกผลไม้เข้าระบบ`,
    });

    return res.json({
      message: 'ยกเลิกคำสั่งซื้อและคืนสต็อกผลไม้เรียบร้อยแล้ว',
      order,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'ไม่สามารถยกเลิกคำสั่งซื้อได้' });
  }
});

export default router;
