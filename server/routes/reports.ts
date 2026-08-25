import { Router } from 'express';
import { db } from '../db';
import { authenticate, requireRole, AuthenticatedRequest } from '../auth';

const router = Router();

// Helper to compute dashboard summary
function getDashboardStats() {
  const allOrders = db.getOrders();
  const allProducts = db.getProducts();
  const allUsers = db.getUsers();
  const allOrderItems = db.getOrderItems();

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const todayOrders = allOrders.filter(
    (o) => new Date(o.createdAt).toISOString().split('T')[0] === todayStr
  );
  const pendingOrders = allOrders.filter((o) => o.status === 'PENDING').length;
  const completedOrders = allOrders.filter((o) => o.status === 'COMPLETED').length;
  const nonCancelledOrders = allOrders.filter((o) => o.status !== 'CANCELLED');
  const totalRevenue = nonCancelledOrders.reduce((sum, o) => sum + o.total, 0);

  const lowStockProducts = allProducts.filter((p) => p.stock <= p.minimumStock);
  const lowStockCount = lowStockProducts.length;

  // Recent 5 orders enriched with user info and items
  const recentOrders = allOrders
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((o) => {
      const user = allUsers.find((u) => u.id === o.userId);
      const items = allOrderItems.filter((i) => i.orderId === o.id);
      return {
        ...o,
        user: user
          ? { firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone }
          : undefined,
        items,
      };
    });

  // Top 5 products
  const fruitSalesMap = new Map<
    string,
    { name: string; quantity: number; revenue: number; unit: string; image?: string }
  >();
  for (const item of allOrderItems) {
    const order = allOrders.find((o) => o.id === item.orderId);
    if (!order || order.status === 'CANCELLED') continue;

    const existing = fruitSalesMap.get(item.productId);
    const prod = allProducts.find((p) => p.id === item.productId);
    if (existing) {
      existing.quantity = Math.round((existing.quantity + item.quantity) * 100) / 100;
      existing.revenue = Math.round((existing.revenue + item.subtotal) * 100) / 100;
    } else {
      fruitSalesMap.set(item.productId, {
        name: item.productName,
        quantity: item.quantity,
        revenue: item.subtotal,
        unit: item.unit,
        image: prod?.image,
      });
    }
  }

  const topProducts = Array.from(fruitSalesMap.entries())
    .map(([productId, data]) => ({
      productId,
      productName: data.name,
      unit: data.unit,
      totalQuantity: data.quantity,
      totalRevenue: data.revenue,
      image: data.image,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  // 7-day chart
  const salesChart: { date: string; displayDate: string; revenue: number; orders: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dStr = d.toISOString().split('T')[0];
    const displayDate = d.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric' });

    const dayOrders = allOrders.filter((o) => {
      const oDateStr = new Date(o.createdAt).toISOString().split('T')[0];
      return oDateStr === dStr && o.status !== 'CANCELLED';
    });

    salesChart.push({
      date: dStr,
      displayDate,
      revenue: Math.round(dayOrders.reduce((s, o) => s + o.total, 0)),
      orders: dayOrders.length,
    });
  }

  return {
    totalRevenue: Math.round(totalRevenue),
    totalOrders: allOrders.length,
    todayOrders: todayOrders.length,
    pendingOrders,
    completedOrders,
    totalUsers: allUsers.length,
    totalProducts: allProducts.length,
    lowStockCount,
    lowStockProducts,
    recentOrders,
    topProducts,
    salesChart,
  };
}

// GET /api/reports/dashboard & /api/reports/dashboard-stats
router.get('/dashboard', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
  const stats = getDashboardStats();
  return res.json({
    data: stats,
    ...stats,
  });
});

router.get('/dashboard-stats', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
  const stats = getDashboardStats();
  return res.json({
    data: stats,
    ...stats,
  });
});

// GET /api/reports/sales (Used by ReportsPage and AdminDashboard)
router.get('/sales', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
  const { period = 'monthly' } = req.query as { period?: string };

  const now = new Date();
  let days = 30;

  if (period === 'daily' || period === 'today') {
    days = 1;
  } else if (period === 'weekly' || period === '7days') {
    days = 7;
  } else if (period === 'monthly' || period === '30days' || period === 'thisMonth') {
    days = 30;
  } else if (period === 'yearly' || period === 'all') {
    days = 365;
  }

  const startDate = period === 'daily' || period === 'today'
    ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
    : new Date(now.getTime() - days * 86400000);

  const allOrders = db.getOrders();
  const allOrderItems = db.getOrderItems();
  const products = db.getProducts();

  const filteredOrders = allOrders.filter((o) => new Date(o.createdAt) >= startDate);
  const nonCancelledOrders = filteredOrders.filter((o) => o.status !== 'CANCELLED');

  const totalRevenue = nonCancelledOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = filteredOrders.length;

  const orderIds = new Set(nonCancelledOrders.map((o) => o.id));
  const relevantItems = allOrderItems.filter((item) => orderIds.has(item.orderId));

  let totalItemsSold = 0;
  const fruitSalesMap = new Map<
    string,
    { name: string; quantity: number; revenue: number; unit: string; image?: string }
  >();

  for (const item of relevantItems) {
    totalItemsSold += item.quantity;
    const existing = fruitSalesMap.get(item.productId);
    const prod = products.find((p) => p.id === item.productId);

    if (existing) {
      existing.quantity = Math.round((existing.quantity + item.quantity) * 100) / 100;
      existing.revenue = Math.round((existing.revenue + item.subtotal) * 100) / 100;
    } else {
      fruitSalesMap.set(item.productId, {
        name: item.productName,
        quantity: item.quantity,
        revenue: item.subtotal,
        unit: item.unit,
        image: prod?.image,
      });
    }
  }

  const topProducts = Array.from(fruitSalesMap.entries())
    .map(([productId, data]) => ({
      productId,
      productName: data.name,
      unit: data.unit,
      totalQuantity: data.quantity,
      totalRevenue: data.revenue,
      image: data.image,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10);

  // Group daily / periodic sales for chart
  const chartDays = period === 'daily' || period === 'today' ? 1 : period === 'weekly' || period === '7days' ? 7 : period === 'yearly' ? 12 : 14;
  const salesByDate: { date: string; displayDate: string; sales: number; orderCount: number }[] = [];

  if (period === 'yearly') {
    // 12 months
    for (let i = 11; i >= 0; i--) {
      const mDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mKey = `${mDate.getFullYear()}-${String(mDate.getMonth() + 1).padStart(2, '0')}`;
      const displayDate = mDate.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' });

      const monthOrders = allOrders.filter((o) => {
        const oDate = new Date(o.createdAt);
        const match = oDate.getFullYear() === mDate.getFullYear() && oDate.getMonth() === mDate.getMonth();
        return match && o.status !== 'CANCELLED';
      });

      const mRevenue = monthOrders.reduce((sum, o) => sum + o.total, 0);
      salesByDate.push({
        date: mKey,
        displayDate,
        sales: Math.round(mRevenue),
        orderCount: monthOrders.length,
      });
    }
  } else if (period === 'daily' || period === 'today') {
    // 24 hours in slots of 4 hours
    for (let h = 0; h < 24; h += 4) {
      const timeStr = `${String(h).padStart(2, '0')}:00`;
      const slotOrders = nonCancelledOrders.filter((o) => {
        const hOrder = new Date(o.createdAt).getHours();
        return hOrder >= h && hOrder < h + 4;
      });
      salesByDate.push({
        date: timeStr,
        displayDate: timeStr,
        sales: Math.round(slotOrders.reduce((sum, o) => sum + o.total, 0)),
        orderCount: slotOrders.length,
      });
    }
  } else {
    for (let i = chartDays - 1; i >= 0; i--) {
      const dayDate = new Date(now.getTime() - i * 86400000);
      const dayStr = dayDate.toISOString().split('T')[0];
      const displayDate = dayDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });

      const dayOrders = allOrders.filter((o) => {
        const oDateStr = new Date(o.createdAt).toISOString().split('T')[0];
        return oDateStr === dayStr && o.status !== 'CANCELLED';
      });

      const dayRevenue = dayOrders.reduce((sum, o) => sum + o.total, 0);

      salesByDate.push({
        date: dayStr,
        displayDate,
        sales: Math.round(dayRevenue),
        orderCount: dayOrders.length,
      });
    }
  }

  const resultData = {
    period,
    totalRevenue: Math.round(totalRevenue),
    totalOrders,
    totalItemsSold: Math.round(totalItemsSold * 100) / 100,
    salesByDate,
    topProducts,
  };

  return res.json({
    data: resultData,
    ...resultData,
  });
});

