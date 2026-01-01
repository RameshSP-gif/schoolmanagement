import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services';

const Navbar = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🎓 School Management
      </Link>
      <div className="navbar-menu">
        <span style={{ marginRight: '20px' }}>
          Welcome, {user?.first_name} {user?.last_name}
        </span>
        <span style={{ marginRight: '20px', opacity: 0.8 }}>
          ({user?.role?.toUpperCase()})
        </span>
        <button onClick={handleLogout} className="btn btn-danger">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
