CREATE TABLE phases (
    id          UUID PRIMARY KEY,
    project_id  UUID NOT NULL REFERENCES projects(id),
    name        VARCHAR(255) NOT NULL,
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    order_index INTEGER NOT NULL,
    CONSTRAINT uq_phase_order UNIQUE (project_id, order_index),
    CONSTRAINT chk_phase_dates CHECK (end_date > start_date)
);
