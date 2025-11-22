import type { NextApiResponse } from 'next';
import { query, queryOne } from '@/lib/db';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const userId = req.user!.id;

  if (req.method === 'GET') {
    try {
      const cartItems = await query(`
        SELECT ci.*, p.name, p.category, p.description, p.monthly_price, p.features
        FROM cart_items ci
        JOIN plans p ON ci.plan_id = p.id
        WHERE ci.user_id = ?
      `, [userId]);

      const formattedItems = cartItems.map(item => ({
        ...item,
        features: typeof item.features === 'string' ? JSON.parse(item.features) : item.features,
      }));

      res.status(200).json(formattedItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({ message: 'Error fetching cart' });
    }
  } else if (req.method === 'POST') {
    try {
      const { planId, quantity = 1 } = req.body;

      if (!planId) {
        return res.status(400).json({ message: 'Plan ID is required' });
      }

      const plan = await queryOne('SELECT id FROM plans WHERE id = ? AND is_active = TRUE', [planId]);

      if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
      }

      await query(
        'INSERT INTO cart_items (user_id, plan_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?',
        [userId, planId, quantity, quantity]
      );

      res.status(201).json({ message: 'Item added to cart' });
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ message: 'Error adding to cart' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { planId } = req.body;

      if (!planId) {
        return res.status(400).json({ message: 'Plan ID is required' });
      }

      await query('DELETE FROM cart_items WHERE user_id = ? AND plan_id = ?', [userId, planId]);

      res.status(200).json({ message: 'Item removed from cart' });
    } catch (error) {
      console.error('Error removing from cart:', error);
      res.status(500).json({ message: 'Error removing from cart' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

export default authMiddleware(handler);
