import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-content">
        <div className="landing-header">
          <h1 className="orange">Book</h1>
          <h1 className="blue">My</h1>
          <h1 className="orange">Court</h1>
        </div>
        
        <div className="landing-options">
          <div className="option-card student-card" onClick={() => navigate('/login')}>
            <div className="option-icon">👨‍🎓</div>
            <h2>Student</h2>
            <p>Book courts, manage your bookings</p>
            <button className="option-btn student-btn">Go to Student Login</button>
          </div>
          
          <div className="option-card admin-card" onClick={() => navigate('/admin/login')}>
            <div className="option-icon">👨‍💼</div>
            <h2>Admin</h2>
            <p>Manage courts, bookings, and system</p>
            <button className="option-btn admin-btn">Go to Admin Login</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;




