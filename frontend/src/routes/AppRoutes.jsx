import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import AdminDashboard from '../pages/AdminDashboard';
import OrganizerDashboard from '../pages/OrganizerDashboard';
import AttenderDashboard from '../pages/AttenderDashboard';
import Payment from '../pages/Payment';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      {/* Redirects */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/organizer" element={<Navigate to="/organizer/dashboard" replace />} />

      {/* Admin Protected Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Organizer Protected Routes */}
      <Route
        path="/organizer/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Organizer']}>
            <OrganizerDashboard />
          </ProtectedRoute>
        }
      />
      {/* Attender Dashboard Route (Protected) */}
      <Route
        path="/attender/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Attender']}>
            <AttenderDashboard />
          </ProtectedRoute>
        }
      />

      {/* Attender Payment Route (Protected) */}
      <Route
        path="/attender/payment/:eventId"
        element={
          <ProtectedRoute allowedRoles={['Attender']}>
            <Payment />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
};

export default AppRoutes;