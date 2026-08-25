import { Router } from 'express';
import { db } from '../db';
import { authenticate, requireRole, AuthenticatedRequest } from '../auth';

const router = Router();

// GET /api/audit-logs (Admin Only)
router.get('/', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
  const { search, action, entity, page = '1', limit = '20' } = req.query as Record<string, string>;

  let logs = db.getAuditLogs();

  if (action && action !== 'ALL') {
    logs = logs.filter((l) => l.action.toLowerCase().includes(action.toLowerCase()));
  }

  if (entity && entity !== 'ALL') {
    logs = logs.filter((l) => l.entity.toLowerCase() === entity.toLowerCase());
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    logs = logs.filter(
      (l) =>
        l.description.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        (l.userName && l.userName.toLowerCase().includes(q))
    );
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const total = logs.length;
  const totalPages = Math.ceil(total / limitNum);
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = logs.slice(startIndex, startIndex + limitNum);

  return res.json({
    data: paginated,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages,
  });
});

export default router;
