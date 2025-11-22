import type { NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const userId = req.user!.id;

  try {
    const orders = await query(`
      SELECT o.*,
        (SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', oi.id,
            'plan_name', oi.plan_name,
            'plan_category', oi.plan_category,
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) FROM order_items oi WHERE oi.order_id = o.id) as items
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, [userId]);

    const formattedOrders = orders.map(order => ({
      ...order,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
    }));

    res.status(200).json(formattedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
}

export default authMiddleware(handler);
