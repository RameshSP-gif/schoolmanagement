import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import TeacherDashboard from './pages/teacher/Dashboard';
import StudentDashboard from './pages/student/Dashboard';
import ParentDashboard from './pages/parent/Dashboard';
import StaffDashboard from './pages/staff/Dashboard';

// Components
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Admin Routes */}
        <Route 
          path="/admin/*" 
          element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          } 
        />

        {/* Teacher Routes */}
        <Route 
          path="/teacher/*" 
          element={
            <PrivateRoute role="teacher">
              <TeacherDashboard />
            </PrivateRoute>
          } 
        />

        {/* Student Routes */}
        <Route 
          path="/student/*" 
          element={
            <PrivateRoute role="student">
              <StudentDashboard />
            </PrivateRoute>
          } 
        />

        {/* Parent Routes */}
        <Route 
          path="/parent/*" 
          element={
            <PrivateRoute role="parent">
              <ParentDashboard />
            </PrivateRoute>
          } 
        />

        {/* Staff Routes */}
        <Route 
          path="/staff/*" 
          element={
            <PrivateRoute role="staff">
              <StaffDashboard />
            </PrivateRoute>
          } 
        />

        {/* Default Route */}
        <Route 
          path="/" 
          element={
            authService.isAuthenticated() ? (
              <Navigate to={`/${authService.getCurrentUser()?.role}`} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
