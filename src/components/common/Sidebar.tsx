import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  ClipboardList,
  Boxes,
  Users,
  BarChart3,
  History,
  Settings,
  ArrowLeft,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  isOpen = false,
  onClose,
}) => {
  const menuItems = [
    {
      label: 'แดชบอร์ดสรุป',
      path: '/admin/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: 'จัดการสินค้าผลไม้',
      path: '/admin/products',
      icon: <ShoppingBag className="w-5 h-5" />,
    },
    {
      label: 'หมวดหมู่ผลไม้',
      path: '/admin/categories',
      icon: <Layers className="w-5 h-5" />,
    },
    {
      label: 'รายการคำสั่งซื้อ',
      path: '/admin/orders',
      icon: <ClipboardList className="w-5 h-5" />,
    },
    {
      label: 'จัดการสต็อกสินค้า',
      path: '/admin/inventory',
      icon: <Boxes className="w-5 h-5" />,
    },
    {
      label: 'จัดการผู้ใช้งาน',
      path: '/admin/users',
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: 'รายงานยอดขาย',
      path: '/admin/reports',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      label: 'บันทึก Audit Logs',
      path: '/admin/audit-logs',
      icon: <History className="w-5 h-5" />,
    },
    {
      label: 'ตั้งค่าร้านค้า',
      path: '/admin/settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const handleNav = (path: string) => {
    onNavigate(path);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍓</span>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">FactFruit Admin</h3>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                Management Console
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Back to Catalog link */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => handleNav('/fruits')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับสู่หน้าร้านผลไม้</span>
          </button>
        </div>
      </aside>
    </>
  );
};
