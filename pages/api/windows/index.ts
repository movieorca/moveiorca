import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const windows = await query('SELECT * FROM windows_os WHERE is_active = TRUE ORDER BY sort_order ASC');
    res.status(200).json(windows);
  } catch (error) {
    console.error('Error fetching Windows OS:', error);
    res.status(500).json({ message: 'Error fetching Windows OS' });
  }
}
