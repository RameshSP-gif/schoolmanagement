import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { authService } from '../../services';

const ParentDashboard = () => {
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
      setChildren(userData.children || []);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    { path: '/parent', label: 'Dashboard', icon: '📊' },
    { path: '/parent/children', label: 'My Children', icon: '👶' },
    { path: '/parent/attendance', label: 'Attendance', icon: '✅' },
    { path: '/parent/grades', label: 'Grades', icon: '📈' },
    { path: '/parent/fees', label: 'Fees', icon: '💰' },
    { path: '/parent/messages', label: 'Messages', icon: '✉️' }
  ];

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <Navbar user={user} />
      <Sidebar role="parent" items={sidebarItems} />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<ParentHome user={user} children={children} />} />
          <Route path="/children" element={<Children children={children} />} />
          <Route path="/attendance" element={<Attendance children={children} />} />
          <Route path="/grades" element={<Grades children={children} />} />
          <Route path="/fees" element={<Fees children={children} />} />
          <Route path="/messages" element={<Messages user={user} />} />
        </Routes>
      </div>
    </div>
  );
};

const ParentHome = ({ user, children }) => {
  return (
    <div className="dashboard">
      <h1>Welcome, {user?.first_name}!</h1>
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">My Children</h2>
        </div>
        {children.length === 0 ? (
          <p>No children registered.</p>
        ) : (
          <div className="stats-grid">
            {children.map(child => (
              <div key={child.id} className="stat-card blue">
                <div className="stat-label">{child.first_name} {child.last_name}</div>
                <div style={{ fontSize: '1rem', marginTop: '10px' }}>
                  Class: {child.class_name || 'Not assigned'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Updates</h2>
        </div>
        <p>No recent updates available.</p>
      </div>
    </div>
  );
};

const Children = ({ children }) => {
  return (
    <div className="dashboard">
      <h1>My Children</h1>
      <div className="card">
        {children.length === 0 ? (
          <p>No children registered.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Class</th>
                <th>Roll No.</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {children.map(child => (
                <tr key={child.id}>
                  <td>{child.first_name} {child.last_name}</td>
                  <td>{child.class_name || 'Not assigned'}</td>
                  <td>{child.roll_number || '-'}</td>
                  <td>
                    <button className="btn btn-primary btn-sm">View Details</button>
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

const Attendance = ({ children }) => {
  const [selectedChild, setSelectedChild] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const loadAttendance = async (studentId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/students/${studentId}/attendance`);
      const data = await response.json();
      setAttendance(data);

      // Load statistics
      const statsResponse = await fetch(`/api/attendance/statistics/${studentId}`);
      const statsData = await statsResponse.json();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChildChange = (e) => {
    const childId = e.target.value;
    setSelectedChild(childId);
    if (childId) {
      loadAttendance(childId);
    }
  };

  return (
    <div className="dashboard">
      <h1>Attendance</h1>
      <div className="card">
        <div className="form-group">
          <label className="form-label">Select Child:</label>
          <select 
            className="form-control" 
            value={selectedChild}
            onChange={handleChildChange}
            style={{ maxWidth: '300px' }}
          >
            <option value="">-- Select a child --</option>
            {children.map(child => (
              <option key={child.id} value={child.id}>
                {child.first_name} {child.last_name}
              </option>
            ))}
          </select>
        </div>

        {loading && <div className="loading"><div className="spinner"></div></div>}

        {stats && (
          <div className="stats-grid mt-2">
            <div className="stat-card blue">
              <div className="stat-value">{stats.present_days}</div>
              <div className="stat-label">Present Days</div>
            </div>
            <div className="stat-card red">
              <div className="stat-value">{stats.absent_days}</div>
              <div className="stat-label">Absent Days</div>
            </div>
            <div className="stat-card orange">
              <div className="stat-value">{stats.total_days}</div>
              <div className="stat-label">Total Days</div>
            </div>
            <div className="stat-card green">
              <div className="stat-value">
                {stats.total_days > 0 ? Math.round((stats.present_days / stats.total_days) * 100) : 0}%
              </div>
              <div className="stat-label">Attendance Rate</div>
            </div>
          </div>
        )}

        {!loading && selectedChild && attendance.length > 0 && (
          <table className="table mt-2">
            <thead>
              <tr>
                <th>Date</th>
                <th>Class</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {attendance.slice(0, 10).map(record => (
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
              ))}
            </tbody>
          </table>
        )}

        {!loading && !selectedChild && (
          <div className="alert alert-info mt-2">
            Please select a child to view attendance records.
          </div>
        )}

        {!loading && selectedChild && attendance.length === 0 && (
          <div className="alert alert-info mt-2">
            No attendance records found for this child.
          </div>
        )}
      </div>
    </div>
  );
};

const Grades = ({ children }) => {
  const [selectedChild, setSelectedChild] = useState('');
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadGrades = async (studentId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/students/${studentId}/grades`);
      const data = await response.json();
      setGrades(data);
    } catch (error) {
      console.error('Error loading grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChildChange = (e) => {
    const childId = e.target.value;
    setSelectedChild(childId);
    if (childId) {
      loadGrades(childId);
    }
  };

  return (
    <div className="dashboard">
      <h1>Grades</h1>
      <div className="card">
        <div className="form-group">
          <label className="form-label">Select Child:</label>
          <select 
            className="form-control" 
            value={selectedChild}
            onChange={handleChildChange}
            style={{ maxWidth: '300px' }}
          >
            <option value="">-- Select a child --</option>
            {children.map(child => (
              <option key={child.id} value={child.id}>
                {child.first_name} {child.last_name}
              </option>
            ))}
          </select>
        </div>

        {loading && <div className="loading"><div className="spinner"></div></div>}

        {!loading && selectedChild && grades.length > 0 && (
          <table className="table mt-2">
            <thead>
              <tr>
                <th>Exam</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Marks Obtained</th>
                <th>Total Marks</th>
                <th>Percentage</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {grades.map(grade => (
                <tr key={grade.id}>
                  <td>{grade.exam_name}</td>
                  <td>{grade.subject_name}</td>
                  <td>{new Date(grade.exam_date).toLocaleDateString()}</td>
                  <td>{grade.marks_obtained}</td>
                  <td>{grade.total_marks}</td>
                  <td>{Math.round((grade.marks_obtained / grade.total_marks) * 100)}%</td>
                  <td><span className="badge badge-success">{grade.grade || 'N/A'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && !selectedChild && (
          <div className="alert alert-info mt-2">
            Please select a child to view grades.
          </div>
        )}

        {!loading && selectedChild && grades.length === 0 && (
          <div className="alert alert-info mt-2">
            No grade records found for this child.
          </div>
        )}
      </div>
    </div>
  );
};

const Fees = ({ children }) => {
  const [selectedChild, setSelectedChild] = useState('');
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadFees = async (studentId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/fees/student/${studentId}`);
      const data = await response.json();
      setFees(data);
    } catch (error) {
      console.error('Error loading fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChildChange = (e) => {
    const childId = e.target.value;
    setSelectedChild(childId);
    if (childId) {
      loadFees(childId);
    }
  };

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
        <div className="form-group">
          <label className="form-label">Select Child:</label>
          <select 
            className="form-control" 
            value={selectedChild}
            onChange={handleChildChange}
            style={{ maxWidth: '300px' }}
          >
            <option value="">-- Select a child --</option>
            {children.map(child => (
              <option key={child.id} value={child.id}>
                {child.first_name} {child.last_name}
              </option>
            ))}
          </select>
        </div>

        {loading && <div className="loading"><div className="spinner"></div></div>}

        {!loading && selectedChild && fees.length > 0 && (
          <table className="table mt-2">
            <thead>
              <tr>
                <th>Fee Type</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Balance</th>
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
                  <td>${fee.amount - (fee.paid_amount || 0)}</td>
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

        {!loading && !selectedChild && (
          <div className="alert alert-info mt-2">
            Please select a child to view fee information.
          </div>
        )}

        {!loading && selectedChild && fees.length === 0 && (
          <div className="alert alert-info mt-2">
            No fee records found for this child.
          </div>
        )}
      </div>
    </div>
  );
};

const Messages = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadMessages();
    }
  }, [user]);

  const loadMessages = async () => {
    try {
      if (user?.id) {
        const response = await fetch(`/api/messages?receiver_id=${user.id}&receiver_type=parent`);
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard">
      <h1>Messages</h1>
      <div className="card mb-2">
        <button className="btn btn-primary">Compose Message</button>
      </div>
      <div className="card">
        {messages.length === 0 ? (
          <div className="alert alert-info">
            No messages yet. All communications from teachers and school will appear here.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {messages.map(message => (
              <div 
                key={message.id} 
                className="card" 
                style={{ 
                  borderLeft: message.is_read ? '4px solid #28a745' : '4px solid #007bff',
                  padding: '15px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <strong>{message.sender_name}</strong>
                    {!message.is_read && (
                      <span className="badge badge-primary" style={{ marginLeft: '10px' }}>
                        New
                      </span>
                    )}
                  </div>
                  <div style={{ color: '#666', fontSize: '0.9em' }}>
                    {new Date(message.sent_at).toLocaleString()}
                  </div>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Subject:</strong> {message.subject}
                </div>
                <div style={{ color: '#555' }}>
                  {message.message}
                </div>
                <div style={{ marginTop: '10px' }}>
                  <button className="btn btn-primary btn-sm" style={{ marginRight: '5px' }}>
                    Reply
                  </button>
                  {!message.is_read && (
                    <button className="btn btn-success btn-sm">
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
