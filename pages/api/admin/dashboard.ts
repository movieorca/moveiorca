import type { NextApiResponse } from 'next';
import { query, queryOne } from '@/lib/db';
import { adminMiddleware, AuthenticatedRequest } from '@/middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const totalCustomers = await queryOne<{count: number}>(
      'SELECT COUNT(*) as count FROM users WHERE role = ?',
      ['customer']
    );

    const totalOrders = await queryOne<{count: number}>(
      'SELECT COUNT(*) as count FROM orders'
    );

    const activeSubscriptions = await queryOne<{count: number}>(
      'SELECT COUNT(*) as count FROM subscriptions WHERE status = ?',
      ['active']
    );

    const totalRevenue = await queryOne<{total: number}>(
      'SELECT SUM(total_amount) as total FROM orders WHERE payment_status = ?',
      ['paid']
    );

    const recentOrders = await query(`
      SELECT o.*, u.full_name, u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    const recentPayments = await query(`
      SELECT p.*, u.full_name, u.email, o.order_number
      FROM payments p
      JOIN users u ON p.user_id = u.id
      JOIN orders o ON p.order_id = o.id
      ORDER BY p.created_at DESC
      LIMIT 10
    `);

    res.status(200).json({
      totalCustomers: totalCustomers?.count || 0,
      totalOrders: totalOrders?.count || 0,
      activeSubscriptions: activeSubscriptions?.count || 0,
      totalRevenue: totalRevenue?.total || 0,
      recentOrders,
      recentPayments,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
}

export default adminMiddleware(handler);
