CREATE TABLE task_comments (
    id         UUID PRIMARY KEY,
    task_id    UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
    author_id  UUID NOT NULL REFERENCES users(id),
    body       TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
