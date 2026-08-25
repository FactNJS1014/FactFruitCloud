import { Router } from 'express';
import { db } from '../db';
import { authenticate, requireRole, AuthenticatedRequest } from '../auth';

const router = Router();

// GET /api/inventory/low-stock (Admin only - must be before /:id)
router.get('/low-stock', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
  const products = db.getProducts();
  const categories = db.getCategories();

  const lowStockList = products
    .filter((p) => p.stock <= p.minimumStock)
    .map((p) => ({
      ...p,
      category: categories.find((c) => c.id === p.categoryId),
      stockStatus: p.stock <= 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
    }));

  return res.json({
    data: lowStockList,
    total: lowStockList.length,
  });
});

// GET /api/inventory/logs (Admin only - must be before /:id)
router.get('/logs', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
  const auditLogs = db.getAuditLogs();
  const inventoryLogs = auditLogs.filter(
    (l) =>
      l.entity === 'Product' ||
      l.action.toLowerCase().includes('stock') ||
      l.description.toLowerCase().includes('สต็อก')
  );

  return res.json({
    data: inventoryLogs,
    total: inventoryLogs.length,
  });
});

// GET /api/inventory (Admin only)
router.get('/', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
  const { filter, search } = req.query as { filter?: string; search?: string };
  const products = db.getProducts();
  const categories = db.getCategories();

  let list = products.map((p) => {
    let stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';
    if (p.stock <= 0) {
      stockStatus = 'OUT_OF_STOCK';
    } else if (p.stock <= p.minimumStock) {
      stockStatus = 'LOW_STOCK';
    }

    return {
      ...p,
      category: categories.find((c) => c.id === p.categoryId),
      stockStatus,
    };
  });

  if (filter === 'OUT_OF_STOCK') {
    list = list.filter((p) => p.stockStatus === 'OUT_OF_STOCK');
  } else if (filter === 'LOW_STOCK') {
    list = list.filter((p) => p.stockStatus === 'LOW_STOCK');
  } else if (filter === 'IN_STOCK') {
    list = list.filter((p) => p.stockStatus === 'IN_STOCK');
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
    );
  }

  const inStockCount = list.filter((p) => p.stockStatus === 'IN_STOCK').length;
  const lowStockCount = list.filter((p) => p.stockStatus === 'LOW_STOCK').length;
  const outOfStockCount = list.filter((p) => p.stockStatus === 'OUT_OF_STOCK').length;

  return res.json({
    data: list,
    summary: {
      total: list.length,
      inStockCount,
      lowStockCount,
      outOfStockCount,
    },
  });
});

// POST /api/inventory/:id/adjust (Admin adjust stock: RESTOCK, CORRECTION, DAMAGE)
router.post('/:id/adjust', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { type, quantity, note } = req.body as {
    type: 'RESTOCK' | 'CORRECTION' | 'DAMAGE';
    quantity: number;
    note?: string;
  };

  const product = db.getProducts().find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'ไม่พบสินค้า' });
  }

  const qty = Math.round(Number(quantity) * 100) / 100;
  if (isNaN(qty) || qty < 0) {
    return res.status(400).json({ error: 'จำนวนสินค้าต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0' });
  }

  const prevStock = product.stock;

  if (type === 'RESTOCK') {
    product.stock = Math.round((product.stock + qty) * 100) / 100;
  } else if (type === 'DAMAGE') {
    product.stock = Math.max(0, Math.round((product.stock - qty) * 100) / 100);
  } else if (type === 'CORRECTION') {
    product.stock = Math.max(0, qty);
  } else {
    return res.status(400).json({ error: 'ประเภทการปรับสต็อกไม่ถูกต้อง' });
  }

  product.updatedAt = new Date().toISOString();
  db.save();

  const user = db.getUsers().find((u) => u.id === req.user!.userId);
  const typeText =
    type === 'RESTOCK'
      ? `เติมสต็อก (+${qty} ${product.unit})`
      : type === 'DAMAGE'
      ? `ตัดจำหน่ายชำรุด (-${qty} ${product.unit})`
      : `ปรับยอดตรวจนับจริง (${product.stock} ${product.unit})`;

  db.addAuditLog({
    userId: req.user!.userId,
    userName: user ? `${user.firstName} ${user.lastName}` : 'Admin',
    action: `Stock Adjustment (${type})`,
    entity: 'Product',
    entityId: product.id,
    description: `ปรับสต็อก "${product.name}": จาก ${prevStock} เป็น ${product.stock} ${product.unit} [${typeText}] ${note ? `(หมายเหตุ: ${note})` : ''}`,
  });

  return res.json({
    message: 'ปรับสต็อกเรียบร้อยแล้ว',
    product,
  });
});

// PATCH /api/inventory/:id/stock (Admin quick adjust stock)
router.patch('/:id/stock', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { stock, minimumStock } = req.body;

  const product = db.getProducts().find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'ไม่พบสินค้า' });
  }

  if (stock !== undefined) {
    const newStock = Math.round(Number(stock) * 100) / 100;
    if (newStock < 0) return res.status(400).json({ error: 'สต็อกต้องไม่ติดลบ' });
    product.stock = newStock;
  }

  if (minimumStock !== undefined) {
    const newMin = Math.round(Number(minimumStock) * 100) / 100;
    if (newMin < 0) return res.status(400).json({ error: 'สต็อกขั้นต่ำต้องไม่ติดลบ' });
    product.minimumStock = newMin;
  }

  product.updatedAt = new Date().toISOString();
  db.save();

  const user = db.getUsers().find((u) => u.id === req.user!.userId);
  db.addAuditLog({
    userId: req.user!.userId,
    userName: user ? `${user.firstName} ${user.lastName}` : 'Admin',
    action: 'Adjust Stock',
    entity: 'Product',
    entityId: product.id,
    description: `ปรับสต็อก ${product.name} เป็น ${product.stock} ${product.unit}`,
  });

  return res.json({
    message: 'ปรับสต็อกเรียบร้อยแล้ว',
    product,
  });
});

export default router;
