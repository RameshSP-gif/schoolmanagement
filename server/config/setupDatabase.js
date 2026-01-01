const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  
  try {
    // Connect without database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });

    console.log('Connected to MySQL server');

    // Create database
    const dbName = process.env.DB_NAME || 'school_management';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✅ Database '${dbName}' created or already exists`);

    await connection.query(`USE ${dbName}`);

    // Create users table
    await connection.query(`
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
      )
    `);
    console.log('✅ Users table created');

    // Create students table
    await connection.query(`
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
      )
    `);
    console.log('✅ Students table created');

    // Create teachers table
    await connection.query(`
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
      )
    `);
    console.log('✅ Teachers table created');

    // Create staff table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS staff (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT UNIQUE NOT NULL,
        employee_id VARCHAR(50) UNIQUE NOT NULL,
        department VARCHAR(100),
        designation VARCHAR(100),
        joining_date DATE,
        salary DECIMAL(10, 2),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Staff table created');

    // Create classes table
    await connection.query(`
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
      )
    `);
    console.log('✅ Classes table created');

    // Create subjects table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(20) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Subjects table created');

    // Create class_subjects table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS class_subjects (
        id INT PRIMARY KEY AUTO_INCREMENT,
        class_id INT NOT NULL,
        subject_id INT NOT NULL,
        teacher_id INT,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
        UNIQUE KEY unique_class_subject (class_id, subject_id)
      )
    `);
    console.log('✅ Class subjects table created');

    // Create attendance table
    await connection.query(`
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
      )
    `);
    console.log('✅ Attendance table created');

    // Create assignments table
    await connection.query(`
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
      )
    `);
    console.log('✅ Assignments table created');

    // Create assignment_submissions table
    await connection.query(`
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
      )
    `);
    console.log('✅ Assignment submissions table created');

    // Create exams table
    await connection.query(`
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
      )
    `);
    console.log('✅ Exams table created');

    // Create exam_results table
    await connection.query(`
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
      )
    `);
    console.log('✅ Exam results table created');

    // Create fees table
    await connection.query(`
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
      )
    `);
    console.log('✅ Fees table created');

    // Create announcements table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        target_audience ENUM('all', 'students', 'teachers', 'parents', 'staff') DEFAULT 'all',
        posted_by INT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Announcements table created');

    // Create messages table
    await connection.query(`
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
      )
    `);
    console.log('✅ Messages table created');

    // Create timetable table
    await connection.query(`
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
      )
    `);
    console.log('✅ Timetable table created');

    // Insert default users with individual passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const teacherPassword = await bcrypt.hash('teacher123', 10);
    const studentPassword = await bcrypt.hash('student123', 10);
    const parentPassword = await bcrypt.hash('parent123', 10);
    const staffPassword = await bcrypt.hash('staff123', 10);
    
    await connection.query(`
      INSERT INTO users (email, password, role, first_name, last_name, phone, gender) 
      VALUES 
      ('admin@school.com', ?, 'admin', 'Admin', 'User', '1234567890', 'male'),
      ('teacher@school.com', ?, 'teacher', 'John', 'Smith', '1234567891', 'male'),
      ('student@school.com', ?, 'student', 'Alice', 'Johnson', '1234567892', 'female'),
      ('parent@school.com', ?, 'parent', 'Bob', 'Williams', '1234567893', 'male'),
      ('staff@school.com', ?, 'staff', 'Emily', 'Brown', '1234567894', 'female')
      ON DUPLICATE KEY UPDATE password=VALUES(password)
    `, [adminPassword, teacherPassword, studentPassword, parentPassword, staffPassword]);
    
    console.log('✅ Default users created');

    // Insert sample teacher
    const [teacherUser] = await connection.query(`SELECT id FROM users WHERE email = 'teacher@school.com'`);
    if (teacherUser.length > 0) {
      await connection.query(`
        INSERT INTO teachers (user_id, employee_id, department, qualification, experience_years, joining_date)
        VALUES (?, 'T001', 'Science', 'M.Sc., B.Ed.', 5, '2020-01-15')
        ON DUPLICATE KEY UPDATE user_id=user_id
      `, [teacherUser[0].id]);
      console.log('✅ Sample teacher created');
    }

    // Insert sample student
    const [studentUser] = await connection.query(`SELECT id FROM users WHERE email = 'student@school.com'`);
    const [parentUser] = await connection.query(`SELECT id FROM users WHERE email = 'parent@school.com'`);
    if (studentUser.length > 0) {
      await connection.query(`
        INSERT INTO students (user_id, admission_number, section, roll_number, admission_date, parent_id)
        VALUES (?, 'S001', 'A', '1', '2023-04-01', ?)
        ON DUPLICATE KEY UPDATE user_id=user_id
      `, [studentUser[0].id, parentUser[0]?.id || null]);
      console.log('✅ Sample student created');
    }

    // Insert sample staff
    const [staffUser] = await connection.query(`SELECT id FROM users WHERE email = 'staff@school.com'`);
    if (staffUser.length > 0) {
      await connection.query(`
        INSERT INTO staff (user_id, employee_id, department, designation, joining_date)
        VALUES (?, 'ST001', 'Administration', 'Office Manager', '2021-06-01')
        ON DUPLICATE KEY UPDATE user_id=user_id
      `, [staffUser[0].id]);
      console.log('✅ Sample staff created');
    }

    // Insert sample classes
    await connection.query(`
      INSERT INTO classes (name, grade_level, section, academic_year)
      VALUES 
      ('Class 10', 10, 'A', '2024-2025'),
      ('Class 10', 10, 'B', '2024-2025'),
      ('Class 9', 9, 'A', '2024-2025')
      ON DUPLICATE KEY UPDATE id=id
    `);
    console.log('✅ Sample classes created');

    // Insert sample subjects
    await connection.query(`
      INSERT INTO subjects (name, code, description)
      VALUES 
      ('Mathematics', 'MATH101', 'Mathematics for Class 10'),
      ('Science', 'SCI101', 'General Science'),
      ('English', 'ENG101', 'English Language and Literature'),
      ('History', 'HIST101', 'World History'),
      ('Physics', 'PHY101', 'Physics')
      ON DUPLICATE KEY UPDATE id=id
    `);
    console.log('✅ Sample subjects created');

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\nDefault login credentials:');
    console.log('Admin: admin@school.com / admin123');
    console.log('Teacher: teacher@school.com / teacher123');
    console.log('Student: student@school.com / student123');
    console.log('Parent: parent@school.com / parent123');
    console.log('Staff: staff@school.com / staff123');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run setup if executed directly
if (require.main === module) {
  setupDatabase()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = setupDatabase;
