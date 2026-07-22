import "dotenv/config";
import * as oracledb from "oracledb";

async function main() {
  const connection = await oracledb.getConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECTION,
  });

  const result = await connection.execute(
    `SELECT user_id, username, password, name, surname, email, birth_date, gender, created_at
     FROM users WHERE username = :username`,
    { username: "ahmet_yilmaz" },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  const row = result.rows?.[0] as Record<string, unknown>;
  console.log("Row:", row);
  console.log("birth_date type:", typeof row?.BIRTH_DATE, row?.BIRTH_DATE);
  if (row?.BIRTH_DATE instanceof Date) {
    console.log("ISO:", row.BIRTH_DATE.toISOString().slice(0, 10));
  }
  await connection.close();
}

main().catch(console.error);
