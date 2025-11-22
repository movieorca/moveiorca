import type { NextApiResponse } from 'next';
import { query, queryOne } from '@/lib/db';
import { adminMiddleware, AuthenticatedRequest } from '@/middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { name, category, description, features, monthlyPrice, ram, cpu, storage, bandwidth, isActive, sortOrder } = req.body;

      if (!name || !category || !monthlyPrice) {
        return res.status(400).json({ message: 'Name, category, and price are required' });
      }

      await query(
        `INSERT INTO plans (name, category, description, features, monthly_price, ram, cpu, storage, bandwidth, is_active, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, category, description, JSON.stringify(features || []), monthlyPrice, ram, cpu, storage, bandwidth, isActive !== false, sortOrder || 0]
      );

      res.status(201).json({ message: 'Plan created successfully' });
    } catch (error) {
      console.error('Error creating plan:', error);
      res.status(500).json({ message: 'Error creating plan' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, name, category, description, features, monthlyPrice, ram, cpu, storage, bandwidth, isActive, sortOrder } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'Plan ID is required' });
      }

      const updates: string[] = [];
      const values: any[] = [];

      if (name) { updates.push('name = ?'); values.push(name); }
      if (category) { updates.push('category = ?'); values.push(category); }
      if (description !== undefined) { updates.push('description = ?'); values.push(description); }
      if (features) { updates.push('features = ?'); values.push(JSON.stringify(features)); }
      if (monthlyPrice !== undefined) { updates.push('monthly_price = ?'); values.push(monthlyPrice); }
      if (ram !== undefined) { updates.push('ram = ?'); values.push(ram); }
      if (cpu !== undefined) { updates.push('cpu = ?'); values.push(cpu); }
      if (storage !== undefined) { updates.push('storage = ?'); values.push(storage); }
      if (bandwidth !== undefined) { updates.push('bandwidth = ?'); values.push(bandwidth); }
      if (isActive !== undefined) { updates.push('is_active = ?'); values.push(isActive); }
      if (sortOrder !== undefined) { updates.push('sort_order = ?'); values.push(sortOrder); }

      if (updates.length > 0) {
        values.push(id);
        await query(`UPDATE plans SET ${updates.join(', ')} WHERE id = ?`, values);
      }

      res.status(200).json({ message: 'Plan updated successfully' });
    } catch (error) {
      console.error('Error updating plan:', error);
      res.status(500).json({ message: 'Error updating plan' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'Plan ID is required' });
      }

      await query('UPDATE plans SET is_active = FALSE WHERE id = ?', [id]);

      res.status(200).json({ message: 'Plan deleted successfully' });
    } catch (error) {
      console.error('Error deleting plan:', error);
      res.status(500).json({ message: 'Error deleting plan' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

export default adminMiddleware(handler);
