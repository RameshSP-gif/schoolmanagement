import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ role, items }) => {
  const location = useLocation();

  return (
    <div className="sidebar">
      <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ color: 'white' }}>{role?.toUpperCase()} PANEL</h3>
      </div>
      <ul className="sidebar-menu">
        {items.map((item, index) => (
          <li 
            key={index} 
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <Link to={item.path} className="sidebar-link">
              {item.icon && <span style={{ marginRight: '10px' }}>{item.icon}</span>}
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
