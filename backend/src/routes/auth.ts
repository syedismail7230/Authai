import express, { Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import axios from 'axios';
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

      try {
        await axios.post('https://api.brevo.com/v3/smtp/email', {
          sender: { name: "AuthAI", email: "syedismailart@gmail.com" }, // Using user's verified email
          to: [{ email }],
          subject: "AuthAI Verification PIN",
          textContent: `Your AuthAI login PIN is: ${otpCode}`,
          htmlContent: `<b>Your AuthAI login PIN is: ${otpCode}</b>`,
        }, {
          headers: {
            'api-key': process.env.SMTP_PASS || 'yhkQOGtFvYE9CbnV',
            'Content-Type': 'application/json',
          }
        });
        console.log(`✅ Brevo API: OTP Email sent to ${email}`);
      } catch (mailError: any) {
        console.error('❌ Brevo API Error:', mailError.response?.data || mailError.message);
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

      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name: email.split('@')[0],
            wallet: 5 * 19, // 5 free certificates
            referralCode: Math.random().toString(36).substr(2, 9),
          }
        });
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      otpStore.delete(email);

      res.json({
        token,
        user: {
          id: user.id,
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

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(409).json({ message: 'User already exists' });
        return;
      }

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          wallet: 5 * 19,
          referralCode: Math.random().toString(36).substr(2, 9),
        }
      });

      if (referralCode) {
        const referrer = await prisma.user.findUnique({ where: { referralCode } });
        if (referrer) {
          await prisma.user.update({
            where: { id: referrer.id },
            data: { wallet: { increment: 1 * 19 } }
          });
        }
      }

      const token = jwt.sign(
        { userId: newUser.id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      otpStore.delete(email);

      res.json({
        token,
        user: {
          id: newUser.id,
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
      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: name || email.split('@')[0],
            email,
            googleId,
            picture,
            wallet: 5 * 19, // 5 free certificates
            referralCode: Math.random().toString(36).substr(2, 9),
          }
        });

        // Handle referral logic for new users
        if (referralCode) {
          const referrer = await prisma.user.findUnique({ where: { referralCode } });
          if (referrer) {
            await prisma.user.update({
              where: { id: referrer.id },
              data: { wallet: { increment: 1 * 19 } }
            });
          }
        }
      } else {
        // Update existing user with Google details if missing
        if (!user.googleId || !user.picture) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId: user.googleId || googleId,
              picture: user.picture || picture
            }
          });
        }
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user.id,
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

      let user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      user = await prisma.user.update({
        where: { id: userId },
        data: {
          name: name || undefined,
          company: company !== undefined ? company : undefined,
          role: role !== undefined ? role : undefined,
          isOnboarded: isOnboarded !== undefined ? isOnboarded : undefined
        }
      });

      res.json({
        user: {
          id: user.id,
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
