import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { FruitProduct } from '../../types';
import { StockBadge } from '../../components/common/StockBadge';
import {
  Boxes,
  AlertTriangle,
  Plus,
  Minus,
  RotateCcw,
  Search,
  History,
  X,
  Save,
  CheckCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const InventoryManagement: React.FC = () => {
  const { token } = useAuth();
  const { success, error } = useToast();

  const [products, setProducts] = useState<FruitProduct[]>([]);
  const [lowStock, setLowStock] = useState<FruitProduct[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restock Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<FruitProduct | null>(null);
  const [adjustType, setAdjustType] = useState<'RESTOCK' | 'CORRECTION' | 'DAMAGE'>('RESTOCK');
  const [quantity, setQuantity] = useState<number>(10);
  const [note, setNote] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const [invData, lowData, logsData] = await Promise.all([
        api.getInventory(token),
        api.getLowStock(token),
        api.getInventoryLogs(token),
      ]);

      if (invData) setProducts(invData);
      if (lowData) setLowStock(lowData);
      if (logsData) setLogs(logsData);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [token]);

  const handleOpenRestock = (prod: FruitProduct) => {
    setSelectedProduct(prod);
    setAdjustType('RESTOCK');
    setQuantity(20);
    setNote('เติมผลไม้สดรอบใหม่จากสวน');
    setIsModalOpen(true);
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      setIsSaving(true);
      const updated = await api.adjustStock(
        token,
        selectedProduct.id,
        adjustType,
        parseFloat(String(quantity)),
        note.trim() || undefined
      );

      success(`ปรับสต็อก "${selectedProduct.name}" สำเร็จ (สต็อกใหม่: ${updated?.stock ?? selectedProduct.stock} ${selectedProduct.unit})`);
      setIsModalOpen(false);
      fetchInventory();
    } catch (err) {
      error('เกิดข้อผิดพลาดในการปรับสต็อกสินค้า');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          จัดการคลังสต็อกผลไม้ (Inventory)
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          ตรวจสอบสต็อกคงเหลือ แจ้งเตือนสินค้าใกล้หมด และบันทึกการรับเข้า/ตัดจ่ายผลไม้
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">ผลไม้ทั้งหมดในคลัง</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {products.length} ชนิด
          </div>
        </div>

        <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-3xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
            สินค้าสต็อกต่ำกว่าเกณฑ์
          </span>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-2">
            {lowStock.length} รายการ
          </div>
        </div>

        <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-3xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">
            สินค้าหมดสต็อก (0 หน่วย)
          </span>
          <div className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-2">
            {products.filter((p) => p.stock <= 0).length} รายการ
          </div>
        </div>
      </div>

      {/* Low Stock Alerts Banner if any */}
      {lowStock.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-3xl p-5">
          <div className="flex items-center gap-2 mb-3 text-amber-800 dark:text-amber-200 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>รายการผลไม้ที่ต้องเติมสต็อกเร่งด่วน:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {lowStock.map((prod) => (
              <div
                key={prod.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/60"
              >
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {prod.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono">{prod.code}</p>
                </div>

                <div className="flex items-center gap-2">
                  <StockBadge stock={prod.stock} minimumStock={prod.minimumStock} unit={prod.unit} />
                  <button
                    onClick={() => handleOpenRestock(prod)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
                  >
                    + เติม
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Stock Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">รายการสต็อกผลไม้ทั้งหมด</h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ หรือรหัสผลไม้..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Mobile Inventory Cards (Screen < md) */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {filteredProducts.map((p) => (
            <div key={p.id} className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <img
                  src={p.image || 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=80&auto=format&fit=crop&q=80'}
                  alt={p.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-[10px] text-slate-400 block uppercase">{p.code}</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{p.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">คงเหลือ:</span>
                    <span className="font-black text-sm text-slate-900 dark:text-white">
                      {p.stock} {p.unit}
                    </span>
                    <span className="text-[10px] text-slate-400">(ขั้นต่ำ: {p.minimumStock})</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <StockBadge stock={p.stock} minimumStock={p.minimumStock} unit={p.unit} />
                <button
                  onClick={() => handleOpenRestock(p)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs inline-flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ปรับสต็อก</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table (Screen >= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">สินค้า</th>
                <th className="py-3 px-4">รหัส</th>
                <th className="py-3 px-4">สต็อกคงเหลือ</th>
                <th className="py-3 px-4">เกณฑ์ขั้นต่ำ</th>
                <th className="py-3 px-4">สถานะสต็อก</th>
                <th className="py-3 px-4 text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={p.image || 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=60&auto=format&fit=crop&q=80'}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <span className="font-bold text-slate-900 dark:text-white text-xs">{p.name}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-500">{p.code}</td>

                  <td className="py-3 px-4 font-black text-slate-900 dark:text-white text-sm">
                    {p.stock} <span className="text-xs font-normal text-slate-400">{p.unit}</span>
                  </td>

                  <td className="py-3 px-4 text-slate-500">
                    {p.minimumStock} {p.unit}
                  </td>

                  <td className="py-3 px-4">
                    <StockBadge stock={p.stock} minimumStock={p.minimumStock} unit={p.unit} />
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleOpenRestock(p)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white font-bold text-xs transition-colors inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ปรับสต็อก</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      <AnimatePresence>
        {isModalOpen && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md w-full z-10"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                ปรับสต็อก: {selectedProduct.name}
              </h2>
              <p className="text-xs text-slate-400 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                สต็อกปัจจุบัน: <strong className="text-emerald-600 font-black">{selectedProduct.stock}</strong> {selectedProduct.unit}
              </p>

              <form onSubmit={handleAdjustStock} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ประเภทการปรับสต็อก
                  </label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="RESTOCK">1. รับผลไม้เข้าคลัง / เติมสต็อก (+)</option>
                    <option value="CORRECTION">2. ปรับปรุงยอดสต็อกตามการนับจริง</option>
                    <option value="DAMAGE">3. ตัดจำหน่ายผลไม้เสียหาย / เน่าเสีย (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    จำนวน ({selectedProduct.unit}) *
                  </label>
                  <input
                    type="number"
                    required
                    step="any"
                    min={0.1}
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    บันทึกหมายเหตุ / เหตุผล
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น สั่งซื้อจากสวนระยอง, ตรวจนับสต็อกประจำสัปดาห์"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 font-bold"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 inline-flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    {isSaving && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                    <Save className="w-4 h-4" />
                    <span>ยืนยันการปรับสต็อก</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
