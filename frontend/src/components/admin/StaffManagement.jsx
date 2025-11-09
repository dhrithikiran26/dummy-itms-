import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './StaffManagement.css';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    staffName: '',
    email: '',
    role: 'Admin',
    reportsTo: ''
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await api.get('/admin/staff');
      setStaff(response.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
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

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember);
    setFormData({
      staffName: staffMember.Staff_Name,
      email: staffMember.Email,
      role: staffMember.Role,
      reportsTo: staffMember.Reports_To || ''
    });
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingStaff(null);
    setFormData({
      staffName: '',
      email: '',
      role: 'Admin',
      reportsTo: ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        reportsTo: formData.reportsTo || null
      };
      if (editingStaff) {
        await api.put(`/admin/staff/${editingStaff.Staff_ID}`, data);
      } else {
        await api.post('/admin/staff', data);
      }
      setShowModal(false);
      fetchStaff();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save staff');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) {
      return;
    }
    try {
      await api.delete(`/admin/staff/${id}`);
      fetchStaff();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete staff');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="staff-management">
      <div className="header">
        <h1>Staff Management</h1>
        <button onClick={handleCreate} className="btn-primary">+ Add Staff</button>
      </div>

      <div className="staff-table-container">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Staff ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Reports To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No staff found</td>
              </tr>
            ) : (
              staff.map((staffMember) => (
                <tr key={staffMember.Staff_ID}>
                  <td>{staffMember.Staff_ID}</td>
                  <td>{staffMember.Staff_Name}</td>
                  <td>{staffMember.Email}</td>
                  <td>
                    <span className={`role-badge ${staffMember.Role.toLowerCase()}`}>
                      {staffMember.Role}
                    </span>
                  </td>
                  <td>{staffMember.Reports_To_Name || '-'}</td>
                  <td>
                    <button onClick={() => handleEdit(staffMember)} className="btn-edit">Edit</button>
                    <button onClick={() => handleDelete(staffMember.Staff_ID)} className="btn-delete">Delete</button>
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
            <h2>{editingStaff ? 'Edit Staff' : 'Create Staff'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Staff Name *</label>
                <input
                  type="text"
                  name="staffName"
                  value={formData.staffName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select name="role" value={formData.role} onChange={handleInputChange} required>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Coach">Coach</option>
                  <option value="Supervisor">Supervisor</option>
                </select>
              </div>
              <div className="form-group">
                <label>Reports To (Optional)</label>
                <select name="reportsTo" value={formData.reportsTo} onChange={handleInputChange}>
                  <option value="">None</option>
                  {staff
                    .filter(s => s.Staff_ID !== editingStaff?.Staff_ID)
                    .map(s => (
                      <option key={s.Staff_ID} value={s.Staff_ID}>
                        {s.Staff_Name}
                      </option>
                    ))
                  }
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

export default StaffManagement;




