-- Seed data for the todo app database
-- This will create test users, projects, tasks, and subtasks

-- Clean up existing data
DELETE FROM tasks;
DELETE FROM projects;
DELETE FROM passwords;
DELETE FROM users;

-- Create test user
INSERT INTO users (id, email, name, created_at, updated_at)
VALUES ('user_1', 'user@example.com', 'Test User', current_timestamp, current_timestamp);

-- Create password (hashed 'password123')
INSERT INTO passwords (user_id, hash)
VALUES ('user_1', '$2a$10$zxUtTd7PI33/tbXv0eGYvOAFAcgpZBhB1ArKgZ9LDpDEzCHJBgix2');

-- Create projects
INSERT INTO projects (id, user_id, title, description, priority, target_date, completed_at, created_at, updated_at) 
VALUES 
('proj_001', 'user_1', 'Website Redesign', 'This is the website redesign project that contains various tasks and subtasks.', 'high', '2025-12-25', NULL, current_timestamp, current_timestamp),
('proj_002', 'user_1', 'Mobile App Development', 'This is the mobile app development project that contains various tasks and subtasks.', 'medium', '2025-09-15', NULL, current_timestamp, current_timestamp),
('proj_003', 'user_1', 'Database Migration', 'This is the database migration project that contains various tasks and subtasks.', 'high', '2025-07-30', NULL, current_timestamp, current_timestamp),
('proj_004', 'user_1', 'API Integration', 'This is the api integration project that contains various tasks and subtasks.', 'low', NULL, '2025-02-15', current_timestamp, current_timestamp),
('proj_005', 'user_1', 'Dashboard Analytics', 'This is the dashboard analytics project that contains various tasks and subtasks.', 'medium', '2025-11-01', NULL, current_timestamp, current_timestamp);

-- Project 1: Website Redesign - Tasks
INSERT INTO tasks (id, project_id, parent_task_id, title, description, label, priority, target_date, completed_at, created_at, updated_at) 
VALUES 
('task_101', 'proj_001', NULL, 'Research and Planning', 'This task is about research and planning for the project.', 'research', 'high', '2025-07-15', NULL, current_timestamp, current_timestamp),
('task_102', 'proj_001', NULL, 'Design System', 'This task is about design system for the project.', 'design', 'medium', '2025-08-01', NULL, current_timestamp, current_timestamp),
('task_103', 'proj_001', NULL, 'Frontend Development', 'This task is about frontend development for the project.', 'development', 'high', '2025-09-15', NULL, current_timestamp, current_timestamp),
('task_104', 'proj_001', NULL, 'Backend Development', 'This task is about backend development for the project.', 'development', 'high', '2025-10-01', NULL, current_timestamp, current_timestamp),
('task_105', 'proj_001', NULL, 'Database Setup', 'This task is about database setup for the project.', 'development', 'medium', '2025-08-15', NULL, current_timestamp, current_timestamp),
('task_106', 'proj_001', NULL, 'User Authentication', 'This task is about user authentication for the project.', 'development', 'high', '2025-09-01', NULL, current_timestamp, current_timestamp),
('task_107', 'proj_001', NULL, 'Testing and QA', 'This task is about testing and qa for the project.', 'testing', 'medium', '2025-11-15', NULL, current_timestamp, current_timestamp),
('task_108', 'proj_001', NULL, 'Performance Optimization', 'This task is about performance optimization for the project.', 'development', 'medium', '2025-11-30', NULL, current_timestamp, current_timestamp),
('task_109', 'proj_001', NULL, 'Documentation', 'This task is about documentation for the project.', 'documentation', 'low', '2025-12-10', NULL, current_timestamp, current_timestamp),
('task_110', 'proj_001', NULL, 'Deployment', 'This task is about deployment for the project.', 'deployment', 'high', '2025-12-20', NULL, current_timestamp, current_timestamp);

-- Project 1: Website Redesign - Subtasks
INSERT INTO tasks (id, project_id, parent_task_id, title, description, label, priority, target_date, completed_at, created_at, updated_at) 
VALUES 
-- Subtasks for Research and Planning
('task_101_1', 'proj_001', 'task_101', 'Review components', 'Subtask to review components.', 'research', 'medium', '2025-07-05', NULL, current_timestamp, current_timestamp),
('task_101_2', 'proj_001', 'task_101', 'Create workflow', 'Subtask to create workflow.', 'research', 'high', '2025-07-10', NULL, current_timestamp, current_timestamp),
('task_101_3', 'proj_001', 'task_101', 'Document process', 'Subtask to document process.', 'documentation', 'low', '2025-07-12', NULL, current_timestamp, current_timestamp),

