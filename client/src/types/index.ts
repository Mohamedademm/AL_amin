// Shared domain types mirroring the backend Prisma schema + API envelopes.

export type Role = "ADMIN" | "MANAGER" | "WORKER" | "CLIENT";

export type OrderStatus =
  | "PENDING"
  | "VERIFYING"
  | "ACCEPTED"
  | "SHIPPING"
  | "DELIVERED"
  | "REFUSED";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: Role;
  status: string;
  createdAt: string;
  assignedSpotId?: string | null;
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
  images?: { id: string; url: string; sortOrder: number }[];
  createdAt?: string;
  // Live pricing computed by the API from active discounts.
  discountPercent?: number;
  discountedPrice?: number;
}

export type DiscountScope = "CATEGORY" | "PRODUCT";

export interface Discount {
  id: string;
  percentage: number;
  categoryId?: string | null;
  productId?: string | null;
  active: boolean;
  startsAt: string;
  endsAt?: string | null;
  maxQuantity?: number | null;
  createdAt: string;
  category?: { name: string } | null;
  product?: { name: string } | null;
}

export interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: string | null;
  newValue?: string | null;
  timestamp: string;
  user?: { firstName: string; lastName: string; email: string };
}

export interface VendingSpot {
  id: string;
  name: string;
  location: string;
  address: string;
  phone?: string | null;
  isWarehouse: boolean;
  managerId?: string | null;
  manager?: { id: string; firstName: string; lastName: string; email: string } | null;
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
  fulfilment?: "LOCAL" | "REMOTE" | null;
  etaDays?: number | null;
  createdAt: string;
  items?: OrderItem[];
  spot?: VendingSpot;
  client?: Pick<User, "id" | "firstName" | "lastName" | "email">;
}

export interface DashboardStats {
  products: number;
  categories: number;
  spots: number;
  users: number;
  orders: {
    total: number;
    PENDING: number;
    VERIFYING: number;
    ACCEPTED: number;
    SHIPPING: number;
    DELIVERED: number;
    REFUSED: number;
  };
  revenue: string | number;
  lowStock: number;
  recentOrders: Array<
    Order & { client?: { firstName: string; lastName: string } }
  >;
}

export interface TrendPoint {
  date: string;
  orders: number;
  revenue: number;
}

// ── Smart Restock (predictive replenishment) ────────────────────────
export type RestockRisk = "CRITICAL" | "WARNING" | "HEALTHY" | "IDLE";

export interface RestockItem {
  productId: string;
  productName: string;
  spotId: string;
  spotName: string;
  isWarehouse: boolean;
  currentQuantity: number;
  velocityPerDay: number;
  daysToStockout: number | null;
  predictedStockoutDate: string | null;
  suggestedReorder: number;
  risk: RestockRisk;
}

export interface RestockForecast {
  generatedAt: string;
  params: {
    windowDays: number;
    coverDays: number;
    leadTimeDays: number;
    safetyDays: number;
  };
  summary: { critical: number; warning: number; healthy: number; idle: number };
  items: RestockItem[];
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
