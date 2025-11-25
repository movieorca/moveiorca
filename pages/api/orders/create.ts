import type { NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';
import { generateOrderNumber } from '@/lib/utils';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { getUserById } from '@/lib/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const userId = req.user!.id;

  try {
    const { paymentMethod } = req.body;

    if (!paymentMethod || !['easypaisa', 'jazzcash', 'manual'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Valid payment method is required' });
    }

    const cartItems = await query(`
      SELECT ci.plan_id, ci.quantity, p.name, p.category, p.monthly_price
      FROM cart_items ci
      JOIN plans p ON ci.plan_id = p.id
      WHERE ci.user_id = ?
    `, [userId]);

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.monthly_price * item.quantity), 0);
    const orderNumber = generateOrderNumber();

    const orderResult = await query(
      'INSERT INTO orders (order_number, user_id, total_amount, payment_method) VALUES (?, ?, ?, ?)',
      [orderNumber, userId, totalAmount, paymentMethod]
    );

    const orderId = (orderResult as any).insertId;

    for (const item of cartItems) {
      await query(
        'INSERT INTO order_items (order_id, plan_id, plan_name, plan_category, quantity, price) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, item.plan_id, item.name, item.category, item.quantity, item.monthly_price]
      );
    }

    await query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

    const user = await getUserById(userId);
    if (user) {
      await sendOrderConfirmationEmail(user.email, orderNumber, userId);
    }

    res.status(201).json({
      message: 'Order created successfully',
      orderId,
      orderNumber,
      totalAmount,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
}

export default authMiddleware(handler);