// GET /api/reports (Admin general overview)
router.get('/', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
  const { period = '30days' } = req.query as { period?: string };

  const now = new Date();
  let startDate: Date;

  if (period === 'today') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === '7days') {
    startDate = new Date(now.getTime() - 7 * 86400000);
  } else if (period === 'thisMonth') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === 'all') {
    startDate = new Date(0);
  } else {
    startDate = new Date(now.getTime() - 30 * 86400000);
  }

  const allOrders = db.getOrders();
  const allOrderItems = db.getOrderItems();
  const products = db.getProducts();

  const filteredOrders = allOrders.filter((o) => new Date(o.createdAt) >= startDate);
  const completedOrders = filteredOrders.filter((o) => o.status === 'COMPLETED');
  const nonCancelledOrders = filteredOrders.filter((o) => o.status !== 'CANCELLED');

  const totalRevenue = nonCancelledOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = filteredOrders.length;
  const completedCount = completedOrders.length;
  const cancelledCount = filteredOrders.filter((o) => o.status === 'CANCELLED').length;
  const pendingCount = filteredOrders.filter((o) => o.status === 'PENDING').length;

  const orderIds = new Set(nonCancelledOrders.map((o) => o.id));
  const relevantItems = allOrderItems.filter((item) => orderIds.has(item.orderId));

  let totalSoldQuantity = 0;
  const fruitSalesMap = new Map<
    string,
    { name: string; quantity: number; revenue: number; unit: string; image?: string }
  >();

  for (const item of relevantItems) {
    totalSoldQuantity += item.quantity;
    const existing = fruitSalesMap.get(item.productId);
    const prod = products.find((p) => p.id === item.productId);

    if (existing) {
      existing.quantity = Math.round((existing.quantity + item.quantity) * 100) / 100;
      existing.revenue = Math.round((existing.revenue + item.subtotal) * 100) / 100;
    } else {
      fruitSalesMap.set(item.productId, {
        name: item.productName,
        quantity: item.quantity,
        revenue: item.subtotal,
        unit: item.unit,
        image: prod?.image,
      });
    }
  }

  const topFruits = Array.from(fruitSalesMap.entries())
    .map(([productId, data]) => ({
      productId,
      productName: data.name,
      unit: data.unit,
      totalQuantity: data.quantity,
      totalRevenue: data.revenue,
      image: data.image,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10);

  const daysToShow = period === '7days' ? 7 : 14;
  const chartData: { date: string; displayDate: string; revenue: number; orders: number }[] = [];

  for (let i = daysToShow - 1; i >= 0; i--) {
    const dayDate = new Date(now.getTime() - i * 86400000);
    const dayStr = dayDate.toISOString().split('T')[0];
    const displayDate = dayDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });

    const dayOrders = allOrders.filter((o) => {
      const oDateStr = new Date(o.createdAt).toISOString().split('T')[0];
      return oDateStr === dayStr && o.status !== 'CANCELLED';
    });

    const dayRevenue = dayOrders.reduce((sum, o) => sum + o.total, 0);

    chartData.push({
      date: dayStr,
      displayDate,
      revenue: Math.round(dayRevenue),
      orders: dayOrders.length,
    });
  }

  const summary = {
    totalRevenue: Math.round(totalRevenue),
    totalOrders,
    completedOrders: completedCount,
    cancelledOrders: cancelledCount,
    pendingOrders: pendingCount,
    totalSoldQuantity: Math.round(totalSoldQuantity * 100) / 100,
    averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / (totalOrders - cancelledCount || 1)) : 0,
  };

  return res.json({
    data: {
      period,
      summary,
      topFruits,
      chartData,
    },
    period,
    summary,
    topFruits,
    chartData,
  });
});

export default router;
