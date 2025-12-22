import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authMiddleware } from './auth.middleware';

const router = Router();

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(1, 'Şifre gereklidir'),
});

/**
 * POST /api/auth/login
 * Login with email and password, returns JWT token
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const body = loginSchema.parse(req.body);
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: body.email },
      select: { id: true, email: true, name: true, passwordHash: true, isActive: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Kullanıcı hesabı aktif değil' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(body.password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable is not set');
      return res.status(500).json({ message: 'Sunucu yapılandırma hatası' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      { expiresIn: '7d' } // Token valid for 7 days
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Geçersiz istek',
        details: error.issues,
      });
    }
    console.error('Login error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

/**
 * GET /api/auth/me
 * Get current user info from JWT token
 */
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Geçersiz token' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Kullanıcı bulunamadı veya aktif değil' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

export default router;

