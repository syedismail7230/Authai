import express, { Response } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import axios from 'axios';
import { AuthRequest, verifyToken } from '../middleware/auth';
import Verification from '../models/Verification';
import User from '../models/User';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// Verify text
router.post('/text', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { text } = req.body;
    const userId = req.userId!;

    if (!text || text.length === 0) {
      res.status(400).json({ message: 'Text is required' });
      return;
    }

    const user = await User.findById(userId);
    if (!user || user.wallet < 19) {
      res.status(402).json({ message: 'Insufficient credits. Please top up your wallet.' });
      return;
    }

    // Call AI Service
    const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL || 'http://localhost:5001'}/verify-text`, new URLSearchParams({ text }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const { aiScore, classification, confidence } = aiResponse.data;

    const verification = await Verification.create({
      userId,
      contentType: 'text',
      contentHash: crypto.createHash('sha256').update(text).digest('hex'),
      aiScore,
      classification,
      confidence,
    });

    // Deduct wallet
    user.wallet -= 19;
    await user.save();

    res.json({
      id: verification._id,
      aiScore,
      classification,
      confidence,
    });
  } catch (error: any) {
    console.error('Text verification error:', error);
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
});

// Verify file
import FormData from 'form-data';

router.post('/file', verifyToken, upload.single('file'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const file = req.file;
    const userId = req.userId!;

    if (!file) {
      res.status(400).json({ message: 'File is required' });
      return;
    }

    const user = await User.findById(userId);
    if (!user || user.wallet < 19) {
      res.status(402).json({ message: 'Insufficient credits. Please top up your wallet.' });
      return;
    }

    // Call AI Service
    const formData = new FormData();
    formData.append('file', file.buffer, { filename: file.originalname, contentType: file.mimetype });
    formData.append('type', file.mimetype.split('/')[0] || 'unknown');

    const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL || 'http://localhost:5001'}/verify-file`, formData, {
      headers: { ...formData.getHeaders() },
    });

    const { aiScore, classification, confidence } = aiResponse.data;

    const verification = await Verification.create({
      userId,
      contentType: file.mimetype,
      contentHash: crypto.createHash('sha256').update(file.buffer).digest('hex'),
      aiScore,
      classification,
      confidence,
      fileUrl: `uploads/${file.originalname}`,
    });

    // Deduct wallet
    user.wallet -= 19;
    await user.save();

    res.json({
      id: verification._id,
      aiScore,
      classification,
      confidence,
    });
  } catch (error: any) {
    console.error('File verification error:', error);
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
});

export default router;
