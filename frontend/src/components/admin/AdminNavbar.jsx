import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import './AdminNavbar.css';

const AdminNavbar = () => {
  const { admin, logout } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleHome = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-container">
        <Link to="/admin/dashboard" className="admin-navbar-logo">
          🏀 Admin Panel
        </Link>
        {admin && (
          <div className="admin-navbar-menu">
            <Link to="/admin/dashboard" className="admin-navbar-link">Dashboard</Link>
            <Link to="/admin/courts" className="admin-navbar-link">Courts</Link>
            <Link to="/admin/bookings" className="admin-navbar-link">Bookings</Link>
            <Link to="/admin/sports" className="admin-navbar-link">Sports</Link>
            <Link to="/admin/staff" className="admin-navbar-link">Staff</Link>
            <div className="admin-navbar-user">
              <span>{admin.name}</span>
              <button onClick={handleHome} className="admin-home-btn">Home</button>
              <button onClick={handleLogout} className="admin-logout-btn">Logout</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;

