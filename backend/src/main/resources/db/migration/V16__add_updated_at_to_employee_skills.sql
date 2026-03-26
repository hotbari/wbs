ALTER TABLE employee_skills
    ADD COLUMN updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    ADD COLUMN updated_by_id UUID REFERENCES users(id);

-- Backfill from employees.skills_last_updated_at
UPDATE employee_skills es
SET updated_at = COALESCE(
    (SELECT e.skills_last_updated_at FROM employees e WHERE e.id = es.employee_id),
    NOW()
);
