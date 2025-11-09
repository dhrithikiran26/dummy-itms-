import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './SportManagement.css';

const SportManagement = () => {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSport, setEditingSport] = useState(null);
  const [formData, setFormData] = useState({
    sportName: '',
    description: ''
  });

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      const response = await api.get('/admin/sports');
      setSports(response.data);
    } catch (error) {
      console.error('Error fetching sports:', error);
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

  const handleEdit = (sport) => {
    setEditingSport(sport);
    setFormData({
      sportName: sport.Sport_Name,
      description: sport.Description || ''
    });
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingSport(null);
    setFormData({
      sportName: '',
      description: ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSport) {
        await api.put(`/admin/sports/${editingSport.Sport_ID}`, formData);
      } else {
        await api.post('/admin/sports', formData);
      }
      setShowModal(false);
      fetchSports();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save sport');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sport?')) {
      return;
    }
    try {
      await api.delete(`/admin/sports/${id}`);
      fetchSports();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete sport');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="sport-management">
      <div className="header">
        <h1>Sport Management</h1>
        <button onClick={handleCreate} className="btn-primary">+ Add Sport</button>
      </div>

      <div className="sports-table-container">
        <table className="sports-table">
          <thead>
            <tr>
              <th>Sport ID</th>
              <th>Sport Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sports.length === 0 ? (
              <tr>
                <td colSpan="4" className="no-data">No sports found</td>
              </tr>
            ) : (
              sports.map((sport) => (
                <tr key={sport.Sport_ID}>
                  <td>{sport.Sport_ID}</td>
                  <td>{sport.Sport_Name}</td>
                  <td>{sport.Description || '-'}</td>
                  <td>
                    <button onClick={() => handleEdit(sport)} className="btn-edit">Edit</button>
                    <button onClick={() => handleDelete(sport.Sport_ID)} className="btn-delete">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingSport ? 'Edit Sport' : 'Create Sport'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Sport Name *</label>
                <input
                  type="text"
                  name="sportName"
                  value={formData.sportName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                />
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

export default SportManagement;




