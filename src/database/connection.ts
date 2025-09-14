import { Pool, PoolClient } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Get connection string with better error handling
const getDatabaseUrl = (): string => {
  const databaseUrl = process.env.DATABASE_URL || 
                     process.env.POSTGRES_URL || 
                     process.env.POSTGRES_PRISMA_URL;

  if (!databaseUrl) {
    console.error("❌ No database connection string found!");
    console.error("Available env vars:", Object.keys(process.env).filter(key => 
      key.includes('DATABASE') || key.includes('POSTGRES')
    ));
    throw new Error("DATABASE_URL environment variable is required");
  }

  // Validate the connection string format
  if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    console.error("❌ Invalid database URL format:", databaseUrl.substring(0, 20) + "...");
    throw new Error("Database URL must start with postgresql:// or postgres://");
  }

  console.log("✅ Database URL found:", databaseUrl.substring(0, 30) + "...");
  return databaseUrl;
};

const connectionString = getDatabaseUrl();

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased timeout for cold starts
});

export const connectDB = async (): Promise<void> => {
  try {
    console.log("🔌 Attempting database connection...");
    const client = await pool.connect();
    console.log("✅ Database connected successfully");
    
    // Test the connection
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log("📅 Database time:", result.rows[0].current_time);
    console.log("🗄️ PostgreSQL version:", result.rows[0].pg_version.split(' ')[0]);
    
    client.release();
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error("Error message:", error.message);
    console.error("Connection string preview:", connectionString.substring(0, 30) + "...");
    
    // More specific error handling
    if (error.message.includes('searchParams')) {
      console.error("🔍 This appears to be a malformed connection string issue");
      console.error("Expected format: postgresql://username:password@host:5432/database");
    }
    
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
    console.error("Database query error:", error.message);
    console.error("Query:", text.substring(0, 200));
    if (params) console.error("Params:", params);
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