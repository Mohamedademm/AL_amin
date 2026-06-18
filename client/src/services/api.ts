import http from './axios';
import type {
  ApiEnvelope,
  AuthResult,
  Category,
  DashboardStats,
  InventoryRecord,
  Order,
  OrderStatus,
  Product,
  Role,
  User,
  VendingSpot,
} from '../types';

// Unwrap the standard { status, data } envelope down to its payload.
const unwrap = <T>(p: Promise<{ data: ApiEnvelope<T> }>) => p.then((r) => r.data.data);

export const authApi = {
  login: (email: string, password: string) =>
    unwrap<AuthResult>(http.post('/auth/login', { email, password })),
  register: (payload: { email: string; password: string; firstName: string; lastName: string; phone?: string }) =>
    unwrap<AuthResult>(http.post('/auth/register', payload)),
  me: () => unwrap<User>(http.get('/auth/me')),
};

export const productApi = {
  list: () => unwrap<Product[]>(http.get('/products')),
  get: (id: string) => unwrap<Product>(http.get(`/products/${id}`)),
  create: (data: Partial<Product>) => unwrap<Product>(http.post('/products', data)),
  update: (id: string, data: Partial<Product>) => unwrap<Product>(http.patch(`/products/${id}`, data)),
  remove: (id: string) => http.delete(`/products/${id}`),
};

export const categoryApi = {
  list: () => unwrap<Category[]>(http.get('/categories')),
  create: (data: { name: string; description?: string }) => unwrap<Category>(http.post('/categories', data)),
  update: (id: string, data: Partial<Category>) => unwrap<Category>(http.patch(`/categories/${id}`, data)),
  remove: (id: string) => http.delete(`/categories/${id}`),
};

export const orderApi = {
  list: () => unwrap<Order[]>(http.get('/orders')),
  get: (id: string) => unwrap<Order>(http.get(`/orders/${id}`)),
  create: (data: { items: { productId: string; quantity: number }[]; address: string; phone: string; spotId?: string }) =>
    unwrap<Order>(http.post('/orders', data)),
  updateStatus: (id: string, status: OrderStatus) =>
    unwrap<Order>(http.patch(`/orders/${id}/status`, { status })),
};

export const inventoryApi = {
  list: (spotId?: string) =>
    unwrap<InventoryRecord[]>(http.get('/inventory', { params: spotId ? { spotId } : undefined })),
  setQuantity: (productId: string, spotId: string, quantity: number) =>
    unwrap<InventoryRecord>(http.put('/inventory', { productId, spotId, quantity })),
};

export const spotApi = {
  list: () => unwrap<VendingSpot[]>(http.get('/spots')),
  create: (data: { name: string; location: string; address: string; phone?: string }) =>
    unwrap<VendingSpot>(http.post('/spots', data)),
  update: (id: string, data: Partial<VendingSpot>) => unwrap<VendingSpot>(http.patch(`/spots/${id}`, data)),
  remove: (id: string) => http.delete(`/spots/${id}`),
};

export const userApi = {
  list: (role?: Role) => unwrap<User[]>(http.get('/users', { params: role ? { role } : undefined })),
  create: (data: { email: string; password: string; firstName: string; lastName: string; role: Role; phone?: string }) =>
    unwrap<User>(http.post('/users', data)),
  update: (id: string, data: Partial<User> & { password?: string }) => unwrap<User>(http.patch(`/users/${id}`, data)),
  remove: (id: string) => http.delete(`/users/${id}`),
};

export const dashboardApi = {
  stats: () => unwrap<DashboardStats>(http.get('/dashboard/stats')),
};
