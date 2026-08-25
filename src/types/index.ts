export type Role = 'ADMIN' | 'USER';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileUpdate {
  firstName: string;
  lastName: string;
  phone: string;
}

export interface FruitCategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FruitProduct {
  id: string;
  code: string;
  name: string;
  description?: string;
  categoryId: string;
  category?: FruitCategory;
  image?: string;
  unit: string; // กิโลกรัม, กรัม, ลูก, กล่อง, ถุง, แพ็ค
  price: number;
  stock: number;
  minimumStock: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  unit: string;
  subtotal: number;
  product?: FruitProduct;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  note?: string;
  changedById?: string;
  changedByName?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  status: OrderStatus;
  subtotal: number;
  discount: number;
  total: number;
  note?: string;
  pickupDate?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  statusHistory?: OrderStatusHistory[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  entity: string;
  entityId?: string;
  description: string;
  createdAt: string;
}

export interface StoreSetting {
  id: string;
  storeName: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  currency: string;
  orderPrefix: string;
  timezone: string;
  updatedAt: string;
}

export interface CartItem {
  product: FruitProduct;
  quantity: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  todayOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalUsers: number;
  totalProducts: number;
  lowStockProducts: number;
  recentOrders: Order[];
  topProducts: {
    productId: string;
    productName: string;
    unit: string;
    totalQuantity: number;
    totalRevenue: number;
    image?: string;
  }[];
  salesChart: {
    date: string;
    revenue: number;
    orders: number;
  }[];
}

export interface UserDashboardStats {
  totalOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  completedOrders: number;
  recentOrders: Order[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  sort?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
