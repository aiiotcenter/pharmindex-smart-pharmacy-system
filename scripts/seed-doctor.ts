import "dotenv/config";
import bcrypt from "bcryptjs";
import * as oracledb from "oracledb";

const DOCTOR_USERNAME = "dr_yilmaz";
const DOCTOR_PASSWORD = "Password123!";
const ADMIN_USERNAME = "admin";

function getConnectionConfig(): oracledb.ConnectionConfig {
  return {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECTION,
  };
}

async function main(): Promise<void> {
  const connection = await oracledb.getConnection(getConnectionConfig());
  const hashedPassword = await bcrypt.hash(DOCTOR_PASSWORD, 12);

  try {
    const existing = await connection.execute(
      `SELECT user_id, role_id FROM users WHERE username = :username`,
      { username: DOCTOR_USERNAME },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const rows = (existing.rows ?? []) as Array<{ USER_ID: number; ROLE_ID: number }>;

    let doctorId: number | undefined = rows[0]?.USER_ID;

    if (rows.length > 0) {
      await connection.execute(
        `UPDATE users SET password = :password WHERE username = :username`,
        { password: hashedPassword, username: DOCTOR_USERNAME },
        { autoCommit: false }
      );
    } else {
      await connection.execute(
        `
        INSERT INTO users (username, password, name, surname, email, birth_date, gender, role_id)
        VALUES (:username, :password, 'Elif', 'Yilmaz', 'elif.yilmaz@clinic.com', DATE '1980-06-15', 'FEMALE', 3)
        `,
        { username: DOCTOR_USERNAME, password: hashedPassword },
        { autoCommit: false }
      );

      const created = await connection.execute(
        `SELECT user_id FROM users WHERE username = :username`,
        { username: DOCTOR_USERNAME },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      doctorId = ((created.rows ?? []) as Array<{ USER_ID: number }>)[0]?.USER_ID;
    }

    if (!doctorId) {
      throw new Error("Doctor user could not be created.");
    }

    const adminRow = await connection.execute(
      `SELECT user_id FROM users WHERE username = :username`,
      { username: ADMIN_USERNAME },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const adminId = (
      (adminRow.rows ?? []) as Array<{ USER_ID: number }>
    )[0]?.USER_ID;

    const requestRow = await connection.execute(
      `SELECT request_id, status FROM doctor_role_requests WHERE user_id = :userId`,
      { userId: doctorId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const request = (
      (requestRow.rows ?? []) as Array<{ REQUEST_ID: number; STATUS: string }>
    )[0];

    if (!request) {
      await connection.execute(
        `INSERT INTO doctor_role_requests (user_id, status) VALUES (:userId, 'PENDING')`,
        { userId: doctorId },
        { autoCommit: false }
      );
    }

    if (adminId) {
      await connection.execute(
        `
        UPDATE doctor_role_requests
        SET status = 'APPROVED', reviewed_by = :adminId, reviewed_at = CURRENT_TIMESTAMP
        WHERE user_id = :userId
        `,
        { adminId, userId: doctorId },
        { autoCommit: false }
      );
      await connection.execute(
        `UPDATE users SET role_id = 2 WHERE user_id = :userId`,
        { userId: doctorId },
        { autoCommit: false }
      );
    }

    const patientRow = await connection.execute(
      `SELECT user_id FROM users WHERE username = 'ahmet_yilmaz'`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const patientId = (
      (patientRow.rows ?? []) as Array<{ USER_ID: number }>
    )[0]?.USER_ID;

    if (patientId) {
      await connection.execute(
        `
        INSERT INTO doctor_patients (doctor_id, patient_id)
        SELECT :doctorId, :patientId FROM dual
        WHERE NOT EXISTS (
          SELECT 1 FROM doctor_patients
          WHERE doctor_id = :doctorId AND patient_id = :patientId
        )
        `,
        { doctorId, patientId },
        { autoCommit: false }
      );
    }

    await connection.commit();
    console.log("Doctor seed completed (admin-approved demo doctor).");
    console.log(`Username: ${DOCTOR_USERNAME}`);
    console.log(`Password: ${DOCTOR_PASSWORD}`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.close();
  }
}

main().catch((error) => {
  console.error("Doctor seed failed:", error);
  process.exit(1);
});
