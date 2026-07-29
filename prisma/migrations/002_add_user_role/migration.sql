-- Add user role for admin support
ALTER TABLE users ADD (
    role VARCHAR2(20) DEFAULT 'USER' NOT NULL
);

ALTER TABLE users ADD CONSTRAINT chk_users_role CHECK (role IN ('USER', 'ADMIN'));
