CREATE TYPE employment_type AS ENUM ('FULL_TIME', 'CONTRACT', 'PART_TIME');

CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100) NOT NULL,
    team VARCHAR(100),
    job_title VARCHAR(100) NOT NULL,
    grade VARCHAR(50),
    employment_type employment_type NOT NULL,
    hired_at DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE users
    ADD CONSTRAINT fk_users_employee FOREIGN KEY (employee_id) REFERENCES employees(id);
