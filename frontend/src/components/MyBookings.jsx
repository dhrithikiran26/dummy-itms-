import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './MyBookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      const url = filter ? `/bookings?status=${filter}` : '/bookings';
      const response = await api.get(url);
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      fetchBookings();
      alert('Booking cancelled successfully');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const handlePay = async (bookingId) => {
    const paymentMethod = window.prompt('Enter payment method (Cash/Card/UPI/Wallet):', 'Cash');
    if (!paymentMethod) {
      return;
    }

    const transactionId = window.prompt('Enter transaction ID (optional, press Cancel to skip):');

    try {
      await api.put(`/bookings/${bookingId}/pay`, {
        paymentMethod: paymentMethod || 'Cash',
        transactionId: transactionId || null
      });
      fetchBookings();
      alert('Payment recorded successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to process payment');
    }
  };

  const handleConfirm = async (bookingId) => {
    if (!window.confirm('Are you sure you want to confirm this booking?')) {
      return;
    }

    try {
      await api.put(`/bookings/${bookingId}/confirm`);
      fetchBookings();
      alert('Booking confirmed successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to confirm booking');
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
    <div className="my-bookings">
      <h1>My Bookings</h1>

      <div className="filter-section">
        <label htmlFor="status-filter">Filter by Status:</label>
        <select
          id="status-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>No bookings found</p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking.Booking_ID} className="booking-card">
              <div className="booking-header">
                <h3>{booking.Court_Name}</h3>
                <span className={`status-badge ${getStatusBadgeClass(booking.Booking_Status)}`}>
                  {booking.Booking_Status}
                </span>
              </div>
              <div className="booking-details">
                <div className="detail-row">
                  <span className="label">Sport:</span>
                  <span className="value">{booking.Sport_Name}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Location:</span>
                  <span className="value">{booking.Location}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Date:</span>
                  <span className="value">{formatDate(booking.Slot_Date)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Time:</span>
                  <span className="value">{formatTime(booking.Start_Time)} - {formatTime(booking.End_Time)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Booking Date:</span>
                  <span className="value">{formatDate(booking.Booking_Date)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Amount:</span>
                  <span className="value amount">₹{booking.Total_Amount}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Payment Status:</span>
                  <span className={`value ${booking.Payment_Status.toLowerCase()}`}>
                    {booking.Payment_Status}
                  </span>
                </div>
              </div>
              {booking.Booking_Status !== 'Cancelled' && 
               booking.Booking_Status !== 'Completed' && (
                <div className="booking-actions">
                  {booking.Payment_Status === 'Unpaid' && (
                    <button
                      onClick={() => handlePay(booking.Booking_ID)}
                      className="pay-btn"
                    >
                      Mark as Paid
                    </button>
                  )}
                  {booking.Booking_Status === 'Pending' && booking.Payment_Status === 'Paid' && (
                    <button
                      onClick={() => handleConfirm(booking.Booking_ID)}
                      className="confirm-btn"
                    >
                      Confirm Booking
                    </button>
                  )}
                  <button
                    onClick={() => handleCancel(booking.Booking_ID)}
                    className="cancel-btn"
                  >
                    Cancel Booking
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;

