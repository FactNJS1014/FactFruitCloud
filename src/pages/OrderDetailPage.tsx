import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Order } from '../types';
import { OrderStatusBadge } from '../components/common/OrderStatusBadge';
import { OrderTimeline } from '../components/common/OrderTimeline';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  AlertTriangle,
  XCircle,
  ShoppingBag,
  CheckCircle,
} from 'lucide-react';

interface OrderDetailPageProps {
  orderId: string;
  onNavigate: (path: string) => void;
}

export const OrderDetailPage: React.FC<OrderDetailPageProps> = ({ orderId, onNavigate }) => {
  const { token, isAdmin } = useAuth();
  const { success, error } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  const fetchOrder = async () => {
    if (!orderId) return;
    try {
      setIsLoading(true);
      const data = await api.getOrderById(token, orderId);
      if (data) {
        setOrder(data);
      } else {
        error('ไม่พบข้อมูลคำสั่งซื้อ');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId, token]);

  const handleCancelOrder = async () => {
    if (!order) return;
    try {
      setIsCancelling(true);
      await api.cancelOrder(token, order.id, 'ลูกค้ายกเลิกคำสั่งซื้อผ่านระบบ');

      success('ยกเลิกคำสั่งซื้อและคืนสต็อกเรียบร้อยแล้ว');
      setIsCancelModalOpen(false);
      fetchOrder();
    } catch (err) {
      error('เกิดข้อผิดพลาดในการยกเลิกคำสั่งซื้อ');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
        <span className="w-8 h-8 border-4 border-emerald-600/30 border-t-emerald-600 rounded-full inline-block animate-spin" />
        <p className="text-xs text-slate-500">กำลังโหลดรายละเอียดคำสั่งซื้อ...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">ไม่พบคำสั่งซื้อนี้</h2>
        <button
          onClick={() => onNavigate(isAdmin ? '/admin/orders' : '/my-orders')}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
        >
          กลับสู่หน้ารายการสั่งซื้อ
        </button>
      </div>
    );
  }

  const canCancel = order.status === 'PENDING';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate(isAdmin ? '/admin/orders' : '/my-orders')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ย้อนกลับไปรายการสั่งซื้อ</span>
        </button>

        {canCancel && (
          <button
            onClick={() => setIsCancelModalOpen(true)}
            className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4" />
            <span>ยกเลิกคำสั่งซื้อนี้</span>
          </button>
        )}
      </div>

      {/* Main Order Card Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                {order.orderNumber}
              </h1>
              <OrderStatusBadge status={order.status} size="md" />
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              สั่งซื้อเมื่อ: {new Date(order.createdAt).toLocaleString('th-TH')}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">ยอดรวมสุทธิ</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              ฿{order.total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Order Status Timeline */}
        <div className="pt-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            สถานะการดำเนินการ
          </h3>
          <OrderTimeline currentStatus={order.status} history={order.statusHistory} />
        </div>
      </div>

      {/* Grid: Order Items & Customer Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items List (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            รายการผลไม้ที่สั่งจอง ({order.items?.length || 0} รายการ)
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {order.items?.map((item) => (
              <div key={item.id} className="py-3.5 flex items-center gap-4">
                <img
                  src={item.product?.image || 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=100&auto=format&fit=crop&q=80'}
                  alt={item.productName}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {item.productName}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        ราคา: ฿{(item.unitPrice ?? (item as any).price ?? item.product?.price ?? 0).toLocaleString()} / {item.unit || 'กก.'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                        ฿{(item.subtotal ?? (item.unitPrice || (item as any).price || 0) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      จำนวน: {item.quantity} {item.unit}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing breakdown */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>ยอดรวมค่าสินค้า</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                ฿{order.subtotal?.toLocaleString() || order.total.toLocaleString()}
              </span>
            </div>
            {order.discount !== undefined && order.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>ส่วนลด</span>
                <span>-฿{order.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
              <span>ยอดรวมสุทธิ</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-lg font-black">
                ฿{order.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Customer & Delivery Info (1 col) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              ข้อมูลผู้สั่งจอง
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block">ชื่อลูกค้า:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'ลูกค้าทั่วไป'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block">อีเมล:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {order.user?.email || '-'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block">เบอร์โทรศัพท์:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {order.user?.phone || '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              ข้อมูลการรับสินค้า
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block">วัน-เวลาที่นัดรับ:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    {order.pickupDate
                      ? new Date(order.pickupDate).toLocaleString('th-TH')
                      : 'รับที่ร้านทันทีเมื่อพร้อม'}
                  </span>
                </div>
              </div>

              {order.note && (
                <div className="flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block">หมายเหตุเพิ่มเติม:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {order.note}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Confirm Dialog */}
      <ConfirmDialog
        isOpen={isCancelModalOpen}
        title="ยืนยันการยกเลิกคำสั่งซื้อ"
        message={`คุณต้องการยกเลิกคำสั่งซื้อหมายเลข ${order.orderNumber} หรือไม่? สต็อกสินค้าจะถูกคืนกลับเข้าระบบโดยอัตโนมัติ`}
        confirmText="ยืนยันการยกเลิก"
        cancelText="กลับ"
        variant="danger"
        isLoading={isCancelling}
        onConfirm={handleCancelOrder}
        onCancel={() => setIsCancelModalOpen(false)}
      />
    </div>
  );
};
