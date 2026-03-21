CREATE TABLE project_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    project_name VARCHAR(255) NOT NULL,
    role_in_project VARCHAR(100) NOT NULL,
    allocation_percent INTEGER NOT NULL CHECK (allocation_percent BETWEEN 1 AND 100),
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_end_after_start CHECK (end_date IS NULL OR end_date > start_date)
);

CREATE INDEX idx_assignments_employee ON project_assignments(employee_id);
CREATE INDEX idx_assignments_active ON project_assignments(employee_id, is_active);
