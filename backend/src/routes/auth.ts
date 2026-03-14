import express, { Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest, verifyToken } from '../middleware/auth';

const router = express.Router();

import nodemailer from 'nodemailer';

// Temporary OTP storage (use Redis in production)
const otpStore = new Map<string, { code: string; expiry: number }>();

// Setup real email account (Brevo)
let transporter: nodemailer.Transporter;

function setupMailer() {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}
setupMailer();

// Send OTP
router.post(
  '/send-otp',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
      }

      const otpCode = Math.random().toString().slice(2, 8);
      otpStore.set(email, {
        code: otpCode,
        expiry: Date.now() + 10 * 60 * 1000, // 10 minutes
      });

      if (process.env.NODE_ENV === 'development' && transporter) {
        const info = await transporter.sendMail({
          from: '"AuthAI Admin" <admin@authai.pro>',
          to: email,
          subject: "AuthAI Verification PIN",
          text: `Your AuthAI login PIN is: ${otpCode}`,
          html: `<b>Your AuthAI login PIN is: ${otpCode}</b>`,
        });
        console.log(`[DEV EMAIL SENT] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }

      res.json({ message: 'OTP sent successfully', email });
    } catch (error: any) {
      console.error(error);
      res.status(400).json({ message: 'Failed to send OTP' });
    }
  }
);

// Verify OTP & Login
router.post(
  '/verify-otp',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { email, otp } = req.body;

      const storedOtp = otpStore.get(email);
      if (!storedOtp || storedOtp.expiry < Date.now()) {
        res.status(401).json({ message: 'OTP expired' });
        return;
      }

      if (storedOtp.code !== otp) {
        res.status(401).json({ message: 'Invalid OTP' });
        return;
      }

      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          email,
          name: email.split('@')[0],
          wallet: 5 * 19, // 5 free certificates
          referralCode: Math.random().toString(36).substr(2, 9),
        });
      }

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      otpStore.delete(email);

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          wallet: user.wallet,
        },
      });
    } catch (error) {
      res.status(400).json({ message: 'Authentication failed' });
    }
  }
);

// Register with referral
router.post(
  '/register',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { name, email, otp, referralCode } = req.body;

      const storedOtp = otpStore.get(email);
      if (!storedOtp || storedOtp.code !== otp) {
        res.status(401).json({ message: 'Invalid OTP' });
        return;
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(409).json({ message: 'User already exists' });
        return;
      }

      const newUser = await User.create({
        name,
        email,
        wallet: 5 * 19,
        referralCode: Math.random().toString(36).substr(2, 9),
      });

      if (referralCode) {
        const referrer = await User.findOne({ referralCode });
        if (referrer) {
          referrer.wallet += 1 * 19;
          await referrer.save();
        }
      }

      const token = jwt.sign(
        { userId: newUser._id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      otpStore.delete(email);

      res.json({
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          wallet: newUser.wallet,
          referralCode: newUser.referralCode,
        },
      });
    } catch (error) {
      res.status(400).json({ message: 'Registration failed' });
    }
  }
);

// Google Sign-In
import { OAuth2Client } from 'google-auth-library';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post(
  '/google',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { credential, referralCode } = req.body;

      if (!credential) {
        res.status(400).json({ message: 'Google credential is required' });
        return;
      }

      // Verify the Google token
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      
      if (!payload || !payload.email) {
        res.status(400).json({ message: 'Invalid Google credential' });
        return;
      }

      const { email, name, picture, sub: googleId } = payload;

      // Find or create user
      let user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          name: name || email.split('@')[0],
          email,
          googleId,
          picture,
          wallet: 5 * 19, // 5 free certificates
          referralCode: Math.random().toString(36).substr(2, 9),
        });

        // Handle referral logic for new users
        if (referralCode) {
          const referrer = await User.findOne({ referralCode });
          if (referrer) {
            referrer.wallet += 1 * 19;
            await referrer.save();
          }
        }
      } else {
        // Update existing user with Google details if missing
        if (!user.googleId || !user.picture) {
          user.googleId = googleId;
          if (!user.picture) user.picture = picture;
          await user.save();
        }
      }

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          picture: user.picture,
          wallet: user.wallet,
          referralCode: user.referralCode,
        },
      });
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      res.status(400).json({ message: 'Google Sign-In failed', error: error.message });
    }
  }
);

// Update Profile & Onboarding
router.put(
  '/profile',
  verifyToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { name, company, role, isOnboarded } = req.body;
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      if (name) user.name = name;
      if (company !== undefined) user.company = company;
      if (role !== undefined) user.role = role;
      if (isOnboarded !== undefined) user.isOnboarded = isOnboarded;

      await user.save();

      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          picture: user.picture,
          company: user.company,
          role: user.role,
          isOnboarded: user.isOnboarded,
          wallet: user.wallet,
          referralCode: user.referralCode,
        },
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  }
);

export default router;
