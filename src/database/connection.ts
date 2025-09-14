import { Pool, PoolClient } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Use DATABASE_URL from Vercel/Neon or fallback to individual variables
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || 
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const connectDB = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log("Database connected successfully");
    
    // Hide password in logs for security
    const safeConnectionString = connectionString.replace(/:[^:]*@/, ':***@');
    console.log("Connected to:", safeConnectionString);
    
    // Test the connection with a simple query
    const result = await client.query('SELECT NOW() as current_time');
    console.log("Database time:", result.rows[0].current_time);
    
    client.release();
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
};

export const query = async (text: string, params?: any[]): Promise<any> => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    if (process.env.NODE_ENV === "development") {
      console.log("Executed query", { 
        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''), 
        duration, 
        rows: result.rowCount 
      });
    }

    return result;
  } catch (error) {
    console.error("Database query error:", error);
    console.error("Query:", text.substring(0, 200));
    console.error("Params:", params);
    throw error;
  }
};

export const getClient = async (): Promise<PoolClient> => {
  return pool.connect();
};

export const closePool = async (): Promise<void> => {
  await pool.end();
  console.log("Database pool closed");
};

// Handle pool errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

// Handle process termination
process.on('SIGINT', async () => {
  console.log('Received SIGINT, closing database pool');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, closing database pool');
  await closePool();
  process.exit(0);
});

export default pool;