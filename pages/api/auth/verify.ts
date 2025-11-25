import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyEmail } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    const success = await verifyEmail(token);

    if (success) {
      res.status(200).json({ message: 'Email verified successfully' });
    } else {
      res.status(400).json({ message: 'Invalid or expired verification token' });
    }
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'An error occurred during verification' });
  }
}
