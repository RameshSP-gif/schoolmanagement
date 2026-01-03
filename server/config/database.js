const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let db = null;
let dbInitialized = false;

// Database file path
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/tmp/school_management.db' 
  : path.join(__dirname, '../../school_management.db');

// Initialize sql.js and database
async function initDatabase() {
  if (dbInitialized && db) return db;

  try {
    // Initialize sql.js
    const SQL = await initSqlJs();
    
    // Try to load existing database
    if (fs.existsSync(dbPath)) {
      try {
        const buffer = fs.readFileSync(dbPath);
        db = new SQL.Database(buffer);
        console.log('✅ Existing database loaded');
        dbInitialized = true;
        return db;
      } catch (error) {
        console.log('Error loading database, creating new one...');
      }
    }

    // Create new database
    db = new SQL.Database();
    console.log('📚 Creating new database schema...');
    
    // Create schema
    createSchema();
    
    // Insert demo data
    insertDemoData();
    
    // Save to disk
    saveDatabase();
    
    dbInitialized = true;
    console.log('✅ Database initialized successfully');
    return db;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Create database schema
function createSchema() {
  const schema = `
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin', 'teacher', 'student', 'parent', 'staff')) NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      date_of_birth DATE,
      gender TEXT CHECK(gender IN ('male', 'female', 'other')),
      profile_image TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      admission_number TEXT UNIQUE NOT NULL,
      class_id INTEGER,
      section TEXT,
      roll_number TEXT,
      admission_date DATE,
      parent_id INTEGER,
      blood_group TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      employee_id TEXT UNIQUE NOT NULL,
      department TEXT,
      qualification TEXT,
      experience_years INTEGER,
      joining_date DATE,
      salary REAL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      employee_id TEXT UNIQUE NOT NULL,
      department TEXT,
      designation TEXT,
      joining_date DATE,
      salary REAL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      grade_level INTEGER NOT NULL,
      section TEXT,
      teacher_id INTEGER,
      academic_year TEXT,
      capacity INTEGER DEFAULT 30,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS class_subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id INTEGER NOT NULL,
      subject_id INTEGER NOT NULL,
      teacher_id INTEGER,
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
      UNIQUE (class_id, subject_id)
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      class_id INTEGER NOT NULL,
      date DATE NOT NULL,
      status TEXT CHECK(status IN ('present', 'absent', 'late', 'excused')) NOT NULL,
      remarks TEXT,
      marked_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
      FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL,
      UNIQUE (student_id, date)
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      class_id INTEGER NOT NULL,
      subject_id INTEGER NOT NULL,
      teacher_id INTEGER NOT NULL,
      due_date DATETIME NOT NULL,
      total_marks INTEGER DEFAULT 100,
      file_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assignment_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assignment_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      file_path TEXT,
      remarks TEXT,
      marks_obtained INTEGER,
      graded_by INTEGER,
      graded_at DATETIME,
      FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (graded_by) REFERENCES teachers(id) ON DELETE SET NULL,
      UNIQUE (assignment_id, student_id)
    );

    CREATE TABLE IF NOT EXISTS exams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      exam_type TEXT,
      class_id INTEGER NOT NULL,
      subject_id INTEGER NOT NULL,
      date DATE NOT NULL,
      start_time TIME,
      end_time TIME,
      total_marks INTEGER DEFAULT 100,
      pass_marks INTEGER DEFAULT 40,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS exam_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exam_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      marks_obtained REAL NOT NULL,
      grade TEXT,
      remarks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      UNIQUE (exam_id, student_id)
    );

    CREATE TABLE IF NOT EXISTS fees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      fee_type TEXT NOT NULL,
      amount REAL NOT NULL,
      due_date DATE NOT NULL,
      paid_amount REAL DEFAULT 0,
      payment_date DATE,
      payment_mode TEXT,
      status TEXT CHECK(status IN ('pending', 'paid', 'partial', 'overdue')) DEFAULT 'pending',
      academic_year TEXT,
      remarks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      target_audience TEXT CHECK(target_audience IN ('all', 'students', 'teachers', 'parents', 'staff')) DEFAULT 'all',
      posted_by INTEGER NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS timetable (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id INTEGER NOT NULL,
      subject_id INTEGER NOT NULL,
      teacher_id INTEGER NOT NULL,
      day_of_week TEXT CHECK(day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')) NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      room_number TEXT,
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
    );
  `;

  db.run(schema);
}

// Insert demo data
function insertDemoData() {
  const demoData = `
    INSERT INTO users (email, password, role, first_name, last_name, phone, gender) VALUES
    ('admin@school.com', '$2a$10$8K1p/a0dL3LKzDOJc4P1HO5wzcyTY6W7F0qWr0VqvX5k5nVWyZGKO', 'admin', 'Admin', 'User', '1234567890', 'male'),
    ('teacher@school.com', '$2a$10$8K1p/a0dL3LKzDOJc4P1HO5wzcyTY6W7F0qWr0VqvX5k5nVWyZGKO', 'teacher', 'John', 'Smith', '1234567891', 'male'),
    ('student@school.com', '$2a$10$8K1p/a0dL3LKzDOJc4P1HO5wzcyTY6W7F0qWr0VqvX5k5nVWyZGKO', 'student', 'Alice', 'Johnson', '1234567892', 'female'),
    ('parent@school.com', '$2a$10$8K1p/a0dL3LKzDOJc4P1HO5wzcyTY6W7F0qWr0VqvX5k5nVWyZGKO', 'parent', 'Bob', 'Williams', '1234567893', 'male'),
    ('staff@school.com', '$2a$10$8K1p/a0dL3LKzDOJc4P1HO5wzcyTY6W7F0qWr0VqvX5k5nVWyZGKO', 'staff', 'Emily', 'Brown', '1234567894', 'female');

    INSERT INTO teachers (user_id, employee_id, department, qualification, experience_years, joining_date) VALUES
    (2, 'T001', 'Science', 'M.Sc., B.Ed.', 5, '2020-01-15');

    INSERT INTO students (user_id, admission_number, section, roll_number, admission_date, parent_id) VALUES
    (3, 'S001', 'A', '1', '2023-04-01', 4);

    INSERT INTO staff (user_id, employee_id, department, designation, joining_date) VALUES
    (5, 'ST001', 'Administration', 'Office Manager', '2021-06-01');

    INSERT INTO classes (name, grade_level, section, academic_year, teacher_id) VALUES
    ('Class 10', 10, 'A', '2024-2025', 1),
    ('Class 10', 10, 'B', '2024-2025', NULL),
    ('Class 9', 9, 'A', '2024-2025', NULL);

    INSERT INTO subjects (name, code, description) VALUES
    ('Mathematics', 'MATH101', 'Mathematics for Class 10'),
    ('Science', 'SCI101', 'General Science'),
    ('English', 'ENG101', 'English Language and Literature'),
    ('History', 'HIST101', 'World History'),
    ('Physics', 'PHY101', 'Physics');
  `;

  db.run(demoData);
}

// Save database to disk
function saveDatabase() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (error) {
    console.error('Error saving database:', error.message);
  }
}

// Query wrapper to maintain compatibility with existing code
async function query(sql, params = []) {
  // Ensure database is initialized
  if (!dbInitialized) {
    await initDatabase();
  }

  try {
    // For SELECT queries
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return [results];
    } 
    // For INSERT/UPDATE/DELETE queries
    else {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      stmt.step();
      const changes = db.getRowsModified();
      stmt.free();
      
      // Save database after modifications
      saveDatabase();
      
      // Get last insert ID for INSERT statements
      const lastId = sql.trim().toUpperCase().startsWith('INSERT') 
        ? db.exec("SELECT last_insert_rowid() as id")[0].values[0][0]
        : null;
      
      return [{ insertId: lastId, affectedRows: changes }];
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Export
module.exports = {
  initDatabase,
  query,
  saveDatabase
};
