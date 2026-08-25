import React from 'react';

interface StockBadgeProps {
  stock: number;
  minimumStock?: number;
  unit: string;
}

export const StockBadge: React.FC<StockBadgeProps> = ({ stock, minimumStock = 5, unit }) => {
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
        สินค้าหมด (0 {unit})
      </span>
    );
  }

  if (stock <= minimumStock) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        สต็อกต่ำ ({stock} {unit})
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      พร้อมจำหน่าย ({stock} {unit})
    </span>
  );
};
