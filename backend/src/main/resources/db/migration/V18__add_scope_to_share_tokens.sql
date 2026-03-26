CREATE TYPE share_token_scope AS ENUM ('EMPLOYEE', 'PROJECT');

ALTER TABLE share_tokens
    ADD COLUMN scope       share_token_scope NOT NULL DEFAULT 'EMPLOYEE',
    ADD COLUMN project_id  UUID REFERENCES projects(id);

ALTER TABLE share_tokens ALTER COLUMN employee_id DROP NOT NULL;
