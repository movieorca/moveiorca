import type { NextApiResponse } from 'next';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';
import { query, queryOne } from '@/lib/db';
import axios from 'axios';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const userId = req.user!.id;

  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const order = await queryOne(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, userId]
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.payment_status === 'paid') {
      return res.status(400).json({ message: 'Order already paid' });
    }

    const settings = await queryOne(
      'SELECT * FROM payment_settings WHERE gateway = ? AND is_active = TRUE',
      ['easypaisa']
    );

    if (!settings) {
      return res.status(503).json({ message: 'Easypaisa payment is not configured' });
    }

    const paymentData = {
      orderId: order.order_number,
      amount: order.total_amount,
      merchantId: settings.merchant_id,
      storeId: settings.store_id || process.env.EASYPAISA_STORE_ID,
    };

    await query(
      'INSERT INTO payments (order_id, user_id, amount, payment_method, payment_data) VALUES (?, ?, ?, ?, ?)',
      [orderId, userId, order.total_amount, 'easypaisa', JSON.stringify(paymentData)]
    );

    res.status(200).json({
      message: 'Payment initiated',
      paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/easypaisa?orderId=${orderId}`,
      orderNumber: order.order_number,
      amount: order.total_amount,
    });
  } catch (error) {
    console.error('Easypaisa payment error:', error);
    res.status(500).json({ message: 'Error initiating payment' });
  }
}

export default authMiddleware(handler);
