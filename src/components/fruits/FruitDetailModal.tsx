import React, { useState } from 'react';
import { FruitProduct } from '../../types';
import { useCart } from '../../context/CartContext';
import { StockBadge } from '../common/StockBadge';
import { X, ShoppingCart, Plus, Minus, Check, Sparkles, ShieldCheck, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FruitDetailModalProps {
  product: FruitProduct | null;
  onClose: () => void;
}

export const FruitDetailModal: React.FC<FruitDetailModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState<number>(1);

  const isSoldOut = !product.isAvailable || product.stock <= 0;
  const isWeightUnit = product.unit === 'กิโลกรัม' || product.unit === 'กรัม';
  const step = isWeightUnit ? 0.5 : 1;
  const minQty = isWeightUnit ? 0.5 : 1;

  const handleIncrement = () => {
    if (quantity + step <= product.stock) {
      setQuantity((prev) => Math.round((prev + step) * 100) / 100);
    }
  };

  const handleDecrement = () => {
    if (quantity - step >= minQty) {
      setQuantity((prev) => Math.round((prev - step) * 100) / 100);
    }
  };

  const handleAdd = () => {
    if (!isSoldOut) {
      addToCart(product, quantity);
      onClose();
    }
  };

  const itemSubtotal = Math.round(product.price * quantity * 100) / 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full z-10 max-h-[90vh] flex flex-col md:flex-row"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left: Fruit image */}
          <div className="md:w-1/2 relative bg-slate-100 dark:bg-slate-800 min-h-[220px] md:min-h-full">
            <img
              src={product.image || 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80'}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {product.category && (
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 text-xs font-semibold rounded-xl bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 backdrop-blur-md shadow-md">
                  {product.category.name}
                </span>
              </div>
            )}
          </div>

          {/* Right: Details & Order Stepper */}
          <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  {product.code}
                </span>
                <StockBadge stock={product.stock} minimumStock={product.minimumStock} unit={product.unit} />
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-2">
                {product.name}
              </h2>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  ฿{product.price.toLocaleString()}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">/ {product.unit}</span>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <p className="leading-relaxed">
                  {product.description || 'ผลไม้สดคัดสรรพิเศษ เก็บเกี่ยวตามฤดูกาลจากสวนชั้นนำ หวานฉ่ำ สดใหม่ สะอาด ปลอดภัย'}
                </p>

                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>การันตีความสดใหม่ 100% คัดเกรดทุกลูก</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>รองรับการสั่งจองล่วงหน้าและระบุเวลาเข้ามารับได้</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Stepper and Add to Cart */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3 text-sm">
                <span className="text-slate-500 dark:text-slate-400">ระบุจำนวน ({product.unit}):</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  รวม: ฿{itemSubtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Stepper */}
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 p-1">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={quantity <= minQty || isSoldOut}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-40"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <input
                    type="number"
                    step={step}
                    min={minQty}
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val >= minQty && val <= product.stock) {
                        setQuantity(val);
                      }
                    }}
                    className="w-14 text-center font-bold text-sm text-slate-800 dark:text-slate-200 bg-transparent focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={quantity >= product.stock || isSoldOut}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart button */}
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={isSoldOut}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    isSoldOut
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-98'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>เพิ่มลงรายการสั่งจอง</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
