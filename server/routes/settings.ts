import { Router } from 'express';
import { db } from '../db';
import { authenticate, requireRole, AuthenticatedRequest } from '../auth';
import { z } from 'zod';

const router = Router();

const settingsSchema = z.object({
  storeName: z.string().min(1, 'กรุณาระบุชื่อร้าน'),
  logo: z.string().optional().default(''),
  address: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  email: z.string().optional().default(''),
  currency: z.string().default('THB'),
  orderPrefix: z.string().default('ORD-'),
  timezone: z.string().default('Asia/Bangkok'),
});

// GET /api/settings (Public)
router.get('/', (req, res) => {
  const settings = db.getStoreSettings();
  return res.json(settings);
});

// PUT /api/settings (Admin Only)
router.put('/', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
  try {
    const parseResult = settingsSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues[0].message });
    }

    const updated = db.updateStoreSettings(parseResult.data);

    const user = db.getUsers().find((u) => u.id === req.user!.userId);
    db.addAuditLog({
      userId: req.user!.userId,
      userName: user ? `${user.firstName} ${user.lastName}` : 'Admin',
      action: 'Update Store Settings',
      entity: 'StoreSetting',
      entityId: updated.id,
      description: `แก้ไขการตั้งค่าร้านค้า FactFruit`,
    });

    return res.json({
      message: 'บันทึกการตั้งค่าร้านค้าเรียบร้อยแล้ว',
      settings: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'ไม่สามารถบันทึกการตั้งค่าร้านค้าได้' });
  }
});

export default router;
