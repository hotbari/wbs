CREATE TYPE proficiency_level AS ENUM ('BEGINNER', 'INTERMEDIATE', 'EXPERT');

CREATE TABLE employee_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    skill_id UUID NOT NULL REFERENCES skills(id),
    proficiency proficiency_level NOT NULL,
    certified BOOLEAN NOT NULL DEFAULT FALSE,
    note TEXT,
    UNIQUE (employee_id, skill_id)
);
