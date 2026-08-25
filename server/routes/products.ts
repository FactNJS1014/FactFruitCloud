import { Router } from 'express';
import { db, ProductRecord } from '../db';
import { authenticate, requireRole, optionalAuth, AuthenticatedRequest } from '../auth';
import { z } from 'zod';

const router = Router();

const productSchema = z.object({
  code: z.string().min(2, 'รหัสสินค้าต้องมีอย่างน้อย 2 ตัวอักษร'),
  name: z.string().min(2, 'กรุณาระบุชื่อผลไม้'),
  description: z.string().optional().default(''),
  categoryId: z.string().min(1, 'กรุณาเลือกหมวดหมู่'),
  image: z.string().optional().default(''),
  unit: z.string().min(1, 'กรุณาระบุหน่วยสินค้า'),
  price: z.number().min(0, 'ราคาต้องไม่น้อยกว่า 0'),
  stock: z.number().min(0, 'จำนวนสต็อกต้องไม่น้อยกว่า 0'),
  minimumStock: z.number().min(0, 'สต็อกขั้นต่ำต้องไม่น้อยกว่า 0').default(5),
  isAvailable: z.boolean().default(true),
});

// GET /api/products (Public or authenticated)
router.get('/', optionalAuth, (req: AuthenticatedRequest, res) => {
  try {
    const {
      search,
      categoryId,
      availableOnly,
      unit,
      sort = 'newest',
      page = '1',
      limit = '20',
    } = req.query as Record<string, string>;

    let products = db.getProducts();

    // If client requested available only or is normal user viewing catalog
    if (availableOnly === 'true') {
      products = products.filter((p) => p.isAvailable);
    }

    // Filter by category
    if (categoryId && categoryId !== 'all') {
      products = products.filter((p) => p.categoryId === categoryId);
    }

    // Filter by unit
    if (unit && unit !== 'all') {
      products = products.filter((p) => p.unit === unit);
    }

    // Filter by search query (Code or Name)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      products = products.filter(
        (p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
      );
    }

    // Sorting
    switch (sort) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        products.sort((a, b) => a.name.localeCompare(b.name, 'th'));
        break;
      case 'stock-desc':
        products.sort((a, b) => b.stock - a.stock);
        break;
      case 'newest':
      default:
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    const categories = db.getCategories();
    const enriched = products.map((p) => ({
      ...p,
      category: categories.find((c) => c.id === p.categoryId),
    }));

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const total = enriched.length;
    const totalPages = Math.ceil(total / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedData = enriched.slice(startIndex, startIndex + limitNum);

    return res.json({
      data: paginatedData,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    });
  } catch (error: any) {
    console.error('Fetch products error:', error);
    return res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลผลไม้ได้' });
  }
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const product = db.getProducts().find((p) => p.id === id || p.code.toLowerCase() === id.toLowerCase());

  if (!product) {
    return res.status(404).json({ error: 'ไม่พบข้อมูลผลไม้ที่ต้องการ' });
  }

  const category = db.getCategories().find((c) => c.id === product.categoryId);
  return res.json({
    ...product,
    category,
  });
});

// POST /api/products (Admin Only)
router.post('/', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
  try {
    const parseResult = productSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues[0].message });
    }

    const data = parseResult.data;
    const existingCode = db.getProducts().find((p) => p.code.toUpperCase() === data.code.toUpperCase().trim());
    if (existingCode) {
      return res.status(400).json({ error: `รหัสสินค้า "${data.code}" ถูกใช้งานแล้ว` });
    }

    const now = new Date().toISOString();
    const newProduct: ProductRecord = {
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code: data.code.toUpperCase().trim(),
      name: data.name.trim(),
      description: data.description || '',
      categoryId: data.categoryId,
      image: data.image || 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80',
      unit: data.unit,
      price: Math.round(data.price * 100) / 100,
      stock: Math.round(data.stock * 100) / 100,
      minimumStock: Math.round(data.minimumStock * 100) / 100,
      isAvailable: data.isAvailable,
      createdAt: now,
      updatedAt: now,
    };

    db.getProducts().unshift(newProduct);
    db.save();

    const user = db.getUsers().find((u) => u.id === req.user?.userId);
    db.addAuditLog({
      userId: req.user?.userId,
      userName: user ? `${user.firstName} ${user.lastName}` : 'Admin',
      action: 'Create Product',
      entity: 'Product',
      entityId: newProduct.id,
      description: `เพิ่มสินค้าใหม่: ${newProduct.name} (${newProduct.code}) ราคา ฿${newProduct.price}/${newProduct.unit}`,
    });

    const category = db.getCategories().find((c) => c.id === newProduct.categoryId);
    return res.status(201).json({
      message: 'เพิ่มสินค้าผลไม้เรียบร้อยแล้ว',
      product: { ...newProduct, category },
    });
  } catch (error: any) {
    console.error('Create product error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างสินค้า' });
  }
});

