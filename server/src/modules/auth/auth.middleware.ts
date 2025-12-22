import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header and attaches user info to req.user
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Yetkilendirme token\'ı bulunamadı' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable is not set');
      res.status(500).json({ message: 'Sunucu yapılandırma hatası' });
      return;
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as { userId: string; email: string };
      (req as AuthRequest).user = {
        userId: decoded.userId,
        email: decoded.email,
      };
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ message: 'Geçersiz token' });
        return;
      }
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ message: 'Token süresi dolmuş' });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
}

