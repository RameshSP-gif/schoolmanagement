import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { authService, assignmentService, attendanceService } from '../../services';

const TeacherDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    myClasses: 0,
    assignments: 0,
    studentsToday: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
      setStats({
        myClasses: 3,
        assignments: 12,
        studentsToday: 85
      });
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    { path: '/teacher', label: 'Dashboard', icon: '📊' },
    { path: '/teacher/classes', label: 'My Classes', icon: '📚' },
    { path: '/teacher/assignments', label: 'Assignments', icon: '📝' },
    { path: '/teacher/attendance', label: 'Attendance', icon: '✅' },
    { path: '/teacher/grades', label: 'Grades', icon: '📈' }
  ];

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <Navbar user={user} />
      <Sidebar role="teacher" items={sidebarItems} />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<TeacherHome stats={stats} user={user} />} />
          <Route path="/classes" element={<MyClasses user={user} />} />
          <Route path="/assignments" element={<Assignments user={user} />} />
          <Route path="/attendance" element={<Attendance user={user} />} />
          <Route path="/grades" element={<Grades />} />
        </Routes>
      </div>
    </div>
  );
};

const TeacherHome = ({ stats, user }) => {
  return (
    <div className="dashboard">
      <h1>Welcome, {user?.first_name}!</h1>
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-value">{stats.myClasses}</div>
          <div className="stat-label">My Classes</div>
        </div>
        <div className="stat-card green">
          <div className="stat-value">{stats.assignments}</div>
          <div className="stat-label">Active Assignments</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-value">{stats.studentsToday}</div>
          <div className="stat-label">Students Today</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Today's Schedule</h2>
        </div>
        <p>No classes scheduled for today.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Pending Tasks</h2>
        </div>
        <ul>
          <li>Grade Assignment: Mathematics - Chapter 5</li>
          <li>Mark Attendance for Class 10-A</li>
          <li>Prepare Quiz for Science</li>
        </ul>
      </div>
    </div>
  );
};

const MyClasses = ({ user }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      if (user?.id) {
        const response = await fetch(`/api/teachers/${user.id}/classes`);
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard">
      <h1>My Classes</h1>
      <div className="card">
        {classes.length === 0 ? (
          <div className="alert alert-info">
            No classes assigned yet.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Grade Level</th>
                <th>Section</th>
                <th>Students</th>
                <th>Academic Year</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map(cls => (
                <tr key={cls.id}>
                  <td>{cls.name}</td>
                  <td>{cls.grade_level}</td>
                  <td>{cls.section || '-'}</td>
                  <td>{cls.student_count || 0}</td>
                  <td>{cls.academic_year}</td>
                  <td>
                    <button className="btn btn-primary btn-sm">View Students</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const Assignments = ({ user }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      if (user?.teacher_id) {
        const response = await fetch(`/api/assignments?teacher_id=${user.teacher_id}`);
        const data = await response.json();
        setAssignments(data);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard">
      <h1>Assignments</h1>
      <div className="card">
        <button className="btn btn-primary mb-2">Create New Assignment</button>
        {assignments.length === 0 ? (
          <div className="alert alert-info">
            No assignments created yet.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Due Date</th>
                <th>Total Marks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(assignment => (
                <tr key={assignment.id}>
                  <td>{assignment.title}</td>
                  <td>{assignment.class_name}</td>
                  <td>{assignment.subject_name}</td>
                  <td>{new Date(assignment.due_date).toLocaleDateString()}</td>
                  <td>{assignment.total_marks}</td>
                  <td>
                    <button className="btn btn-primary btn-sm" style={{ marginRight: '5px' }}>
                      View Submissions
                    </button>
                    <button className="btn btn-warning btn-sm">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const Attendance = ({ user }) => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      if (user?.teacher_id) {
        const response = await fetch(`/api/teachers/${user.teacher_id}/classes`);
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard">
      <h1>Attendance</h1>
      <div className="card">
        <div className="form-group">
          <label className="form-label">Select Class:</label>
          <select 
            className="form-control" 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={{ maxWidth: '300px' }}
          >
            <option value="">-- Select a class --</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name} - {cls.section} ({cls.student_count} students)
              </option>
            ))}
          </select>
        </div>
        
        {selectedClass ? (
          <div className="mt-2">
            <button className="btn btn-primary mb-2">Mark Attendance for Today</button>
            <div className="alert alert-info">
              Select students and mark their attendance status for {new Date().toLocaleDateString()}.
            </div>
          </div>
        ) : (
          <div className="alert alert-info">
            Please select a class to mark attendance.
          </div>
        )}
      </div>
    </div>
  );
};

const Grades = ({ user }) => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      if (user?.teacher_id) {
        const response = await fetch(`/api/teachers/${user.teacher_id}/classes`);
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExams = async (classId) => {
    try {
      const response = await fetch(`/api/exams?class_id=${classId}`);
      const data = await response.json();
      setExams(data);
    } catch (error) {
      console.error('Error loading exams:', error);
    }
  };

  const loadGrades = async (examId) => {
    try {
      const response = await fetch(`/api/exams/${examId}/results`);
      const data = await response.json();
      setGrades(data);
    } catch (error) {
      console.error('Error loading grades:', error);
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    setSelectedExam('');
    setGrades([]);
    if (classId) {
      loadExams(classId);
    }
  };

  const handleExamChange = (e) => {
    const examId = e.target.value;
    setSelectedExam(examId);
    if (examId) {
      loadGrades(examId);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard">
      <h1>Grade Management</h1>
      <div className="card">
        <div className="form-group">
          <label className="form-label">Select Class:</label>
          <select 
            className="form-control" 
            value={selectedClass}
            onChange={handleClassChange}
            style={{ maxWidth: '300px' }}
          >
            <option value="">-- Select a class --</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name} - {cls.section}
              </option>
            ))}
          </select>
        </div>

        {selectedClass && (
          <div className="form-group mt-2">
            <label className="form-label">Select Exam:</label>
            <select 
              className="form-control" 
              value={selectedExam}
              onChange={handleExamChange}
              style={{ maxWidth: '300px' }}
            >
              <option value="">-- Select an exam --</option>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>
                  {exam.exam_name} - {exam.subject_name} ({new Date(exam.exam_date).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedExam && grades.length > 0 && (
          <div className="mt-2">
            <button className="btn btn-success mb-2">Add Grades</button>
            <table className="table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Marks Obtained</th>
                  <th>Total Marks</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {grades.map(grade => (
                  <tr key={grade.id}>
                    <td>{grade.student_name}</td>
                    <td>{grade.marks_obtained}</td>
                    <td>{grade.total_marks}</td>
                    <td>{((grade.marks_obtained / grade.total_marks) * 100).toFixed(2)}%</td>
                    <td>
                      <span className={`badge badge-${grade.grade === 'A' || grade.grade === 'B' ? 'success' : grade.grade === 'C' ? 'info' : 'warning'}`}>
                        {grade.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!selectedClass && (
          <div className="alert alert-info mt-2">
            Please select a class to manage grades.
          </div>
        )}

        {selectedClass && !selectedExam && (
          <div className="alert alert-info mt-2">
            Please select an exam to view or add grades.
          </div>
        )}

        {selectedExam && grades.length === 0 && (
          <div className="alert alert-info mt-2">
            No grades recorded for this exam yet. Click "Add Grades" to start.
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
