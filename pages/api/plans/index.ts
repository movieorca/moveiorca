import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { Plan } from '@/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { category } = req.query;

      let sql = 'SELECT * FROM plans WHERE is_active = TRUE';
      const params: any[] = [];

      if (category) {
        sql += ' AND category = ?';
        params.push(category);
      }

      sql += ' ORDER BY sort_order ASC, id ASC';

      const plans = await query<Plan>(sql, params);

      const formattedPlans = plans.map(plan => ({
        ...plan,
        features: typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features,
      }));

      res.status(200).json(formattedPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      res.status(500).json({ message: 'Error fetching plans' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
