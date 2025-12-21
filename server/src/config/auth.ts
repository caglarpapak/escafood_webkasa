import { Request } from 'express';
import { prisma } from './prisma';
import { DEV_USER_ID, DEV_USER_EMAIL } from './devUser';

/**
 * Extract user ID from request
 * 
 * Priority:
 * 1. Try to read from 'x-user-id' header (set by frontend)
 * 2. In development, fall back to DEV_USER_ID
 * 3. In production, throw error if no user ID is provided
 * 
 * TODO: Replace with real auth middleware (JWT token or session) when authentication is implemented
 */
export function getUserId(req: Request): string {
  // Try to get user ID from request header (frontend should send this)
  const headerUserId = req.headers['x-user-id'];
  if (headerUserId && typeof headerUserId === 'string' && headerUserId.trim()) {
    // Map frontend user IDs to backend user IDs
    // Frontend uses 'onur'/'hayrullah', backend uses 'user-onur'/'user-hayrullah'
    const userId = headerUserId.trim();
    if (userId === 'onur') return 'user-onur';
    if (userId === 'hayrullah') return 'user-hayrullah';
    // If it's already a full user ID (starts with 'user-'), use it as-is
    if (userId.startsWith('user-')) return userId;
    // Otherwise, assume it's a valid user ID
    return userId;
  }

  // In development, fall back to dev user
  // Check both NODE_ENV and a more lenient check for dev mode
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    // eslint-disable-next-line no-console
    console.warn(
      'getUserId: No x-user-id header found, using DEV_USER_ID. ' +
      'This should not happen in production. Ensure frontend sends x-user-id header.'
    );
    return DEV_USER_ID;
  }

  // In production, throw error if no user ID is provided
  throw new Error(
    'User ID is required but not provided in request. ' +
    'Ensure x-user-id header is set or implement proper authentication.'
  );
}

/**
 * KULLANICI / AUTH / AUDIT - 7.1 & 7.2: Transaction'da kullanıcı bilgisi zorunlu
 * Resolve user email from user ID
 * Transaction kaydında gerçek kullanıcı resolve edilmek zorunda
 */
export async function getUserEmail(userId: string): Promise<string> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    
    if (user && user.email) {
      return user.email;
    }
    
    // Fallback to dev email if user not found (dev mode only)
    const isProduction = process.env.NODE_ENV === 'production';
    if (!isProduction) {
      console.warn(`getUserEmail: User ${userId} not found, using DEV_USER_EMAIL`);
      return DEV_USER_EMAIL;
    }
    
    throw new Error(`User with ID ${userId} not found`);
  } catch (error) {
    console.error(`getUserEmail: Error resolving email for user ${userId}:`, error);
    // In production, throw error
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
      throw error;
    }
    // In dev, fallback to dev email
    return DEV_USER_EMAIL;
  }
}

/**
 * KULLANICI / AUTH / AUDIT - 7.1 & 7.2: Get both user ID and email from request
 * Transaction kaydında gerçek kullanıcı resolve edilmek zorunda
 */
export async function getUserInfo(req: Request): Promise<{ userId: string; userEmail: string }> {
  const userId = getUserId(req);
  const userEmail = await getUserEmail(userId);
  return { userId, userEmail };
}

