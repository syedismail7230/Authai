import express, { Response } from 'express';
import { AuthRequest, verifyToken } from '../middleware/auth';
import { prisma } from '../prisma';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
});

// Get wallet balance
router.get('/balance', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ balance: user.wallet });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch balance' });
  }
});

// Create Order
router.post('/create-order', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount } = req.body;
    const userId = req.userId!;

    if (!amount || amount <= 0) {
      res.status(400).json({ message: 'Invalid amount' });
      return;
    }

    const options = {
      amount: amount * 100, // Razorpay takes amount in paise for INR
      currency: "INR",
      receipt: `receipt_${userId}_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    
    res.json(order);
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
});

// Verify Payment
router.post('/verify-payment', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amountAdded } = req.body;
    const userId = req.userId!;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret')
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment is authentic, add to wallet
      const user = await prisma.user.update({
        where: { id: userId },
        data: { wallet: { increment: amountAdded } }
      });
      res.json({ success: true, balance: user?.wallet, message: 'Payment verified and wallet updated' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
});

export default router;
