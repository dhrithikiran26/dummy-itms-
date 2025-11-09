import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import './CourtBooking.css';

const CourtBooking = () => {
  const [searchParams] = useSearchParams();
  const courtIdParam = searchParams.get('courtId');
  const navigate = useNavigate();

  const [courts, setCourts] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchCourts();
    if (courtIdParam) {
      setSelectedCourt(courtIdParam);
    }
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);

  useEffect(() => {
    if (selectedCourt && selectedDate) {
      fetchSlots();
    }
  }, [selectedCourt, selectedDate]);

  const fetchCourts = async () => {
    try {
      const response = await api.get('/courts?status=Active');
      setCourts(response.data);
    } catch (error) {
      console.error('Error fetching courts:', error);
    }
  };

  const fetchSlots = async () => {
    if (!selectedCourt || !selectedDate) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/courts/${selectedCourt}/slots?date=${selectedDate}`);
      setSlots(response.data);
      setSelectedSlot('');
    } catch (error) {
      console.error('Error fetching slots:', error);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedCourt || !selectedSlot) {
      setError('Please select a court and slot');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await api.post('/bookings', {
        courtId: parseInt(selectedCourt),
        slotId: parseInt(selectedSlot)
      });

      if (response.data) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/bookings');
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // Allow booking up to 30 days ahead
    return maxDate.toISOString().split('T')[0];
  };

  const selectedCourtData = courts.find(c => c.Court_ID === parseInt(selectedCourt));

  return (
    <div className="court-booking">
      <h1>Book a Court</h1>

      <div className="booking-form">
        <div className="form-section">
          <label htmlFor="court-select">Select Court *</label>
          <select
            id="court-select"
            value={selectedCourt}
            onChange={(e) => {
              setSelectedCourt(e.target.value);
              setSelectedSlot('');
            }}
          >
            <option value="">Choose a court</option>
            {courts.map((court) => (
              <option key={court.Court_ID} value={court.Court_ID}>
                {court.Court_Name} - {court.Sport_Name} ({court.Location})
              </option>
            ))}
          </select>
        </div>

        {selectedCourtData && (
          <div className="court-details">
            <h3>Court Details</h3>
            <p><strong>Location:</strong> {selectedCourtData.Location}</p>
            <p><strong>Capacity:</strong> {selectedCourtData.Capacity}</p>
            <p><strong>Hourly Rate:</strong> ₹{selectedCourtData.Hourly_Rate}</p>
          </div>
        )}

        <div className="form-section">
          <label htmlFor="date-select">Select Date *</label>
          <input
            type="date"
            id="date-select"
            value={selectedDate}
            min={getMinDate()}
            max={getMaxDate()}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedSlot('');
            }}
          />
        </div>

        {selectedCourt && selectedDate && (
          <div className="form-section">
            <label>Available Slots</label>
            {loading ? (
              <div className="loading-slots">Loading slots...</div>
            ) : slots.length === 0 ? (
              <div className="no-slots">No available slots for this date</div>
            ) : (
              <div className="slots-grid">
                {slots.map((slot) => (
                  <button
                    key={slot.Slot_ID}
                    className={`slot-btn ${selectedSlot === slot.Slot_ID.toString() ? 'selected' : ''}`}
                    onClick={() => setSelectedSlot(slot.Slot_ID.toString())}
                  >
                    {slot.Start_Time} - {slot.End_Time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Booking created successfully! Redirecting...</div>}

        <button
          onClick={handleBooking}
          disabled={loading || !selectedCourt || !selectedSlot}
          className="submit-booking-btn"
        >
          {loading ? 'Processing...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
};

export default CourtBooking;




