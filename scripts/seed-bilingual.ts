import "dotenv/config";
import * as oracledb from "oracledb";

function getConnectionConfig(): oracledb.ConnectionConfig {
  return {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECTION,
  };
}

/** Idempotent: TR/EN hatırlatıcı, doz ve alerji notlarını günceller. */
async function main(): Promise<void> {
  const connection = await oracledb.getConnection(getConnectionConfig());

  try {
    await connection.execute(
      `UPDATE medicine_schedules SET
        notes_tr = 'Kahvaltıdan sonra alın',
        notes_en = 'Take after breakfast',
        notes = 'Take after breakfast'
       WHERE schedule_id = 1`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE medicine_schedules SET
        notes_tr = 'Uyumadan önce alın',
        notes_en = 'Take before sleep',
        notes = 'Take before sleep'
       WHERE schedule_id = 2`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE medicine_schedules SET
        notes_tr = 'Pazartesi günleri koruyucu inhaler',
        notes_en = 'Maintenance inhaler on Mondays',
        notes = 'Maintenance inhaler on Mondays'
       WHERE schedule_id = 3`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE medicine_schedules SET
        notes_tr = 'Perşembe günleri koruyucu inhaler',
        notes_en = 'Maintenance inhaler on Thursdays',
        notes = 'Maintenance inhaler on Thursdays'
       WHERE schedule_id = 4`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE medicine_schedules SET
        notes_tr = 'Aylık migren önleyici doz',
        notes_en = 'Monthly migraine prevention dose',
        notes = 'Monthly migraine prevention dose'
       WHERE schedule_id = 5`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE user_medicines SET
        dosage_tr = 'Kahvaltıdan sonra 1 tablet',
        dosage_en = '1 tablet after breakfast',
        dosage = '1 tablet after breakfast'
       WHERE user_medicine_id = 1`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE user_medicines SET
        dosage_tr = 'Gece 1 tablet',
        dosage_en = '1 tablet at night',
        dosage = '1 tablet at night'
       WHERE user_medicine_id = 2`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE user_medicines SET
        dosage_tr = 'Gerektiğinde 2 puff',
        dosage_en = '2 puffs when needed',
        dosage = '2 puffs when needed'
       WHERE user_medicine_id = 3`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE user_medicines SET
        dosage_tr = 'Gerektiğinde 1 tablet',
        dosage_en = '1 tablet when needed',
        dosage = '1 tablet when needed'
       WHERE user_medicine_id = 4`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE user_allergies SET
        notes_tr = 'Penisilin grubu antibiyotik alerjisi',
        notes_en = 'Penicillin-class antibiotic allergy',
        notes = 'Penicillin-class antibiotic allergy'
       WHERE user_id = 1 AND ingredient_id = 3`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE user_allergies SET
        notes_tr = 'Aspirin hassasiyeti',
        notes_en = 'Aspirin sensitivity',
        notes = 'Aspirin sensitivity'
       WHERE user_id = 2 AND ingredient_id = 4`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE user_allergies SET
        notes_tr = 'Ibuprofen hafif mide rahatsızlığı yapıyor',
        notes_en = 'Ibuprofen causes mild stomach discomfort',
        notes = 'Ibuprofen causes mild stomach discomfort'
       WHERE user_id = 3 AND ingredient_id = 2`,
      {},
      { autoCommit: false }
    );

    await connection.commit();
    console.log("Bilingual user content seed completed.");
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.close();
  }
}

main().catch((error) => {
  console.error("Bilingual seed failed:", error);
  process.exit(1);
});
