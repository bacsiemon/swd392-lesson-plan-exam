

-- Create a dedicated schema for the lesson plan exam system
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- =============================================================================
-- ENUM to INTEGER mappings
-- user_role_enum: 1=admin, 2=teacher, 3=student
-- question_type_enum: 1=multiple_choice, 2=fill_blank
-- exam_status_enum: 1=draft, 2=inactive, 3=active
-- attempt_status_enum: 1=in_progress, 2=submitted, 3=graded, 4=expired
-- scoring_method_enum: 1=average, 2=highest, 3=latest
-- approval_status_enum: 1=draft, 2=requested, 3=approved, 4=rejected



-- Account table (base for all users)
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    normalized_email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_enum INTEGER NOT NULL, -- 1=admin, 2=teacher, 3=student
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Students table (extends accounts)
CREATE TABLE students (
    account_id INTEGER PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Teachers table (extends accounts)
CREATE TABLE teachers (
    account_id INTEGER PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
    school_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admins table (extends accounts)
CREATE TABLE admins (
    account_id INTEGER PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- LESSON PLANNING TABLES
-- =============================================================================

-- Lesson plans (Giáo án)
CREATE TABLE lesson_plans (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    created_by_teacher INTEGER NOT NULL REFERENCES teachers(account_id) ON DELETE CASCADE,
    objectives TEXT, -- mục tiêu
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Individual lesson periods (Tiết học)
CREATE TABLE slot_plans (
    id SERIAL PRIMARY KEY,
    lesson_plan_id INTEGER NOT NULL REFERENCES lesson_plans(id) ON DELETE CASCADE,
    slot_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    duration_minutes INTEGER DEFAULT 45,
    content TEXT NOT NULL, -- nội dung tiết học
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lesson_plan_id, slot_number)
);

CREATE TABLE slot_materials (
    id SERIAL PRIMARY KEY,
    slot_plan_id INTEGER NOT NULL REFERENCES slot_plans(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- QUESTION AND EXAM MANAGEMENT TABLES
-- =============================================================================

-- Question banks (Ngân hàng câu hỏi)
CREATE TABLE question_banks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    grade_level INTEGER NOT NULL CHECK (grade_level BETWEEN 1 AND 12),
    teacher_id INTEGER NOT NULL REFERENCES teachers(account_id) ON DELETE CASCADE,
    description TEXT,
    status_enum INTEGER DEFAULT 1, -- 1=draft, 2=requested, 3=approved, 4=rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE question_difficulties (
    id SERIAL PRIMARY KEY,
    domain VARCHAR(100), -- lĩnh vực
    difficulty_level INTEGER UNIQUE NOT NULL,
    description TEXT
);

-- Questions (Câu hỏi)
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    question_bank_id INTEGER NOT NULL REFERENCES question_banks(id) ON DELETE CASCADE,
    question_difficulty_id INTEGER REFERENCES question_difficulties(id),
    title VARCHAR(500) NOT NULL, -- tiêu đề câu hỏi
    content TEXT NOT NULL, -- nội dung câu hỏi
    question_type_enum INTEGER NOT NULL, -- 1=multiple_choice, 2=fill_blank
    additional_data JSONB DEFAULT '{}', -- additional data like images, formulas
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Question answers (for multiple choice)
CREATE TABLE question_multiple_choice_answers (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    explanation TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE question_fill_blank_answers (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    correct_answer TEXT NOT NULL,
    normalized_correct_answer TEXT NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Quiz matrices (Ma trận đề)
CREATE TABLE exam_matrices (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    teacher_id INTEGER NOT NULL REFERENCES teachers(account_id) ON DELETE CASCADE,
    description TEXT,
    total_questions INTEGER DEFAULT 0,
    total_points DECIMAL(5,2) DEFAULT 0,
    configuration JSONB DEFAULT '{}', -- detailed matrix configuration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Quiz matrix items (details of question distribution)
CREATE TABLE exam_matrix_items (
    id SERIAL PRIMARY KEY,
    exam_matrix_id INTEGER NOT NULL REFERENCES exam_matrices(id) ON DELETE CASCADE,
    question_bank_id INTEGER NOT NULL REFERENCES question_banks(id) ON DELETE CASCADE,
    domain VARCHAR(100), -- lĩnh vực
    difficulty_level INTEGER, -- level of difficulty
    question_count INTEGER NOT NULL DEFAULT 1,
    points_per_question DECIMAL(5,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Exams (Bài thi)
CREATE TABLE exams (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    created_by_teacher INTEGER NOT NULL REFERENCES teachers(account_id) ON DELETE CASCADE,
    exam_matrix_id INTEGER REFERENCES exam_matrices(id) ON DELETE SET NULL,
    grade_level INTEGER CHECK (grade_level BETWEEN 1 AND 12), -- optional grade level
    description TEXT,
    
    -- Timing settings
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER NOT NULL DEFAULT 60, -- giới hạn thời gian làm bài
    
    -- Access settings
    password_hash VARCHAR(255), -- mật khẩu
    max_attempts INTEGER DEFAULT 1, -- số lần làm tối đa
    scoring_method_enum INTEGER DEFAULT 2, -- 1=average, 2=highest, 3=latest
    
    -- Display settings
    show_results_immediately BOOLEAN DEFAULT false,
    show_correct_answers BOOLEAN DEFAULT false,
    randomize_questions BOOLEAN DEFAULT false,
    randomize_answers BOOLEAN DEFAULT false,
    
    -- Status and metadata
    status_enum INTEGER DEFAULT 1, -- 1=draft, 2=inactive, 3=active
    total_questions INTEGER DEFAULT 0,
    total_points DECIMAL(5,2) DEFAULT 0,
    pass_threshold DECIMAL(5,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_exam_time CHECK (end_time > start_time)
);

-- Exam questions (generated from quiz matrix)
CREATE TABLE exam_questions (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    points DECIMAL(5,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exam_id, question_id),
    UNIQUE(exam_id, order_index)
);


-- =============================================================================
-- EXAM ATTEMPT TABLES
-- =============================================================================

-- Exam attempts (Lần làm bài)
CREATE TABLE exam_attempts (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(account_id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP WITH TIME ZONE,
    time_spent_seconds INTEGER DEFAULT 0,
    
    -- Scoring
    total_score DECIMAL(5,2) DEFAULT 0,
    max_score DECIMAL(5,2) DEFAULT 0,
    score_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Status
    status_enum INTEGER DEFAULT 1, -- 1=in_progress, 2=submitted, 3=graded, 4=expired
    
    -- Grading
    auto_graded_at TIMESTAMP WITH TIME ZONE,
    manual_graded_at TIMESTAMP WITH TIME ZONE,
    graded_by INTEGER REFERENCES teachers(account_id),
    feedback TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(exam_id, student_id, attempt_number)
);

-- Student answers for each question
CREATE TABLE exam_attempt_answers (
    id SERIAL PRIMARY KEY,
    exam_attempt_id INTEGER NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    
    -- Answer data
    selected_answer_ids INTEGER[], -- for multiple choice (array of answer IDs)
    text_answer TEXT, -- for essay/fill-in-blank
    answer_data JSONB DEFAULT '{}', -- for complex answer types
    
    -- Scoring
    points_earned DECIMAL(5,2) DEFAULT 0,
    points_possible DECIMAL(5,2) DEFAULT 0,
    is_correct BOOLEAN,
    
    -- Grading (for manual grading)
    -- graded_at TIMESTAMP WITH TIME ZONE,
    -- graded_by UUID REFERENCES teachers(id),
    -- feedback TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(exam_attempt_id, question_id)
);

-- =============================================================================
-- FILE MANAGEMENT TABLES
-- =============================================================================

CREATE TABLE file_uploads (
    id SERIAL PRIMARY KEY,
    data BYTEA NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



-- =============================================================================
-- DEPLOYMENT INSTRUCTIONS
-- =============================================================================

/*
DEPLOYMENT STEPS:

1. Run this script as a PostgreSQL superuser (typically 'postgres')

2. The script will:
   - Drop the database 'lesson_plan_exam_db' if it exists
   - Create a new database 'lesson_plan_exam_db' with UTF-8 encoding
   - Create a dedicated schema 'lesson_plan_system'
   - Create all tables, constraints, and indexes within the new schema

3. After running this script, connect to the database using:
   Database: lesson_plan_exam_db
   Schema: lesson_plan_system

4. Connection examples:
   
   PostgreSQL Command Line:
   psql -U postgres -d lesson_plan_exam_db
   
   Application Connection String:
   postgresql://username:password@localhost:5432/lesson_plan_exam_db
   
   Set search path in your application:
   SET search_path TO lesson_plan_system, public;

5. All tables are created in the 'lesson_plan_system' schema, so you can either:
   - Set the search_path to include lesson_plan_system (recommended)
   - Reference tables with full schema name: lesson_plan_system.accounts

SCHEMA STRUCTURE:
- Database: lesson_plan_exam_db
- Schema: lesson_plan_system
- All application tables are in the lesson_plan_system schema
- This provides better organization and avoids conflicts with system tables
*/

ALTER TABLE lesson_plans DELETE COLUMN approval_status_enum;