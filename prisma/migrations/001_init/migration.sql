-- Smart Pharmacy Oracle schema (10 tables)

CREATE TABLE users (
    user_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR2(50) NOT NULL,
    password VARCHAR2(255) NOT NULL,
    name VARCHAR2(100) NOT NULL,
    surname VARCHAR2(100) NOT NULL,
    email VARCHAR2(255) NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR2(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uk_users_username UNIQUE (username),
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT chk_users_gender CHECK (gender IN ('MALE', 'FEMALE', 'OTHER'))
);

CREATE TABLE diseases (
    disease_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name_en VARCHAR2(150) NOT NULL,
    name_tr VARCHAR2(150) NOT NULL,
    description_en VARCHAR2(2000),
    description_tr VARCHAR2(2000)
);

CREATE TABLE active_ingredients (
    ingredient_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name_en VARCHAR2(150) NOT NULL,
    name_tr VARCHAR2(150) NOT NULL,
    description_en VARCHAR2(2000),
    description_tr VARCHAR2(2000)
);

CREATE TABLE medicines (
    medicine_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name_en VARCHAR2(150) NOT NULL,
    name_tr VARCHAR2(150) NOT NULL,
    description_en VARCHAR2(2000),
    description_tr VARCHAR2(2000),
    dosage_form VARCHAR2(100)
);

CREATE TABLE medicine_ingredients (
    medicine_id NUMBER NOT NULL,
    ingredient_id NUMBER NOT NULL,
    amount_mg NUMBER(10, 2),
    CONSTRAINT pk_medicine_ingredients PRIMARY KEY (medicine_id, ingredient_id),
    CONSTRAINT fk_mi_medicine FOREIGN KEY (medicine_id) REFERENCES medicines (medicine_id),
    CONSTRAINT fk_mi_ingredient FOREIGN KEY (ingredient_id) REFERENCES active_ingredients (ingredient_id)
);

CREATE TABLE user_diseases (
    user_id NUMBER NOT NULL,
    disease_id NUMBER NOT NULL,
    diagnosed_date DATE,
    CONSTRAINT pk_user_diseases PRIMARY KEY (user_id, disease_id),
    CONSTRAINT fk_ud_user FOREIGN KEY (user_id) REFERENCES users (user_id),
    CONSTRAINT fk_ud_disease FOREIGN KEY (disease_id) REFERENCES diseases (disease_id)
);

CREATE TABLE user_allergies (
    user_id NUMBER NOT NULL,
    ingredient_id NUMBER NOT NULL,
    severity VARCHAR2(20),
    notes VARCHAR2(500),
    CONSTRAINT pk_user_allergies PRIMARY KEY (user_id, ingredient_id),
    CONSTRAINT fk_ua_user FOREIGN KEY (user_id) REFERENCES users (user_id),
    CONSTRAINT fk_ua_ingredient FOREIGN KEY (ingredient_id) REFERENCES active_ingredients (ingredient_id),
    CONSTRAINT chk_ua_severity CHECK (severity IS NULL OR severity IN ('MILD', 'MODERATE', 'SEVERE'))
);

CREATE TABLE user_medicines (
    user_medicine_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER NOT NULL,
    medicine_id NUMBER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    dosage VARCHAR2(100),
    is_active NUMBER(1) DEFAULT 1 NOT NULL,
    CONSTRAINT fk_um_user FOREIGN KEY (user_id) REFERENCES users (user_id),
    CONSTRAINT fk_um_medicine FOREIGN KEY (medicine_id) REFERENCES medicines (medicine_id),
    CONSTRAINT chk_um_active CHECK (is_active IN (0, 1))
);

CREATE TABLE medicine_schedules (
    schedule_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_medicine_id NUMBER NOT NULL,
    frequency_type VARCHAR2(20) NOT NULL,
    day_of_week NUMBER(1),
    day_of_month NUMBER(2),
    time_of_day VARCHAR2(5) NOT NULL,
    notes VARCHAR2(500),
    CONSTRAINT fk_ms_user_medicine FOREIGN KEY (user_medicine_id) REFERENCES user_medicines (user_medicine_id),
    CONSTRAINT chk_ms_frequency CHECK (frequency_type IN ('DAILY', 'WEEKLY', 'MONTHLY')),
    CONSTRAINT chk_ms_day_of_week CHECK (day_of_week IS NULL OR day_of_week BETWEEN 1 AND 7),
    CONSTRAINT chk_ms_day_of_month CHECK (day_of_month IS NULL OR day_of_month BETWEEN 1 AND 31)
);

CREATE TABLE disease_medicines (
    disease_id NUMBER NOT NULL,
    medicine_id NUMBER NOT NULL,
    recommendation_note VARCHAR2(1000),
    CONSTRAINT pk_disease_medicines PRIMARY KEY (disease_id, medicine_id),
    CONSTRAINT fk_dm_disease FOREIGN KEY (disease_id) REFERENCES diseases (disease_id),
    CONSTRAINT fk_dm_medicine FOREIGN KEY (medicine_id) REFERENCES medicines (medicine_id)
);

CREATE INDEX idx_user_medicines_user ON user_medicines (user_id);
CREATE INDEX idx_user_medicines_medicine ON user_medicines (medicine_id);
CREATE INDEX idx_medicine_schedules_um ON medicine_schedules (user_medicine_id);
CREATE INDEX idx_user_diseases_user ON user_diseases (user_id);
CREATE INDEX idx_user_allergies_user ON user_allergies (user_id);
CREATE INDEX idx_disease_medicines_disease ON disease_medicines (disease_id);