-- Subtasks for Design System
('task_102_1', 'proj_001', 'task_102', 'Create UI elements', 'Subtask to create ui elements.', 'design', 'high', '2025-07-20', NULL, current_timestamp, current_timestamp),
('task_102_2', 'proj_001', 'task_102', 'Document components', 'Subtask to document components.', 'documentation', 'medium', '2025-07-25', NULL, current_timestamp, current_timestamp),

-- Subtasks for Frontend Development
('task_103_1', 'proj_001', 'task_103', 'Implement components', 'Subtask to implement components.', 'development', 'high', '2025-08-20', NULL, current_timestamp, current_timestamp),
('task_103_2', 'proj_001', 'task_103', 'Test functionality', 'Subtask to test functionality.', 'testing', 'medium', '2025-09-01', NULL, current_timestamp, current_timestamp),
('task_103_3', 'proj_001', 'task_103', 'Optimize performance', 'Subtask to optimize performance.', 'development', 'medium', '2025-09-10', NULL, current_timestamp, current_timestamp);

-- Project 2: Mobile App Development - Tasks
INSERT INTO tasks (id, project_id, parent_task_id, title, description, label, priority, target_date, completed_at, created_at, updated_at) 
VALUES 
('task_201', 'proj_002', NULL, 'Research and Planning', 'This task is about research and planning for the project.', 'research', 'high', '2025-07-01', NULL, current_timestamp, current_timestamp),
('task_202', 'proj_002', NULL, 'Design System', 'This task is about design system for the project.', 'design', 'high', '2025-07-15', NULL, current_timestamp, current_timestamp),
('task_203', 'proj_002', NULL, 'Frontend Development', 'This task is about frontend development for the project.', 'development', 'high', '2025-08-01', NULL, current_timestamp, current_timestamp),
('task_204', 'proj_002', NULL, 'Backend Development', 'This task is about backend development for the project.', 'development', 'high', '2025-08-15', NULL, current_timestamp, current_timestamp),
('task_205', 'proj_002', NULL, 'Database Setup', 'This task is about database setup for the project.', 'development', 'medium', '2025-07-20', NULL, current_timestamp, current_timestamp),
('task_206', 'proj_002', NULL, 'User Authentication', 'This task is about user authentication for the project.', 'development', 'high', '2025-08-05', NULL, current_timestamp, current_timestamp),
('task_207', 'proj_002', NULL, 'Testing and QA', 'This task is about testing and qa for the project.', 'testing', 'high', '2025-09-01', NULL, current_timestamp, current_timestamp),
('task_208', 'proj_002', NULL, 'Performance Optimization', 'This task is about performance optimization for the project.', 'development', 'medium', '2025-09-07', NULL, current_timestamp, current_timestamp),
('task_209', 'proj_002', NULL, 'Documentation', 'This task is about documentation for the project.', 'documentation', 'low', '2025-09-10', NULL, current_timestamp, current_timestamp),
('task_210', 'proj_002', NULL, 'Deployment', 'This task is about deployment for the project.', 'deployment', 'high', '2025-09-15', NULL, current_timestamp, current_timestamp);

-- Add similar tasks for Project 3, 4, 5...
INSERT INTO tasks (id, project_id, parent_task_id, title, description, label, priority, target_date, completed_at, created_at, updated_at) 
VALUES 
-- Project 3: Database Migration - Basic tasks
('task_301', 'proj_003', NULL, 'Research and Planning', 'This task is about research and planning for the project.', 'research', 'high', '2025-06-10', NULL, current_timestamp, current_timestamp),
('task_302', 'proj_003', NULL, 'Data Modeling', 'This task is about data modeling for the project.', 'design', 'high', '2025-06-25', NULL, current_timestamp, current_timestamp),
('task_303', 'proj_003', NULL, 'Migration Scripts', 'This task is about creating migration scripts for the project.', 'development', 'high', '2025-07-10', NULL, current_timestamp, current_timestamp),
('task_304', 'proj_003', NULL, 'Testing', 'This task is about testing for the project.', 'testing', 'high', '2025-07-20', NULL, current_timestamp, current_timestamp),
('task_305', 'proj_003', NULL, 'Deployment', 'This task is about deployment for the project.', 'deployment', 'high', '2025-07-30', NULL, current_timestamp, current_timestamp),

