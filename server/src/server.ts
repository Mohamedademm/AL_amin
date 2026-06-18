import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { ENV } from './config/env';
import { errorHandler, AppError } from './middleware/errorHandler';

import authRoutes from './modules/auth/routes';
import productRoutes from './modules/product/routes';
import categoryRoutes from './modules/category/routes';
import orderRoutes from './modules/order/routes';
import inventoryRoutes from './modules/inventory/routes';
import spotRoutes from './modules/spot/routes';
import userRoutes from './modules/user/routes';
import dashboardRoutes from './modules/dashboard/routes';
import discountRoutes from './modules/discount/routes';
import auditRoutes from './modules/audit/routes';

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/spots', spotRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/audit', auditRoutes);

// 404 Handler
app.use((req, res, next) => {
  next(new AppError('Resource not found', 404));
});

// Global Error Handler
app.use(errorHandler);

const PORT = Number(ENV.PORT);

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${ENV.NODE_ENV} mode on port ${PORT}`);
  console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
});
