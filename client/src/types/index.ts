// Shared domain types mirroring the backend Prisma schema + API envelopes.

export type Role = 'ADMIN' | 'MANAGER' | 'WORKER' | 'CLIENT';

export type OrderStatus = 'PENDING' | 'VERIFYING' | 'ACCEPTED' | 'REFUSED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: Role;
  status: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: string | number;
  categoryId: string;
  category?: Category;
  imageUrl?: string | null;
  createdAt?: string;
}

export interface VendingSpot {
  id: string;
  name: string;
  location: string;
  address: string;
  phone?: string | null;
  _count?: { inventory: number; orders: number };
}

export interface InventoryRecord {
  id: string;
  productId: string;
  spotId: string;
  quantity: number;
  product?: Product;
  spot?: VendingSpot;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: string | number;
  product?: Product;
}

export interface Order {
  id: string;
  clientId: string;
  spotId: string;
  status: OrderStatus;
  totalAmount: string | number;
  address: string;
  phone: string;
  createdAt: string;
  items?: OrderItem[];
  spot?: VendingSpot;
  client?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
}

export interface DashboardStats {
  products: number;
  categories: number;
  spots: number;
  users: number;
  orders: { total: number; PENDING: number; VERIFYING: number; ACCEPTED: number; REFUSED: number };
  revenue: string | number;
  lowStock: number;
  recentOrders: Array<Order & { client?: { firstName: string; lastName: string } }>;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AuthResult {
  user: User;
  token: string;
}

// Standard success envelope returned by every endpoint: { status, data }.
export interface ApiEnvelope<T> {
  status: string;
  data: T;
}
