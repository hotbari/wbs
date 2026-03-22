ALTER TABLE project_assignments
    ADD COLUMN project_id UUID REFERENCES projects(id);
