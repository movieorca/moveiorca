import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { adminMiddleware, AuthenticatedRequest } from '@/middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const plans = await query(`
        SELECT p.*,
          (SELECT JSON_ARRAYAGG(JSON_OBJECT('code', c.code, 'name', c.name, 'flag', c.flag_emoji))
           FROM plan_countries pc
           JOIN countries c ON pc.country_id = c.id
           WHERE pc.plan_id = p.id AND pc.is_available = TRUE) as countries,
          (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', w.id, 'name', w.name, 'version', w.version))
           FROM plan_windows_os pw
           JOIN windows_os w ON pw.windows_os_id = w.id
           WHERE pw.plan_id = p.id AND pw.is_available = TRUE) as windows_versions
        FROM plans p
        ORDER BY p.sort_order ASC, p.id ASC
      `);

      const formattedPlans = plans.map(plan => ({
        ...plan,
        features: typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features,
        countries: plan.countries ? (typeof plan.countries === 'string' ? JSON.parse(plan.countries) : plan.countries) : [],
        windows_versions: plan.windows_versions ? (typeof plan.windows_versions === 'string' ? JSON.parse(plan.windows_versions) : plan.windows_versions) : [],
      }));

      res.status(200).json(formattedPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      res.status(500).json({ message: 'Error fetching plans' });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        name, slug, category, description, features,
        daily_price, weekly_price, monthly_price,
        discount_6months, discount_yearly,
        is_popular_daily, is_popular_weekly, is_popular_monthly,
        ram, cpu, vcpu, storage, bandwidth,
        admin_access, dedicated_ip, max_users,
        gpu_type, gpu_memory,
        countries, windows_os,
        sort_order, is_active
      } = req.body;

      if (!name || !slug || !category || !monthly_price) {
        return res.status(400).json({ message: 'Name, slug, category, and monthly price are required' });
      }

      // If marking as popular, unmark others in same category
      if (is_popular_daily) {
        await query('UPDATE plans SET is_popular_daily = FALSE WHERE category = ?', [category]);
      }
      if (is_popular_weekly) {
        await query('UPDATE plans SET is_popular_weekly = FALSE WHERE category = ?', [category]);
      }
      if (is_popular_monthly) {
        await query('UPDATE plans SET is_popular_monthly = FALSE WHERE category = ?', [category]);
      }

      const result = await query(
        `INSERT INTO plans (
          name, slug, category, description, features,
          daily_price, weekly_price, monthly_price,
          discount_6months, discount_yearly,
          is_popular_daily, is_popular_weekly, is_popular_monthly,
          ram, cpu, vcpu, storage, bandwidth,
          admin_access, dedicated_ip, max_users,
          gpu_type, gpu_memory,
          sort_order, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name, slug, category, description, JSON.stringify(features || []),
          daily_price, weekly_price, monthly_price,
          discount_6months || 0, discount_yearly || 0,
          is_popular_daily || false, is_popular_weekly || false, is_popular_monthly || false,
          ram, cpu, vcpu, storage, bandwidth,
          admin_access !== false, dedicated_ip !== false, max_users || 1,
          gpu_type, gpu_memory,
          sort_order || 0, is_active !== false
        ]
      );

      const planId = (result as any).insertId;

      // Add countries
      if (countries && countries.length > 0) {
        const countryRecords = await query('SELECT id, code FROM countries WHERE code IN (?)', [countries]);
        for (const country of countryRecords) {
          await query('INSERT INTO plan_countries (plan_id, country_id) VALUES (?, ?)', [planId, country.id]);
        }
      }

      // Add Windows OS
      if (windows_os && windows_os.length > 0) {
        for (const osId of windows_os) {
          await query('INSERT INTO plan_windows_os (plan_id, windows_os_id) VALUES (?, ?)', [planId, osId]);
        }
      }

      res.status(201).json({ message: 'Plan created successfully', planId });
    } catch (error: any) {
      console.error('Error creating plan:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Plan with this slug already exists' });
      }
      res.status(500).json({ message: 'Error creating plan' });
    }
  } else if (req.method === 'PUT') {
    try {
      const {
        id, name, slug, category, description, features,
        daily_price, weekly_price, monthly_price,
        discount_6months, discount_yearly,
        is_popular_daily, is_popular_weekly, is_popular_monthly,
        ram, cpu, vcpu, storage, bandwidth,
        admin_access, dedicated_ip, max_users,
        gpu_type, gpu_memory,
        countries, windows_os,
        sort_order, is_active
      } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'Plan ID is required' });
      }

      // If marking as popular, unmark others
      if (is_popular_daily) {
        await query('UPDATE plans SET is_popular_daily = FALSE WHERE category = ? AND id != ?', [category, id]);
      }
      if (is_popular_weekly) {
        await query('UPDATE plans SET is_popular_weekly = FALSE WHERE category = ? AND id != ?', [category, id]);
      }
      if (is_popular_monthly) {
        await query('UPDATE plans SET is_popular_monthly = FALSE WHERE category = ? AND id != ?', [category, id]);
      }

      await query(
        `UPDATE plans SET
          name = ?, slug = ?, category = ?, description = ?, features = ?,
          daily_price = ?, weekly_price = ?, monthly_price = ?,
          discount_6months = ?, discount_yearly = ?,
          is_popular_daily = ?, is_popular_weekly = ?, is_popular_monthly = ?,
          ram = ?, cpu = ?, vcpu = ?, storage = ?, bandwidth = ?,
          admin_access = ?, dedicated_ip = ?, max_users = ?,
          gpu_type = ?, gpu_memory = ?,
          sort_order = ?, is_active = ?
        WHERE id = ?`,
        [
          name, slug, category, description, JSON.stringify(features),
          daily_price, weekly_price, monthly_price,
          discount_6months, discount_yearly,
          is_popular_daily, is_popular_weekly, is_popular_monthly,
          ram, cpu, vcpu, storage, bandwidth,
          admin_access, dedicated_ip, max_users,
          gpu_type, gpu_memory,
          sort_order, is_active,
          id
        ]
      );

      // Update countries
      await query('DELETE FROM plan_countries WHERE plan_id = ?', [id]);
      if (countries && countries.length > 0) {
        const countryRecords = await query('SELECT id, code FROM countries WHERE code IN (?)', [countries]);
        for (const country of countryRecords) {
          await query('INSERT INTO plan_countries (plan_id, country_id) VALUES (?, ?)', [id, country.id]);
        }
      }

      // Update Windows OS
      await query('DELETE FROM plan_windows_os WHERE plan_id = ?', [id]);
      if (windows_os && windows_os.length > 0) {
        for (const osId of windows_os) {
          await query('INSERT INTO plan_windows_os (plan_id, windows_os_id) VALUES (?, ?)', [id, osId]);
        }
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