-- Project 4: API Integration - Tasks
('task_401', 'proj_004', NULL, 'Research and Planning', 'This task is about research and planning for the project.', 'research', 'medium', '2025-01-10', '2025-01-15', current_timestamp, current_timestamp),
('task_402', 'proj_004', NULL, 'API Documentation', 'This task is about API documentation for the project.', 'documentation', 'medium', '2025-01-20', '2025-01-22', current_timestamp, current_timestamp),
('task_403', 'proj_004', NULL, 'Integration Development', 'This task is about integration development for the project.', 'development', 'high', '2025-01-30', '2025-02-05', current_timestamp, current_timestamp),
('task_404', 'proj_004', NULL, 'Testing', 'This task is about testing for the project.', 'testing', 'high', '2025-02-10', '2025-02-12', current_timestamp, current_timestamp),
('task_405', 'proj_004', NULL, 'Deployment', 'This task is about deployment for the project.', 'deployment', 'high', '2025-02-15', '2025-02-15', current_timestamp, current_timestamp),

-- Project 5: Dashboard Analytics - Tasks
('task_501', 'proj_005', NULL, 'Research and Planning', 'This task is about research and planning for the project.', 'research', 'high', '2025-08-10', NULL, current_timestamp, current_timestamp),
('task_502', 'proj_005', NULL, 'Data Modeling', 'This task is about data modeling for the project.', 'design', 'medium', '2025-08-25', NULL, current_timestamp, current_timestamp),
('task_503', 'proj_005', NULL, 'Dashboard Development', 'This task is about dashboard development for the project.', 'development', 'high', '2025-09-15', NULL, current_timestamp, current_timestamp),
('task_504', 'proj_005', NULL, 'Data Visualization', 'This task is about data visualization for the project.', 'development', 'high', '2025-10-01', NULL, current_timestamp, current_timestamp),
('task_505', 'proj_005', NULL, 'Testing', 'This task is about testing for the project.', 'testing', 'medium', '2025-10-15', NULL, current_timestamp, current_timestamp),
('task_506', 'proj_005', NULL, 'Deployment', 'This task is about deployment for the project.', 'deployment', 'high', '2025-11-01', NULL, current_timestamp, current_timestamp);

-- Add subtasks for a few more tasks
INSERT INTO tasks (id, project_id, parent_task_id, title, description, label, priority, target_date, completed_at, created_at, updated_at) 
VALUES 
-- Subtasks for Project 3 - Migration Scripts
('task_303_1', 'proj_003', 'task_303', 'Create schema migration', 'Subtask to create schema migration scripts.', 'development', 'high', '2025-07-01', NULL, current_timestamp, current_timestamp),
('task_303_2', 'proj_003', 'task_303', 'Create data migration', 'Subtask to create data migration scripts.', 'development', 'high', '2025-07-05', NULL, current_timestamp, current_timestamp),
('task_303_3', 'proj_003', 'task_303', 'Test migrations', 'Subtask to test migration scripts.', 'testing', 'high', '2025-07-08', NULL, current_timestamp, current_timestamp),

-- Subtasks for Project 5 - Dashboard Development
('task_503_1', 'proj_005', 'task_503', 'Create dashboard layout', 'Subtask to create dashboard layout.', 'design', 'medium', '2025-09-01', NULL, current_timestamp, current_timestamp),
('task_503_2', 'proj_005', 'task_503', 'Implement data fetching', 'Subtask to implement data fetching.', 'development', 'high', '2025-09-05', NULL, current_timestamp, current_timestamp),
('task_503_3', 'proj_005', 'task_503', 'Create dashboard components', 'Subtask to create dashboard components.', 'development', 'high', '2025-09-10', NULL, current_timestamp, current_timestamp),
('task_503_4', 'proj_005', 'task_503', 'Implement interactivity', 'Subtask to implement interactivity.', 'development', 'medium', '2025-09-12', NULL, current_timestamp, current_timestamp);
