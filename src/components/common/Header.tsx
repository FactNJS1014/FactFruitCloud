import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import {
  ShoppingBag,
  Bell,
  Sun,
  Moon,
  User as UserIcon,
  LogOut,
  Shield,
  Menu,
  X,
  CheckCheck,
  ChevronDown,
  Sparkles,
  Package,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  onNavigate,
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const { isDark, setTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNav = (path: string) => {
    onNavigate(path);
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Admin Sidebar Toggle */}
        <div className="flex items-center gap-3">
          {isAdmin && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Admin Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div
            onClick={() => handleNav('/')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <span className="text-xl">🍓</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                  Fact<span className="text-emerald-600 dark:text-emerald-400">Fruit</span>
                </span>
                {isAdmin && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none">
                Fruit Ordering Management
              </p>
            </div>
          </div>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => handleNav('/fruits')}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
              currentPath === '/' || currentPath === '/fruits'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            ผลไม้สด
          </button>

          {isAuthenticated && !isAdmin && (
            <>
              <button
                onClick={() => handleNav('/my-orders')}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  currentPath.startsWith('/my-orders')
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                รายการสั่งซื้อ
              </button>

              <button
                onClick={() => handleNav('/dashboard')}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  currentPath === '/dashboard'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                แดชบอร์ด
              </button>
            </>
          )}

          {isAdmin && (
            <button
              onClick={() => handleNav('/admin/dashboard')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all ${
                currentPath.startsWith('/admin')
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>ระบบหลังบ้าน (Admin)</span>
            </button>
          )}
        </nav>

        {/* Right: Actions (Theme, Notifs, Cart, User) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDark ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'}
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications Dropdown */}
          {isAuthenticated && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="การแจ้งเตือน"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">การแจ้งเตือน</h4>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            {unreadCount} ใหม่
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>อ่านทั้งหมด</span>
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          ไม่มีการแจ้งเตือนในขณะนี้
                        </div>
                      ) : (
                        notifications.slice(0, 8).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markAsRead(n.id);
                              if (n.link) handleNav(n.link);
                              setIsNotifOpen(false);
                            }}
                            className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                              !n.isRead ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold text-xs text-slate-900 dark:text-white">
                                {n.title}
                              </span>
                              {!n.isRead && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                              {n.message}
                            </p>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 block">
                              {new Date(n.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors flex items-center gap-1.5"
            title="ตะกร้าสินค้า"
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="px-1.5 py-0.5 text-xs font-bold rounded-full bg-emerald-600 text-white">
                {itemCount}
              </span>
            )}
          </button>

          {/* User Account / Profile */}
          {isAuthenticated && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs">
                  {user.firstName[0]}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                    {user.firstName}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase">
                    {user.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50"
                  >
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => handleNav('/profile')}
                      className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>ข้อมูลโปรไฟล์</span>
                    </button>

                    {isAdmin ? (
                      <button
                        onClick={() => handleNav('/admin/dashboard')}
                        className="w-full px-3 py-2 rounded-xl text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 flex items-center gap-2.5 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <span>จัดการระบบ (Admin)</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleNav('/dashboard')}
                        className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        <span>แดชบอร์ดของฉัน</span>
                      </button>
                    )}

                    <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>ออกจากระบบ</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNav('/login')}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                เข้าสู่ระบบ
              </button>
              <button
                onClick={() => handleNav('/register')}
                className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors hidden sm:block"
              >
                สมัครสมาชิก
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle Mobile Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-2 overflow-hidden"
          >
            <button
              onClick={() => handleNav('/fruits')}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              ผลไม้สดทั้งหมด
            </button>

            {isAuthenticated && !isAdmin && (
              <>
                <button
                  onClick={() => handleNav('/dashboard')}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  แดชบอร์ด
                </button>
                <button
                  onClick={() => handleNav('/my-orders')}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  รายการสั่งซื้อของฉัน
                </button>
                <button
                  onClick={() => handleNav('/profile')}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  โปรไฟล์
                </button>
              </>
            )}

            {isAdmin && (
              <button
                onClick={() => handleNav('/admin/dashboard')}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white"
              >
                จัดการระบบแอดมิน (Admin Panel)
              </button>
            )}

            {!isAuthenticated && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <button
                  onClick={() => handleNav('/login')}
                  className="flex-1 py-2.5 text-center text-sm font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  เข้าสู่ระบบ
                </button>
                <button
                  onClick={() => handleNav('/register')}
                  className="flex-1 py-2.5 text-center text-sm font-bold rounded-xl bg-emerald-600 text-white"
                >
                  สมัครสมาชิก
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
