import nodemailer from 'nodemailer';
import { query } from './db';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  userId?: number;
  emailType: 'verification' | 'password_reset' | 'order_confirmation' | 'payment_update' | 'subscription_expiry';
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@rdphosting.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    await query(
      'INSERT INTO email_logs (user_id, email_to, email_type, subject, status) VALUES (?, ?, ?, ?, ?)',
      [options.userId || null, options.to, options.emailType, options.subject, 'sent']
    );

    return true;
  } catch (error) {
    console.error('Email sending error:', error);

    await query(
      'INSERT INTO email_logs (user_id, email_to, email_type, subject, status, error_message) VALUES (?, ?, ?, ?, ?, ?)',
      [options.userId || null, options.to, options.emailType, options.subject, 'failed', String(error)]
    );

    return false;
  }
}

export async function sendVerificationEmail(email: string, token: string, userId: number) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;

  return sendEmail({
    to: email,
    subject: 'Verify Your Email Address',
    emailType: 'verification',
    userId,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0ea5e9; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .button { display: inline-block; padding: 12px 30px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to RDP Hosting</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for registering with RDP Hosting. Please click the button below to verify your email address:</p>
            <a href="${verificationUrl}" class="button">Verify Email</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} RDP Hosting. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string, userId: number) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

  return sendEmail({
    to: email,
    subject: 'Reset Your Password',
    emailType: 'password_reset',
    userId,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0ea5e9; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .button { display: inline-block; padding: 12px 30px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} RDP Hosting. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

export async function sendOrderConfirmationEmail(email: string, orderNumber: string, userId: number) {
  return sendEmail({
    to: email,
    subject: `Order Confirmation - ${orderNumber}`,
    emailType: 'order_confirmation',
    userId,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0ea5e9; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .button { display: inline-block; padding: 12px 30px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed!</h1>
          </div>
          <div class="content">
            <h2>Thank you for your order</h2>
            <p>Your order <strong>${orderNumber}</strong> has been received and is being processed.</p>
            <p>You will receive an email notification once your payment is confirmed and your RDP/VPS credentials are ready.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/customer/orders" class="button">View Order Details</a>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} RDP Hosting. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}
