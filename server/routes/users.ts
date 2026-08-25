import { Router } from 'express';
import { db } from '../db';
import { authenticate, requireRole, AuthenticatedRequest } from '../auth';

const router = Router();

// GET /api/users (Admin Only)
router.get('/', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
  const { search, role, page = '1', limit = '20' } = req.query as Record<string, string>;

  let users = db.getUsers();

  if (role && role !== 'ALL') {
    users = users.filter((u) => u.role === role);
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    users = users.filter(
      (u) =>
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q)
    );
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const total = users.length;
  const totalPages = Math.ceil(total / limitNum);
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = users.slice(startIndex, startIndex + limitNum);

  const safeUsers = paginated.map(({ passwordHash: _, ...u }) => u);

  return res.json({
    data: safeUsers,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages,
  });
});

// PATCH /api/users/:id/toggle-active (Admin Only)
router.patch('/:id/toggle-active', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  if (id === req.user!.userId) {
    return res.status(400).json({ error: 'ไม่อนุญาตให้ปิดการใช้งานบัญชีของตนเอง' });
  }

  const user = db.getUsers().find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
  }

  user.isActive = !user.isActive;
  user.updatedAt = new Date().toISOString();
  db.save();

  const admin = db.getUsers().find((u) => u.id === req.user!.userId);
  db.addAuditLog({
    userId: req.user!.userId,
    userName: admin ? `${admin.firstName} ${admin.lastName}` : 'Admin',
    action: 'Toggle User Status',
    entity: 'User',
    entityId: user.id,
    description: `เปลี่ยนสถานะบัญชีของ ${user.email} เป็น ${user.isActive ? 'เปิดใช้งาน' : 'ระงับการใช้งาน'}`,
  });

  const { passwordHash: _, ...safeUser } = user;
  return res.json({
    message: `เปลี่ยนสถานะเป็น ${user.isActive ? 'เปิดใช้งาน' : 'ระงับการใช้งาน'} เรียบร้อยแล้ว`,
    user: safeUser,
  });
});

// PUT /api/users/:id/role (Admin Only)
router.put('/:id/role', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (id === req.user!.userId) {
    return res.status(400).json({ error: 'ไม่อนุญาตให้เปลี่ยนบทบาทบัญชีของตนเอง' });
  }

  if (role !== 'ADMIN' && role !== 'USER') {
    return res.status(400).json({ error: 'บทบาทไม่ถูกต้อง' });
  }

  const user = db.getUsers().find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
  }

  const prevRole = user.role;
  user.role = role;
  user.updatedAt = new Date().toISOString();
  db.save();

  const admin = db.getUsers().find((u) => u.id === req.user!.userId);
  db.addAuditLog({
    userId: req.user!.userId,
    userName: admin ? `${admin.firstName} ${admin.lastName}` : 'Admin',
    action: 'Change User Role',
    entity: 'User',
    entityId: user.id,
    description: `เปลี่ยนบทบาทของ ${user.email} จาก ${prevRole} เป็น ${role}`,
  });

  const { passwordHash: _, ...safeUser } = user;
  return res.json({
    message: `เปลี่ยนบทบาทผู้ใช้เป็น ${role} เรียบร้อยแล้ว`,
    user: safeUser,
  });
});

export default router;
