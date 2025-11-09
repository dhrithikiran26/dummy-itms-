import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import Landing from './components/Landing';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import CourtBooking from './components/CourtBooking';
import MyBookings from './components/MyBookings';
import Navbar from './components/Navbar';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import CourtManagement from './components/admin/CourtManagement';
import BookingsManagement from './components/admin/BookingsManagement';
import SportManagement from './components/admin/SportManagement';
import StaffManagement from './components/admin/StaffManagement';
import AdminNavbar from './components/admin/AdminNavbar';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { admin, loading } = useAdmin();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return admin ? children : <Navigate to="/admin/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Landing />} />
        
        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <AdminProvider>
            <AdminRoutes />
          </AdminProvider>
        } />
        
        {/* Student Routes */}
        <Route path="/*" element={
          <AuthProvider>
            <StudentRoutes />
          </AuthProvider>
        } />
      </Routes>
    </Router>
  );
}

function AdminRoutes() {
  return (
    <div className="App">
      <AdminNavbar />
      <main className="main-content">
        <Routes>
          <Route path="login" element={<AdminLogin />} />
          <Route
            path="dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="courts"
            element={
              <AdminRoute>
                <CourtManagement />
              </AdminRoute>
            }
          />
          <Route
            path="bookings"
            element={
              <AdminRoute>
                <BookingsManagement />
              </AdminRoute>
            }
          />
          <Route
            path="sports"
            element={
              <AdminRoute>
                <SportManagement />
              </AdminRoute>
            }
          />
          <Route
            path="staff"
            element={
              <AdminRoute>
                <StaffManagement />
              </AdminRoute>
            }
          />
          <Route path="" element={<Navigate to="/admin/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
}

function StudentRoutes() {
  return (
    <div className="App">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/book"
            element={
              <PrivateRoute>
                <CourtBooking />
              </PrivateRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <PrivateRoute>
                <MyBookings />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;

