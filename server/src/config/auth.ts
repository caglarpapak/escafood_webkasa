import { Request } from 'express';
import { prisma } from './prisma';
import { AuthRequest } from '../modules/auth/auth.middleware';

/**
 * Extract user ID from request (requires auth middleware to be called first)
 * Reads user ID from req.user set by authMiddleware
 */
export function getUserId(req: Request): string {
  const authReq = req as AuthRequest;
  if (!authReq.user || !authReq.user.userId) {
    throw new Error('User ID not found in request. Ensure authMiddleware is applied to this route.');
  }
  return authReq.user.userId;
}

/**
 * KULLANICI / AUTH / AUDIT - 7.1 & 7.2: Transaction'da kullanıcı bilgisi zorunlu
 * Resolve user email from user ID
 * Transaction kaydında gerçek kullanıcı resolve edilmek zorunda
 */
export async function getUserEmail(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  
  if (!user || !user.email) {
    throw new Error(`User with ID ${userId} not found`);
  }
  
  return user.email;
}

/**
 * KULLANICI / AUTH / AUDIT - 7.1 & 7.2: Get both user ID and email from request
 * Transaction kaydında gerçek kullanıcı resolve edilmek zorunda
 * Uses JWT token from authMiddleware to get user info
 */
export async function getUserInfo(req: Request): Promise<{ userId: string; userEmail: string }> {
  const authReq = req as AuthRequest;
  if (!authReq.user || !authReq.user.userId) {
    throw new Error('User info not found in request. Ensure authMiddleware is applied to this route.');
  }
  
  // Use email from JWT token (already verified by middleware)
  return {
    userId: authReq.user.userId,
    userEmail: authReq.user.email,
  };
}

