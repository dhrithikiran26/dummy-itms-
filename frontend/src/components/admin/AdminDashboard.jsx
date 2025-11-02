import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Active Courts</h3>
            <p className="stat-value">{stats.active_courts || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Active Students</h3>
            <p className="stat-value">{stats.active_students || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Confirmed Bookings</h3>
            <p className="stat-value">{stats.confirmed_bookings || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Bookings</h3>
            <p className="stat-value">{stats.pending_bookings || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Completed Bookings</h3>
            <p className="stat-value">{stats.completed_bookings || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Cancelled Bookings</h3>
            <p className="stat-value">{stats.cancelled_bookings || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Available Slots</h3>
            <p className="stat-value">{stats.available_slots || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Booked Slots</h3>
            <p className="stat-value">{stats.booked_slots || 0}</p>
          </div>
          <div className="stat-card revenue">
            <h3>Total Revenue</h3>
            <p className="stat-value">₹{parseFloat(stats.total_revenue || 0).toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

