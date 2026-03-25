CREATE TABLE share_tokens (
    id UUID PRIMARY KEY,
    token UUID NOT NULL UNIQUE,
    employee_id UUID NOT NULL REFERENCES employees(id),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_share_tokens_token ON share_tokens(token);
