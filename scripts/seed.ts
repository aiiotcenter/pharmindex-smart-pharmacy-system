import "dotenv/config";
import bcrypt from "bcryptjs";
import * as oracledb from "oracledb";

const DEFAULT_PASSWORD = "Password123!";

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

async function tableHasRows(
  connection: oracledb.Connection,
  tableName: string
): Promise<boolean> {
  const result = await connection.execute(
    `SELECT COUNT(*) AS CNT FROM ${tableName}`,
    {},
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  const rows = result.rows as Array<{ CNT: number }>;
  return (rows[0]?.CNT ?? 0) > 0;
}

async function main(): Promise<void> {
  const connection = await oracledb.getConnection(getConnectionConfig());
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  try {
    if (await tableHasRows(connection, "users")) {
      console.log("Seed skipped: database already contains users.");
      return;
    }

    await connection.execute(
      `
      INSERT INTO diseases (name_en, name_tr, description_en, description_tr) VALUES
      ('Type 2 Diabetes', 'Tip 2 Diyabet', 'A chronic condition affecting blood sugar regulation.', 'Kan şekeri düzenlemesini etkileyen kronik bir hastalık.'),
      ('Hypertension', 'Hipertansiyon', 'High blood pressure that may lead to heart disease.', 'Kalp hastalıklarına yol açabilen yüksek tansiyon.'),
      ('Asthma', 'Astım', 'A respiratory condition causing airway inflammation.', 'Solunum yollarında iltihaplanmaya neden olan bir durum.'),
      ('Migraine', 'Migren', 'A neurological condition with severe recurring headaches.', 'Şiddetli tekrarlayan baş ağrılarına neden olan nörolojik bir durum.'),
      ('GERD', 'Reflü', 'Gastroesophageal reflux causing heartburn and discomfort.', 'Mide asidinin yemek borusuna çıkmasıyla oluşan rahatsızlık.')
      `,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `
      INSERT INTO active_ingredients (name_en, name_tr, description_en, description_tr) VALUES
      ('Paracetamol', 'Parasetamol', 'Analgesic and antipyretic used for pain and fever.', 'Ağrı ve ateş için kullanılan analjezik ve antipiretik.'),
      ('Ibuprofen', 'Ibuprofen', 'NSAID used for pain, fever, and inflammation.', 'Ağrı, ateş ve iltihap için kullanılan NSAID.'),
      ('Amoxicillin', 'Amoksisilin', 'Penicillin-class antibiotic for bacterial infections.', 'Bakteriyel enfeksiyonlar için penisilin sınıfı antibiyotik.'),
      ('Acetylsalicylic Acid', 'Asetilsalisilik Asit', 'NSAID also known as aspirin.', 'Aspirin olarak bilinen NSAID.'),
      ('Salbutamol', 'Salbutamol', 'Bronchodilator for asthma and COPD relief.', 'Astım ve KOAH için bronkodilatör.'),
      ('Metformin', 'Metformin', 'First-line medication for type 2 diabetes.', 'Tip 2 diyabet için birinci basamak ilaç.'),
      ('Atorvastatin', 'Atorvastatin', 'Statin used to lower cholesterol levels.', 'Kolesterolü düşürmek için kullanılan statin.'),
      ('Omeprazole', 'Omeprazol', 'Proton pump inhibitor for acid reflux.', 'Asit reflüsü için proton pompa inhibitörü.')
      `,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `
      INSERT INTO medicines (name_en, name_tr, description_en, description_tr, dosage_form) VALUES
      ('Parol 500 mg', 'Parol 500 mg', 'Paracetamol tablet for mild to moderate pain.', 'Hafif-orta ağrı için parasetamol tablet.', 'TABLET'),
      ('Brufen 400 mg', 'Brufen 400 mg', 'Ibuprofen tablet for pain and inflammation.', 'Ağrı ve iltihap için ibuprofen tablet.', 'TABLET'),
      ('Augmentin 875 mg', 'Augmentin 875 mg', 'Amoxicillin-based antibiotic combination.', 'Amoksisilin bazlı antibiyotik kombinasyonu.', 'TABLET'),
      ('Aspirin 100 mg', 'Aspirin 100 mg', 'Low-dose aspirin for cardiovascular protection.', 'Kardiyovasküler koruma için düşük doz aspirin.', 'TABLET'),
      ('Ventolin Inhaler', 'Ventolin Inhaler', 'Salbutamol inhaler for acute asthma symptoms.', 'Akut astım semptomları için salbutamol inhaler.', 'INHALER'),
      ('Glucophage 850 mg', 'Glucophage 850 mg', 'Metformin tablet for blood sugar control.', 'Kan şekeri kontrolü için metformin tablet.', 'TABLET'),
      ('Lipitor 20 mg', 'Lipitor 20 mg', 'Atorvastatin for cholesterol management.', 'Kolesterol yönetimi için atorvastatin.', 'TABLET'),
      ('Losec 20 mg', 'Losec 20 mg', 'Omeprazole capsule for acid reflux.', 'Asit reflüsü için omeprazol kapsül.', 'CAPSULE')
      `,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `
      INSERT INTO medicine_ingredients (medicine_id, ingredient_id, amount_mg) VALUES
      (1, 1, 500),
      (2, 2, 400),
      (3, 3, 875),
      (4, 4, 100),
      (5, 5, 100),
      (6, 6, 850),
      (7, 7, 20),
      (8, 8, 20)
      `,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `
      INSERT INTO disease_medicines (disease_id, medicine_id, recommendation_note) VALUES
      (1, 6, 'First-line oral antidiabetic for type 2 diabetes.'),
      (1, 7, 'Often prescribed when lipid control is needed in diabetic patients.'),
      (2, 7, 'Statin therapy for hypertension with dyslipidemia.'),
      (2, 4, 'Low-dose aspirin may be considered under physician supervision.'),
      (3, 5, 'Rescue bronchodilator for asthma attacks.'),
      (4, 1, 'Paracetamol is commonly used for migraine pain relief.'),
      (5, 8, 'PPI therapy for GERD symptom control.')
      `,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `
      INSERT INTO users (username, password, name, surname, email, birth_date, gender, role_id) VALUES
      (:u1, :p, 'Ahmet', 'Yilmaz', 'ahmet.yilmaz@example.com', DATE '1985-03-12', 'MALE', 3),
      (:u2, :p, 'Ayse', 'Kaya', 'ayse.kaya@example.com', DATE '1992-07-25', 'FEMALE', 3),
      (:u3, :p, 'Mehmet', 'Demir', 'mehmet.demir@example.com', DATE '1978-11-08', 'MALE', 3)
      `,
      {
        u1: "ahmet_yilmaz",
        u2: "ayse_kaya",
        u3: "mehmet_demir",
        p: hashedPassword,
      },
      { autoCommit: false }
    );

    await connection.execute(
      `
      INSERT INTO user_diseases (user_id, disease_id, diagnosed_date) VALUES
      (1, 1, DATE '2018-05-10'),
      (1, 2, DATE '2020-01-15'),
      (2, 3, DATE '2015-09-20'),
      (3, 4, DATE '2019-04-03')
      `,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `
      INSERT INTO user_allergies (user_id, ingredient_id, severity, notes, notes_tr, notes_en) VALUES
      (1, 3, 'SEVERE', 'Penicillin-class antibiotic allergy', 'Penisilin grubu antibiyotik alerjisi', 'Penicillin-class antibiotic allergy'),
      (2, 4, 'MODERATE', 'Aspirin sensitivity', 'Aspirin hassasiyeti', 'Aspirin sensitivity'),
      (3, 2, 'MILD', 'Ibuprofen causes mild stomach discomfort', 'Ibuprofen hafif mide rahatsızlığı yapıyor', 'Ibuprofen causes mild stomach discomfort')
      `,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `
      INSERT INTO user_medicines (user_id, medicine_id, start_date, dosage, dosage_tr, dosage_en, is_active) VALUES
      (1, 6, DATE '2024-01-01', '1 tablet after breakfast', 'Kahvaltıdan sonra 1 tablet', '1 tablet after breakfast', 1),
      (1, 7, DATE '2024-03-01', '1 tablet at night', 'Gece 1 tablet', '1 tablet at night', 1),
      (2, 5, DATE '2023-06-15', '2 puffs when needed', 'Gerektiğinde 2 puff', '2 puffs when needed', 1),
      (3, 1, DATE '2024-08-01', '1 tablet when needed', 'Gerektiğinde 1 tablet', '1 tablet when needed', 1)
      `,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `
      INSERT INTO medicine_schedules (user_medicine_id, frequency_type, day_of_week, day_of_month, time_of_day, notes, notes_tr, notes_en) VALUES
      (1, 'DAILY', NULL, NULL, '08:00', 'Take after breakfast', 'Kahvaltıdan sonra alın', 'Take after breakfast'),
      (2, 'DAILY', NULL, NULL, '22:00', 'Take before sleep', 'Uyumadan önce alın', 'Take before sleep'),
      (3, 'WEEKLY', 1, NULL, '09:00', 'Maintenance inhaler on Mondays', 'Pazartesi günleri koruyucu inhaler', 'Maintenance inhaler on Mondays'),
      (3, 'WEEKLY', 4, NULL, '09:00', 'Maintenance inhaler on Thursdays', 'Perşembe günleri koruyucu inhaler', 'Maintenance inhaler on Thursdays'),
      (4, 'MONTHLY', NULL, 1, '10:00', 'Monthly migraine prevention dose', 'Aylık migren önleyici doz', 'Monthly migraine prevention dose')
      `,
      {},
      { autoCommit: false }
    );

    await connection.commit();
    console.log("Seed completed successfully.");
    console.log(`Demo users password: ${DEFAULT_PASSWORD}`);
    console.log("Users: ahmet_yilmaz, ayse_kaya, mehmet_demir");
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.close();
  }
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
