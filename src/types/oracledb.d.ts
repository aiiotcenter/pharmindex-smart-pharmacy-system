declare module "oracledb" {
  export interface Pool {
    getConnection(): Promise<Connection>;
    close(drainTime?: number): Promise<void>;
  }

  export interface Connection {
    execute(
      sql: string,
      binds?: unknown,
      options?: ExecuteOptions
    ): Promise<Result>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    close(): Promise<void>;
  }

  export interface ExecuteOptions {
    outFormat?: number;
    autoCommit?: boolean;
  }

  export interface Result {
    rows?: unknown[];
    rowsAffected?: number;
  }

  export interface PoolConfig {
    user?: string;
    password?: string;
    connectString?: string;
    poolMin?: number;
    poolMax?: number;
    poolIncrement?: number;
    connectTimeout?: number;
  }

  export interface ConnectionConfig {
    user?: string;
    password?: string;
    connectString?: string;
  }

  export function createPool(config: PoolConfig): Promise<Pool>;
  export function getConnection(config: ConnectionConfig): Promise<Connection>;

  export const OUT_FORMAT_OBJECT: number;
}
