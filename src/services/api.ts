import { mockStore } from '../data/mockStore';
import { FruitCategory, FruitProduct, Order, OrderStatus, Role } from '../types';

/**
 * Universal safe API fetcher that handles both Full-Stack server backends
 * and Static Client-Side environments (Netlify / GitHub Pages / Vercel).
 */
export const api = {
  // --- Categories ---
  async getCategories(): Promise<FruitCategory[]> {
    try {
      const res = await fetch('/api/categories');
      const ct = res.headers.get('content-type');
      if (res.ok && ct && ct.includes('application/json')) {
        const json = await res.json();
        if (json.data && json.data.length > 0) return json.data;
      }
    } catch (e) {}
    return mockStore.getCategories();
  },

  async createCategory(token: string | null, data: Partial<FruitCategory>): Promise<FruitCategory> {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      const ct = res.headers.get('content-type');
      if (res.ok && ct && ct.includes('application/json')) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
    return mockStore.createCategory(data);
  },

  async updateCategory(token: string | null, id: string, data: Partial<FruitCategory>): Promise<FruitCategory | null> {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      const ct = res.headers.get('content-type');
      if (res.ok && ct && ct.includes('application/json')) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
    return mockStore.updateCategory(id, data);
  },

  async deleteCategory(token: string | null, id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const ct = res.headers.get('content-type');
      if (res.ok && ct && ct.includes('application/json')) {
        return true;
      }
    } catch (e) {}
    return mockStore.deleteCategory(id);
  },

  // --- Products ---
  async getProducts(params?: { categoryId?: string; search?: string }): Promise<FruitProduct[]> {
    try {
      const q = new URLSearchParams();
      if (params?.categoryId && params.categoryId !== 'all') q.append('categoryId', params.categoryId);
      if (params?.search) q.append('search', params.search);

      const res = await fetch(`/api/products?${q.toString()}`);
      const ct = res.headers.get('content-type');
      if (res.ok && ct && ct.includes('application/json')) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}

    let prods = mockStore.getProducts();
    if (params?.categoryId && params.categoryId !== 'all') {
      prods = prods.filter((p) => p.categoryId === params.categoryId);
    }
    if (params?.search?.trim()) {
      const s = params.search.toLowerCase();
      prods = prods.filter((p) => p.name.toLowerCase().includes(s) || p.code.toLowerCase().includes(s) || (p.description && p.description.toLowerCase().includes(s)));
    }
    return prods;
  },

  async createProduct(token: string | null, data: Partial<FruitProduct>): Promise<FruitProduct> {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      const ct = res.headers.get('content-type');
      if (res.ok && ct && ct.includes('application/json')) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
    return mockStore.createProduct(data);
  },

  async updateProduct(token: string | null, id: string, data: Partial<FruitProduct>): Promise<FruitProduct | null> {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      const ct = res.headers.get('content-type');
      if (res.ok && ct && ct.includes('application/json')) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
    return mockStore.updateProduct(id, data);
  },

  async deleteProduct(token: string | null, id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const ct = res.headers.get('content-type');
      if (res.ok && ct && ct.includes('application/json')) {
        return true;
      }
    } catch (e) {}
    return mockStore.deleteProduct(id);
  },

  // --- Orders ---
  async getOrders(token: string | null, params?: { status?: string; search?: string }): Promise<Order[]> {
    try {
      const q = new URLSearchParams();
      if (params?.status && params.status !== 'ALL') q.append('status', params.status);
      if (params?.search) q.append('search', params.search);

      const res = await fetch(`/api/orders?${q.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ct = res.headers.get('content-type');
      if (res.ok && ct && ct.includes('application/json')) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}

    let orders = mockStore.getOrders();
    if (params?.status && params.status !== 'ALL') {
      orders = orders.filter((o) => o.status === params.status);
    }
    if (params?.search?.trim()) {
      const s = params.search.toLowerCase();
      orders = orders.filter((o) => o.orderNumber.toLowerCase().includes(s) || (o.user?.firstName && o.user.firstName.toLowerCase().includes(s)));
    }
    return orders;
  },

  async createOrder(token: string | null, data: { items: { productId: string; quantity: number }[]; note?: string; pickupDate?: string }, currentUser?: any): Promise<Order> {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      const ct = res.headers.get('content-type');
      if (res.ok && ct && ct.includes('application/json')) {
        const json = await res.json();
        if (json.order) return json.order;
        if (json.data) return json.data;
      }
    } catch (e) {}
    return mockStore.createOrder(data, currentUser);
  },

  async getOrderById(token: string | null, orderId: string): Promise<Order | null> {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ct = res.headers.get('content-type');
      if (res.ok && ct && ct.includes('application/json')) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
    const found = mockStore.getOrders().find((o) => o.id === orderId || o.orderNumber === orderId);
    return found || null;
  },

  async cancelOrder(token: string | null, orderId: string, note?: string): Promise<Order | null> {
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ note }),
      });
      const ct = res.headers.get('content-type');
      if (res.ok && ct && ct.includes('application/json')) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
    return mockStore.updateOrderStatus(orderId, 'CANCELLED', note || 'ลูกค้ายกเลิกคำสั่งซื้อ');
  },

  async updateOrderStatus(token: string | null, orderId: string, status: OrderStatus, note?: string): Promise<Order | null> {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, note }),
      });
      const ct = res.headers.get('content-type');
      if (res.ok && ct && ct.includes('application/json')) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
    return mockStore.updateOrderStatus(orderId, status, note);
  },

  // --- Inventory ---
  async getInventory(token: string | null): Promise<FruitProduct[]> {
    try {
      const res = await fetch('/api/inventory', { headers: { Authorization: `Bearer ${token}` } });
      const ct = res.headers.get('content-type');
      if (res.ok && ct && ct.includes('application/json')) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
    return mockStore.getProducts();
  },

  async getLowStock(token: string | null): Promise<FruitProduct[]> {
    try {
      const res = await fetch('/api/inventory/low-stock', { headers: { Authorization: `Bearer ${token}` } });
      const ct = res.headers.get('content-type');
      if (res.ok && ct && ct.includes('application/json')) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
    return mockStore.getProducts().filter((p) => p.stock <= p.minimumStock);
  },

  async getInventoryLogs(token: string | null): Promise<any[]> {
    try {
      const res = await fetch('/api/inventory/logs', { headers: { Authorization: `Bearer ${token}` } });
      const ct = res.headers.get('content-type');
      if (res.ok && ct && ct.includes('application/json')) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
    return mockStore.getInventoryLogs();
  },

  async adjustStock(token: string | null, productId: string, type: 'RESTOCK' | 'CORRECTION' | 'DAMAGE', quantity: number, note?: string): Promise<FruitProduct | null> {
    try {
      const res = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId, type, quantity, note }),
      });
      const ct = res.headers.get('content-type');
      if (res.ok && ct && ct.includes('application/json')) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
    return mockStore.adjustStock(productId, type, quantity, note);
  },

  // --- Users ---
  async getUsers(token: string | null): Promise<any[]> {
    try {
      const res = await fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } });
      const ct = res.headers.get('content-type');
      if (res.ok && ct && ct.includes('application/json')) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
    return mockStore.getUsers();
  },

  async updateUserRole(token: string | null, userId: string, role: Role): Promise<any> {
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role }),
      });
      const ct = res.headers.get('content-type');
      if (res.ok && ct && ct.includes('application/json')) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
    return mockStore.updateUserRole(userId, role);
  },

  async updateUserStatus(token: string | null, userId: string, isActive: boolean): Promise<any> {
    try {
      const res = await fetch(`/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive }),
      });
      const ct = res.headers.get('content-type');
      if (res.ok && ct && ct.includes('application/json')) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
    return mockStore.updateUserStatus(userId, isActive);
  },

  // --- Dashboard & Reports ---
  async getDashboardStats(token: string | null): Promise<any> {
    try {
      const res = await fetch('/api/reports/dashboard', { headers: { Authorization: `Bearer ${token}` } });
      const ct = res.headers.get('content-type');
      if (res.ok && ct && ct.includes('application/json')) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
    return mockStore.getDashboardStats();
  },

  async getSalesReport(token: string | null, period: string = 'monthly'): Promise<any> {
    try {
      const res = await fetch(`/api/reports/sales?period=${period}`, { headers: { Authorization: `Bearer ${token}` } });
      const ct = res.headers.get('content-type');
      if (res.ok && ct && ct.includes('application/json')) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
    return mockStore.getSalesReport(period);
  },

  // --- Audit Logs ---
  async getAuditLogs(token: string | null, action?: string): Promise<any[]> {
    try {
      const q = new URLSearchParams();
      if (action && action !== 'ALL') q.append('action', action);
      const res = await fetch(`/api/audit-logs?${q.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
      const ct = res.headers.get('content-type');
      if (res.ok && ct && ct.includes('application/json')) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
    return mockStore.getAuditLogs(action);
  },

  // --- Settings ---
  async getSettings(): Promise<any> {
    try {
      const res = await fetch('/api/settings');
      const ct = res.headers.get('content-type');
      if (res.ok && ct && ct.includes('application/json')) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
    return mockStore.getSettings();
  },

  async updateSettings(token: string | null, data: any): Promise<any> {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      const ct = res.headers.get('content-type');
      if (res.ok && ct && ct.includes('application/json')) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
    return mockStore.updateSettings(data);
  },
};
