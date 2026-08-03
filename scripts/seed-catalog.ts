import "dotenv/config";
import * as oracledb from "oracledb";
import {
  CATALOG_DISEASES,
  CATALOG_INGREDIENTS,
  CATALOG_MEDICINES,
} from "./data/catalog-data";

function getConnectionConfig(): oracledb.ConnectionConfig {
  return {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECTION,
  };
}

async function countRows(
  connection: oracledb.Connection,
  table: string
): Promise<number> {
  const result = await connection.execute(
    `SELECT COUNT(*) AS cnt FROM ${table}`,
    {},
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return ((result.rows ?? []) as Array<{ CNT: number }>)[0]?.CNT ?? 0;
}

async function cleanupSyntheticCatalog(connection: oracledb.Connection): Promise<void> {
  await connection.execute(
    `DELETE FROM disease_medicines WHERE disease_id IN (
      SELECT disease_id FROM diseases WHERE REGEXP_LIKE(name_en, ' [0-9]+$')
    )`,
    {},
    { autoCommit: false }
  );

  await connection.execute(
    `DELETE FROM user_diseases WHERE disease_id IN (
      SELECT disease_id FROM diseases WHERE REGEXP_LIKE(name_en, ' [0-9]+$')
    )`,
    {},
    { autoCommit: false }
  );

  await connection.execute(
    `DELETE FROM diseases WHERE REGEXP_LIKE(name_en, ' [0-9]+$')`,
    {},
    { autoCommit: false }
  );

  await connection.execute(
    `DELETE FROM medicine_ingredients WHERE medicine_id IN (
      SELECT medicine_id FROM medicines WHERE name_en LIKE 'Medicine % EN'
    )`,
    {},
    { autoCommit: false }
  );

  await connection.execute(
    `DELETE FROM user_medicines WHERE medicine_id IN (
      SELECT medicine_id FROM medicines WHERE name_en LIKE 'Medicine % EN'
    )`,
    {},
    { autoCommit: false }
  );

  await connection.execute(
    `DELETE FROM medicines WHERE name_en LIKE 'Medicine % EN'`,
    {},
    { autoCommit: false }
  );

  await connection.execute(
    `DELETE FROM user_allergies WHERE ingredient_id IN (
      SELECT ingredient_id FROM active_ingredients WHERE REGEXP_LIKE(name_en, ' [0-9]+$')
    )`,
    {},
    { autoCommit: false }
  );

  await connection.execute(
    `DELETE FROM medicine_ingredients WHERE ingredient_id IN (
      SELECT ingredient_id FROM active_ingredients WHERE REGEXP_LIKE(name_en, ' [0-9]+$')
    )`,
    {},
    { autoCommit: false }
  );

  await connection.execute(
    `DELETE FROM active_ingredients WHERE REGEXP_LIKE(name_en, ' [0-9]+$')`,
    {},
    { autoCommit: false }
  );
}

async function main(): Promise<void> {
  const connection = await oracledb.getConnection(getConnectionConfig());

  try {
    await cleanupSyntheticCatalog(connection);

    for (const disease of CATALOG_DISEASES) {
      await connection.execute(
        `
        INSERT INTO diseases (name_en, name_tr, description_en, description_tr,
          symptoms_en, symptoms_tr, treatment_en, treatment_tr)
        SELECT :nameEn, :nameTr, :descEn, :descTr,
          'Clinical evaluation required', 'Klinik değerlendirme gerekir',
          'Individualized treatment plan', 'Kişiye özel tedavi planı'
        FROM dual
        WHERE NOT EXISTS (
          SELECT 1 FROM diseases WHERE name_en = :nameEn
        )
        `,
        disease,
        { autoCommit: false }
      );
    }

    for (const ingredient of CATALOG_INGREDIENTS) {
      await connection.execute(
        `
        INSERT INTO active_ingredients (name_en, name_tr, description_en, description_tr,
          body_effects_en, body_effects_tr, allergy_symptoms_en, allergy_symptoms_tr)
        SELECT :nameEn, :nameTr, :descEn, :descTr,
          'Pharmacological effect varies by dose', 'Farmakolojik etki doza göre değişir',
          'Rash|Itching|Swelling', 'Döküntü|Kaşıntı|Şişlik'
        FROM dual
        WHERE NOT EXISTS (
          SELECT 1 FROM active_ingredients WHERE name_en = :nameEn
        )
        `,
        ingredient,
        { autoCommit: false }
      );
    }

    const ingredientIdsResult = await connection.execute(
      `SELECT ingredient_id, name_en FROM active_ingredients ORDER BY ingredient_id`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const ingredientIdByName = new Map<string, number>();
    for (const row of (ingredientIdsResult.rows ?? []) as Array<{
      INGREDIENT_ID: number;
      NAME_EN: string;
    }>) {
      ingredientIdByName.set(row.NAME_EN, row.INGREDIENT_ID);
    }

    const ingredientNames = CATALOG_INGREDIENTS.map((item) => item.nameEn);
    const catalogMedicineNames = CATALOG_MEDICINES.map((item) => item.nameEn);

    for (const medicine of CATALOG_MEDICINES) {
      await connection.execute(
        `
        INSERT INTO medicines (name_en, name_tr, description_en, description_tr, dosage_form,
          uses_en, uses_tr, how_to_use_en, how_to_use_tr,
          side_effects_en, side_effects_tr, contraindications_en, contraindications_tr,
          pregnancy_en, pregnancy_tr, breastfeeding_en, breastfeeding_tr,
          elderly_en, elderly_tr, children_en, children_tr,
          special_conditions_en, special_conditions_tr)
        SELECT
          :nameEn, :nameTr, :descEn, :descTr, :dosageForm,
          'Therapeutic use per physician guidance', 'Hekim önerisiyle terapötik kullanım',
          'Follow prescription instructions', 'Reçete talimatlarına uyun',
          'See product leaflet', 'Ürün bilgisine bakınız',
          'Hypersensitivity to ingredients', 'Etken maddeye aşırı duyarlılık',
          'Consult physician', 'Hekime danışın',
          'Consult physician', 'Hekime danışın',
          'Dose adjustment may be required', 'Doz ayarı gerekebilir',
          'Pediatric dosing per specialist', 'Çocuk dozu uzman önerisiyle',
          'Review comorbidities before use', 'Kullanım öncesi eş hastalıkları değerlendirin'
        FROM dual
        WHERE NOT EXISTS (
          SELECT 1 FROM medicines WHERE name_en = :nameEn
        )
        `,
        {
          nameEn: medicine.nameEn,
          nameTr: medicine.nameTr,
          descEn: medicine.descEn,
          descTr: medicine.descTr,
          dosageForm: medicine.dosageForm,
        },
        { autoCommit: false }
      );

      const medResult = await connection.execute(
        `SELECT medicine_id FROM medicines WHERE name_en = :nameEn`,
        { nameEn: medicine.nameEn },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const medId = (
        (medResult.rows ?? []) as Array<{ MEDICINE_ID: number }>
      )[0]?.MEDICINE_ID;

      const ingredientName = ingredientNames[medicine.ingredientIndex];
      const ingredientId = ingredientIdByName.get(ingredientName);

      if (medId && ingredientId) {
        await connection.execute(
          `
          INSERT INTO medicine_ingredients (medicine_id, ingredient_id, amount_mg)
          SELECT :medId, :ingredientId, :amountMg FROM dual
          WHERE NOT EXISTS (
            SELECT 1 FROM medicine_ingredients
            WHERE medicine_id = :medId AND ingredient_id = :ingredientId
          )
          `,
          {
            medId,
            ingredientId,
            amountMg: medicine.amountMg,
          },
          { autoCommit: false }
        );
      }
    }

    const nameBinds: Record<string, string> = {};
    const namePlaceholders = catalogMedicineNames
      .map((name, index) => {
        const key = `n${index}`;
        nameBinds[key] = name;
        return `:${key}`;
      })
      .join(", ");

    await connection.execute(
      `
      DELETE FROM disease_medicines
      WHERE medicine_id IN (
        SELECT m.medicine_id FROM medicines m
        WHERE m.name_en NOT IN (${namePlaceholders})
        AND NOT EXISTS (
          SELECT 1 FROM user_medicines um WHERE um.medicine_id = m.medicine_id
        )
      )
      `,
      nameBinds,
      { autoCommit: false }
    );

    await connection.execute(
      `
      DELETE FROM medicine_similar
      WHERE medicine_id IN (
        SELECT m.medicine_id FROM medicines m
        WHERE m.name_en NOT IN (${namePlaceholders})
        AND NOT EXISTS (
          SELECT 1 FROM user_medicines um WHERE um.medicine_id = m.medicine_id
        )
      )
      OR similar_medicine_id IN (
        SELECT m.medicine_id FROM medicines m
        WHERE m.name_en NOT IN (${namePlaceholders})
        AND NOT EXISTS (
          SELECT 1 FROM user_medicines um WHERE um.medicine_id = m.medicine_id
        )
      )
      `,
      nameBinds,
      { autoCommit: false }
    );

    await connection.execute(
      `
      DELETE FROM medicine_ingredients
      WHERE medicine_id IN (
        SELECT m.medicine_id FROM medicines m
        WHERE m.name_en NOT IN (${namePlaceholders})
        AND NOT EXISTS (
          SELECT 1 FROM user_medicines um WHERE um.medicine_id = m.medicine_id
        )
      )
      `,
      nameBinds,
      { autoCommit: false }
    );

    await connection.execute(
      `
      DELETE FROM medicines m
      WHERE m.name_en NOT IN (${namePlaceholders})
      AND NOT EXISTS (
        SELECT 1 FROM user_medicines um WHERE um.medicine_id = m.medicine_id
      )
      `,
      nameBinds,
      { autoCommit: false }
    );

    await connection.commit();
    console.log("Catalog seed completed.");
    console.log(`Diseases: ${await countRows(connection, "diseases")}`);
    console.log(`Ingredients: ${await countRows(connection, "active_ingredients")}`);
    console.log(`Medicines: ${await countRows(connection, "medicines")}`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.close();
  }
}

main().catch((error) => {
  console.error("Catalog seed failed:", error);
  process.exit(1);
});
