import React from 'react';
import { OrderStatus } from '../../types';
import { Clock, CheckCircle, Package, Truck, CheckCheck, XCircle } from 'lucide-react';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const configMap: Record<
    OrderStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    PENDING: {
      label: 'รอดำเนินการ',
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    CONFIRMED: {
      label: 'ยืนยันแล้ว',
      bg: 'bg-blue-50 dark:bg-blue-950/60',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800',
      icon: <CheckCircle className="w-3.5 h-3.5" />,
    },
    PREPARING: {
      label: 'กำลังจัดเตรียม',
      bg: 'bg-indigo-50 dark:bg-indigo-950/60',
      text: 'text-indigo-700 dark:text-indigo-300',
      border: 'border-indigo-200 dark:border-indigo-800',
      icon: <Package className="w-3.5 h-3.5" />,
    },
    READY: {
      label: 'พร้อมรับสินค้า',
      bg: 'bg-purple-50 dark:bg-purple-950/60',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-800',
      icon: <Truck className="w-3.5 h-3.5" />,
    },
    COMPLETED: {
      label: 'สำเร็จ',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: <CheckCheck className="w-3.5 h-3.5" />,
    },
    CANCELLED: {
      label: 'ยกเลิกแล้ว',
      bg: 'bg-rose-50 dark:bg-rose-950/60',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-200 dark:border-rose-800',
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
  };

  const current = configMap[status] || {
    label: status,
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
    icon: null,
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${current.bg} ${current.text} ${current.border} ${sizeClasses[size]} whitespace-nowrap shadow-xs`}
    >
      {showIcon && current.icon}
      <span>{current.label}</span>
    </span>
  );
};
