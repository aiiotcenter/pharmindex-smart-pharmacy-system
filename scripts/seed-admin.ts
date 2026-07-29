import "dotenv/config";
import bcrypt from "bcryptjs";
import * as oracledb from "oracledb";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123!";

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

async function main(): Promise<void> {
  const connection = await oracledb.getConnection(getConnectionConfig());
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  try {
    const existing = await connection.execute(
      "SELECT user_id FROM users WHERE username = :username",
      { username: ADMIN_USERNAME },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const rows = (existing.rows ?? []) as Array<{ USER_ID: number }>;

    if (rows.length > 0) {
      await connection.execute(
        `UPDATE users SET password = :password, role = 'ADMIN' WHERE username = :username`,
        { password: hashedPassword, username: ADMIN_USERNAME },
        { autoCommit: true }
      );
      console.log("Admin user updated.");
      return;
    }

    await connection.execute(
      `
      INSERT INTO users (username, password, name, surname, email, birth_date, gender, role)
      VALUES (:username, :password, 'Admin', 'User', 'admin@smartpharmacy.com', DATE '1990-01-01', 'OTHER', 'ADMIN')
      `,
      { username: ADMIN_USERNAME, password: hashedPassword },
      { autoCommit: true }
    );

    console.log("Admin user created.");
    console.log(`Username: ${ADMIN_USERNAME}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
  } finally {
    await connection.close();
  }
}

main().catch((error) => {
  console.error("Admin seed failed:", error);
  process.exit(1);
});
