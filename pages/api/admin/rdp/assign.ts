import type { NextApiResponse } from 'next';
import { query, queryOne } from '@/lib/db';
import { adminMiddleware, AuthenticatedRequest } from '@/middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { subscriptionId, serverIp, serverPort, username, password, additionalInfo } = req.body;

    if (!subscriptionId || !serverIp || !username || !password) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const subscription = await queryOne(
      'SELECT * FROM subscriptions WHERE id = ?',
      [subscriptionId]
    );

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    const existing = await queryOne(
      'SELECT id FROM rdp_credentials WHERE subscription_id = ?',
      [subscriptionId]
    );

    if (existing) {
      await query(
        'UPDATE rdp_credentials SET server_ip = ?, server_port = ?, username = ?, password = ?, additional_info = ? WHERE subscription_id = ?',
        [serverIp, serverPort || 3389, username, password, additionalInfo, subscriptionId]
      );
    } else {
      await query(
        'INSERT INTO rdp_credentials (subscription_id, server_ip, server_port, username, password, additional_info) VALUES (?, ?, ?, ?, ?, ?)',
        [subscriptionId, serverIp, serverPort || 3389, username, password, additionalInfo]
      );
    }

    res.status(200).json({ message: 'RDP credentials assigned successfully' });
  } catch (error) {
    console.error('Error assigning RDP credentials:', error);
    res.status(500).json({ message: 'Error assigning credentials' });
  }
}

export default adminMiddleware(handler);
