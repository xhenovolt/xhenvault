import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'xhenvault_longterm',
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  charset: 'utf8mb4'
});

export async function query(sql:string, params: any = {}) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export async function getConnection() { return pool.getConnection(); }