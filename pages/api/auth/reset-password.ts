import type { NextApiRequest, NextApiResponse } from 'next';
import { resetPassword } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const success = await resetPassword(token, password);

    if (success) {
      res.status(200).json({ message: 'Password reset successfully' });
    } else {
      res.status(400).json({ message: 'Invalid or expired reset token' });
    }
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
}
