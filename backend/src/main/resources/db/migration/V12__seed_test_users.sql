-- Test users for local development (password: "password" for both)
INSERT INTO employees (id, full_name, email, phone, department, team, job_title, grade, employment_type, hired_at)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'Admin User', 'admin@test.com', '010-0000-0000', 'Engineering', 'Platform', 'Developer', 'Senior', 'FULL_TIME', '2024-01-01'),
    ('00000000-0000-0000-0000-000000000002', 'Test Employee', 'employee@test.com', '010-1111-1111', 'Engineering', 'Backend', 'Developer', 'Junior', 'FULL_TIME', '2024-06-01');

INSERT INTO users (id, email, password_hash, role, employee_id)
VALUES
    ('00000000-0000-0000-0000-000000000010', 'admin@test.com', '$2b$10$6.q4kv0BUcrIP3tpz2ZtHOfapxlTmCTKnfly4b5MNyooOHK.5E/bS', 'ADMIN', '00000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0000-000000000020', 'employee@test.com', '$2b$10$6.q4kv0BUcrIP3tpz2ZtHOfapxlTmCTKnfly4b5MNyooOHK.5E/bS', 'EMPLOYEE', '00000000-0000-0000-0000-000000000002');
