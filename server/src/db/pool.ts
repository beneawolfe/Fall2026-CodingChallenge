import "dotenv/config";
import { Pool } from "pg";

// Single shared connection pool used by all routes
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});