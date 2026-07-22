import "server-only";

import { getPool } from "./oracle";
import * as oracledb from "oracledb";

export type QueryBinds = Record<string, unknown> | unknown[];

export async function executeQuery<T = Record<string, unknown>>(
  sql: string,
  binds: QueryBinds = {}
): Promise<T[]> {
  const pool = await getPool();
  const connection = await pool.getConnection();

  try {
    const result = await connection.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    return (result.rows ?? []) as T[];
  } finally {
    await connection.close();
  }
}

export async function executeMutation(
  sql: string,
  binds: QueryBinds = {},
  autoCommit = true
): Promise<number> {
  const pool = await getPool();
  const connection = await pool.getConnection();

  try {
    const result = await connection.execute(sql, binds, { autoCommit });
    return result.rowsAffected ?? 0;
  } finally {
    await connection.close();
  }
}

export async function executeReturning<T = Record<string, unknown>>(
  sql: string,
  binds: QueryBinds = {}
): Promise<T | null> {
  const pool = await getPool();
  const connection = await pool.getConnection();

  try {
    const result = await connection.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
    });

    const rows = (result.rows ?? []) as T[];
    return rows[0] ?? null;
  } finally {
    await connection.close();
  }
}
