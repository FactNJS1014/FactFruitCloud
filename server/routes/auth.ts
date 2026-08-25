import { Router } from 'express';
import { db, UserRecord } from '../db';
import { generateToken, hashPassword, comparePassword, authenticate, AuthenticatedRequest } from '../auth';
import { z } from 'zod';

const router = Router();

const registerSchema = z.object({
  firstName: z.string().min(1, 'กรุณาระบุชื่อ'),
  lastName: z.string().min(1, 'กรุณาระบุนามสกุล'),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  phone: z.string().min(9, 'กรุณาระบุเบอร์โทรศัพท์ที่ถูกต้อง (อย่างน้อย 9 หลัก)'),
  password: z.string().min(6, 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน',
  path: ['confirmPassword'],
});

const loginSchema = z.object({
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(1, 'กรุณาระบุรหัสผ่าน'),
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return res.status(400).json({ error: issue.message });
    }

    const { firstName, lastName, email, phone, password } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = db.getUsers().find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existingUser) {
      return res.status(400).json({ error: 'อีเมลนี้ถูกใช้งานในระบบแล้ว กรุณาใช้อีเมลอื่น' });
    }

    const passwordHash = hashPassword(password);
    const now = new Date().toISOString();
    const newUser: UserRecord = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      passwordHash,
      phone: phone.trim(),
      role: 'USER', // Always default to USER
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    db.getUsers().push(newUser);
    db.save();

    db.addAuditLog({
      userId: newUser.id,
      userName: `${newUser.firstName} ${newUser.lastName}`,
      action: 'User Register',
      entity: 'User',
      entityId: newUser.id,
      description: `ผู้ใช้ใหม่ลงทะเบียนเข้าสู่ระบบ: ${newUser.email}`,
    });

    const token = generateToken(newUser);
    res.cookie('factfruit_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(201).json({
      message: 'ลงทะเบียนสำเร็จ ยินดีต้อนรับสู่ FactFruit',
      token,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const { email, password } = parseResult.data;
    const user = db.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user || !comparePassword(password, user.passwordHash)) {
      return res.status(400).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'บัญชีผู้ใช้นี้ถูกปิดการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' });
    }

    const token = generateToken(user);
    res.cookie('factfruit_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    db.addAuditLog({
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      action: 'User Login',
      entity: 'User',
      entityId: user.id,
      description: `ผู้ใช้เข้าสู่ระบบ: ${user.email} (${user.role})`,
    });

    const { passwordHash: _, ...safeUser } = user;
    return res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req: AuthenticatedRequest, res) => {
  const user = db.getUsers().find((u) => u.id === req.user?.userId);
  if (!user) {
    return res.status(404).json({ error: 'ไม่พบข้อมูลผู้ใช้' });
  }

  const { passwordHash: _, ...safeUser } = user;
  return res.json({ user: safeUser });
});

// PUT /api/auth/profile
router.put('/profile', authenticate, (req: AuthenticatedRequest, res) => {
  try {
    const user = db.getUsers().find((u) => u.id === req.user?.userId);
    if (!user) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลผู้ใช้' });
    }

    const { firstName, lastName, phone } = req.body;
    if (!firstName || !lastName || !phone) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    user.firstName = firstName.trim();
    user.lastName = lastName.trim();
    user.phone = phone.trim();
    user.updatedAt = new Date().toISOString();
    db.save();

    db.addAuditLog({
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      action: 'Update Profile',
      entity: 'User',
      entityId: user.id,
      description: `ผู้ใช้อัปเดตข้อมูลโปรไฟล์ส่วนตัว`,
    });

    const { passwordHash: _, ...safeUser } = user;
    return res.json({
      message: 'อัปเดตข้อมูลโปรไฟล์เรียบร้อยแล้ว',
      user: safeUser,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'ไม่สามารถอัปเดตข้อมูลโปรไฟล์ได้' });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, (req: AuthenticatedRequest, res) => {
  res.clearCookie('factfruit_token');
  if (req.user) {
    const user = db.getUsers().find((u) => u.id === req.user?.userId);
    db.addAuditLog({
      userId: req.user.userId,
      userName: user ? `${user.firstName} ${user.lastName}` : 'User',
      action: 'User Logout',
      entity: 'User',
      entityId: req.user.userId,
      description: 'ผู้ใช้ออกจากระบบ',
    });
  }
  return res.json({ message: 'ออกจากระบบเรียบร้อยแล้ว' });
});

export default router;
