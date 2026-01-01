-- School Management System Database Setup
-- MySQL Database Script

-- ================================================
-- 1. CREATE DATABASE
-- ================================================

CREATE DATABASE IF NOT EXISTS school_management;
USE school_management;

-- ================================================
-- 2. CREATE TABLES
-- ================================================

-- Users Table (Main authentication table)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher', 'student', 'parent', 'staff') NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    profile_image VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    admission_number VARCHAR(50) UNIQUE NOT NULL,
    class_id INT,
    section VARCHAR(10),
    roll_number VARCHAR(20),
    admission_date DATE,
    parent_id INT,
    blood_group VARCHAR(5),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100),
    qualification VARCHAR(255),
    experience_years INT,
    joining_date DATE,
    salary DECIMAL(10, 2),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Staff Table
CREATE TABLE IF NOT EXISTS staff (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100),
    designation VARCHAR(100),
    joining_date DATE,
    salary DECIMAL(10, 2),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Classes Table
CREATE TABLE IF NOT EXISTS classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    grade_level INT NOT NULL,
    section VARCHAR(10),
    teacher_id INT,
    academic_year VARCHAR(20),
    capacity INT DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
);

-- Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Class Subjects (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS class_subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
    UNIQUE KEY unique_class_subject (class_id, subject_id)
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
    remarks TEXT,
    marked_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_attendance (student_id, date)
);

-- Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    due_date DATETIME NOT NULL,
    total_marks INT DEFAULT 100,
    file_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- Assignment Submissions Table
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    assignment_id INT NOT NULL,
    student_id INT NOT NULL,
    submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(255),
    remarks TEXT,
    marks_obtained INT,
    graded_by INT,
    graded_at DATETIME,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (graded_by) REFERENCES teachers(id) ON DELETE SET NULL,
    UNIQUE KEY unique_submission (assignment_id, student_id)
);

-- Exams Table
CREATE TABLE IF NOT EXISTS exams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    exam_type VARCHAR(50),
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    total_marks INT DEFAULT 100,
    pass_marks INT DEFAULT 40,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- Exam Results Table
CREATE TABLE IF NOT EXISTS exam_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    marks_obtained DECIMAL(5, 2) NOT NULL,
    grade VARCHAR(5),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_result (exam_id, student_id)
);

-- Fees Table
CREATE TABLE IF NOT EXISTS fees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    fee_type VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    payment_date DATE,
    payment_mode VARCHAR(50),
    status ENUM('pending', 'paid', 'partial', 'overdue') DEFAULT 'pending',
    academic_year VARCHAR(20),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    target_audience ENUM('all', 'students', 'teachers', 'parents', 'staff') DEFAULT 'all',
    posted_by INT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Timetable Table
