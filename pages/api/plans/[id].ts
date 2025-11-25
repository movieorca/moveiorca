import type { NextApiRequest, NextApiResponse } from 'next';
import { queryOne } from '@/lib/db';
import { Plan } from '@/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    const plan = await queryOne<Plan>('SELECT * FROM plans WHERE id = ? AND is_active = TRUE', [id]);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const formattedPlan = {
      ...plan,
      features: typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features,
    };

    res.status(200).json(formattedPlan);
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({ message: 'Error fetching plan' });
  }
}
