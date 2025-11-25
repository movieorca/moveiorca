import type { NextApiResponse } from 'next';
import { query, queryOne } from '@/lib/db';
import { adminMiddleware, AuthenticatedRequest } from '@/middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const settings = await query('SELECT * FROM payment_settings');
      res.status(200).json(settings);
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      res.status(500).json({ message: 'Error fetching payment settings' });
    }
  } else if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const { gateway, merchantId, apiKey, secretKey, isActive, isTestMode, configuration } = req.body;

      if (!gateway || !['easypaisa', 'jazzcash'].includes(gateway)) {
        return res.status(400).json({ message: 'Valid gateway is required' });
      }

      const existing = await queryOne(
        'SELECT id FROM payment_settings WHERE gateway = ?',
        [gateway]
      );

      if (existing) {
        const updates: string[] = [];
        const values: any[] = [];

        if (merchantId !== undefined) { updates.push('merchant_id = ?'); values.push(merchantId); }
        if (apiKey !== undefined) { updates.push('api_key = ?'); values.push(apiKey); }
        if (secretKey !== undefined) { updates.push('secret_key = ?'); values.push(secretKey); }
        if (isActive !== undefined) { updates.push('is_active = ?'); values.push(isActive); }
        if (isTestMode !== undefined) { updates.push('is_test_mode = ?'); values.push(isTestMode); }
        if (configuration !== undefined) { updates.push('configuration = ?'); values.push(JSON.stringify(configuration)); }

        if (updates.length > 0) {
          values.push(gateway);
          await query(`UPDATE payment_settings SET ${updates.join(', ')} WHERE gateway = ?`, values);
        }
      } else {
        await query(
          'INSERT INTO payment_settings (gateway, merchant_id, api_key, secret_key, is_active, is_test_mode, configuration) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [gateway, merchantId, apiKey, secretKey, isActive !== false, isTestMode !== false, JSON.stringify(configuration || {})]
        );
      }

      res.status(200).json({ message: 'Payment settings updated successfully' });
    } catch (error) {
      console.error('Error updating payment settings:', error);
      res.status(500).json({ message: 'Error updating payment settings' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

export default adminMiddleware(handler);
