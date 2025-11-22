import type { NextApiRequest, NextApiResponse } from 'next';
import { createPasswordResetToken, getUserByEmail } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(200).json({
        message: 'If an account exists with this email, you will receive a password reset link',
      });
    }

    const resetToken = await createPasswordResetToken(email);

    if (resetToken) {
      await sendPasswordResetEmail(email, resetToken, user.id);
    }

    res.status(200).json({
      message: 'If an account exists with this email, you will receive a password reset link',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
}
