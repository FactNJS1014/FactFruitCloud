import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { db, UserRecord, Role } from './db';

const JWT_SECRET = process.env.AUTH_SECRET || 'factfruit-super-secret-auth-key-2026';

export interface AuthPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function generateToken(user: UserRecord): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch (err) {
    return null;
  }
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.factfruit_token) {
    token = req.cookies.factfruit_token;
  }

  if (!token) {
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' });
  }

  const user = db.getUsers().find((u) => u.id === payload.userId);
  if (!user || !user.isActive) {
    return res.status(401).json({ error: 'บัญชีผู้ใช้นี้ถูกปิดการใช้งาน หรือไม่พบข้อมูลในระบบ' });
  }

  req.user = payload;
  next();
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.factfruit_token) {
    token = req.cookies.factfruit_token;
  }

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      const user = db.getUsers().find((u) => u.id === payload.userId);
      if (user && user.isActive) {
        req.user = payload;
      }
    }
  }
  next();
}

export function requireRole(role: Role) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ error: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้ (สำหรับ ' + role + ' เท่านั้น)' });
    }

    next();
  };
}
