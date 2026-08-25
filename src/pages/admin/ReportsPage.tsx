import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart3,
  Calendar,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Award,
  Download,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const { token } = useAuth();
  const [period, setPeriod] = useState<string>('monthly');
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchReports = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/reports/sales?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.data) setReport(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [period, token]);

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];

  const handleExportCSV = () => {
    if (!report?.salesByDate) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['วันที่,ยอดขาย (บาท),จำนวนออเดอร์']
        .concat(report.salesByDate.map((r: any) => `${r.date},${r.sales},${r.orderCount || 1}`))
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `factfruit-report-${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            รายงานและสถิติยอดขาย (Reports & Analytics)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            วิเคราะห์แนวโน้มยอดขายผลไม้ สินค้าขายดี และผลการดำเนินงาน
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period Selector */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs font-bold">
            <button
              onClick={() => setPeriod('daily')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                period === 'daily'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              รายวัน
            </button>
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                period === 'weekly'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              รายสัปดาห์
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                period === 'monthly'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              รายเดือน
            </button>
            <button
              onClick={() => setPeriod('yearly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                period === 'yearly'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              รายปี
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
            title="ส่งออกรายงานเป็น CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">ส่งออก CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">ยอดขายรวมช่วงนี้</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            ฿{report?.totalRevenue?.toLocaleString() || 0}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold">ยอดจำหน่ายรวม</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">จำนวนคำสั่งซื้อ</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {report?.totalOrders?.toLocaleString() || 0}
          </div>
          <span className="text-[11px] text-blue-600 font-bold">ออเดอร์ทั้งหมด</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">ผลไม้ที่ขายได้ทั้งหมด</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {report?.totalItemsSold?.toLocaleString() || 0}
          </div>
          <span className="text-[11px] text-purple-600 font-bold">หน่วย (กิโลกรัม / ลูก)</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">ยอดเฉลี่ยต่อออเดอร์ (AOV)</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            ฿
            {report?.totalOrders > 0
              ? Math.round(report.totalRevenue / report.totalOrders).toLocaleString()
              : 0}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Average Order Value</span>
        </div>
      </div>

      {/* Main Revenue Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
          กราฟแสดงแนวโน้มยอดขายผลไม้
        </h3>
        <p className="text-xs text-slate-400 mb-4">ยอดขายรวมตามช่วงเวลาที่เลือก (บาท)</p>

        <div className="h-72">
          {report?.salesByDate && report.salesByDate.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={report.salesByDate}>
                <defs>
                  <linearGradient id="reportGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  formatter={(val: any) => [`฿${Number(val).toLocaleString()}`, 'ยอดขาย']}
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
                  fill="url(#reportGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              ยังไม่มีข้อมูลยอดขายในรอบนี้
            </div>
          )}
        </div>
      </div>

      {/* Best Selling Products Breakdown */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
          ตารางสินค้าผลไม้ขายดีและรายรับ
        </h3>
        <p className="text-xs text-slate-400 mb-4">เรียงตามปริมาณที่จำหน่ายได้สูงสุด</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase">
                <th className="pb-3 px-3">อันดับ</th>
                <th className="pb-3 px-3">ชื่อผลไม้</th>
                <th className="pb-3 px-3">จำนวนที่ขายได้</th>
                <th className="pb-3 px-3">ยอดขายรวม (บาท)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {report?.topProducts?.length > 0 ? (
                report.topProducts.map((p: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                          idx === 0
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                            : idx === 1
                            ? 'bg-slate-200 text-slate-800'
                            : idx === 2
                            ? 'bg-orange-100 text-orange-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {p.productName}
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                      {p.totalQuantity} หน่วย
                    </td>
                    <td className="py-3 px-3 font-black text-emerald-600 dark:text-emerald-400">
                      ฿{p.totalRevenue?.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    ไม่มีข้อมูลสินค้าขายดี
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
