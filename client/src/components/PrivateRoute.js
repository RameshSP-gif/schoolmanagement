import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services';

const PrivateRoute = ({ children, role }) => {
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && currentUser?.role !== role) {
    return <Navigate to={`/${currentUser?.role}`} replace />;
  }

  return children;
};

export default PrivateRoute;
