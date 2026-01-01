import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { authService, studentService, teacherService, classService, feeService } from '../../services';

// Import sub-pages
import Students from './Students';
import Teachers from './Teachers';
import Classes from './Classes';
import Fees from './Fees';
import Reports from './Reports';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    pendingFees: 0
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
    }
  };

  const loadStats = async () => {
    try {
      const [students, teachers, classes, feeStats] = await Promise.all([
        studentService.getAll(),
        teacherService.getAll(),
        classService.getAll(),
        feeService.getStatistics()
      ]);

      setStats({
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalClasses: classes.length,
        pendingFees: feeStats.pending_count || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/students', label: 'Students', icon: '👨‍🎓' },
    { path: '/admin/teachers', label: 'Teachers', icon: '👨‍🏫' },
    { path: '/admin/classes', label: 'Classes', icon: '📚' },
    { path: '/admin/fees', label: 'Fees', icon: '💰' },
    { path: '/admin/reports', label: 'Reports', icon: '📈' }
  ];

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <Navbar user={user} />
      <Sidebar role="admin" items={sidebarItems} />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<DashboardHome stats={stats} />} />
          <Route path="/students" element={<Students />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/fees" element={<Fees />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </div>
    </div>
  );
};

const DashboardHome = ({ stats }) => {
  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-value">{stats.totalStudents}</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card green">
          <div className="stat-value">{stats.totalTeachers}</div>
          <div className="stat-label">Total Teachers</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-value">{stats.totalClasses}</div>
          <div className="stat-label">Total Classes</div>
        </div>
        <div className="stat-card red">
          <div className="stat-value">{stats.pendingFees}</div>
          <div className="stat-label">Pending Fees</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
        </div>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <a href="/admin/students" className="btn btn-primary">Add New Student</a>
          <a href="/admin/teachers" className="btn btn-success">Add New Teacher</a>
          <a href="/admin/classes" className="btn btn-warning">Create Class</a>
          <a href="/admin/fees" className="btn btn-secondary">Manage Fees</a>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Activities</h2>
        </div>
        <p>No recent activities to display.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
