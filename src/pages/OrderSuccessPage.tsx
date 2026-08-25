import React, { useEffect } from 'react';
import { CheckCircle2, ShoppingBag, ArrowRight, Eye, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

interface OrderSuccessPageProps {
  orderId: string;
  orderNumber?: string;
  total?: number;
  onNavigate: (path: string) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({
  orderId,
  orderNumber = '',
  total = 0,
  onNavigate,
}) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6"
      >
        <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50 dark:ring-emerald-950/30">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>สั่งจองสำเร็จเรียบร้อย</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            ขอบคุณที่สั่งผลไม้กับเรา!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            ระบบได้บันทึกคำสั่งซื้อของคุณแล้ว แอดมินจะดำเนินการตรวจสอบสต็อกและจัดเตรียมผลไม้สดใหม่ให้ทันที
          </p>
        </div>

        {orderNumber && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-2">
            <div className="flex justify-between items-center text-slate-500">
              <span>หมายเลขคำสั่งซื้อ</span>
              <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                {orderNumber}
              </span>
            </div>
            {total > 0 && (
              <div className="flex justify-between items-center text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>ยอดชำระ / ยอดรวม</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-base">
                  ฿{total.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => onNavigate(`/my-orders/${orderId}`)}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>ดูรายละเอียดคำสั่งซื้อ</span>
          </button>

          <button
            onClick={() => onNavigate('/fruits')}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>กลับสู่หน้าร้านผลไม้</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
