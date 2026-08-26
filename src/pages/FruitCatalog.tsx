import React, { useState, useEffect } from 'react';
import { FruitProduct, FruitCategory } from '../types';
import { FruitCard } from '../components/fruits/FruitCard';
import { FruitDetailModal } from '../components/fruits/FruitDetailModal';
import { Search, SlidersHorizontal, Sparkles, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api';

interface FruitCatalogProps {
  onNavigate: (path: string) => void;
}

export const FruitCatalog: React.FC<FruitCatalogProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<FruitProduct[]>([]);
  const [categories, setCategories] = useState<FruitCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<FruitProduct | null>(null);

  // Fetch Categories
  useEffect(() => {
    api.getCategories().then((cats) => {
      if (cats && cats.length > 0) {
        setCategories(cats);
      }
    });
  }, []);

  // Fetch Products
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await api.getProducts({
        categoryId: selectedCategory,
        search: searchQuery.trim(),
      });

      let sorted = [...(data || [])];
      if (sortBy === 'price-asc') {
        sorted.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-desc') {
        sorted.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'name') {
        sorted.sort((a, b) => a.name.localeCompare(b.name, 'th'));
      }

      setProducts(sorted);
      setTotalPages(1);
      setTotalItems(sorted.length);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-emerald-100 text-xs font-semibold border border-white/20">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>ผลไม้สดคัดพิเศษ คุณภาพพรีเมียม สั่งจองสะดวก</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            ตลาดผลไม้สด <span className="text-emerald-200">FactFruit</span>
          </h1>

          <p className="text-sm sm:text-base text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            เลือกสรรผลไม้ไทยและนำเข้าเกรดคุณภาพ สดใหม่ทุกลูก พร้อมระบบสั่งจองและระบุเวลารับที่สะดวกสบาย
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-xl mx-auto mt-6 flex items-center bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-1.5 border border-white/20"
          >
            <div className="flex-1 flex items-center px-3">
              <Search className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="ค้นหาชื่อผลไม้ หรือรหัสสินค้า เช่น แอปเปิล, ORANGE..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-transparent focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors"
            >
              ค้นหา
            </button>
          </form>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Filter and Category Pills */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 sm:pb-0 max-w-full no-scrollbar">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setPage(1);
                }}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                ทั้งหมด
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setPage(1);
                  }}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.name}
                  {cat.productCount !== undefined && (
                    <span className="ml-1.5 opacity-70 text-[11px]">({cat.productCount})</span>
                  )}
                </button>
              ))}
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center justify-between sm:justify-start gap-2 text-xs text-slate-500 shrink-0">
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                <span className="inline">เรียงตาม:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:border-emerald-500"
              >
                <option value="newest">สินค้าใหม่ล่าสุด</option>
                <option value="price-asc">ราคาต่ำ → สูง</option>
                <option value="price-desc">ราคาสูง → ต่ำ</option>
                <option value="name-asc">ชื่อ A → Z</option>
                <option value="stock-desc">สต็อกพร้อมจำหน่าย</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              พบผลไม้ <strong className="text-slate-800 dark:text-slate-200">{totalItems}</strong> รายการ
            </span>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPage(1);
                  fetchProducts();
                }}
                className="text-emerald-600 hover:underline"
              >
                ล้างคำค้นหา
              </button>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 animate-pulse space-y-3"
              >
                <div className="aspect-4/3 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mt-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Filter className="w-8 h-8 stroke-1" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">ไม่พบสินค้าที่ตรงกับเงื่อนไข</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              ลองค้นหาด้วยคำอื่น หรือเลือกหมวดหมู่อื่นเพื่อดูผลไม้สดรายการอื่น
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
            {products.map((prod) => (
              <FruitCard
                key={prod.id}
                product={prod}
                onOpenDetail={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const pNum = i + 1;
              return (
                <button
                  key={pNum}
                  onClick={() => setPage(pNum)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                    page === pNum
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {pNum}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <FruitDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};
