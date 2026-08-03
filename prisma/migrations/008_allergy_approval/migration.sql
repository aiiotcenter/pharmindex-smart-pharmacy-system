ALTER TABLE user_allergies ADD (
    added_by VARCHAR2(20) DEFAULT 'PATIENT',
    approval_status VARCHAR2(20) DEFAULT 'APPROVED',
    approved_by_doctor_id NUMBER,
    approved_at TIMESTAMP
);

ALTER TABLE user_allergies ADD CONSTRAINT fk_ua_approved_doctor
    FOREIGN KEY (approved_by_doctor_id) REFERENCES users (user_id);

CREATE INDEX idx_ua_approval ON user_allergies (approval_status);
