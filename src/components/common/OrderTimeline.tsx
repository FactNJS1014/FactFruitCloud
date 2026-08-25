import React from 'react';
import { OrderStatus, OrderStatusHistory } from '../../types';
import { Check, Clock, Package, Truck, CheckCheck, XCircle } from 'lucide-react';

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  history?: OrderStatusHistory[];
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ currentStatus, history = [] }) => {
  const steps: { status: OrderStatus; label: string; description: string; icon: React.ReactNode }[] = [
    {
      status: 'PENDING',
      label: 'รอดำเนินการ',
      description: 'ระบบบันทึกรายการสั่งจองแล้ว',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      status: 'CONFIRMED',
      label: 'ยืนยันออเดอร์',
      description: 'แอดมินยืนยันและเช็คสต็อก',
      icon: <Check className="w-4 h-4" />,
    },
    {
      status: 'PREPARING',
      label: 'กำลังจัดเตรียม',
      description: 'คัดสรรผลไม้สดและบรรจุกล่อง',
      icon: <Package className="w-4 h-4" />,
    },
    {
      status: 'READY',
      label: 'พร้อมรับสินค้า',
      description: 'ผลไม้จัดเตรียมเสร็จ พร้อมรับที่ร้าน',
      icon: <Truck className="w-4 h-4" />,
    },
    {
      status: 'COMPLETED',
      label: 'สำเร็จ',
      description: 'ลูกค้ารับสินค้าเรียบร้อยแล้ว',
      icon: <CheckCheck className="w-4 h-4" />,
    },
  ];

  if (currentStatus === 'CANCELLED') {
    const cancelHist = history.find((h) => h.status === 'CANCELLED');
    return (
      <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-rose-900 dark:text-rose-100">คำสั่งซื้อถูกยกเลิกแล้ว</h4>
            <p className="text-sm text-rose-700 dark:text-rose-300 mt-0.5">
              {cancelHist?.note || 'รายการสั่งจองนี้ถูกยกเลิก และคืนจำนวนสต็อกผลไม้เข้าระบบแล้ว'}
            </p>
            {cancelHist?.createdAt && (
              <p className="text-xs text-rose-500 dark:text-rose-400 mt-2">
                เมื่อ {new Date(cancelHist.createdAt).toLocaleString('th-TH')}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const statusOrder: Record<OrderStatus, number> = {
    PENDING: 0,
    CONFIRMED: 1,
    PREPARING: 2,
    READY: 3,
    COMPLETED: 4,
    CANCELLED: -1,
  };

  const currentIndex = statusOrder[currentStatus] ?? 0;

  return (
    <div className="w-full py-4">
      {/* Horizontal Steps (Desktop) */}
      <div className="hidden md:grid grid-cols-5 gap-2 relative">
        <div className="absolute top-5 left-8 right-8 h-1 bg-slate-200 dark:bg-slate-700 -z-0">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${(currentIndex / 4) * 100}%` }}
          />
        </div>

        {steps.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const hist = history.find((h) => h.status === step.status);

          return (
            <div key={step.status} className="flex flex-col items-center text-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  isDone
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-300 dark:border-slate-600'
                } ${isCurrent ? 'ring-4 ring-emerald-100 dark:ring-emerald-950/60 scale-110' : ''}`}
              >
                {step.icon}
              </div>

              <div className="mt-3">
                <div
                  className={`text-sm font-semibold ${
                    isCurrent
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : isDone
                      ? 'text-slate-800 dark:text-slate-200'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {step.label}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {step.description}
                </div>
                {hist && (
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                    {new Date(hist.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Vertical Steps (Mobile) */}
      <div className="md:hidden space-y-4 relative pl-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
        {steps.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const hist = history.find((h) => h.status === step.status);

          return (
            <div key={step.status} className="relative flex items-start gap-3">
              <div
                className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                  isDone
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-600'
                } ${isCurrent ? 'ring-2 ring-emerald-200' : ''}`}
              >
                {step.icon}
              </div>

              <div>
                <div
                  className={`text-sm font-semibold ${
                    isCurrent
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : isDone
                      ? 'text-slate-800 dark:text-slate-200'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {hist?.note || step.description}
                </div>
                {hist && (
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {new Date(hist.createdAt).toLocaleString('th-TH')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
