import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, queryOne } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'customer' | 'admin';
  is_verified: boolean;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function getUserByEmail(email: string) {
  return queryOne(
    'SELECT id, email, password, full_name, role, is_verified FROM users WHERE email = ?',
    [email]
  );
}

export async function getUserById(id: number) {
  return queryOne(
    'SELECT id, email, full_name, phone, role, is_verified, created_at FROM users WHERE id = ?',
    [id]
  );
}

export async function createUser(email: string, password: string, fullName: string) {
  const hashedPassword = await hashPassword(password);
  const verificationToken = generateRandomToken();

  const result = await query(
    'INSERT INTO users (email, password, full_name, verification_token) VALUES (?, ?, ?, ?)',
    [email, hashedPassword, fullName, verificationToken]
  );

  return { verificationToken, userId: (result as any).insertId };
}

export function generateRandomToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function verifyEmail(token: string): Promise<boolean> {
  const result = await query(
    'UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE verification_token = ?',
    [token]
  );

  return (result as any).affectedRows > 0;
}

export async function createPasswordResetToken(email: string): Promise<string | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;

  const resetToken = generateRandomToken();
  const expiry = new Date(Date.now() + 3600000); // 1 hour

  await query(
    'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
    [resetToken, expiry, email]
  );

  return resetToken;
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const user = await queryOne(
    'SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
    [token]
  );

  if (!user) return false;

  const hashedPassword = await hashPassword(newPassword);

  await query(
    'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
    [hashedPassword, user.id]
  );

  return true;
}
