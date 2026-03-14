import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import verificationRoutes from './routes/verification';
import walletRoutes from './routes/wallet';
import adminRoutes from './routes/admin';
import certificateRoutes from './routes/certificate';
import { verifyToken } from './middleware/auth';
import { prisma } from './prisma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Connection Check
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Prisma connected to PostgreSQL (Neon) successfully');
  } catch (err: any) {
    console.error('❌ Database connection error:', err.message);
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/verify', verifyToken, verificationRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', verifyToken, adminRoutes);
app.use('/api/certificate', certificateRoutes);

// Health check
app.get('/health', async (req, res) => {
  try {
    // Simple query to verify connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

export default app;
