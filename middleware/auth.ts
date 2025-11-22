import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/auth';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: number;
    email: string;
    role: 'customer' | 'admin';
  };
}

export function authMiddleware(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      if (!decoded) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      req.user = decoded;

      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };
}

export function adminMiddleware(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return authMiddleware(async (req: AuthenticatedRequest, res: NextApiResponse) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    return handler(req, res);
  });
}
