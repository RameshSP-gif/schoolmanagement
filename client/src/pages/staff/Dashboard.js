import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { authService, studentService, feeService } from '../../services';

const StaffDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    pendingAdmissions: 0,
    pendingFees: 0,
    todayVisitors: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    loadStats();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const feeStats = await feeService.getStatistics();
      setStats({
        pendingAdmissions: 5,
        pendingFees: feeStats.pending_count || 0,
        todayVisitors: 12
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const sidebarItems = [
    { path: '/staff', label: 'Dashboard', icon: '📊' },
    { path: '/staff/admissions', label: 'Admissions', icon: '📝' },
    { path: '/staff/students', label: 'Students', icon: '👨‍🎓' },
    { path: '/staff/fees', label: 'Fee Management', icon: '💰' },
    { path: '/staff/visitors', label: 'Visitors', icon: '👥' }
  ];

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <Navbar user={user} />
      <Sidebar role="staff" items={sidebarItems} />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<StaffHome stats={stats} user={user} />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/students" element={<Students />} />
          <Route path="/fees" element={<Fees />} />
          <Route path="/visitors" element={<Visitors />} />
        </Routes>
      </div>
    </div>
  );
};

const StaffHome = ({ stats, user }) => {
  return (
    <div className="dashboard">
      <h1>Welcome, {user?.first_name}!</h1>
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-value">{stats.pendingAdmissions}</div>
          <div className="stat-label">Pending Admissions</div>
        </div>
        <div className="stat-card green">
          <div className="stat-value">{stats.pendingFees}</div>
          <div className="stat-label">Pending Fees</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-value">{stats.todayVisitors}</div>
          <div className="stat-label">Today's Visitors</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
        </div>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <a href="/staff/admissions" className="btn btn-primary">Process Admission</a>
          <a href="/staff/fees" className="btn btn-success">Collect Fee</a>
          <a href="/staff/visitors" className="btn btn-warning">Register Visitor</a>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Today's Tasks</h2>
        </div>
        <ul>
          <li>Process 5 pending admission applications</li>
          <li>Follow up on overdue fee payments</li>
          <li>Prepare monthly attendance report</li>
        </ul>
      </div>
    </div>
  );
};

const Admissions = () => {
  const [admissions, setAdmissions] = useState([
    { id: 1, name: 'Emma Wilson', class: 'Class 6', date: '2024-01-15', status: 'pending' },
    { id: 2, name: 'Daniel Brown', class: 'Class 8', date: '2024-01-14', status: 'pending' },
    { id: 3, name: 'Sophie Davis', class: 'Class 7', date: '2024-01-13', status: 'approved' },
    { id: 4, name: 'Oliver Taylor', class: 'Class 9', date: '2024-01-12', status: 'rejected' },
    { id: 5, name: 'Mia Anderson', class: 'Class 5', date: '2024-01-11', status: 'pending' }
  ]);

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      approved: 'badge-success',
      rejected: 'badge-danger'
    };
    return `badge ${badges[status]}`;
  };

  return (
    <div className="dashboard">
      <h1>Admission Management</h1>
      <div className="card mb-2">
        <button className="btn btn-primary">New Admission Application</button>
      </div>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Application ID</th>
              <th>Student Name</th>
              <th>Class</th>
              <th>Application Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admissions.map(admission => (
              <tr key={admission.id}>
                <td>#{admission.id.toString().padStart(4, '0')}</td>
                <td>{admission.name}</td>
                <td>{admission.class}</td>
                <td>{new Date(admission.date).toLocaleDateString()}</td>
                <td>
                  <span className={getStatusBadge(admission.status)}>
                    {admission.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  <button className="btn btn-primary btn-sm" style={{ marginRight: '5px' }}>
                    View Details
                  </button>
                  {admission.status === 'pending' && (
                    <>
                      <button className="btn btn-success btn-sm" style={{ marginRight: '5px' }}>
                        Approve
                      </button>
                      <button className="btn btn-danger btn-sm">
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await studentService.getAll();
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard">
      <h1>Student Management</h1>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Admission No.</th>
              <th>Name</th>
              <th>Class</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">No students found</td>
              </tr>
            ) : (
              students.map(student => (
                <tr key={student.id}>
                  <td>{student.admission_number}</td>
                  <td>{student.first_name} {student.last_name}</td>
                  <td>{student.class_name || 'Not assigned'}</td>
                  <td>{student.phone || '-'}</td>
                  <td>
                    <button className="btn btn-primary btn-sm">View</button>
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

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = async () => {
    try {
      const data = await feeService.getAll();
      setFees(data);
    } catch (error) {
      console.error('Error loading fees:', error);
    } finally {
      setLoading(false);
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

  const filteredFees = fees.filter(fee => {
    if (filter === 'all') return true;
    return fee.status === filter;
  });

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard">
      <h1>Fee Management</h1>
      
      <div className="card mb-2">
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label className="form-label" style={{ marginBottom: 0 }}>Filter:</label>
          <select 
            className="form-control" 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ maxWidth: '200px' }}
          >
            <option value="all">All Fees</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="overdue">Overdue</option>
            <option value="paid">Paid</option>
          </select>
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn btn-success">Collect Fee Payment</button>
          </div>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Fee Type</th>
              <th>Amount</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFees.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">No fee records found</td>
              </tr>
            ) : (
              filteredFees.map(fee => (
                <tr key={fee.id}>
                  <td>{fee.student_name}</td>
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
                  <td>
                    {fee.status !== 'paid' && (
                      <button className="btn btn-primary btn-sm">
                        Collect
                      </button>
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

const Visitors = () => {
  const [visitors, setVisitors] = useState([
    { id: 1, name: 'John Smith', purpose: 'Parent Meeting', phone: '555-0101', time: '09:00 AM', date: new Date().toISOString() },
    { id: 2, name: 'Sarah Johnson', purpose: 'Admission Inquiry', phone: '555-0102', time: '10:30 AM', date: new Date().toISOString() },
    { id: 3, name: 'Michael Lee', purpose: 'Vendor Visit', phone: '555-0103', time: '11:15 AM', date: new Date().toISOString() },
    { id: 4, name: 'Emily Chen', purpose: 'Document Submission', phone: '555-0104', time: '02:00 PM', date: new Date().toISOString() }
  ]);

  return (
    <div className="dashboard">
      <h1>Visitor Management</h1>
      <div className="card mb-2">
        <button className="btn btn-primary">Register New Visitor</button>
      </div>
      <div className="card">
        <h3>Today's Visitors ({visitors.length})</h3>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Purpose</th>
              <th>Phone</th>
              <th>Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visitors.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">No visitors registered today</td>
              </tr>
            ) : (
              visitors.map(visitor => (
                <tr key={visitor.id}>
                  <td>#{visitor.id.toString().padStart(3, '0')}</td>
                  <td>{visitor.name}</td>
                  <td>{visitor.purpose}</td>
                  <td>{visitor.phone}</td>
                  <td>{visitor.time}</td>
                  <td>
                    <button className="btn btn-primary btn-sm" style={{ marginRight: '5px' }}>
                      View Details
                    </button>
                    <button className="btn btn-success btn-sm">
                      Check Out
                    </button>
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

export default StaffDashboard;
