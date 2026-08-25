import { Router } from 'express';
import { db, CategoryRecord } from '../db';
import { authenticate, requireRole, AuthenticatedRequest } from '../auth';
import { z } from 'zod';

const router = Router();

const categorySchema = z.object({
  name: z.string().min(2, 'กรุณาระบุชื่อหมวดหมู่'),
  description: z.string().optional().default(''),
  image: z.string().optional().default(''),
  isActive: z.boolean().default(true),
});

// GET /api/categories
router.get('/', (req, res) => {
  const categories = db.getCategories();
  const products = db.getProducts();

  const enriched = categories.map((cat) => {
    const productCount = products.filter((p) => p.categoryId === cat.id).length;
    return {
      ...cat,
      productCount,
    };
  });

  return res.json({ data: enriched });
});

// POST /api/categories (Admin Only)
router.post('/', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
  try {
    const parseResult = categorySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues[0].message });
    }

    const { name, description, image, isActive } = parseResult.data;
    const now = new Date().toISOString();

    const newCategory: CategoryRecord = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&auto=format&fit=crop&q=80',
      isActive: isActive !== undefined ? isActive : true,
      createdAt: now,
      updatedAt: now,
    };

    db.getCategories().push(newCategory);
    db.save();

    const user = db.getUsers().find((u) => u.id === req.user?.userId);
    db.addAuditLog({
      userId: req.user?.userId,
      userName: user ? `${user.firstName} ${user.lastName}` : 'Admin',
      action: 'Create Category',
      entity: 'Category',
      entityId: newCategory.id,
      description: `เพิ่มหมวดหมู่ผลไม้ใหม่: ${newCategory.name}`,
    });

    return res.status(201).json({
      message: 'เพิ่มหมวดหมู่ผลไม้เรียบร้อยแล้ว',
      category: { ...newCategory, productCount: 0 },
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างหมวดหมู่' });
  }
});

// PUT /api/categories/:id (Admin Only)
router.put('/:id', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const category = db.getCategories().find((c) => c.id === id);
    if (!category) {
      return res.status(404).json({ error: 'ไม่พบหมวดหมู่ที่ต้องการแก้ไข' });
    }

    const { name, description, image, isActive } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'กรุณาระบุชื่อหมวดหมู่' });
    }

    category.name = name.trim();
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (isActive !== undefined) category.isActive = Boolean(isActive);
    category.updatedAt = new Date().toISOString();

    db.save();

    const user = db.getUsers().find((u) => u.id === req.user?.userId);
    db.addAuditLog({
      userId: req.user?.userId,
      userName: user ? `${user.firstName} ${user.lastName}` : 'Admin',
      action: 'Update Category',
      entity: 'Category',
      entityId: category.id,
      description: `แก้ไขข้อมูลหมวดหมู่: ${category.name}`,
    });

    const productCount = db.getProducts().filter((p) => p.categoryId === id).length;
    return res.json({
      message: 'อัปเดตข้อมูลหมวดหมู่เรียบร้อยแล้ว',
      category: { ...category, productCount },
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแก้ไขหมวดหมู่' });
  }
});

// DELETE /api/categories/:id (Admin Only)
router.delete('/:id', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const index = db.getCategories().findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'ไม่พบหมวดหมู่' });
  }

  const hasProducts = db.getProducts().some((p) => p.categoryId === id);
  if (hasProducts) {
    return res.status(400).json({
      error: 'ไม่สามารถลบหมวดหมู่นี้ได้เนื่องจากมีสินค้าผลไม้อยู่ในหมวดหมู่นี้ กรุณาย้ายหรือลบสินค้าก่อน',
    });
  }

  const category = db.getCategories()[index];
  db.getCategories().splice(index, 1);
  db.save();

  const user = db.getUsers().find((u) => u.id === req.user?.userId);
  db.addAuditLog({
    userId: req.user?.userId,
    userName: user ? `${user.firstName} ${user.lastName}` : 'Admin',
    action: 'Delete Category',
    entity: 'Category',
    entityId: id,
    description: `ลบหมวดหมู่ผลไม้: ${category.name}`,
  });

  return res.json({ message: 'ลบหมวดหมู่เรียบร้อยแล้ว' });
});

export default router;
