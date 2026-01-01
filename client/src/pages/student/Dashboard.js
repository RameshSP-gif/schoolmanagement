import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { authService, studentService, announcementService } from '../../services';

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    attendance: 0,
    assignments: 0,
    grades: 0
  });
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    loadAnnouncements();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
      
      if (userData.student_id) {
        const [assignments, grades] = await Promise.all([
          studentService.getAssignments(userData.student_id),
          studentService.getGrades(userData.student_id)
        ]);
        
        setStats({
          attendance: 85,
          assignments: assignments.length,
          grades: grades.length
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const data = await announcementService.getAll();
      setAnnouncements(data.slice(0, 5));
    } catch (error) {
      console.error('Error loading announcements:', error);
    }
  };

  const sidebarItems = [
    { path: '/student', label: 'Dashboard', icon: '📊' },
    { path: '/student/courses', label: 'My Courses', icon: '📚' },
    { path: '/student/assignments', label: 'Assignments', icon: '📝' },
    { path: '/student/grades', label: 'Grades', icon: '📈' },
    { path: '/student/attendance', label: 'Attendance', icon: '✅' },
    { path: '/student/fees', label: 'Fees', icon: '💰' }
  ];

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <Navbar user={user} />
      <Sidebar role="student" items={sidebarItems} />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<StudentHome stats={stats} user={user} announcements={announcements} />} />
          <Route path="/courses" element={<Courses user={user} />} />
          <Route path="/assignments" element={<Assignments user={user} />} />
          <Route path="/grades" element={<Grades user={user} />} />
          <Route path="/attendance" element={<Attendance user={user} />} />
          <Route path="/fees" element={<Fees user={user} />} />
        </Routes>
      </div>
    </div>
  );
};

const StudentHome = ({ stats, user, announcements }) => {
  return (
    <div className="dashboard">
      <h1>Welcome, {user?.first_name}!</h1>
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-value">{stats.attendance}%</div>
          <div className="stat-label">Attendance</div>
        </div>
        <div className="stat-card green">
          <div className="stat-value">{stats.assignments}</div>
          <div className="stat-label">Pending Assignments</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-value">{stats.grades}</div>
          <div className="stat-label">Total Grades</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📢 Announcements</h2>
        </div>
        {announcements.length === 0 ? (
          <p>No announcements at the moment.</p>
        ) : (
          <ul>
            {announcements.map(announcement => (
              <li key={announcement.id} style={{ marginBottom: '10px' }}>
                <strong>{announcement.title}</strong>
                <p style={{ margin: '5px 0', color: '#666' }}>{announcement.content}</p>
                <small style={{ color: '#999' }}>
                  Posted on {new Date(announcement.created_at).toLocaleDateString()}
                </small>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Upcoming Assignments</h2>
        </div>
        <p>No upcoming assignments.</p>
      </div>
    </div>
  );
};

const Courses = ({ user }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.class_id) {
      loadSubjects();
    }
  }, [user]);

  const loadSubjects = async () => {
    try {
      // Load subjects for the student's class
      if (user?.class_id) {
        const response = await fetch(`/api/classes/${user.class_id}/subjects`);
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard">
      <h1>My Courses</h1>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Enrolled Subjects</h2>
        </div>
        {subjects.length === 0 ? (
          <div className="alert alert-info">
            No subjects assigned to your class yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {subjects.map((subject, index) => (
              <div key={subject.id} className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <h3>{subject.subject_name}</h3>
                <p style={{ opacity: 0.9, marginTop: '10px' }}>Code: {subject.code}</p>
                <p style={{ opacity: 0.9 }}>Teacher: {subject.teacher_name || 'Not assigned'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Assignments = ({ user }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.student_id) {
      loadAssignments();
    }
  }, [user]);

  const loadAssignments = async () => {
    try {
      if (user?.student_id) {
        const data = await studentService.getAssignments(user.student_id);
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
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Subject</th>
              <th>Due Date</th>
              <th>Total Marks</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">No assignments found</td>
              </tr>
            ) : (
              assignments.map(assignment => (
                <tr key={assignment.id}>
                  <td>{assignment.title}</td>
                  <td>{assignment.subject_name}</td>
                  <td>{new Date(assignment.due_date).toLocaleDateString()}</td>
                  <td>{assignment.total_marks}</td>
                  <td>
                    {assignment.submission_date ? (
                      <span className="badge badge-success">Submitted</span>
                    ) : (
                      <span className="badge badge-warning">Pending</span>
                    )}
                  </td>
                  <td>
                    {!assignment.submission_date && (
                      <button className="btn btn-primary btn-sm">Submit</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Grades = ({ user }) => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.student_id) {
      loadGrades();
    }
  }, [user]);

  const loadGrades = async () => {
    try {
      if (user?.student_id) {
        const data = await studentService.getGrades(user.student_id);
        setGrades(data);
      }
    } catch (error) {
      console.error('Error loading grades:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard">
      <h1>My Grades</h1>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Exam</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Marks Obtained</th>
              <th>Total Marks</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {grades.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">No grades available</td>
              </tr>
            ) : (
              grades.map(grade => (
                <tr key={grade.id}>
                  <td>{grade.exam_name}</td>
                  <td>{grade.subject_name}</td>
                  <td>{new Date(grade.exam_date).toLocaleDateString()}</td>
                  <td>{grade.marks_obtained}</td>
                  <td>{grade.total_marks}</td>
                  <td><span className="badge badge-success">{grade.grade || 'N/A'}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Attendance = ({ user }) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.student_id) {
      loadAttendance();
    }
  }, [user]);

  const loadAttendance = async () => {
    try {
      if (user?.student_id) {
        const data = await studentService.getAttendance(user.student_id);
        setAttendance(data);
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard">
      <h1>My Attendance</h1>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Class</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {attendance.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center">No attendance records</td>
              </tr>
            ) : (
              attendance.map(record => (
                <tr key={record.id}>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>{record.class_name}</td>
                  <td>
                    <span className={`badge ${record.status === 'present' ? 'badge-success' : 'badge-danger'}`}>
                      {record.status.toUpperCase()}
                    </span>
                  </td>
                  <td>{record.remarks || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Fees = ({ user }) => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.student_id) {
      loadFees();
    }
  }, [user]);

  const loadFees = async () => {
    try {
      if (user?.student_id) {
        const response = await fetch(`/api/fees/student/${user.student_id}`);
        const data = await response.json();
        // Ensure data is an array
        if (Array.isArray(data)) {
          setFees(data);
        } else {
          console.error('Fees data is not an array:', data);
          setFees([]);
        }
      }
    } catch (error) {
      console.error('Error loading fees:', error);
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  const getStatusBadge = (status) => {
    const badges = {
      paid: 'badge-success',
      pending: 'badge-warning',
      partial: 'badge-info',
      overdue: 'badge-danger'
    };
    return `badge ${badges[status] || 'badge-info'}`;
  };

  return (
    <div className="dashboard">
      <h1>Fee Status</h1>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">My Fee Records</h2>
        </div>
        {fees.length === 0 ? (
          <div className="alert alert-info">
            No fee records found.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Fee Type</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.map(fee => (
                <tr key={fee.id}>
                  <td>{fee.fee_type}</td>
                  <td>${fee.amount}</td>
                  <td>${fee.paid_amount || 0}</td>
                  <td>{new Date(fee.due_date).toLocaleDateString()}</td>
                  <td>
                    <span className={getStatusBadge(fee.status)}>
                      {fee.status.toUpperCase()}
                    </span>
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

export default StudentDashboard;