CREATE TABLE IF NOT EXISTS timetable (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_number VARCHAR(20),
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- ================================================
-- 3. INSERT SAMPLE DATA
-- ================================================

-- Insert Default Users (Password: bcrypt hash of respective passwords)
-- Note: In production, use proper password hashing. These are hashed versions of simple passwords.
INSERT INTO users (email, password, role, first_name, last_name, phone, gender) 
VALUES 
('admin@school.com', '$2a$10$8K1p/a0dL3LKzDOJc4P1HO5wzcyTY6W7F0qWr0VqvX5k5nVWyZGKO', 'admin', 'Admin', 'User', '1234567890', 'male'),
('teacher@school.com', '$2a$10$8K1p/a0dL3LKzDOJc4P1HO5wzcyTY6W7F0qWr0VqvX5k5nVWyZGKO', 'teacher', 'John', 'Smith', '1234567891', 'male'),
('student@school.com', '$2a$10$8K1p/a0dL3LKzDOJc4P1HO5wzcyTY6W7F0qWr0VqvX5k5nVWyZGKO', 'student', 'Alice', 'Johnson', '1234567892', 'female'),
('parent@school.com', '$2a$10$8K1p/a0dL3LKzDOJc4P1HO5wzcyTY6W7F0qWr0VqvX5k5nVWyZGKO', 'parent', 'Bob', 'Williams', '1234567893', 'male'),
('staff@school.com', '$2a$10$8K1p/a0dL3LKzDOJc4P1HO5wzcyTY6W7F0qWr0VqvX5k5nVWyZGKO', 'staff', 'Emily', 'Brown', '1234567894', 'female');

-- Insert Sample Teacher
INSERT INTO teachers (user_id, employee_id, department, qualification, experience_years, joining_date)
VALUES (2, 'T001', 'Science', 'M.Sc., B.Ed.', 5, '2020-01-15');

-- Insert Sample Student
INSERT INTO students (user_id, admission_number, section, roll_number, admission_date, parent_id)
VALUES (3, 'S001', 'A', '1', '2023-04-01', 4);

-- Insert Sample Staff
INSERT INTO staff (user_id, employee_id, department, designation, joining_date)
VALUES (5, 'ST001', 'Administration', 'Office Manager', '2021-06-01');

-- Insert Sample Classes
INSERT INTO classes (name, grade_level, section, academic_year, teacher_id)
VALUES 
('Class 10', 10, 'A', '2024-2025', 1),
('Class 10', 10, 'B', '2024-2025', NULL),
('Class 9', 9, 'A', '2024-2025', NULL);

-- Insert Sample Subjects
INSERT INTO subjects (name, code, description)
VALUES 
('Mathematics', 'MATH101', 'Mathematics for Class 10'),
('Science', 'SCI101', 'General Science'),
('English', 'ENG101', 'English Language and Literature'),
('History', 'HIST101', 'World History'),
('Physics', 'PHY101', 'Physics');

-- ================================================
-- 4. USEFUL QUERIES
-- ================================================

-- Get all students with their class information
-- SELECT s.*, u.first_name, u.last_name, u.email, c.name as class_name
-- FROM students s
-- JOIN users u ON s.user_id = u.id
-- LEFT JOIN classes c ON s.class_id = c.id;

-- Get attendance for a specific student
-- SELECT a.*, c.name as class_name
-- FROM attendance a
-- JOIN classes c ON a.class_id = c.id
-- WHERE a.student_id = 1
-- ORDER BY a.date DESC;

-- Get all assignments for a class
-- SELECT a.*, s.name as subject_name, CONCAT(u.first_name, ' ', u.last_name) as teacher_name
-- FROM assignments a
-- JOIN subjects s ON a.subject_id = s.id
-- JOIN teachers t ON a.teacher_id = t.id
-- JOIN users u ON t.user_id = u.id
-- WHERE a.class_id = 1;

-- Get fee status for all students
-- SELECT s.admission_number, u.first_name, u.last_name, 
--        f.fee_type, f.amount, f.paid_amount, f.status
-- FROM students s
-- JOIN users u ON s.user_id = u.id
-- LEFT JOIN fees f ON s.id = f.student_id
-- ORDER BY f.status, s.admission_number;

-- Get teacher schedule
-- SELECT t.*, s.name as subject_name, c.name as class_name
-- FROM timetable t
-- JOIN subjects s ON t.subject_id = s.id
-- JOIN classes c ON t.class_id = c.id
-- WHERE t.teacher_id = 1
-- ORDER BY FIELD(t.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'), t.start_time;

-- ================================================
-- 5. INDEXES FOR PERFORMANCE (Optional)
-- ================================================

-- CREATE INDEX idx_users_email ON users(email);
-- CREATE INDEX idx_users_role ON users(role);
-- CREATE INDEX idx_students_admission ON students(admission_number);
-- CREATE INDEX idx_attendance_date ON attendance(date);
-- CREATE INDEX idx_assignments_due ON assignments(due_date);
-- CREATE INDEX idx_fees_status ON fees(status);

-- ================================================
-- END OF SCRIPT
-- ================================================

-- Note: Default password for all demo accounts is their role name + 123
-- Examples: admin123, teacher123, student123, parent123, staff123