// PUT /api/products/:id (Admin Only)
router.put('/:id', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const product = db.getProducts().find((p) => p.id === id);
    if (!product) {
      return res.status(404).json({ error: 'ไม่พบสินค้าที่ต้องการแก้ไข' });
    }

    const { name, description, categoryId, image, unit, price, stock, minimumStock, isAvailable } = req.body;

    if (!name || price === undefined || stock === undefined || !unit) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลสำคัญให้ครบถ้วน' });
    }

    if (Number(price) < 0 || Number(stock) < 0) {
      return res.status(400).json({ error: 'ราคาและจำนวนสต็อกต้องไม่ติดลบ' });
    }

    product.name = name.trim();
    if (description !== undefined) product.description = description;
    if (categoryId) product.categoryId = categoryId;
    if (image) product.image = image;
    product.unit = unit;
    product.price = Math.round(Number(price) * 100) / 100;
    product.stock = Math.round(Number(stock) * 100) / 100;
    if (minimumStock !== undefined) product.minimumStock = Math.round(Number(minimumStock) * 100) / 100;
    if (isAvailable !== undefined) product.isAvailable = Boolean(isAvailable);
    product.updatedAt = new Date().toISOString();

    db.save();

    const user = db.getUsers().find((u) => u.id === req.user?.userId);
    db.addAuditLog({
      userId: req.user?.userId,
      userName: user ? `${user.firstName} ${user.lastName}` : 'Admin',
      action: 'Update Product',
      entity: 'Product',
      entityId: product.id,
      description: `แก้ไขข้อมูลสินค้า: ${product.name} (${product.code})`,
    });

    const category = db.getCategories().find((c) => c.id === product.categoryId);
    return res.json({
      message: 'อัปเดตข้อมูลสินค้าเรียบร้อยแล้ว',
      product: { ...product, category },
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแก้ไขสินค้า' });
  }
});

// PATCH /api/products/:id/toggle (Admin Only)
router.patch('/:id/toggle', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const product = db.getProducts().find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'ไม่พบสินค้า' });
  }

  product.isAvailable = !product.isAvailable;
  product.updatedAt = new Date().toISOString();
  db.save();

  const user = db.getUsers().find((u) => u.id === req.user?.userId);
  db.addAuditLog({
    userId: req.user?.userId,
    userName: user ? `${user.firstName} ${user.lastName}` : 'Admin',
    action: 'Toggle Product Availability',
    entity: 'Product',
    entityId: product.id,
    description: `เปลี่ยนสถานะการจำหน่ายของ ${product.name} เป็น ${product.isAvailable ? 'เปิดขาย' : 'ปิดขาย'}`,
  });

  return res.json({
    message: `เปลี่ยนสถานะเป็น ${product.isAvailable ? 'เปิดจำหน่าย' : 'ปิดจำหน่าย'} แล้ว`,
    isAvailable: product.isAvailable,
  });
});

// DELETE /api/products/:id (Admin Only)
router.delete('/:id', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const index = db.getProducts().findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'ไม่พบสินค้า' });
  }

  const product = db.getProducts()[index];
  // Check if product was referenced in historical orders
  const hasOrders = db.getOrderItems().some((item) => item.productId === id);

  const user = db.getUsers().find((u) => u.id === req.user?.userId);

  if (hasOrders) {
    // Soft delete / disable availability to preserve order history
    product.isAvailable = false;
    product.updatedAt = new Date().toISOString();
    db.save();

    db.addAuditLog({
      userId: req.user?.userId,
      userName: user ? `${user.firstName} ${user.lastName}` : 'Admin',
      action: 'Soft Delete Product',
      entity: 'Product',
      entityId: product.id,
      description: `ปิดการจำหน่ายสินค้า ${product.name} (Soft Delete เนื่องจากมีประวัติออเดอร์)`,
    });

    return res.json({
      message: 'สินค้านี้มีประวัติคำสั่งซื้อ ระบบจึงทำการปิดการจำหน่ายแทนการลบถาวรเพื่อรักษาประวัติ',
      softDeleted: true,
    });
  } else {
    // Safe hard delete
    db.getProducts().splice(index, 1);
    db.save();

    db.addAuditLog({
      userId: req.user?.userId,
      userName: user ? `${user.firstName} ${user.lastName}` : 'Admin',
      action: 'Delete Product',
      entity: 'Product',
      entityId: id,
      description: `ลบสินค้า ${product.name} (${product.code}) ออกจากระบบ`,
    });

    return res.json({
      message: 'ลบสินค้าออกจากระบบเรียบร้อยแล้ว',
      softDeleted: false,
    });
  }
});

export default router;
