import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rdp_ecommerce',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function query<T = any>(sql: string, values?: any[]): Promise<T[]> {
  try {
    const [rows] = await pool.execute(sql, values);
    return rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function queryOne<T = any>(sql: string, values?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, values);
  return rows.length > 0 ? rows[0] : null;
}

export default pool;
