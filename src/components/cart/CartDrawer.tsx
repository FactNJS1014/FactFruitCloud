import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Calendar, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface CartDrawerProps {
  onOrderSuccess?: (orderId: string, orderNumber: string, total: number) => void;
  onNavigateToLogin?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOrderSuccess, onNavigateToLogin }) => {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart, subtotal } = useCart();
  const { isAuthenticated, token } = useAuth();
  const { error, success } = useToast();

  const [note, setNote] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      setIsCartOpen(false);
      if (onNavigateToLogin) onNavigateToLogin();
      return;
    }

    if (items.length === 0) {
      error('ไม่มีสินค้าในตะกร้า');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        note: note.trim() || undefined,
        pickupDate: pickupDate || undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ');
        setIsSubmitting(false);
        return;
      }

      // Success! Clear cart & trigger celebratory confetti
      clearCart();
      setIsCartOpen(false);
      success(`สั่งจองสำเร็จ! หมายเลขคำสั่งซื้อ ${data.order.orderNumber}`);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Ignore if confetti fails
      }

      if (onOrderSuccess) {
        onOrderSuccess(data.order.id, data.order.orderNumber, data.order.total);
      }
    } catch (err) {
      error('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full sm:w-96 md:w-screen md:max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col h-full"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 dark:text-white text-base">รายการสั่งจองผลไม้</h2>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {items.length} รายการในตะกร้า
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                      <ShoppingBag className="w-8 h-8 stroke-1" />
                    </div>
                    <p className="font-medium text-slate-700 dark:text-slate-300">ยังไม่มีสินค้าในรายการสั่งจอง</p>
                    <p className="text-xs text-slate-400 mt-1">เลือกผลไม้สดที่คุณต้องการแล้วเพิ่มลงตะกร้าได้เลย</p>
                  </div>
                ) : (
                  items.map((item) => {
                    const isWeight = item.product.unit === 'กิโลกรัม' || item.product.unit === 'กรัม';
                    const step = isWeight ? 0.5 : 1;
                    const itemTotal = Math.round(item.product.price * item.quantity * 100) / 100;

                    return (
                      <div
                        key={item.product.id}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                      >
                        <img
                          src={item.product.image || 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=120&auto=format&fit=crop&q=80'}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                        />

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {item.product.name}
                          </h4>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            ฿{item.product.price.toLocaleString()} / {item.product.unit}
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            {/* Stepper */}
                            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 p-0.5">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - step)}
                                className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-9 text-center text-xs font-bold text-slate-800 dark:text-slate-200">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + step)}
                                disabled={item.quantity >= item.product.stock}
                                className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="text-right font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                              ฿{itemTotal.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="ลบรายการ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}

                {/* Additional Inputs (Note & Pickup Date) */}
                {items.length > 0 && (
                  <div className="pt-2 space-y-3 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        หมายเหตุ / คำขอพิเศษ:
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น ขอผลไม้สุกพร้อมทาน, บรรจุแยกถุง"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        วันที่ต้องการเข้ารับผลไม้:
                      </label>
                      <input
                        type="datetime-local"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer & Checkout */}
              {items.length > 0 && (
                <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>ยอดรวมสินค้า</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        ฿{subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>ส่วนลด</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">฿0</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                      <span>ยอดสุทธิ</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xl">
                        ฿{subtotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {!isAuthenticated ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCartOpen(false);
                        if (onNavigateToLogin) onNavigateToLogin();
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
                    >
                      <span>เข้าสู่ระบบเพื่อดำเนินการสั่งจอง</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCheckout}
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          <span>กำลังบันทึกรายการ...</span>
                        </>
                      ) : (
                        <>
                          <span>ยืนยันการสั่งจองสินค้า</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
