import express, { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Verification from '../models/Verification';

const router = express.Router();

const requireAdmin = async (req: AuthRequest, res: Response, next: express.NextFunction) => {
  try {
    const user = await User.findById(req.userId);
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
    const totalUsers = await User.countDocuments();
    const totalVerifications = await Verification.countDocuments();
    const recentVerifications = await Verification.find().sort({ createdAt: -1 }).limit(100);
    
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
    const users = await User.find().select('-password').sort({ createdAt: -1 }).limit(50);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get verification logs
router.get('/logs', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const logs = await Verification.find()
      .populate('userId', 'name email company')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch logs' });
  }
});

export default router;
