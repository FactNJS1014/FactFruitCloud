import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FruitCategory } from '../../types';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ImageUploadInput } from '../../components/common/ImageUploadInput';
import { Plus, Edit2, Trash2, Layers, X, Save, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CategoryManagement: React.FC = () => {
  const { token } = useAuth();
  const { success, error } = useToast();

  const [categories, setCategories] = useState<FruitCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<FruitCategory | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [deletingCategory, setDeletingCategory] = useState<FruitCategory | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
  });

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/categories');
      const json = await res.json();
      if (json.data) setCategories(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', image: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: FruitCategory) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      error('กรุณาระบุชื่อหมวดหมู่');
      return;
    }

    try {
      setIsSaving(true);
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

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
        error(json.error || 'เกิดข้อผิดพลาดในการบันทึกหมวดหมู่');
        return;
      }

      success(editingCategory ? 'อัปเดตหมวดหมู่เรียบร้อยแล้ว' : 'เพิ่มหมวดหมู่ผลไม้ใหม่แล้ว');
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      error('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory || !token) return;
    try {
      setIsSaving(true);
      const res = await fetch(`/api/categories/${deletingCategory.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok) {
        error(json.error || 'ไม่สามารถลบหมวดหมู่ได้');
        return;
      }

      success(`ลบหมวดหมู่ "${deletingCategory.name}" เรียบร้อยแล้ว`);
      setIsDeleteOpen(false);
      fetchCategories();
    } catch (err) {
      error('เกิดข้อผิดพลาดในการลบหมวดหมู่');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            หมวดหมู่ผลไม้ (Categories)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            จัดกลุ่มผลไม้ตามประเภท เช่น ผลไม้ไทย, ผลไม้นำเข้า, ผลไม้ตามฤดูกาล
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 inline-flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มหมวดหมู่ใหม่</span>
        </button>
      </div>

      {/* Grid of Categories */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-slate-400">กำลังโหลดหมวดหมู่...</div>
      ) : categories.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Layers className="w-12 h-12 stroke-1 text-slate-300 mx-auto mb-2" />
          <p className="font-bold text-sm text-slate-700 dark:text-slate-300">ยังไม่มีหมวดหมู่ผลไม้</p>
          <p className="text-xs text-slate-400 mt-1">คลิกปุ่ม "+ เพิ่มหมวดหมู่ใหม่" ด้านบน</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-800 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base">
                        🍍
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{cat.name}</h3>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                        {cat.productCount || 0} รายการสินค้า
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingCategory(cat);
                        setIsDeleteOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                  {cat.description || 'หมวดหมู่สำหรับจัดกลุ่มผลไม้สดในร้าน'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <AnimatePresence>
        {isModalOpen && (
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

              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                {editingCategory ? 'แก้ไขหมวดหมู่ผลไม้' : 'เพิ่มหมวดหมู่ผลไม้ใหม่'}
              </h2>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ชื่อหมวดหมู่ *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ผลไม้ไทย, ผลไม้นำเข้า, ออร์แกนิก"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>

                <ImageUploadInput
                  label="รูปภาพหมวดหมู่ (Category Picture)"
                  value={formData.image}
                  onChange={(val) => setFormData({ ...formData, image: val })}
                  supportPresets={true}
                />

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    คำอธิบาย
                  </label>
                  <textarea
                    rows={3}
                    placeholder="รายละเอียดเพิ่มเติมของหมวดหมู่นี้"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                    <span>บันทึกหมวดหมู่</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="ยืนยันการลบหมวดหมู่"
        message={`คุณต้องการลบหมวดหมู่ "${deletingCategory?.name}" ใช่หรือไม่? (สินค้าที่อยู่ในหมวดนี้จะยังคงอยู่)`}
        confirmText="ลบหมวดหมู่"
        cancelText="ยกเลิก"
        variant="danger"
        isLoading={isSaving}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
};
