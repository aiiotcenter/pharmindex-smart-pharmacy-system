import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import * as oracledb from "oracledb";

const MIGRATIONS_DIR = path.join(process.cwd(), "prisma", "migrations");

function getConnectionConfig(): oracledb.ConnectionConfig {
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const connectString = process.env.DB_CONNECTION;

  if (!user || !password || !connectString) {
    throw new Error(
      "Missing DB_USER, DB_PASSWORD, or DB_CONNECTION environment variables."
    );
  }

  return { user, password, connectString };
}

function stripComments(sql: string): string {
  return sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");
}

function splitStatements(sql: string): string[] {
  return stripComments(sql)
    .split(/;\s*(?=\n|$)/)
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
}

async function ensureMigrationTable(connection: oracledb.Connection): Promise<void> {
  try {
    await connection.execute(`
      CREATE TABLE app_migrations (
        migration_name VARCHAR2(255) PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("ORA-00955")) {
      throw error;
    }
  }
}

async function getAppliedMigrations(
  connection: oracledb.Connection
): Promise<Set<string>> {
  const result = await connection.execute(
    "SELECT migration_name FROM app_migrations",
    {},
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  const rows = (result.rows ?? []) as Array<{ MIGRATION_NAME: string }>;
  return new Set(rows.map((row) => row.MIGRATION_NAME));
}

async function runMigration(
  connection: oracledb.Connection,
  migrationName: string,
  sqlFile: string
): Promise<void> {
  const sql = fs.readFileSync(sqlFile, "utf-8");
  const statements = splitStatements(sql);

  for (const statement of statements) {
    await connection.execute(statement, {}, { autoCommit: false });
  }

  await connection.execute(
    "INSERT INTO app_migrations (migration_name) VALUES (:name)",
    { name: migrationName },
    { autoCommit: false }
  );

  await connection.commit();
  console.log(`Applied migration: ${migrationName}`);
}

async function main(): Promise<void> {
  const migrationFolders = fs
    .readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const connection = await oracledb.getConnection(getConnectionConfig());

  try {
    await ensureMigrationTable(connection);
    const applied = await getAppliedMigrations(connection);

    for (const folder of migrationFolders) {
      if (applied.has(folder)) {
        console.log(`Skipped (already applied): ${folder}`);
        continue;
      }

      const sqlFile = path.join(MIGRATIONS_DIR, folder, "migration.sql");
      if (!fs.existsSync(sqlFile)) {
        console.warn(`No migration.sql found in ${folder}, skipping.`);
        continue;
      }

      await runMigration(connection, folder, sqlFile);
    }

    console.log("All migrations completed.");
  } finally {
    await connection.close();
  }
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
