CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

CREATE TABLE project_tasks (
    id               UUID PRIMARY KEY,
    phase_id         UUID NOT NULL REFERENCES phases(id) ON DELETE CASCADE,
    title            VARCHAR(255) NOT NULL,
    description      TEXT,
    assignee_id      UUID REFERENCES employees(id),
    status           task_status NOT NULL DEFAULT 'TODO',
    progress_percent INTEGER NOT NULL DEFAULT 0
        CONSTRAINT chk_progress CHECK (progress_percent BETWEEN 0 AND 100),
    due_date         DATE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
