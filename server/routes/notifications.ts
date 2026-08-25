import { Router } from 'express';
import { db } from '../db';
import { authenticate, AuthenticatedRequest } from '../auth';

const router = Router();

// GET /api/notifications
router.get('/', authenticate, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.userId;
  const notifs = db
    .getNotifications()
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = notifs.filter((n) => !n.isRead).length;

  return res.json({
    data: notifs,
    unreadCount,
  });
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticate, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const notif = db.getNotifications().find((n) => n.id === id && n.userId === req.user!.userId);

  if (!notif) {
    return res.status(404).json({ error: 'ไม่พบการแจ้งเตือน' });
  }

  notif.isRead = true;
  db.save();

  return res.json({ message: 'อ่านแล้ว', notification: notif });
});

// PATCH /api/notifications/read-all
router.patch('/read-all', authenticate, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.userId;
  const notifs = db.getNotifications().filter((n) => n.userId === userId);

  notifs.forEach((n) => {
    n.isRead = true;
  });
  db.save();

  return res.json({ message: 'ทำเครื่องหมายอ่านทั้งหมดเรียบร้อยแล้ว' });
});

export default router;
