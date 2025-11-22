import type { NextApiRequest, NextApiResponse } from 'next';
import { createUser } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const { verificationToken, userId } = await createUser(email, password, fullName);

    await sendVerificationEmail(email, verificationToken, userId);

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
    });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email already exists' });
    }

    console.error('Registration error:', error);
    res.status(500).json({ message: 'An error occurred during registration' });
  }
}
