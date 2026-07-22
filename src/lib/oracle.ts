import "server-only";
import * as oracledb from "oracledb";

let pool: oracledb.Pool | null = null;

export async function getPool(): Promise<oracledb.Pool> {
  if (pool) {
    return pool;
  }

  pool = await oracledb.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECTION,
    poolMin: 0,
    poolMax: 10,
    poolIncrement: 1,
    connectTimeout: 15,
  });

  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.close(0);
    pool = null;
  }
}
