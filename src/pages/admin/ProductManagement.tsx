import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FruitProduct, FruitCategory } from '../../types';
import { StockBadge } from '../../components/common/StockBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ImageUploadInput } from '../../components/common/ImageUploadInput';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  SlidersHorizontal,
  Package,
  Layers,
  X,
  Save,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ProductManagement: React.FC = () => {
  const { token } = useAuth();
  const { success, error } = useToast();

  const [products, setProducts] = useState<FruitProduct[]>([]);
  const [categories, setCategories] = useState<FruitCategory[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<FruitProduct | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [deletingProduct, setDeletingProduct] = useState<FruitProduct | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    categoryId: '',
    price: 0,
    stock: 0,
    unit: 'กิโลกรัม',
    minimumStock: 5,
    description: '',
    image: '',
    isAvailable: true,
  });

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const json = await res.json();
      if (json.data) setCategories(json.data);
    } catch (e) {}
  };

  const fetchProducts = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ limit: '100' });
      if (selectedCat !== 'all') params.append('categoryId', selectedCat);
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json();
      if (json.data) setProducts(json.data);
    } catch (err) {
      console.error('Error fetching products', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCat, token]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      code: `FRUIT-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      categoryId: categories[0]?.id || '',
      price: 100,
      stock: 50,
      unit: 'กิโลกรัม',
      minimumStock: 5,
      description: '',
      image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80',
      isAvailable: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: FruitProduct) => {
    setEditingProduct(prod);
    setFormData({
      code: prod.code,
      name: prod.name,
      categoryId: prod.categoryId,
      price: prod.price,
      stock: prod.stock,
      unit: prod.unit,
      minimumStock: prod.minimumStock,
      description: prod.description || '',
      image: prod.image || '',
      isAvailable: prod.isAvailable,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      error('กรุณาระบุชื่อและรหัสสินค้า');
      return;
    }

    try {
      setIsSaving(true);
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        error(json.error || 'เกิดข้อผิดพลาดในการบันทึกสินค้า');
        return;
      }

      success(editingProduct ? 'อัปเดตข้อมูลสินค้าเรียบร้อยแล้ว' : 'เพิ่มสินค้าผลไม้ใหม่เรียบร้อยแล้ว');
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      error('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct || !token) return;
    try {
      setIsSaving(true);
      const res = await fetch(`/api/products/${deletingProduct.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok) {
        error(json.error || 'ไม่สามารถลบสินค้าได้');
        return;
      }

      success(`ลบสินค้า "${deletingProduct.name}" เรียบร้อยแล้ว`);
      setIsDeleteOpen(false);
      fetchProducts();
    } catch (err) {
      error('เกิดข้อผิดพลาดในการลบสินค้า');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAvailable = async (prod: FruitProduct) => {
    try {
      const res = await fetch(`/api/products/${prod.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isAvailable: !prod.isAvailable }),
      });
      if (res.ok) {
        success(`เปลี่ยนสถานะ "${prod.name}" เป็น ${!prod.isAvailable ? 'พร้อมจำหน่าย' : 'ปิดจำหน่าย'}`);
        fetchProducts();
      }
    } catch (e) {
      error('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            จัดการสินค้าผลไม้ (Products)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            เพิ่ม ลบ แก้ไขข้อมูลผลไม้ ราคา สต็อก และสถานะการจำหน่าย
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 inline-flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มผลไม้ใหม่</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="w-full md:w-80 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ หรือรหัสสินค้า..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold"
          >
            ค้นหา
          </button>
        </form>

        {/* Category selector */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCat === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            ทั้งหมด
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCat === c.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table & Mobile Cards */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400">กำลังโหลดรายการสินค้า...</div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Package className="w-12 h-12 stroke-1 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">ไม่พบรายการผลไม้</p>
            <p className="text-xs text-slate-400 mt-1">คลิกปุ่ม "+ เพิ่มผลไม้ใหม่" เพื่อเริ่มสร้างรายการสินค้า</p>
          </div>
        ) : (
          <>
            {/* Mobile Card List (Screen < md) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {products.map((p) => (
                <div key={p.id} className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={p.image || 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=120&auto=format&fit=crop&q=80'}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                          {p.code}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          {p.category?.name || '-'}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate mt-0.5">
                        {p.name}
                      </h4>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                          ฿{p.price.toLocaleString()}
                        </span>
                        <span className="text-slate-400 text-xs"> / {p.unit}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <StockBadge stock={p.stock} minimumStock={p.minimumStock} unit={p.unit} />
                    <button
                      onClick={() => handleToggleAvailable(p)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                        p.isAvailable
                          ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {p.isAvailable ? 'เปิดจำหน่าย' : 'ปิดจำหน่าย'}
                    </button>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>แก้ไข</span>
                    </button>
                    <button
                      onClick={() => {
                        setDeletingProduct(p);
                        setIsDeleteOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบ</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (Screen >= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">รูปภาพ & ข้อมูลสินค้า</th>
                    <th className="py-3.5 px-4">หมวดหมู่</th>
                    <th className="py-3.5 px-4">ราคา / หน่วย</th>
                    <th className="py-3.5 px-4">สต็อกคงเหลือ</th>
                    <th className="py-3.5 px-4">สถานะจำหน่าย</th>
                    <th className="py-3.5 px-4 text-right">การกระทำ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image || 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=80&auto=format&fit=crop&q=80'}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div>
                            <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                              {p.code}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {p.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
                          {p.category?.name || '-'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                          ฿{p.price.toLocaleString()}
                        </span>
                        <span className="text-slate-400 text-xs"> / {p.unit}</span>
                      </td>

                      <td className="py-3 px-4">
                        <StockBadge stock={p.stock} minimumStock={p.minimumStock} unit={p.unit} />
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleAvailable(p)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                            p.isAvailable
                              ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {p.isAvailable ? 'เปิดจำหน่าย' : 'ปิดจำหน่าย'}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-2 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 dark:text-slate-300 transition-colors"
                            title="แก้ไขสินค้า"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingProduct(p);
                              setIsDeleteOpen(true);
                            }}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                            title="ลบสินค้า"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
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
              className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-2xl w-full z-10 my-8 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                {editingProduct ? 'แก้ไขข้อมูลสินค้าผลไม้' : 'เพิ่มสินค้าผลไม้ใหม่'}
              </h2>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      รหัสสินค้า (Product Code) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white uppercase font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      ชื่อผลไม้ (Fruit Name) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น มะม่วงน้ำดอกไม้, ส้มสายน้ำผึ้ง"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      หมวดหมู่ *
                    </label>
                    <select
                      required
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-semibold"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      ราคา (บาท) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      หน่วยนับ *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="กิโลกรัม, ลูก, แพ็ค, กล่อง"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      สต็อกสินค้าปัจจุบัน *
                    </label>
                    <input
                      type="number"
                      required
                      step="any"
                      min={0}
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      เกณฑ์แจ้งเตือนสต็อกต่ำ (Minimum Stock)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.minimumStock}
                      onChange={(e) => setFormData({ ...formData, minimumStock: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>
                </div>

                <ImageUploadInput
                  label="รูปภาพสินค้า (Product Picture)"
                  value={formData.image}
                  onChange={(val) => setFormData({ ...formData, image: val })}
                  supportPresets={true}
                />

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    คำอธิบายสินค้า (Description)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="รายละเอียด ความหวาน สายพันธุ์ หรือคำแนะนำการเก็บรักษา"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="isAvailable" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    เปิดให้สั่งจองและพร้อมจำหน่ายหน้าร้าน
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
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
                    <span>บันทึกสินค้า</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="ยืนยันการลบสินค้า"
        message={`คุณต้องการลบผลไม้ "${deletingProduct?.name}" (${deletingProduct?.code}) ใช่หรือไม่? การกระทำนี้ไม่สามารถยกเลิกได้`}
        confirmText="ลบสินค้า"
        cancelText="ยกเลิก"
        variant="danger"
        isLoading={isSaving}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
};
