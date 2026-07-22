import "dotenv/config";
import * as oracledb from "oracledb";

async function main() {
  const connection = await oracledb.getConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECTION,
  });

  const result = await connection.execute(
    "SELECT username FROM users WHERE username = :username",
    { username: "ahmet_yilmaz" },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  console.log("DB OK:", result.rows);
  await connection.close();
}

main().catch(console.error);
