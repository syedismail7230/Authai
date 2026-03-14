import express, { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../prisma';

const router = express.Router();

const requireAdmin = async (req: AuthRequest, res: Response, next: express.NextFunction) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user || user.role !== 'admin') {
      res.status(403).json({ message: 'Forbidden. Admin access required.' });
      return;
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error retrieving user role' });
  }
};

// Apply requireAdmin to all routes in this file
router.use(requireAdmin);

// Get admin stats
router.get('/stats', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await prisma.user.count();
    const totalVerifications = await prisma.verification.count();
    const recentVerifications = await prisma.verification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    
    const fakeRate = recentVerifications.filter(v => ['Fully AI-Generated', 'AI-Assisted'].includes(v.classification)).length;
    const fakePercentage = recentVerifications.length > 0 ? (fakeRate / recentVerifications.length) * 100 : 0;
    
    // Revenue based on verifications (19 INR each)
    const revenue = totalVerifications * 19;

    res.json({
      totalUsers,
      totalVerifications,
      revenue,
      fakePercentage: Math.round(fakePercentage)
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// Get all users
router.get('/users', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get verification logs
router.get('/logs', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const logs = await prisma.verification.findMany({
      include: {
        user: {
          select: { name: true, email: true, company: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch logs' });
  }
});

export default router;
