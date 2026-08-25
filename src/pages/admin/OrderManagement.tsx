import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Order, OrderStatus } from '../../types';
import { OrderStatusBadge } from '../../components/common/OrderStatusBadge';
import {
  Search,
  ClipboardList,
  Eye,
  CheckCircle,
  Clock,
  Package,
  Truck,
  CheckCheck,
  XCircle,
  Filter,
  User,
  Calendar,
} from 'lucide-react';

interface OrderManagementProps {
  onNavigate: (path: string) => void;
}

export const OrderManagement: React.FC<OrderManagementProps> = ({ onNavigate }) => {
  const { token } = useAuth();
  const { success, error } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [activeStatus, setActiveStatus] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ limit: '50' });
      if (activeStatus !== 'ALL') params.append('status', activeStatus);
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`/api/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.data) setOrders(json.data);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeStatus, token]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          note: `ปรับสถานะเป็น ${newStatus} โดยผู้ดูแลระบบ`,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        error(json.error || 'ไม่สามารถปรับสถานะคำสั่งซื้อได้');
        return;
      }

      success(`อัปเดตสถานะคำสั่งซื้อเป็น "${newStatus}" เรียบร้อยแล้ว`);
      fetchOrders();
    } catch (err) {
      error('เกิดข้อผิดพลาดในการปรับสถานะ');
    } finally {
      setUpdatingId(null);
    }
  };

  const tabs = [
    { key: 'ALL', label: 'ทั้งหมด' },
    { key: 'PENDING', label: 'รอดำเนินการ' },
    { key: 'CONFIRMED', label: 'ยืนยันแล้ว' },
    { key: 'PREPARING', label: 'กำลังจัดเตรียม' },
    { key: 'READY', label: 'พร้อมรับสินค้า' },
    { key: 'COMPLETED', label: 'สำเร็จ' },
    { key: 'CANCELLED', label: 'ยกเลิกแล้ว' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            จัดการคำสั่งซื้อ (Orders Management)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ตรวจสอบ อัปเดตสถานะ และติดตามการสั่งจองผลไม้ของลูกค้า
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveStatus(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeStatus === tab.key
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาตามรหัสคำสั่งซื้อ หรือชื่อลูกค้า..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold"
          >
            ค้นหา
          </button>
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400">กำลังโหลดคำสั่งซื้อ...</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <ClipboardList className="w-12 h-12 stroke-1 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">ไม่พบคำสั่งซื้อ</p>
            <p className="text-xs text-slate-400 mt-1">ไม่มีคำสั่งซื้อในสถานะที่เลือก</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">รหัสคำสั่งซื้อ & วันที่</th>
                  <th className="py-3.5 px-4">ลูกค้า & เบอร์โทร</th>
                  <th className="py-3.5 px-4">รายการผลไม้</th>
                  <th className="py-3.5 px-4">ยอดรวมสุทธิ</th>
                  <th className="py-3.5 px-4">สถานะปัจจุบัน</th>
                  <th className="py-3.5 px-4">เปลี่ยนสถานะ</th>
                  <th className="py-3.5 px-4 text-right">รายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-black text-slate-900 dark:text-white block text-sm">
                        {order.orderNumber}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleString('th-TH')}
                      </span>
                      {order.pickupDate && (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          นัดรับ: {new Date(order.pickupDate).toLocaleDateString('th-TH')}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'ลูกค้าทั่วไป'}
                      </span>
                      <span className="text-slate-400 text-[11px]">{order.user?.phone || '-'}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="text-slate-600 dark:text-slate-300">
                            • {item.productName} ({item.quantity} {item.unit})
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-black text-sm text-emerald-600 dark:text-emerald-400">
                      ฿{order.total.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <OrderStatusBadge status={order.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4">
                      {updatingId === order.id ? (
                        <span className="text-xs text-slate-400 animate-pulse">กำลังบันทึก...</span>
                      ) : (
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="PENDING">1. รอดำเนินการ (PENDING)</option>
                          <option value="CONFIRMED">2. ยืนยันออเดอร์ (CONFIRMED)</option>
                          <option value="PREPARING">3. กำลังจัดเตรียม (PREPARING)</option>
                          <option value="READY">4. พร้อมรับสินค้า (READY)</option>
                          <option value="COMPLETED">5. สำเร็จ (COMPLETED)</option>
                          <option value="CANCELLED">6. ยกเลิก (CANCELLED)</option>
                        </select>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onNavigate(`/my-orders/${order.id}`)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>ดูข้อมูล</span>
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
