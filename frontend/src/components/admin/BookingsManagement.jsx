import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './BookingsManagement.css';

const BookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', date: '' });

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.date) params.append('date', filter.date);
      
      const response = await api.get(`/admin/bookings?${params.toString()}`);
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString.substring(0, 5);
  };

  const getStatusBadgeClass = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'confirmed') return 'status-confirmed';
    if (statusLower === 'pending') return 'status-pending';
    if (statusLower === 'cancelled') return 'status-cancelled';
    if (statusLower === 'completed') return 'status-completed';
    return 'status-default';
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="bookings-management">
      <h1>Bookings Management</h1>

      <div className="filters">
        <div className="filter-group">
          <label>Filter by Status:</label>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Filter by Date:</label>
          <input
            type="date"
            value={filter.date}
            onChange={(e) => setFilter({ ...filter, date: e.target.value })}
          />
        </div>
      </div>

      <div className="bookings-table-container">
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Student</th>
              <th>Court</th>
              <th>Sport</th>
              <th>Date</th>
              <th>Time</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Booking Date</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="10" className="no-data">No bookings found</td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.Booking_ID}>
                  <td>{booking.Booking_ID}</td>
                  <td>
                    <div>
                      <div>{booking.First_Name} {booking.Last_Name}</div>
                      <div className="student-email">{booking.Email}</div>
                      <div className="student-ssrn">{booking.SSRN}</div>
                    </div>
                  </td>
                  <td>
                    <div>{booking.Court_Name}</div>
                    <div className="location">{booking.Location}</div>
                  </td>
                  <td>{booking.Sport_Name}</td>
                  <td>{formatDate(booking.Slot_Date)}</td>
                  <td>{formatTime(booking.Start_Time)} - {formatTime(booking.End_Time)}</td>
                  <td>₹{booking.Total_Amount}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(booking.Booking_Status)}`}>
                      {booking.Booking_Status}
                    </span>
                  </td>
                  <td>
                    <span className={`payment-status ${booking.Payment_Status.toLowerCase()}`}>
                      {booking.Payment_Status}
                    </span>
                  </td>
                  <td>{formatDate(booking.Booking_Date)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingsManagement;

