ALTER TABLE user_medicines ADD (
    added_by VARCHAR2(20) DEFAULT 'PATIENT',
    approval_status VARCHAR2(20) DEFAULT 'APPROVED',
    approved_by_doctor_id NUMBER,
    approved_at TIMESTAMP
);

ALTER TABLE user_medicines ADD CONSTRAINT fk_um_approved_doctor
    FOREIGN KEY (approved_by_doctor_id) REFERENCES users (user_id);

CREATE TABLE doctor_patient_requests (
    request_id NUMBER GENERATED ALWAYS AS IDENTITY,
    patient_id NUMBER NOT NULL,
    doctor_id NUMBER NOT NULL,
    status VARCHAR2(20) DEFAULT 'PENDING' NOT NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    responded_at TIMESTAMP,
    CONSTRAINT pk_doctor_patient_requests PRIMARY KEY (request_id),
    CONSTRAINT fk_dpr_patient FOREIGN KEY (patient_id) REFERENCES users (user_id),
    CONSTRAINT fk_dpr_doctor FOREIGN KEY (doctor_id) REFERENCES users (user_id),
    CONSTRAINT uq_dpr_patient_doctor UNIQUE (patient_id, doctor_id)
);

CREATE TABLE doctor_patients (
    doctor_id NUMBER NOT NULL,
    patient_id NUMBER NOT NULL,
    linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_doctor_patients PRIMARY KEY (doctor_id, patient_id),
    CONSTRAINT fk_dp_doctor FOREIGN KEY (doctor_id) REFERENCES users (user_id),
    CONSTRAINT fk_dp_patient FOREIGN KEY (patient_id) REFERENCES users (user_id)
);

CREATE INDEX idx_dpr_doctor_status ON doctor_patient_requests (doctor_id, status);
CREATE INDEX idx_dpr_patient ON doctor_patient_requests (patient_id);
CREATE INDEX idx_um_approval ON user_medicines (approval_status);
