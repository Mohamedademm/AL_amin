import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { ENV } from './config/env';
import { errorHandler, AppError } from './middleware/errorHandler';

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Future Route Mounts (Sprint 2)
// app.use('/api/categories', categoryRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/auth', authRoutes);

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
