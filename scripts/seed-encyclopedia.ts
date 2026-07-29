import "dotenv/config";
import * as oracledb from "oracledb";

function getConnectionConfig(): oracledb.ConnectionConfig {
  return {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECTION,
  };
}

async function main(): Promise<void> {
  const connection = await oracledb.getConnection(getConnectionConfig());

  try {
    // Fix Turkish characters in base descriptions
    await connection.execute(
      `UPDATE diseases SET
        name_tr = 'Tip 2 Diyabet',
        description_tr = 'Kan şekeri düzenlemesini etkileyen kronik bir hastalık.',
        symptoms_tr = 'Aşırı susama|Sık idrara çıkma|Yorgunluk|Bulanık görme',
        treatment_tr = 'Diyet|Egzeriz|Metformin gibi oral antidiyabetikler|İnsülin (ileri evre)',
        when_to_use_tr = 'Kan şekeri yüksekliği teşhisi konduğunda hekim önerisiyle',
        when_not_to_use_tr = 'Hipoglisemi riski olan durumlarda doktor kontrolü olmadan ilaç değiştirmeyin',
        affected_patients_tr = 'Tip 2 diyabet tanılı yetişkin hastalar; genellikle Glucophage (Metformin) kullanır'
       WHERE disease_id = 1`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE diseases SET
        name_tr = 'Hipertansiyon',
        description_tr = 'Kalp hastalıklarına yol açabilen yüksek tansiyon.',
        symptoms_tr = 'Baş ağrısı|Baş dönmesi|Burun kanaması (bazı hastalarda belirti olmayabilir)',
        treatment_tr = 'Tuz kısıtlaması|Düzenli egzersiz|ACE inhibitörleri|Statinler|Düşük doz aspirin',
        when_to_use_tr = 'Tansiyon ölçümünde tekrarlayan yüksek değerlerde',
        when_not_to_use_tr = 'Tansiyon düşüklüğü, böbrek yetmezliği veya ilaç etkileşimi riskinde dikkat',
        affected_patients_tr = 'Hipertansiyon tanılı hastalar; Lipitor ve düşük doz aspirin kullanabilir'
       WHERE disease_id = 2`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE diseases SET
        name_tr = 'Astım',
        description_tr = 'Solunum yollarında iltihaplanmaya neden olan kronik bir durum.',
        symptoms_tr = 'Nefes darlığı|Hırıltı|Öksürük|Göğüs sıkışması',
        treatment_tr = 'İnhaler bronkodilatörler|Kortizon (ağırlaşma döneminde)|Tetikleyicilerden kaçınma',
        when_to_use_tr = 'Astım atağı veya nefes darlığında kurtarıcı inhaler ile',
        when_not_to_use_tr = 'Sürekli kullanım gerektiren durumlarda hekim planına uyun',
        affected_patients_tr = 'Astım tanılı hastalar; Ventolin inhaler kullanır'
       WHERE disease_id = 3`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE diseases SET
        name_tr = 'Migren',
        description_tr = 'Şiddetli tekrarlayan baş ağrılarına neden olan nörolojik bir durum.',
        symptoms_tr = 'Tek taraflı zonklayıcı baş ağrısı|Bulantı|Işığa hassasiyet',
        treatment_tr = 'Tetikleyicilerden kaçınma|Parasetamol|NSAID|Profilaktik tedavi (ağır vakalarda)',
        when_to_use_tr = 'Atak başladığında erken dönemde ağrı kesici ile',
        when_not_to_use_tr = 'Aşırı ağrı kesici kullanımından kaçının; hekim önerisi alın',
        affected_patients_tr = 'Migren tanılı hastalar; Parol (Parasetamol) kullanabilir'
       WHERE disease_id = 4`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE diseases SET
        name_tr = 'Reflü',
        description_tr = 'Mide asidinin yemek borusuna çıkmasıyla oluşan rahatsızlık.',
        symptoms_tr = 'Yanma|Geğirme|Göğüs ağrısı|Gece öksürüğü',
        treatment_tr = 'Beslenme düzenlemesi|Omeprazol gibi PPI ilaçları|Yatmadan önce yemek yememe',
        when_to_use_tr = 'Sık tekrarlayan mide yanması ve reflü şikayetlerinde',
        when_not_to_use_tr = 'Uzun süreli PPI kullanımında doktor takibi gerekir',
        affected_patients_tr = 'Reflü tanılı hastalar; Losec (Omeprazol) kullanır'
       WHERE disease_id = 5`,
      {},
      { autoCommit: false }
    );

    // Parol - full encyclopedia entry
    await connection.execute(
      `
      UPDATE medicines SET
        name_tr = 'Parol 500 mg',
        description_tr = 'Hafif-orta ağrı ve ateş için parasetamol tablet.',
        uses_tr = 'Ateş düşürücü|Ağrı kesici|Baş ağrısı|Kas ağrısı|Diş ağrısı|Soğuk algınlığında ateş',
        how_to_use_tr = 'Yetişkinlerde genellikle 500 mg-1 g, günde 3-4 kez. Tablet bol su ile yemekten sonra alınabilir. Günlük maksimum 4 g aşılmamalıdır.',
        side_effects_tr = 'Nadiren mide bulantısı|Cilt döküntüsü|Karaciğer hasarı (aşırı dozda)',
        contraindications_tr = 'Ciddi karaciğer yetmezliği|Parasetamole aşırı duyarlılık|Alkol bağımlılığında dikkat',
        pregnancy_tr = 'Gebelikte hekim önerisiyle düşük doz kullanılabilir. Doktorunuza danışın.',
        breastfeeding_tr = 'Emzirme döneminde genellikle güvenli kabul edilir; hekim önerisiyle kullanın.',
        elderly_tr = 'Yaşlılarda doz ayarlaması gerekebilir; böbrek ve karaciğer fonksiyonları değerlendirilmelidir.',
        children_tr = 'Çocuklarda kiloya göre doz hesaplanır. 12 yaş altı için çocuk formülasyonları tercih edilir.',
        special_conditions_tr = 'Gebelik planlama: Doktorunuza danışın|Menopoz: Genellikle güvenli|Adet dönemi: Ağrı kesici olarak kullanılabilir|Prostat hastalığı: Doğrudan etkileşim yok|Testosteron tedavisi: Hekim önerisiyle',
        uses_en = 'Antipyretic|Analgesic|Headache|Muscle pain|Toothache|Fever in cold',
        how_to_use_en = 'Adults: 500mg-1g every 4-6 hours. Max 4g/day. Take with water after food.',
        side_effects_en = 'Rare nausea|Skin rash|Liver damage (overdose)',
        contraindications_en = 'Severe liver failure|Paracetamol hypersensitivity',
        pregnancy_en = 'May be used in pregnancy under medical advice.',
        breastfeeding_en = 'Generally considered safe during breastfeeding.',
        elderly_en = 'Dose adjustment may be needed in elderly patients.',
        children_en = 'Weight-based dosing in children.',
        special_conditions_en = 'Pregnancy planning: consult doctor|Menopause: generally safe|Menstruation: may use for pain'
       WHERE medicine_id = 1
      `,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE medicines SET
        description_tr = 'Ağrı ve iltihap için ibuprofen tablet.',
        uses_tr = 'Ağrı kesici|Ateş düşürücü|İltihap giderici|Adet ağrısı|Eklem ağrısı',
        how_to_use_tr = 'Yemekle birlikte alın. Günde 3 kez 400 mg (hekim önerisine göre).',
        side_effects_tr = 'Mide rahatsızlığı|Hazımsızlık|Baş dönmesi',
        contraindications_tr = 'Mide ülseri|Aspirin astımı|Son trimester gebelik',
        pregnancy_tr = 'Gebelikte özellikle 3. trimesterde kullanılmamalıdır.',
        breastfeeding_tr = 'Kısa süreli düşük doz genellikle kabul edilebilir; hekime danışın.',
        elderly_tr = 'Yaşlılarda mide kanaması riski artabilir.',
        children_tr = '12 yaş altı çocuklarda genellikle önerilmez.',
        special_conditions_tr = 'Menopoz döneminde mide hassasiyeti olabilir|Adet döneminde sık kullanılır|Prostat: dikkatli kullanım'
       WHERE medicine_id = 2`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE medicines SET
        description_tr = 'Amoksisilin bazlı antibiyotik kombinasyonu.',
        uses_tr = 'Bakteriyel enfeksiyon tedavisi|Solunum yolu enfeksiyonları|İdrar yolu enfeksiyonları',
        how_to_use_tr = 'Hekim tarafından belirlenen doz ve süre boyunca düzenli kullanın. Kür tamamlanmalıdır.',
        side_effects_tr = 'İshal|Mide bulantısı|Döküntü|Alerjik reaksiyon',
        contraindications_tr = 'Penisilin alerjisi|Anafilaksi öyküsü',
        pregnancy_tr = 'Gebelikte hekim önerisiyle kullanılabilir.',
        breastfeeding_tr = 'Emzirmede hekim kontrolü önerilir.',
        elderly_tr = 'Yaşlılarda böbrek fonksiyonuna göre doz ayarı gerekebilir.',
        children_tr = 'Çocuklarda kiloya göre dozlanır.',
        special_conditions_tr = 'Gebelik planlama: enfeksiyon varsa hekime danışın|Penisilin alerjisi olanlar KULLANMAMALI'
       WHERE medicine_id = 3`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE medicines SET
        description_tr = 'Kardiyovasküler koruma için düşük doz aspirin.',
        uses_tr = 'Kan pıhtılaşmasını azaltma|Kalp-damar koruma|İnme riski azaltma (hekim önerisiyle)',
        how_to_use_tr = 'Günde 1 tablet (100 mg), genellikle akşam yemekten sonra.',
        side_effects_tr = 'Mide kanaması|Kolay morarma|Mide yanması',
        contraindications_tr = 'Aktif mide ülseri|Aspirin alerjisi|Kanama bozuklukları',
        pregnancy_tr = 'Gebelikte genellikle önerilmez.',
        breastfeeding_tr = 'Emzirmede hekime danışın.',
        elderly_tr = 'Yaşlılarda mide kanaması riski yüksektir.',
        children_tr = 'Reye sendromu riski nedeniyle çocuklarda viral enfeksiyonda kullanılmamalı.',
        special_conditions_tr = 'Prostat hastalığı: kanama riski açısından dikkat|Testosteron tedavisi: etkileşim için hekime danışın'
       WHERE medicine_id = 4`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE medicines SET
        description_tr = 'Akut astım semptomları için salbutamol inhaler.',
        uses_tr = 'Astım atağında nefes açma|Bronş spazmı giderme|Nefes darlığı',
        how_to_use_tr = 'Atak anında 1-2 puff. 20 dakikada 3 dozdan fazla kullanmayın. Acil durumda 112.',
        side_effects_tr = 'Titreme|Kalp çarpıntısı|Baş ağrısı',
        contraindications_tr = 'Salbutamole aşırı duyarlılık|Kontrolsüz aritmi',
        pregnancy_tr = 'Gebelikte hekim önerisiyle kullanılabilir.',
        breastfeeding_tr = 'Emzirmede genellikle güvenli.',
        elderly_tr = 'Yaşlılarda kalp etkileri izlenmelidir.',
        children_tr = 'Çocuklarda spacer cihazı ile kullanım önerilir.',
        special_conditions_tr = 'Gebelik planlama: astım kontrolü için hekim takibi|Menopoz: kullanım devam edebilir'
       WHERE medicine_id = 5`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE medicines SET
        description_tr = 'Kan şekeri kontrolü için metformin tablet.',
        uses_tr = 'Tip 2 diyabette kan şekeri düşürme|İnsülin direncini azaltma',
        how_to_use_tr = 'Genellikle yemeklerle birlikte günde 1-2 kez. Hekim dozunu ayarlar.',
        side_effects_tr = 'Mide bulantısı|İshal|Metalik tat',
        contraindications_tr = 'Ciddi böbrek yetmezliği|Metabolik asidoz|Karaciğer yetmezliği',
        pregnancy_tr = 'Gebelikte insülin tercih edilebilir; hekime danışın.',
        breastfeeding_tr = 'Emzirmede genellikle güvenli kabul edilir.',
        elderly_tr = 'Yaşlılarda böbrek fonksiyonu izlenmelidir.',
        children_tr = '12 yaş üstü tip 2 diyabette kullanılabilir.',
        special_conditions_tr = 'Gebelik planlama: kan şekeri kontrolü şart|Menopoz: kullanım devam edebilir|Prostat: doğrudan etkileşim yok'
       WHERE medicine_id = 6`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE medicines SET
        description_tr = 'Kolesterol yönetimi için atorvastatin.',
        uses_tr = 'LDL kolesterol düşürme|Kalp-damar riskini azaltma',
        how_to_use_tr = 'Genellikle akşam 1 tablet. Düzenli kan testi ile takip.',
        side_effects_tr = 'Kas ağrısı|Karaciğer enzim yüksekliği|Baş ağrısı',
        contraindications_tr = 'Aktif karaciğer hastalığı|Gebelik|Emzirme',
        pregnancy_tr = 'Gebelikte KULLANILMAMALIDIR.',
        breastfeeding_tr = 'Emzirmede KULLANILMAMALIDIR.',
        elderly_tr = 'Yaşlılarda doz düşürülebilir.',
        children_tr = 'Çocuklarda hekim önerisiyle sınırlı endikasyon.',
        special_conditions_tr = 'Gebelik planlama: kesinlikle kullanmayın|Testosteron tedavisi: etkileşim için hekime danışın'
       WHERE medicine_id = 7`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE medicines SET
        description_tr = 'Asit reflüsü için omeprazol kapsül.',
        uses_tr = 'Mide asidi azaltma|Reflü tedavisi|Gastrit|Ülser koruma',
        how_to_use_tr = 'Sabah aç karnına 1 kapsül. Hekim süresini belirler.',
        side_effects_tr = 'Baş ağrısı|Karın ağrısı|Uzun sürede B12 eksikliği riski',
        contraindications_tr = 'Omeprazole aşırı duyarlılık',
        pregnancy_tr = 'Gebelikte hekim önerisiyle kullanılabilir.',
        breastfeeding_tr = 'Emzirmede hekime danışın.',
        elderly_tr = 'Yaşlılarda kemik erimesi riski uzun kullanımda artabilir.',
        children_tr = '12 yaş üstü reflü tedavisinde kullanılabilir.',
        special_conditions_tr = 'Menopoz: uzun süreli kullanımda kemik sağlığı takibi|Prostat: doğrudan etkileşim yok'
       WHERE medicine_id = 8`,
      {},
      { autoCommit: false }
    );

    // Ingredients - allergy info
    await connection.execute(
      `UPDATE active_ingredients SET
        description_tr = 'Ağrı ve ateş için kullanılan analjezik ve antipiretik.',
        body_effects_tr = 'Aşırı dozda karaciğer hasarı|Nadir alerjik reaksiyon',
        allergy_symptoms_tr = 'Cilt döküntüsü|Kaşıntı|Yüzde şişme (nadir)|Anafilaksi (çok nadir)'
       WHERE ingredient_id = 1`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE active_ingredients SET
        description_tr = 'Ağrı, ateş ve iltihap için kullanılan NSAID.',
        body_effects_tr = 'Mide tahrişi|Böbrek fonksiyon etkisi|Kan basıncı değişikliği',
        allergy_symptoms_tr = 'Döküntü|Astım atağı (aspirin astımı)|Yüzde şişme|Nefes darlığı'
       WHERE ingredient_id = 2`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE active_ingredients SET
        description_tr = 'Bakteriyel enfeksiyonlar için penisilin sınıfı antibiyotik.',
        body_effects_tr = 'İshal|Mide bulantısı|Candida enfeksiyonu riski',
        allergy_symptoms_tr = 'Kurdeşen|Kaşıntı|Yüz-dil-dudak şişmesi|Anafilaksi|Nefes darlığı|Penisilin alerjisi olanlar AUGMENTIN KULLANMAMALI'
       WHERE ingredient_id = 3`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE active_ingredients SET
        name_tr = 'Asetilsalisilik Asit',
        description_tr = 'Aspirin olarak bilinen NSAID.',
        body_effects_tr = 'Mide kanaması riski|Kan pıhtılaşmasını azaltma',
        allergy_symptoms_tr = 'Burun akıntısı|Astım benzeri nefes darlığı|Döküntü|Aspirin alerjisi olanlar ASPIRIN KULLANMAMALI'
       WHERE ingredient_id = 4`,
      {},
      { autoCommit: false }
    );

    // Add similar medicines if not exist
    const similarMeds = [
      ["Minoset 500 mg", "Minoset 500 mg", "Parasetamol tablet.", "Parasetamol tablet.", "Tablet", 1],
      ["Dolven 500 mg", "Dolven 500 mg", "Parasetamol tablet.", "Parasetamol tablet.", "Tablet", 1],
      ["Calpol 500 mg", "Calpol 500 mg", "Parasetamol tablet.", "Parasetamol tablet.", "Tablet", 1],
    ];

    for (const [nameEn, nameTr, descEn, descTr, form, ingId] of similarMeds) {
      const exists = await connection.execute(
        `SELECT medicine_id FROM medicines WHERE name_tr = :nameTr`,
        { nameTr },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const existRows = (exists.rows ?? []) as Array<{ MEDICINE_ID: number }>;

      if (existRows.length === 0) {
        await connection.execute(
          `INSERT INTO medicines (name_en, name_tr, description_en, description_tr, dosage_form, uses_tr, uses_en)
           VALUES (:nameEn, :nameTr, :descEn, :descTr, :form, 'Ateş düşürücü|Ağrı kesici', 'Antipyretic|Analgesic')`,
          { nameEn, nameTr, descEn, descTr, form },
          { autoCommit: false }
        );
        const newMed = await connection.execute(
          `SELECT MAX(medicine_id) AS id FROM medicines`,
          {},
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const newId = ((newMed.rows ?? []) as Array<{ ID: number }>)[0]?.ID;
        if (newId) {
          await connection.execute(
            `INSERT INTO medicine_ingredients (medicine_id, ingredient_id, amount_mg) VALUES (:mid, :iid, 500)`,
            { mid: newId, iid: ingId },
            { autoCommit: false }
          );
          await connection.execute(
            `INSERT INTO medicine_similar (medicine_id, similar_medicine_id)
             SELECT 1, :sid FROM dual
             WHERE NOT EXISTS (
               SELECT 1 FROM medicine_similar
               WHERE medicine_id = 1 AND similar_medicine_id = :sid
             )`,
            { sid: newId },
            { autoCommit: false }
          );
        }
      } else {
        await connection.execute(
          `INSERT INTO medicine_similar (medicine_id, similar_medicine_id)
           SELECT 1, :sid FROM dual
           WHERE NOT EXISTS (
             SELECT 1 FROM medicine_similar
             WHERE medicine_id = 1 AND similar_medicine_id = :sid
           )`,
          { sid: existRows[0].MEDICINE_ID },
          { autoCommit: false }
        );
      }
    }

    // English encyclopedia content
    await connection.execute(
      `UPDATE diseases SET
        description_en = 'A chronic condition affecting blood sugar regulation.',
        symptoms_en = 'Excessive thirst|Frequent urination|Fatigue|Blurred vision',
        treatment_en = 'Diet|Exercise|Oral antidiabetics such as metformin|Insulin (advanced stage)',
        when_to_use_en = 'When hyperglycemia is diagnosed under physician guidance',
        when_not_to_use_en = 'Do not change medication without doctor supervision if hypoglycemia risk exists',
        affected_patients_en = 'Adult patients diagnosed with type 2 diabetes; usually use Glucophage (Metformin)'
       WHERE disease_id = 1`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE diseases SET
        description_en = 'High blood pressure that may lead to heart disease.',
        symptoms_en = 'Headache|Dizziness|Nosebleeds (some patients may have no symptoms)',
        treatment_en = 'Salt restriction|Regular exercise|ACE inhibitors|Statins|Low-dose aspirin',
        when_to_use_en = 'When repeated high blood pressure readings are observed',
        when_not_to_use_en = 'Use caution with hypotension, kidney failure, or drug interaction risk',
        affected_patients_en = 'Patients with hypertension; may use Lipitor and low-dose aspirin'
       WHERE disease_id = 2`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE diseases SET
        description_en = 'A chronic condition causing inflammation in the airways.',
        symptoms_en = 'Shortness of breath|Wheezing|Cough|Chest tightness',
        treatment_en = 'Inhaled bronchodilators|Corticosteroids (during exacerbations)|Avoiding triggers',
        when_to_use_en = 'Use rescue inhaler during asthma attack or shortness of breath',
        when_not_to_use_en = 'Follow physician plan for maintenance therapy',
        affected_patients_en = 'Patients with asthma; use Ventolin inhaler'
       WHERE disease_id = 3`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE diseases SET
        description_en = 'A neurological condition causing severe recurring headaches.',
        symptoms_en = 'Unilateral throbbing headache|Nausea|Light sensitivity',
        treatment_en = 'Avoid triggers|Paracetamol|NSAIDs|Preventive therapy (severe cases)',
        when_to_use_en = 'Use analgesics early when attack begins',
        when_not_to_use_en = 'Avoid excessive analgesic use; consult a physician',
        affected_patients_en = 'Patients with migraine; may use Parol (Paracetamol)'
       WHERE disease_id = 4`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE diseases SET
        description_en = 'Discomfort caused by stomach acid flowing into the esophagus.',
        symptoms_en = 'Heartburn|Belching|Chest pain|Night cough',
        treatment_en = 'Dietary changes|PPI drugs such as omeprazole|Avoid eating before bed',
        when_to_use_en = 'For recurring heartburn and reflux symptoms',
        when_not_to_use_en = 'Long-term PPI use requires medical follow-up',
        affected_patients_en = 'Patients with reflux; use Losec (Omeprazole)'
       WHERE disease_id = 5`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE medicines SET
        uses_en = 'Analgesic|Antipyretic|Anti-inflammatory|Menstrual pain|Joint pain',
        side_effects_en = 'Stomach discomfort|Indigestion|Dizziness',
        how_to_use_en = 'Take with food. 400 mg three times daily (as directed by physician).',
        contraindications_en = 'Stomach ulcer|Aspirin asthma|Third trimester pregnancy',
        pregnancy_en = 'Should not be used in pregnancy, especially third trimester.',
        breastfeeding_en = 'Short-term low doses may be acceptable; consult physician.',
        elderly_en = 'Increased risk of gastrointestinal bleeding in elderly patients.',
        children_en = 'Generally not recommended for children under 12.',
        special_conditions_en = 'Menopause: possible stomach sensitivity|Menstruation: frequently used|Prostate: use with caution'
       WHERE medicine_id = 2`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE medicines SET
        uses_en = 'Bacterial infection treatment|Respiratory infections|Urinary tract infections',
        side_effects_en = 'Diarrhea|Nausea|Rash|Allergic reaction',
        how_to_use_en = 'Take at prescribed dose and duration. Complete the full course.',
        contraindications_en = 'Penicillin allergy|History of anaphylaxis',
        pregnancy_en = 'May be used in pregnancy under medical advice.',
        breastfeeding_en = 'Medical supervision recommended during breastfeeding.',
        elderly_en = 'Dose adjustment may be needed based on kidney function.',
        children_en = 'Dosed by weight in children.',
        special_conditions_en = 'Pregnancy planning: consult physician if infection present|Do NOT use if penicillin allergic'
       WHERE medicine_id = 3`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE medicines SET
        uses_en = 'Reduce blood clotting|Cardiovascular protection|Stroke risk reduction (under medical advice)',
        side_effects_en = 'Gastrointestinal bleeding|Easy bruising|Heartburn',
        how_to_use_en = 'One tablet (100 mg) daily, usually after evening meal.',
        contraindications_en = 'Active stomach ulcer|Aspirin allergy|Bleeding disorders',
        pregnancy_en = 'Generally not recommended during pregnancy.',
        breastfeeding_en = 'Consult physician during breastfeeding.',
        elderly_en = 'Higher gastrointestinal bleeding risk in elderly.',
        children_en = 'Not for viral infections in children due to Reye syndrome risk.',
        special_conditions_en = 'Prostate disease: bleeding risk caution|Testosterone therapy: consult physician for interactions'
       WHERE medicine_id = 4`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE medicines SET
        uses_en = 'Relieve breathing during asthma attack|Bronchospasm relief|Shortness of breath',
        side_effects_en = 'Tremor|Palpitations|Headache',
        how_to_use_en = '1-2 puffs during attack. Do not exceed 3 doses in 20 minutes. Call emergency services if needed.',
        contraindications_en = 'Hypersensitivity to salbutamol|Uncontrolled arrhythmia',
        pregnancy_en = 'May be used in pregnancy under medical advice.',
        breastfeeding_en = 'Generally safe during breastfeeding.',
        elderly_en = 'Cardiac effects should be monitored in elderly.',
        children_en = 'Use with spacer device in children.',
        special_conditions_en = 'Pregnancy planning: physician follow-up for asthma control|Menopause: may continue use'
       WHERE medicine_id = 5`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE medicines SET
        description_en = 'Metformin tablet for blood sugar control.',
        uses_en = 'Lower blood sugar in type 2 diabetes|Reduce insulin resistance',
        side_effects_en = 'Nausea|Diarrhea|Metallic taste',
        how_to_use_en = 'Usually once or twice daily with meals. Physician adjusts dose.',
        contraindications_en = 'Severe kidney failure|Metabolic acidosis|Liver failure',
        pregnancy_en = 'Insulin may be preferred in pregnancy; consult physician.',
        breastfeeding_en = 'Generally considered safe during breastfeeding.',
        elderly_en = 'Kidney function should be monitored in elderly.',
        children_en = 'May be used in type 2 diabetes above age 12.',
        special_conditions_en = 'Pregnancy planning: blood sugar control required|Menopause: may continue use|Prostate: no direct interaction'
       WHERE medicine_id = 6`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE medicines SET
        uses_en = 'Lower LDL cholesterol|Reduce cardiovascular risk',
        side_effects_en = 'Muscle pain|Elevated liver enzymes|Headache',
        how_to_use_en = 'Usually one tablet in the evening. Monitor with regular blood tests.',
        contraindications_en = 'Active liver disease|Pregnancy|Breastfeeding',
        pregnancy_en = 'Must NOT be used during pregnancy.',
        breastfeeding_en = 'Must NOT be used during breastfeeding.',
        elderly_en = 'Dose may be reduced in elderly patients.',
        children_en = 'Limited indications in children under physician advice.',
        special_conditions_en = 'Pregnancy planning: do not use|Testosterone therapy: consult physician for interactions'
       WHERE medicine_id = 7`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE medicines SET
        uses_en = 'Reduce stomach acid|Reflux treatment|Gastritis|Ulcer protection',
        side_effects_en = 'Headache|Abdominal pain|Long-term B12 deficiency risk',
        how_to_use_en = 'One capsule on empty stomach in the morning. Physician determines duration.',
        contraindications_en = 'Hypersensitivity to omeprazole',
        pregnancy_en = 'May be used in pregnancy under medical advice.',
        breastfeeding_en = 'Consult physician during breastfeeding.',
        elderly_en = 'Long-term use may increase osteoporosis risk in elderly.',
        children_en = 'May be used for reflux in children above age 12.',
        special_conditions_en = 'Menopause: bone health monitoring with long-term use|Prostate: no direct interaction'
       WHERE medicine_id = 8`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE active_ingredients SET
        description_en = 'Analgesic and antipyretic used for pain and fever.',
        body_effects_en = 'Liver damage in overdose|Rare allergic reactions',
        allergy_symptoms_en = 'Skin rash|Itching|Facial swelling (rare)|Anaphylaxis (very rare)'
       WHERE ingredient_id = 1`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE active_ingredients SET
        description_en = 'NSAID used for pain, fever, and inflammation.',
        body_effects_en = 'Stomach irritation|Kidney function effects|Blood pressure changes',
        allergy_symptoms_en = 'Rash|Asthma attack (aspirin asthma)|Facial swelling|Shortness of breath'
       WHERE ingredient_id = 2`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE active_ingredients SET
        description_en = 'Penicillin-class antibiotic for bacterial infections.',
        body_effects_en = 'Diarrhea|Nausea|Risk of candida infection',
        allergy_symptoms_en = 'Hives|Itching|Face-tongue-lip swelling|Anaphylaxis|Shortness of breath|Patients with penicillin allergy must NOT use AUGMENTIN'
       WHERE ingredient_id = 3`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE active_ingredients SET
        description_en = 'NSAID known as aspirin.',
        body_effects_en = 'Gastrointestinal bleeding risk|Reduces blood clotting',
        allergy_symptoms_en = 'Runny nose|Asthma-like shortness of breath|Rash|Patients with aspirin allergy must NOT use ASPIRIN'
       WHERE ingredient_id = 4`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE medicines SET dosage_form = 'TABLET' WHERE dosage_form = 'Tablet'`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE medicines SET dosage_form = 'INHALER' WHERE LOWER(dosage_form) = 'inhaler'`,
      {},
      { autoCommit: false }
    );

    await connection.execute(
      `UPDATE medicines SET dosage_form = 'CAPSULE' WHERE LOWER(dosage_form) = 'capsule'`,
      {},
      { autoCommit: false }
    );

    await connection.commit();
    console.log("Encyclopedia seed completed with Turkish characters.");
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.close();
  }
}

main().catch((error) => {
  console.error("Encyclopedia seed failed:", error);
  process.exit(1);
});
