import type { NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { adminMiddleware, AuthenticatedRequest } from '@/middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const customers = await query(`
      SELECT u.id, u.email, u.full_name, u.phone, u.is_verified, u.created_at,
        (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as total_orders,
        (SELECT COUNT(*) FROM subscriptions WHERE user_id = u.id AND status = 'active') as active_subscriptions,
        (SELECT SUM(total_amount) FROM orders WHERE user_id = u.id AND payment_status = 'paid') as total_spent
      FROM users u
      WHERE u.role = 'customer'
      ORDER BY u.created_at DESC
    `);

    res.status(200).json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Error fetching customers' });
  }
}

export default adminMiddleware(handler);
