ALTER TABLE users ADD role_id NUMBER DEFAULT 3;

UPDATE users SET role_id = 1 WHERE role = 'ADMIN';
UPDATE users SET role_id = 2 WHERE role = 'DOCTOR';
UPDATE users SET role_id = 3 WHERE role = 'USER' OR role IS NULL;

ALTER TABLE users MODIFY role_id NOT NULL;

ALTER TABLE users DROP CONSTRAINT chk_users_role;
ALTER TABLE users DROP COLUMN role;

ALTER TABLE users ADD CONSTRAINT chk_users_role_id CHECK (role_id IN (1, 2, 3));

CREATE TABLE doctor_role_requests (
    request_id NUMBER GENERATED ALWAYS AS IDENTITY,
    user_id NUMBER NOT NULL,
    status VARCHAR2(20) DEFAULT 'PENDING' NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reviewed_by NUMBER,
    reviewed_at TIMESTAMP,
    CONSTRAINT pk_doctor_role_requests PRIMARY KEY (request_id),
    CONSTRAINT fk_drr_user FOREIGN KEY (user_id) REFERENCES users (user_id),
    CONSTRAINT fk_drr_reviewer FOREIGN KEY (reviewed_by) REFERENCES users (user_id),
    CONSTRAINT uq_drr_user UNIQUE (user_id),
    CONSTRAINT chk_drr_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

CREATE INDEX idx_drr_status ON doctor_role_requests (status);
