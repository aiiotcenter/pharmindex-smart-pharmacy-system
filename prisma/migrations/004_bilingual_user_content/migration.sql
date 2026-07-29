ALTER TABLE medicine_schedules ADD (
    notes_tr VARCHAR2(500),
    notes_en VARCHAR2(500)
);

ALTER TABLE user_medicines ADD (
    dosage_tr VARCHAR2(500),
    dosage_en VARCHAR2(500)
);

UPDATE medicine_schedules SET notes_en = notes WHERE notes IS NOT NULL;
UPDATE user_medicines SET dosage_en = dosage WHERE dosage IS NOT NULL;

UPDATE medicine_schedules SET
    notes_tr = 'Kahvaltıdan sonra alın',
    notes_en = 'Take after breakfast'
WHERE schedule_id = 1;

UPDATE medicine_schedules SET
    notes_tr = 'Uyumadan önce alın',
    notes_en = 'Take before sleep'
WHERE schedule_id = 2;

UPDATE medicine_schedules SET
    notes_tr = 'Pazartesi günleri koruyucu inhaler',
    notes_en = 'Maintenance inhaler on Mondays'
WHERE schedule_id = 3;

UPDATE medicine_schedules SET
    notes_tr = 'Perşembe günleri koruyucu inhaler',
    notes_en = 'Maintenance inhaler on Thursdays'
WHERE schedule_id = 4;

UPDATE medicine_schedules SET
    notes_tr = 'Aylık migren önleyici doz',
    notes_en = 'Monthly migraine prevention dose'
WHERE schedule_id = 5;

UPDATE user_medicines SET
    dosage_tr = 'Kahvaltıdan sonra 1 tablet',
    dosage_en = '1 tablet after breakfast'
WHERE user_medicine_id = 1;

UPDATE user_medicines SET
    dosage_tr = 'Gece 1 tablet',
    dosage_en = '1 tablet at night'
WHERE user_medicine_id = 2;

UPDATE user_medicines SET
    dosage_tr = 'Gerektiğinde 2 puff',
    dosage_en = '2 puffs when needed'
WHERE user_medicine_id = 3;

UPDATE user_medicines SET
    dosage_tr = 'Gerektiğinde 1 tablet',
    dosage_en = '1 tablet when needed'
WHERE user_medicine_id = 4;

ALTER TABLE user_allergies ADD (
    notes_tr VARCHAR2(500),
    notes_en VARCHAR2(500)
);

UPDATE user_allergies SET notes_en = notes WHERE notes IS NOT NULL;

UPDATE user_allergies SET
    notes_tr = 'Penisilin grubu antibiyotik alerjisi',
    notes_en = 'Penicillin-class antibiotic allergy'
WHERE user_id = 1 AND ingredient_id = 3;

UPDATE user_allergies SET
    notes_tr = 'Aspirin hassasiyeti',
    notes_en = 'Aspirin sensitivity'
WHERE user_id = 2 AND ingredient_id = 4;

UPDATE user_allergies SET
    notes_tr = 'Ibuprofen hafif mide rahatsızlığı yapıyor',
    notes_en = 'Ibuprofen causes mild stomach discomfort'
WHERE user_id = 3 AND ingredient_id = 2;
