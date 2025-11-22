import type { NextApiResponse } from 'next';
import { query, queryOne } from '@/lib/db';
import { adminMiddleware, AuthenticatedRequest } from '@/middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { orderId, status, paymentStatus, notes } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const order = await queryOne('SELECT * FROM orders WHERE id = ?', [orderId]);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (status) {
      updates.push('status = ?');
      values.push(status);
    }

    if (paymentStatus) {
      updates.push('payment_status = ?');
      values.push(paymentStatus);

      if (paymentStatus === 'paid' && order.payment_status !== 'paid') {
        const orderItems = await query(
          'SELECT * FROM order_items WHERE order_id = ?',
          [orderId]
        );

        for (const item of orderItems) {
          const startDate = new Date();
          const expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + 1);

          await query(
            'INSERT INTO subscriptions (user_id, order_id, plan_id, start_date, expiry_date) VALUES (?, ?, ?, ?, ?)',
            [order.user_id, orderId, item.plan_id, startDate.toISOString().split('T')[0], expiryDate.toISOString().split('T')[0]]
          );
        }
      }
    }

    if (notes !== undefined) {
      updates.push('notes = ?');
      values.push(notes);
    }

    if (updates.length > 0) {
      values.push(orderId);
      await query(
        `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    res.status(200).json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Error updating order' });
  }
}

export default adminMiddleware(handler);
