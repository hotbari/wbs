CREATE TYPE project_status AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED');

CREATE TABLE projects (
    id          UUID PRIMARY KEY,
    name        VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    status      project_status NOT NULL DEFAULT 'ACTIVE',
    start_date  DATE NOT NULL,
    end_date    DATE,
    created_by  UUID NOT NULL REFERENCES users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
