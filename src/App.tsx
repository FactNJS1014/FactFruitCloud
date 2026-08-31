import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

// Common Components
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { Sidebar } from './components/common/Sidebar';
import { CartDrawer } from './components/cart/CartDrawer';

// User Pages
import { FruitCatalog } from './pages/FruitCatalog';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { UserDashboard } from './pages/UserDashboard';
import { MyOrders } from './pages/MyOrders';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { UserProfile } from './pages/UserProfile';
import { OrderSuccessPage } from './pages/OrderSuccessPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ProductManagement } from './pages/admin/ProductManagement';
import { CategoryManagement } from './pages/admin/CategoryManagement';
import { OrderManagement } from './pages/admin/OrderManagement';
import { InventoryManagement } from './pages/admin/InventoryManagement';
import { UserManagement } from './pages/admin/UserManagement';
import { ReportsPage } from './pages/admin/ReportsPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { SettingsPage } from './pages/admin/SettingsPage';

function AppContent() {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [successOrderInfo, setSuccessOrderInfo] = useState<{ id: string; orderNumber: string; total: number } | null>(null);

  // Synchronize browser history & enforce /login for unauthenticated users
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && currentPath !== '/login' && currentPath !== '/register') {
      window.history.replaceState({}, '', '/login');
      setCurrentPath('/login');
    }
  }, [isLoading, isAuthenticated, currentPath]);

  const navigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOrderSuccess = (orderId: string, orderNumber: string, total: number) => {
    setSuccessOrderInfo({ id: orderId, orderNumber, total });
    navigate(`/orders/success/${orderId}`);
  };

  // Route matching helper
  const renderView = () => {
    if (isLoading) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">กำลังเตรียมระบบ FactFruit...</p>
        </div>
      );
    }

    // Authentication views when explicitly requested
    if (currentPath === '/register') {
      return <Register onNavigate={navigate} />;
    }
    if (currentPath === '/login') {
      return <Login onNavigate={navigate} />;
    }

    // Force Login / Register if user is not authenticated
    if (!isAuthenticated) {
      return <Login onNavigate={navigate} />;
    }

    // Public / Catalog (Accessible when logged in)
    if (currentPath === '/' || currentPath === '/fruits') {
      return <FruitCatalog onNavigate={navigate} />;
    }

    // Order Success
    if (currentPath.startsWith('/orders/success/')) {
      const parts = currentPath.split('/');
      const orderId = parts[3] || '';
      return (
        <OrderSuccessPage
          orderId={orderId}
          orderNumber={successOrderInfo?.orderNumber}
          total={successOrderInfo?.total}
          onNavigate={navigate}
        />
      );
    }

    // Protected: Order Detail
    if (currentPath.startsWith('/my-orders/')) {
      const parts = currentPath.split('/');
      const orderId = parts[2] || '';
      if (!isAuthenticated) {
        return <Login onNavigate={navigate} />;
      }
      return <OrderDetailPage orderId={orderId} onNavigate={navigate} />;
    }

    // Protected: My Orders List
    if (currentPath === '/my-orders') {
      if (!isAuthenticated) {
        return <Login onNavigate={navigate} />;
      }
      return <MyOrders onNavigate={navigate} />;
    }

    // Protected: User Dashboard
    if (currentPath === '/dashboard') {
      if (!isAuthenticated) {
        return <Login onNavigate={navigate} />;
      }
      return <UserDashboard onNavigate={navigate} />;
    }

    // Protected: User Profile
    if (currentPath === '/profile') {
      if (!isAuthenticated) {
        return <Login onNavigate={navigate} />;
      }
      return <UserProfile />;
    }

    // Admin Routes
    if (currentPath.startsWith('/admin')) {
      if (!isAuthenticated) {
        return <Login onNavigate={navigate} />;
      }
      if (!isAdmin) {
        return (
          <div className="max-w-md mx-auto my-16 p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl space-y-4">
            <div className="text-4xl">🔒</div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">พื้นที่เฉพาะผู้ดูแลระบบ (Admin)</h2>
            <p className="text-xs text-slate-500">บัญชีของคุณไม่มีสิทธิ์เข้าถึงส่วนผู้ดูแลระบบ</p>
            <button
              onClick={() => navigate('/fruits')}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
            >
              กลับสู่หน้าร้านผลไม้
            </button>
          </div>
        );
      }

      // Admin sub-routes
      return (
        <div className="flex min-h-[calc(100vh-4rem)]">
          <Sidebar
            currentPath={currentPath}
            onNavigate={navigate}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50/60 dark:bg-slate-950/40 min-w-0 overflow-y-auto">
            {currentPath === '/admin' || currentPath === '/admin/dashboard' ? (
              <AdminDashboard onNavigate={navigate} />
            ) : currentPath === '/admin/products' ? (
              <ProductManagement />
            ) : currentPath === '/admin/categories' ? (
              <CategoryManagement />
            ) : currentPath === '/admin/orders' ? (
              <OrderManagement onNavigate={navigate} />
            ) : currentPath === '/admin/inventory' ? (
              <InventoryManagement />
            ) : currentPath === '/admin/users' ? (
              <UserManagement />
            ) : currentPath === '/admin/reports' ? (
              <ReportsPage />
            ) : currentPath === '/admin/audit-logs' ? (
              <AuditLogsPage />
            ) : currentPath === '/admin/settings' ? (
              <SettingsPage />
            ) : (
              <AdminDashboard onNavigate={navigate} />
            )}
          </main>
        </div>
      );
    }

    // Default Fallback: FruitCatalog
    return <FruitCatalog onNavigate={navigate} />;
  };

  const isAdminSection = currentPath.startsWith('/admin') && isAdmin;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Header
        currentPath={currentPath}
        onNavigate={navigate}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex-1">{renderView()}</div>

      {!isAdminSection && <Footer />}

      <CartDrawer
        onOrderSuccess={handleOrderSuccess}
        onNavigateToLogin={() => navigate('/login')}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
