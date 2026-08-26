import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Order } from '../types';
import { OrderStatusBadge } from '../components/common/OrderStatusBadge';
import {
  ShoppingBag,
  Clock,
  Package,
  Truck,
  CheckCheck,
  ArrowRight,
  Eye,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';

interface UserDashboardProps {
  onNavigate: (path: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onNavigate }) => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getOrders(token)
      .then((data) => {
        if (data) setOrders(data);
      })
      .catch((err) => console.error('Error fetching user orders', err))
      .finally(() => setIsLoading(false));
  }, [token]);

  const totalCount = orders.length;
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const preparingCount = orders.filter((o) => o.status === 'PREPARING' || o.status === 'CONFIRMED').length;
  const readyCount = orders.filter((o) => o.status === 'READY').length;
  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/10 [mask-image:linear-gradient(to_left,black,transparent)] pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>FactFruit Member Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            สวัสดี คุณ {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
            ยินดีต้อนรับสู่ระบบสั่งจองผลไม้ คุณสามารถตรวจสอบสถานะคำสั่งซื้อ ประวัติย้อนหลัง และเลือกสั่งจองผลไม้สดใหม่ได้ที่นี่
          </p>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('/fruits')}
              className="px-5 py-2.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold shadow-md transition-colors inline-flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>เลือกสั่งซื้อผลไม้เพิ่ม</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Orders */}
        <div
          onClick={() => onNavigate('/my-orders')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-emerald-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">สั่งซื้อทั้งหมด</span>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {totalCount}
          </div>
          <span className="text-[11px] text-slate-400">รายการทั้งหมด</span>
        </div>

        {/* Pending */}
        <div
          onClick={() => onNavigate('/my-orders')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-amber-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">รอดำเนินการ</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {pendingCount}
          </div>
          <span className="text-[11px] text-amber-600/80">รอแอดมินตรวจสอบ</span>
        </div>

        {/* Preparing */}
        <div
          onClick={() => onNavigate('/my-orders')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-indigo-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">กำลังจัดเตรียม</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {preparingCount}
          </div>
          <span className="text-[11px] text-indigo-600/80">กำลังคัดและแพ็ค</span>
        </div>

        {/* Ready */}
        <div
          onClick={() => onNavigate('/my-orders')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-purple-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">พร้อมรับสินค้า</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {readyCount}
          </div>
          <span className="text-[11px] text-purple-600/80">มารับที่หน้าร้านได้</span>
        </div>

        {/* Completed */}
        <div
          onClick={() => onNavigate('/my-orders')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-emerald-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">สำเร็จ</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {completedCount}
          </div>
          <span className="text-[11px] text-emerald-600/80">รับสินค้าเรียบร้อย</span>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">รายการสั่งซื้อล่าสุด</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              คำสั่งซื้อผลไม้ที่คุณได้ทำรายการไว้
            </p>
          </div>

          <button
            onClick={() => onNavigate('/my-orders')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>ดูทั้งหมด</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-slate-400 text-xs">กำลังโหลดรายการสั่งซื้อ...</div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <ShoppingBag className="w-12 h-12 stroke-1 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">ยังไม่มีรายการสั่งซื้อ</p>
            <p className="text-xs text-slate-400 mt-1">เริ่มเลือกซื้อผลไม้สดส่งตรงจากสวนได้ทันที</p>
            <button
              onClick={() => onNavigate('/fruits')}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700"
            >
              เลือกซื้อผลไม้เลย
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                  <th className="pb-3 px-3">เลขคำสั่งซื้อ</th>
                  <th className="pb-3 px-3">วันที่สั่ง</th>
                  <th className="pb-3 px-3">จำนวนสินค้า</th>
                  <th className="pb-3 px-3">ยอดรวมสุทธิ</th>
                  <th className="pb-3 px-3">สถานะ</th>
                  <th className="pb-3 px-3 text-right">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {o.orderNumber}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400">
                      {new Date(o.createdAt).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">
                      {o.items?.length || 1} รายการ
                    </td>
                    <td className="py-3.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                      ฿{o.total.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3">
                      <OrderStatusBadge status={o.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => onNavigate(`/my-orders/${o.id}`)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold text-xs inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>ดูรายละเอียด</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
