import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './CourtManagement.css';

const CourtManagement = () => {
  const [courts, setCourts] = useState([]);
  const [sports, setSports] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourt, setEditingCourt] = useState(null);
  const [formData, setFormData] = useState({
    sportId: '',
    courtName: '',
    sportType: '',
    staffId: '',
    location: '',
    capacity: '',
    hourlyRate: '',
    availabilityStatus: 'Active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [courtsRes, sportsRes, staffRes] = await Promise.all([
        api.get('/admin/courts'),
        api.get('/sports'),
        api.get('/admin/staff')
      ]);
      setCourts(courtsRes.data);
      setSports(sportsRes.data);
      setStaff(staffRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEdit = (court) => {
    setEditingCourt(court);
    setFormData({
      sportId: court.Sport_ID,
      courtName: court.Court_Name,
      sportType: court.Sport_Type || '',
      staffId: court.Staff_ID,
      location: court.Location,
      capacity: court.Capacity,
      hourlyRate: court.Hourly_Rate,
      availabilityStatus: court.Availability_Status
    });
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingCourt(null);
    setFormData({
      sportId: '',
      courtName: '',
      sportType: '',
      staffId: '',
      location: '',
      capacity: '',
      hourlyRate: '',
      availabilityStatus: 'Active'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourt) {
        await api.put(`/admin/courts/${editingCourt.Court_ID}`, formData);
      } else {
        await api.post('/admin/courts', formData);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save court');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this court?')) {
      return;
    }
    try {
      await api.delete(`/admin/courts/${id}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete court');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="court-management">
      <div className="header">
        <h1>Court Management</h1>
        <button onClick={handleCreate} className="btn-primary">+ Add Court</button>
      </div>

      <div className="courts-table-container">
        <table className="courts-table">
          <thead>
            <tr>
              <th>Court Name</th>
              <th>Sport</th>
              <th>Location</th>
              <th>Capacity</th>
              <th>Hourly Rate</th>
              <th>Status</th>
              <th>Managed By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courts.map((court) => (
              <tr key={court.Court_ID}>
                <td>{court.Court_Name}</td>
                <td>{court.Sport_Name}</td>
                <td>{court.Location}</td>
                <td>{court.Capacity}</td>
                <td>₹{court.Hourly_Rate}</td>
                <td>
                  <span className={`status-badge ${court.Availability_Status.toLowerCase()}`}>
                    {court.Availability_Status}
                  </span>
                </td>
                <td>{court.Staff_Name}</td>
                <td>
                  <button onClick={() => handleEdit(court)} className="btn-edit">Edit</button>
                  <button onClick={() => handleDelete(court.Court_ID)} className="btn-delete">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingCourt ? 'Edit Court' : 'Create Court'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Sport *</label>
                <select name="sportId" value={formData.sportId} onChange={handleInputChange} required>
                  <option value="">Select Sport</option>
                  {sports.map((sport) => (
                    <option key={sport.Sport_ID} value={sport.Sport_ID}>
                      {sport.Sport_Name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Court Name *</label>
                <input type="text" name="courtName" value={formData.courtName} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Sport Type</label>
                <input type="text" name="sportType" value={formData.sportType} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Staff *</label>
                <select name="staffId" value={formData.staffId} onChange={handleInputChange} required>
                  <option value="">Select Staff</option>
                  {staff.map((s) => (
                    <option key={s.Staff_ID} value={s.Staff_ID}>
                      {s.Staff_Name} ({s.Role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Location *</label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Capacity *</label>
                <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} required min="1" />
              </div>
              <div className="form-group">
                <label>Hourly Rate (₹)</label>
                <input type="number" name="hourlyRate" value={formData.hourlyRate} onChange={handleInputChange} step="0.01" />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="availabilityStatus" value={formData.availabilityStatus} onChange={handleInputChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourtManagement;

