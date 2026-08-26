import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { OrderStatusBadge } from '../../components/common/OrderStatusBadge';
import { StockBadge } from '../../components/common/StockBadge';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  Users,
  Eye,
  ArrowRight,
  Sparkles,
  DollarSign,
  Boxes,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [salesReport, setSalesReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    Promise.all([
      api.getDashboardStats(token),
      api.getSalesReport(token, 'monthly'),
    ])
      .then(([dashData, salesData]) => {
        if (isMounted) {
          if (dashData) setStats(dashData);
          if (salesData) setSalesReport(salesData);
        }
      })
      .catch((err) => console.error('Error loading dashboard stats:', err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1'];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            แดชบอร์ดภาพรวมระบบ
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            สรุปยอดขาย คำสั่งซื้อ สต็อกสินค้า และกิจกรรมระบบ FactFruit
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/admin/products')}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            + เพิ่มสินค้าผลไม้
          </button>
          <button
            onClick={() => onNavigate('/admin/orders')}
            className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
          >
            จัดการคำสั่งซื้อ
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              ยอดขายรวมทั้งสิ้น
            </span>
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-3">
            ฿{stats?.totalRevenue?.toLocaleString() || 0}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>คำนวณจากออเดอร์ที่ยืนยันแล้ว</span>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              คำสั่งซื้อทั้งหมด
            </span>
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-3">
            {stats?.totalOrders?.toLocaleString() || 0}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-600 font-semibold">
            <span>รอดำเนินการ {stats?.pendingOrders || 0} รายการ</span>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              รายการสินค้าผลไม้
            </span>
            <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-3">
            {stats?.totalProducts || 0}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-medium">
            <span>พร้อมจำหน่ายในระบบ</span>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div
          onClick={() => onNavigate('/admin/inventory')}
          className={`border rounded-3xl p-5 shadow-xs transition-all cursor-pointer ${
            stats?.lowStockCount > 0
              ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 hover:border-rose-400'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              แจ้งเตือนสต็อกต่ำ
            </span>
            <div
              className={`p-2.5 rounded-2xl ${
                stats?.lowStockCount > 0
                  ? 'bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-3">
            {stats?.lowStockCount || 0} รายการ
          </div>
          <div className="mt-1 text-[11px] text-rose-600/80 font-medium">
            <span>คลิกเพื่อดูและเติมสต็อกสินค้า</span>
          </div>
        </div>
      </div>

      {/* Sales Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">แนวโน้มยอดขายรายวัน</h3>
              <p className="text-xs text-slate-400">ยอดจำหน่ายผลไม้รวม (บาท)</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
              อัปเดตล่าสุด
            </span>
          </div>

          <div className="h-64 mt-4">
            {salesReport?.salesByDate && salesReport.salesByDate.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesReport.salesByDate}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    formatter={(val: any) => [`฿${Number(val).toLocaleString()}`, 'ยอดขาย']}
                    labelFormatter={(label) => `วันที่: ${label}`}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                ยังไม่มีข้อมูลยอดขายเพียงพอสำหรับสร้างกราฟ
              </div>
            )}
          </div>
        </div>

        {/* Top 5 Products Bar Chart (1 col) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">5 อันดับผลไม้ขายดี</h3>
            <p className="text-xs text-slate-400">จำนวนที่ขายได้ (ชิ้น/กก.)</p>
          </div>

          <div className="h-64 mt-4">
            {salesReport?.topProducts && salesReport.topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salesReport.topProducts.slice(0, 5)}
                  layout="vertical"
                  margin={{ left: 10, right: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                  <YAxis
                    dataKey="productName"
                    type="category"
                    stroke="#94a3b8"
                    fontSize={11}
                    width={80}
                  />
                  <Tooltip
                    formatter={(val: any) => [`${val} หน่วย`, 'ยอดขาย']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="totalQuantity" fill="#10b981" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                ยังไม่มีข้อมูลสินค้าขายดี
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Orders & Low Stock Warning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">คำสั่งซื้อล่าสุด</h3>
              <p className="text-xs text-slate-400">รายการสั่งจองจากลูกค้าที่ต้องดำเนินการ</p>
            </div>

            <button
              onClick={() => onNavigate('/admin/orders')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              <span>ดูคำสั่งซื้อทั้งหมด</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                  <th className="pb-2 px-2">เลขออเดอร์</th>
                  <th className="pb-2 px-2">ลูกค้า</th>
                  <th className="pb-2 px-2">ยอดรวม</th>
                  <th className="pb-2 px-2">สถานะ</th>
                  <th className="pb-2 px-2 text-right">การกระทำ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {stats?.recentOrders?.length > 0 ? (
                  stats.recentOrders.map((o: any) => (
                    <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-2 font-mono font-bold text-slate-900 dark:text-white">
                        {o.orderNumber}
                      </td>
                      <td className="py-3 px-2 text-slate-700 dark:text-slate-300">
                        {o.user ? `${o.user.firstName} ${o.user.lastName}` : 'ลูกค้าทั่วไป'}
                      </td>
                      <td className="py-3 px-2 font-bold text-emerald-600 dark:text-emerald-400">
                        ฿{o.total?.toLocaleString()}
                      </td>
                      <td className="py-3 px-2">
                        <OrderStatusBadge status={o.status} size="sm" />
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() => onNavigate(`/my-orders/${o.id}`)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white font-bold text-[11px] text-slate-700 dark:text-slate-300 inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>ดูข้อมูล</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      ยังไม่มีคำสั่งซื้อในระบบ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Warning List (1 col) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">ผลไม้สต็อกต่ำ</h3>
            </div>
            <button
              onClick={() => onNavigate('/admin/inventory')}
              className="text-xs font-bold text-rose-600 hover:underline"
            >
              เติมสต็อก
            </button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto">
            {stats?.lowStockProducts?.length > 0 ? (
              stats.lowStockProducts.map((p: any) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={p.image || 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=60&auto=format&fit=crop&q=80'}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {p.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">{p.code}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <StockBadge stock={p.stock} minimumStock={p.minimumStock} unit={p.unit} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                สต็อกผลไม้ทุกรายการอยู่ในเกณฑ์ปกติ
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
