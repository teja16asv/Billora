import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Public
import Login from './pages/Login';
import PublicPayment from './pages/public/PublicPayment';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Customers from './pages/admin/Customers';
import UsageUpload from './pages/admin/UsageUpload';
import AdminInvoices from './pages/admin/AdminInvoices';
import Settings from './pages/admin/Settings';

// Customer Pages
import CustomerInvoices from './pages/customer/CustomerInvoices';
import Payment from './pages/customer/Payment';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/pay/:id" element={<PublicPayment />} />

          {/* Admin Protected Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <DashboardLayout><AdminDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <DashboardLayout><AdminDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/customers" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <DashboardLayout><Customers /></DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/usage-upload" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <DashboardLayout><UsageUpload /></DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/invoices" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <DashboardLayout><AdminInvoices /></DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/settings" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <DashboardLayout><Settings /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Customer / Shared Protected Routes */}
          <Route path="/customer/invoices" element={
            <ProtectedRoute allowedRoles={['Admin', 'Customer']}>
              <DashboardLayout><CustomerInvoices /></DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/customer/payment/:id" element={
            <ProtectedRoute allowedRoles={['Admin', 'Customer']}>
              <DashboardLayout><Payment /></DashboardLayout>
            </ProtectedRoute>
          } />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
