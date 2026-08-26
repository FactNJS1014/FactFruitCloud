import { FruitCategory, FruitProduct, Order, OrderItem, User, Role, OrderStatus } from '../types';
import { fallbackCategories, fallbackProducts } from './mockData';

const STORAGE_KEYS = {
  CATEGORIES: 'factfruit_categories_data',
  PRODUCTS: 'factfruit_products_data',
  ORDERS: 'factfruit_orders_data',
  USERS: 'factfruit_users_data',
  INVENTORY_LOGS: 'factfruit_inv_logs_data',
  AUDIT_LOGS: 'factfruit_audit_logs_data',
  SETTINGS: 'factfruit_settings_data',
};

const initialUsers: User[] = [
  {
    id: 'user-admin-1',
    firstName: 'ผู้ดูแลระบบ',
    lastName: 'แอดมินฟรุต',
    email: 'admin@factfruit.com',
    phone: '0812345678',
    role: 'ADMIN',
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-sample-1',
    firstName: 'คุณสมชาย',
    lastName: 'ใจดี',
    email: 'user@factfruit.com',
    phone: '0898765432',
    role: 'USER',
    isActive: true,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-sample-2',
    firstName: 'คุณวิภาดา',
    lastName: 'รักผลไม้',
    email: 'wipada@example.com',
    phone: '0861122334',
    role: 'USER',
    isActive: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const initialOrders: Order[] = [
  {
    id: 'order-101',
    orderNumber: 'FF-2026-00101',
    userId: 'user-sample-1',
    user: initialUsers[1],
    subtotal: 1250,
    discount: 0,
    total: 1250,
    status: 'COMPLETED',
    items: [
      {
        id: 'item-1',
        orderId: 'order-101',
        productId: 'prod-1',
        productName: fallbackProducts[0].name,
        product: fallbackProducts[0],
        unitPrice: 250,
        quantity: 3,
        unit: fallbackProducts[0].unit,
        subtotal: 750,
      },
      {
        id: 'item-2',
        orderId: 'order-101',
        productId: 'prod-2',
        productName: fallbackProducts[1].name,
        product: fallbackProducts[1],
        unitPrice: 120,
        quantity: 2,
        unit: fallbackProducts[1].unit,
        subtotal: 240,
      },
      {
        id: 'item-3',
        orderId: 'order-101',
        productId: 'prod-3',
        productName: fallbackProducts[2].name,
        product: fallbackProducts[2],
        unitPrice: 490,
        quantity: 1,
        unit: fallbackProducts[2].unit,
        subtotal: 490,
      },
    ],
    note: 'ขอผลสุกพร้อมทาน 1 ลูก',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'order-102',
    orderNumber: 'FF-2026-00102',
    userId: 'user-sample-2',
    user: initialUsers[2],
    subtotal: 1590,
    discount: 0,
    total: 1590,
    status: 'PREPARING',
    items: [
      {
        id: 'item-4',
        orderId: 'order-102',
        productId: 'prod-5',
        productName: fallbackProducts[4].name,
        product: fallbackProducts[4],
        unitPrice: 1590,
        quantity: 1,
        unit: fallbackProducts[4].unit,
        subtotal: 1590,
      },
    ],
    note: 'เขียนการ์ดอวยพรวันเกิดให้ด้วยครับ',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'order-103',
    orderNumber: 'FF-2026-00103',
    userId: 'user-sample-1',
    user: initialUsers[1],
    subtotal: 690,
    discount: 0,
    total: 690,
    status: 'PENDING',
    items: [
      {
        id: 'item-5',
        orderId: 'order-103',
        productId: 'prod-4',
        productName: fallbackProducts[3].name,
        product: fallbackProducts[3],
        unitPrice: 690,
        quantity: 1,
        unit: fallbackProducts[3].unit,
        subtotal: 690,
      },
    ],
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

const initialAuditLogs = [
  {
    id: 'log-1',
    action: 'PRODUCT_CREATE',
    details: 'เพิ่มสินค้า "ทุเรียนหมอนทองระยอง เกรดพรีเมียม" เข้าสู่ระบบ',
    userName: 'ผู้ดูแลระบบ (Admin)',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-2',
    action: 'STOCK_ADJUST',
    details: 'ปรับเพิ่มสต็อก "มะม่วงน้ำดอกไม้สีทอง" จำนวน +50 กิโลกรัม',
    userName: 'ผู้ดูแลระบบ (Admin)',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-3',
    action: 'ORDER_UPDATE',
    details: 'อัปเดตคำสั่งซื้อ FF-2026-00101 เป็นสถานะ PAID',
    userName: 'ผู้ดูแลระบบ (Admin)',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const initialSettings = {
  storeName: 'FactFruit ตลาดผลไม้พรีเมียม',
  description: 'ระบบจัดการขายและสั่งจองผลไม้พรีเมียม คัดสรรสดใหม่ส่งตรงจากสวน',
  phone: '02-888-9999, 081-234-5678',
  email: 'contact@factfruit.com',
  address: '123 ตลาดผลไม้พรีเมียม ถ.สุขุมวิท กรุงเทพฯ 10110',
  promptpayNumber: '0812345678',
  promptpayName: 'บจก. แฟคท์ฟรุต กรุ๊ป',
  openingHours: '08:00 - 20:00 น. (เปิดบริการทุกวัน)',
  autoConfirm: false,
};

// Helper getter and setter for localStorage
function getStore<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch (e) {
    return defaultVal;
  }
}

function setStore<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('LocalStorage write error', e);
  }
}

export const mockStore = {
  // Categories
  getCategories(): FruitCategory[] {
    return getStore(STORAGE_KEYS.CATEGORIES, fallbackCategories);
  },
  saveCategories(cats: FruitCategory[]) {
    setStore(STORAGE_KEYS.CATEGORIES, cats);
  },
  createCategory(data: Partial<FruitCategory>): FruitCategory {
    const cats = this.getCategories();
    const newCat: FruitCategory = {
      id: `cat-${Date.now()}`,
      name: data.name || 'หมวดหมู่ใหม่',
      description: data.description || '',
      image: data.image || 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&auto=format&fit=crop&q=80',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    cats.push(newCat);
    this.saveCategories(cats);
    this.addAuditLog('CATEGORY_CREATE', `เพิ่มหมวดหมู่ "${newCat.name}"`);
    return newCat;
  },
  updateCategory(id: string, data: Partial<FruitCategory>): FruitCategory | null {
    const cats = this.getCategories();
    const idx = cats.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    cats[idx] = { ...cats[idx], ...data, updatedAt: new Date().toISOString() };
    this.saveCategories(cats);
    this.addAuditLog('CATEGORY_UPDATE', `แก้ไขหมวดหมู่ "${cats[idx].name}"`);
    return cats[idx];
  },
  deleteCategory(id: string): boolean {
    const cats = this.getCategories();
    const target = cats.find((c) => c.id === id);
    const filtered = cats.filter((c) => c.id !== id);
    this.saveCategories(filtered);
    if (target) {
      this.addAuditLog('CATEGORY_DELETE', `ลบหมวดหมู่ "${target.name}"`);
    }
    return true;
  },

  // Products
  getProducts(): FruitProduct[] {
    return getStore(STORAGE_KEYS.PRODUCTS, fallbackProducts);
  },
  saveProducts(prods: FruitProduct[]) {
    setStore(STORAGE_KEYS.PRODUCTS, prods);
  },
  createProduct(data: Partial<FruitProduct>): FruitProduct {
    const prods = this.getProducts();
    const newProd: FruitProduct = {
      id: `prod-${Date.now()}`,
      code: data.code || `FRUIT-${Math.floor(100 + Math.random() * 900)}`,
      name: data.name || 'สินค้าใหม่',
      description: data.description || '',
      categoryId: data.categoryId || this.getCategories()[0]?.id || 'cat-1',
      image: data.image || 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&auto=format&fit=crop&q=80',
      unit: data.unit || 'กิโลกรัม',
      price: Number(data.price) || 100,
      stock: Number(data.stock) || 0,
      minimumStock: Number(data.minimumStock) || 5,
      isAvailable: data.isAvailable !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    prods.unshift(newProd);
    this.saveProducts(prods);
    this.addAuditLog('PRODUCT_CREATE', `เพิ่มสินค้า "${newProd.name}" (${newProd.code})`);
    return newProd;
  },
  updateProduct(id: string, data: Partial<FruitProduct>): FruitProduct | null {
    const prods = this.getProducts();
    const idx = prods.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    prods[idx] = { ...prods[idx], ...data, updatedAt: new Date().toISOString() };
    this.saveProducts(prods);
    this.addAuditLog('PRODUCT_UPDATE', `แก้ไขข้อมูลสินค้า "${prods[idx].name}"`);
    return prods[idx];
  },
  deleteProduct(id: string): boolean {
    const prods = this.getProducts();
    const target = prods.find((p) => p.id === id);
    const filtered = prods.filter((p) => p.id !== id);
    this.saveProducts(filtered);
    if (target) {
      this.addAuditLog('PRODUCT_DELETE', `ลบสินค้า "${target.name}" (${target.code})`);
    }
    return true;
  },

  // Orders
  getOrders(): Order[] {
    return getStore(STORAGE_KEYS.ORDERS, initialOrders);
  },
  saveOrders(orders: Order[]) {
    setStore(STORAGE_KEYS.ORDERS, orders);
  },
  createOrder(orderData: { items: { productId: string; quantity: number }[]; note?: string; pickupDate?: string }, currentUser?: User | null): Order {
    const orders = this.getOrders();
    const products = this.getProducts();
    const user = currentUser || initialUsers[1];

    let total = 0;
    const orderId = `order-${Date.now()}`;
    const orderItems: OrderItem[] = orderData.items.map((item, idx) => {
      const prod = products.find((p) => p.id === item.productId) || products[0];
      const subtotal = prod.price * item.quantity;
      total += subtotal;
      // Deduct stock
      prod.stock = Math.max(0, prod.stock - item.quantity);
      return {
        id: `item-${Date.now()}-${idx}`,
        orderId,
        productId: prod.id,
        productName: prod.name,
        product: prod,
        quantity: item.quantity,
        unitPrice: prod.price,
        unit: prod.unit,
        subtotal,
      };
    });

    // Update deducted products stock
    this.saveProducts(products);

    const newOrder: Order = {
      id: orderId,
      orderNumber: `FF-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: user.id,
      user,
      subtotal: total,
      discount: 0,
      total,
      status: 'PENDING',
      items: orderItems,
      note: orderData.note,
      pickupDate: orderData.pickupDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.unshift(newOrder);
    this.saveOrders(orders);
    this.addAuditLog('ORDER_CREATE', `สร้างคำสั่งซื้อใหม่ #${newOrder.orderNumber} ยอด ${total.toLocaleString()} บาท`, user.firstName);
    return newOrder;
  },
  updateOrderStatus(id: string, status: OrderStatus, note?: string): Order | null {
    const orders = this.getOrders();
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    orders[idx].status = status;
    orders[idx].updatedAt = new Date().toISOString();
    if (note) orders[idx].note = (orders[idx].note ? orders[idx].note + ' | ' : '') + note;
    this.saveOrders(orders);
    this.addAuditLog('ORDER_UPDATE', `ปรับสถานะคำสั่งซื้อ #${orders[idx].orderNumber} เป็น ${status}`);
    return orders[idx];
  },

  // Inventory & Stock Adjustment
  adjustStock(productId: string, type: 'RESTOCK' | 'CORRECTION' | 'DAMAGE', quantity: number, note?: string): FruitProduct | null {
    const prods = this.getProducts();
    const prod = prods.find((p) => p.id === productId);
    if (!prod) return null;

    const oldStock = prod.stock;
    if (type === 'RESTOCK' || type === 'CORRECTION') {
      prod.stock += quantity;
    } else {
      prod.stock = Math.max(0, prod.stock - quantity);
    }
    prod.updatedAt = new Date().toISOString();
    this.saveProducts(prods);

    const logs = getStore<any[]>(STORAGE_KEYS.INVENTORY_LOGS, []);
    logs.unshift({
      id: `inv-log-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      type,
      quantity,
      oldStock,
      newStock: prod.stock,
      note: note || `ปรับสต็อก ${type}`,
      createdAt: new Date().toISOString(),
    });
    setStore(STORAGE_KEYS.INVENTORY_LOGS, logs);
    this.addAuditLog('STOCK_ADJUST', `ปรับสต็อก "${prod.name}" (${type}: ${quantity > 0 ? '+' : ''}${quantity}) คงเหลือ ${prod.stock}`);
    return prod;
  },
  getInventoryLogs(): any[] {
    return getStore(STORAGE_KEYS.INVENTORY_LOGS, [
      {
        id: 'inv-1',
        productId: 'prod-1',
        productName: 'ทุเรียนหมอนทองระยอง',
        type: 'RESTOCK',
        quantity: 20,
        oldStock: 25,
        newStock: 45,
        note: 'เติมสต็อกรอบเช้า',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ]);
  },

  // Users
  getUsers(): User[] {
    return getStore(STORAGE_KEYS.USERS, initialUsers);
  },
  saveUsers(users: User[]) {
    setStore(STORAGE_KEYS.USERS, users);
  },
  updateUserRole(userId: string, role: Role): User | null {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return null;
    users[idx].role = role;
    users[idx].updatedAt = new Date().toISOString();
    this.saveUsers(users);
    this.addAuditLog('USER_ROLE_CHANGE', `เปลี่ยนสิทธิ์ของ "${users[idx].firstName}" เป็น ${role}`);
    return users[idx];
  },
  updateUserStatus(userId: string, isActive: boolean): User | null {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return null;
    users[idx].isActive = isActive;
    users[idx].updatedAt = new Date().toISOString();
    this.saveUsers(users);
    this.addAuditLog('USER_STATUS_CHANGE', `${isActive ? 'เปิดใช้งาน' : 'ระงับการใช้งาน'} บัญชีของ "${users[idx].firstName}"`);
    return users[idx];
  },

  // Dashboard & Reports
  getDashboardStats() {
    const products = this.getProducts();
    const orders = this.getOrders();
    const users = this.getUsers();

    const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'CANCELLED' ? o.total : 0), 0);
    const lowStockCount = products.filter((p) => p.stock <= p.minimumStock).length;

    return {
      totalRevenue,
      totalOrders: orders.length,
      totalProducts: products.length,
      totalUsers: users.length,
      lowStockCount,
      recentOrders: orders.slice(0, 5),
      lowStockProducts: products.filter((p) => p.stock <= p.minimumStock),
    };
  },

  getSalesReport(period: string = 'monthly') {
    const orders = this.getOrders();
    const categories = this.getCategories();
    const products = this.getProducts();

    const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'CANCELLED' ? o.total : 0), 0);
    const completedOrders = orders.filter((o) => o.status === 'COMPLETED' || o.status === 'DELIVERED' || o.status === 'PAID').length;

    const salesByDate = [
      { date: 'จ.', sales: 2450, orders: 4 },
      { date: 'อ.', sales: 3890, orders: 6 },
      { date: 'พ.', sales: 4200, orders: 7 },
      { date: 'พฤ.', sales: 3100, orders: 5 },
      { date: 'ศ.', sales: 6500, orders: 11 },
      { date: 'ส.', sales: 8900, orders: 15 },
      { date: 'อา.', sales: 7600, orders: 12 },
    ];

    const categorySales = categories.map((cat, idx) => ({
      name: cat.name,
      value: (idx + 1) * 3500 + Math.floor(Math.random() * 2000),
    }));

    const topSellingProducts = products.slice(0, 5).map((p, idx) => ({
      ...p,
      soldCount: (5 - idx) * 18 + 5,
      totalAmount: ((5 - idx) * 18 + 5) * p.price,
    }));

    return {
      period,
      totalRevenue: totalRevenue || 36640,
      totalOrders: orders.length || 60,
      completedOrders: completedOrders || 48,
      averageOrderValue: Math.round((totalRevenue || 36640) / (orders.length || 60)),
      salesByDate,
      categorySales,
      topSellingProducts,
    };
  },

  // Audit Logs
  getAuditLogs(action?: string): any[] {
    const logs = getStore<any[]>(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
    if (!action || action === 'ALL') return logs;
    return logs.filter((l) => l.action === action);
  },
  addAuditLog(action: string, details: string, userName: string = 'ผู้ดูแลระบบ (Admin)') {
    const logs = getStore<any[]>(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
    logs.unshift({
      id: `log-${Date.now()}`,
      action,
      details,
      userName,
      createdAt: new Date().toISOString(),
    });
    setStore(STORAGE_KEYS.AUDIT_LOGS, logs);
  },

  // Settings
  getSettings() {
    return getStore(STORAGE_KEYS.SETTINGS, initialSettings);
  },
  updateSettings(data: any) {
    const updated = { ...this.getSettings(), ...data };
    setStore(STORAGE_KEYS.SETTINGS, updated);
    this.addAuditLog('SETTINGS_UPDATE', 'อัปเดตการตั้งค่าข้อมูลร้านค้า');
    return updated;
  },
};
