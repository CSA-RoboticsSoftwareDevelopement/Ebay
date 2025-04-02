import mysql from 'mysql2/promise';

// ✅ Load environment variables
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

// ✅ Create a connection pool for better performance
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // ✅ Adjust based on server capacity
  queueLimit: 0,
});

// ✅ Function to execute SQL queries
export async function executeQuery<T = Record<string, unknown>>(query: string, values: (string | number | boolean | null)[] = []): Promise<T[]> {
  try {
    const [results] = await pool.execute(query, values);
    return results as T[];
  } catch (error) {
    console.error('❌ Database Query Error:', error);
    throw new Error('Database query failed');
  }
}

// ✅ Export the connection pool
export { pool };
