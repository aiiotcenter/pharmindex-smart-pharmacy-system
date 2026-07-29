-- Encyclopedia fields for Health Info Center

ALTER TABLE medicines ADD (
    uses_tr VARCHAR2(4000),
    uses_en VARCHAR2(4000),
    how_to_use_tr VARCHAR2(4000),
    how_to_use_en VARCHAR2(4000),
    side_effects_tr VARCHAR2(4000),
    side_effects_en VARCHAR2(4000),
    contraindications_tr VARCHAR2(4000),
    contraindications_en VARCHAR2(4000),
    pregnancy_tr VARCHAR2(4000),
    pregnancy_en VARCHAR2(4000),
    breastfeeding_tr VARCHAR2(4000),
    breastfeeding_en VARCHAR2(4000),
    elderly_tr VARCHAR2(4000),
    elderly_en VARCHAR2(4000),
    children_tr VARCHAR2(4000),
    children_en VARCHAR2(4000),
    special_conditions_tr VARCHAR2(4000),
    special_conditions_en VARCHAR2(4000)
);

ALTER TABLE diseases ADD (
    symptoms_tr VARCHAR2(4000),
    symptoms_en VARCHAR2(4000),
    treatment_tr VARCHAR2(4000),
    treatment_en VARCHAR2(4000),
    when_to_use_tr VARCHAR2(4000),
    when_to_use_en VARCHAR2(4000),
    when_not_to_use_tr VARCHAR2(4000),
    when_not_to_use_en VARCHAR2(4000),
    affected_patients_tr VARCHAR2(4000),
    affected_patients_en VARCHAR2(4000)
);

ALTER TABLE active_ingredients ADD (
    body_effects_tr VARCHAR2(4000),
    body_effects_en VARCHAR2(4000),
    allergy_symptoms_tr VARCHAR2(4000),
    allergy_symptoms_en VARCHAR2(4000)
);

CREATE TABLE medicine_similar (
    medicine_id NUMBER NOT NULL,
    similar_medicine_id NUMBER NOT NULL,
    CONSTRAINT pk_medicine_similar PRIMARY KEY (medicine_id, similar_medicine_id),
    CONSTRAINT fk_ms_medicine FOREIGN KEY (medicine_id) REFERENCES medicines (medicine_id),
    CONSTRAINT fk_ms_similar FOREIGN KEY (similar_medicine_id) REFERENCES medicines (medicine_id)
);

CREATE TABLE user_health_profile (
    user_id NUMBER PRIMARY KEY,
    pregnancy NUMBER(1) DEFAULT 0 NOT NULL,
    breastfeeding NUMBER(1) DEFAULT 0 NOT NULL,
    elderly NUMBER(1) DEFAULT 0 NOT NULL,
    menopause NUMBER(1) DEFAULT 0 NOT NULL,
    menstruation NUMBER(1) DEFAULT 0 NOT NULL,
    pregnancy_planning NUMBER(1) DEFAULT 0 NOT NULL,
    prostate_history NUMBER(1) DEFAULT 0 NOT NULL,
    testosterone_therapy NUMBER(1) DEFAULT 0 NOT NULL,
    CONSTRAINT fk_uhp_user FOREIGN KEY (user_id) REFERENCES users (user_id),
    CONSTRAINT chk_uhp_pregnancy CHECK (pregnancy IN (0, 1)),
    CONSTRAINT chk_uhp_breastfeeding CHECK (breastfeeding IN (0, 1)),
    CONSTRAINT chk_uhp_elderly CHECK (elderly IN (0, 1)),
    CONSTRAINT chk_uhp_menopause CHECK (menopause IN (0, 1)),
    CONSTRAINT chk_uhp_menstruation CHECK (menstruation IN (0, 1)),
    CONSTRAINT chk_uhp_pregnancy_planning CHECK (pregnancy_planning IN (0, 1)),
    CONSTRAINT chk_uhp_prostate CHECK (prostate_history IN (0, 1)),
    CONSTRAINT chk_uhp_testosterone CHECK (testosterone_therapy IN (0, 1))
);
