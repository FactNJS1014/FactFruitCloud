import React, { useState } from 'react';
import { FruitProduct } from '../../types';
import { useCart } from '../../context/CartContext';
import { StockBadge } from '../common/StockBadge';
import { ShoppingCart, Plus, Minus, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface FruitCardProps {
  product: FruitProduct;
  onOpenDetail?: (product: FruitProduct) => void;
}

export const FruitCard: React.FC<FruitCardProps> = ({ product, onOpenDetail }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState<number>(1);

  const isSoldOut = !product.isAvailable || product.stock <= 0;

  // Choose step increment based on unit (e.g. weight in kg/gram supports 0.5 or 0.25)
  const isWeightUnit = product.unit === 'กิโลกรัม' || product.unit === 'กรัม';
  const step = isWeightUnit ? 0.5 : 1;
  const minQty = isWeightUnit ? 0.5 : 1;

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity + step <= product.stock) {
      setQuantity((prev) => Math.round((prev + step) * 100) / 100);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity - step >= minQty) {
      setQuantity((prev) => Math.round((prev - step) * 100) / 100);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSoldOut) {
      addToCart(product, quantity);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => onOpenDetail && onOpenDetail(product)}
      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-800 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Image container */}
      <div className="relative aspect-4/3 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <img
          src={product.image || 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80'}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category tag */}
        {product.category && (
          <div className="absolute top-2.5 left-2.5">
            <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wide rounded-lg bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 backdrop-blur-md shadow-xs border border-white/40 dark:border-slate-700">
              {product.category.name}
            </span>
          </div>
        )}

        {/* Quick info button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenDetail) onOpenDetail(product);
          }}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/40 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
          title="ดูรายละเอียดเพิ่มเติม"
        >
          <Info className="w-4 h-4" />
        </button>

        {isSoldOut && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-lg">
              สินค้าหมดชั่วคราว
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500 uppercase">
              {product.code}
            </span>
            <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {product.name}
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {product.description || 'ผลไม้สดคัดสรรพิเศษ คุณภาพระดับพรีเมียม'}
        </p>

        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            ฿{product.price.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">/ {product.unit}</span>
        </div>

        <div className="mt-2">
          <StockBadge stock={product.stock} minimumStock={product.minimumStock} unit={product.unit} />
        </div>

        {/* Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Quantity Stepper */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`flex items-center justify-between sm:justify-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/80 p-0.5 ${
              isSoldOut ? 'opacity-40 pointer-events-none' : ''
            }`}
          >
            <button
              type="button"
              onClick={handleDecrement}
              disabled={quantity <= minQty || isSoldOut}
              className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-40"
              aria-label="ลดจำนวน"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <span className="w-10 text-center font-bold text-xs text-slate-800 dark:text-slate-200">
              {quantity}
            </span>

            <button
              type="button"
              onClick={handleIncrement}
              disabled={quantity >= product.stock || isSoldOut}
              className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-40"
              aria-label="เพิ่มจำนวน"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to cart button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isSoldOut}
            className={`flex-1 py-2 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-all duration-200 ${
              isSoldOut
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-md hover:shadow-emerald-600/20 active:scale-98'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">เพิ่มลงตะกร้า</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
