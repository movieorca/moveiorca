import type { NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const userId = req.user!.id;

  try {
    const subscriptions = await query(`
      SELECT s.*, p.name as plan_name, p.category as plan_category,
        rc.server_ip, rc.server_port, rc.username, rc.password, rc.additional_info,
        rc.status as credential_status
      FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      LEFT JOIN rdp_credentials rc ON s.id = rc.subscription_id
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC
    `, [userId]);

    res.status(200).json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ message: 'Error fetching subscriptions' });
  }
}

export default authMiddleware(handler);
