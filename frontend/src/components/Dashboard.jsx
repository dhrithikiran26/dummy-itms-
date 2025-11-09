import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [sports, setSports] = useState([]);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('');

  useEffect(() => {
    fetchSports();
    fetchCourts();
  }, []);

  useEffect(() => {
    fetchCourts();
  }, [selectedSport]);

  const fetchSports = async () => {
    try {
      const response = await api.get('/sports');
      setSports(response.data);
    } catch (error) {
      console.error('Error fetching sports:', error);
    }
  };

  const fetchCourts = async () => {
    try {
      const url = selectedSport 
        ? `/courts?sportId=${selectedSport}&status=Active`
        : '/courts?status=Active';
      const response = await api.get(url);
      setCourts(response.data);
    } catch (error) {
      console.error('Error fetching courts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="Welcome">
      <h1>Welcome!</h1>
      </div>
      
      <div className="sports-filter">
        <label htmlFor="sport-select">Filter by Sport:</label>
        <select
          id="sport-select"
          value={selectedSport}
          onChange={(e) => setSelectedSport(e.target.value)}
        >
          <option value="">All Sports</option>
          {sports.map((sport) => (
            <option key={sport.Sport_ID} value={sport.Sport_ID}>
              {sport.Sport_Name}
            </option>
          ))}
        </select>
      </div>

      <div className="courts-grid">
        {courts.length === 0 ? (
          <div className="no-courts">No courts available</div>
        ) : (
          courts.map((court) => (
            <div key={court.Court_ID} className="court-card">
              <div className="court-header">
                <h3>{court.Court_Name}</h3>
                <span className={`status-badge ${court.Availability_Status.toLowerCase()}`}>
                  {court.Availability_Status}
                </span>
              </div>
              <div className="court-info">
                <p><strong>Sport:</strong> {court.Sport_Name}</p>
                <p><strong>Location:</strong> {court.Location}</p>
                <p><strong>Capacity:</strong> {court.Capacity}</p>
                <p><strong>Hourly Rate:</strong> ₹{court.Hourly_Rate}</p>
                <p><strong>Managed by:</strong> {court.Staff_Name} ({court.Role})</p>
              </div>
              <Link 
                to={`/book?courtId=${court.Court_ID}`}
                className="book-btn"
              >
                Book Now
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;

