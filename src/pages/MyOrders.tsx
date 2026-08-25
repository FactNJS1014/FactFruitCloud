import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Order, OrderStatus } from '../types';
import { OrderStatusBadge } from '../components/common/OrderStatusBadge';
import { Search, ShoppingBag, Eye, Calendar, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface MyOrdersProps {
  onNavigate: (path: string) => void;
}

export const MyOrders: React.FC<MyOrdersProps> = ({ onNavigate }) => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeStatus, setActiveStatus] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchOrders = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (activeStatus !== 'ALL') {
        params.append('status', activeStatus);
      }
      if (search.trim()) {
        params.append('search', search.trim());
      }

      const res = await fetch(`/api/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.data) {
        setOrders(json.data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeStatus, token]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const tabs: { key: string; label: string }[] = [
    { key: 'ALL', label: 'ทั้งหมด' },
    { key: 'PENDING', label: 'รอดำเนินการ' },
    { key: 'CONFIRMED', label: 'ยืนยันแล้ว' },
    { key: 'PREPARING', label: 'กำลังจัดเตรียม' },
    { key: 'READY', label: 'พร้อมรับสินค้า' },
    { key: 'COMPLETED', label: 'สำเร็จ' },
    { key: 'CANCELLED', label: 'ยกเลิกแล้ว' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            รายการสั่งซื้อของฉัน
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ติดตามสถานะและประวัติการสั่งจองผลไม้ทั้งหมดของคุณ
          </p>
        </div>

        <button
          onClick={() => onNavigate('/fruits')}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>สั่งจองผลไม้เพิ่ม</span>
        </button>
      </div>

      {/* Filters and Search */}
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
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาตามรหัสคำสั่งซื้อ เช่น ORD-2026..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            ค้นหา
          </button>
        </form>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 animate-pulse space-y-4"
            >
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
              <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
          <ShoppingBag className="w-12 h-12 stroke-1 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">ไม่พบรายการสั่งซื้อ</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            คุณยังไม่มีรายการสั่งซื้อในสถานะนี้ สามารถเลือกซื้อผลไม้สดใหม่ได้ทุกวัน
          </p>
          <button
            onClick={() => onNavigate('/fruits')}
            className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            ไปที่ร้านค้าผลไม้
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-800 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-base text-slate-900 dark:text-white">
                      {order.orderNumber}
                    </span>
                    <OrderStatusBadge status={order.status} size="sm" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(order.createdAt).toLocaleString('th-TH')}
                    </span>
                    {order.pickupDate && (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        เวลารับ: {new Date(order.pickupDate).toLocaleString('th-TH')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">ยอดสุทธิ</span>
                    <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                      ฿{order.total.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => onNavigate(`/my-orders/${order.id}`)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>รายละเอียด</span>
                  </button>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                  >
                    <img
                      src={item.product?.image || 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=80&auto=format&fit=crop&q=80'}
                      alt={item.productName}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.productName}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {item.quantity} {item.unit} × ฿{item.price.toLocaleString()}
                      </p>
                    </div>
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                      ฿{item.subtotal.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
