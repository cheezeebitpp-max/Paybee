import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Auth & Protection
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleRoute from './components/auth/RoleRoute';

// Pages
import UserDashboard from './pages/user/UserDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import Deposits from './pages/admin/Deposits';
import Payouts from './pages/admin/Payouts';
import CMS from './pages/admin/CMS';

// Placeholder components for other routes
const Placeholder = ({ name }: { name: string }) => (
  <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 min-h-[400px] flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-[#0F1014] mb-2">{name}</h2>
      <p className="text-gray-500">This component is currently being converted to the unified design.</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Unified Dashboard (Protected) */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          
          {/* User Routes */}
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/market" element={<Placeholder name="P2P Market" />} />
          <Route path="/wallet" element={<Placeholder name="My Wallet" />} />
          <Route path="/trades" element={<Placeholder name="Active Trades" />} />
          <Route path="/history" element={<Placeholder name="Trade History" />} />
          <Route path="/settings" element={<Placeholder name="Settings" />} />

          {/* Admin Routes (Restricted) */}
          <Route path="/admin" element={
            <RoleRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <AdminDashboard />
            </RoleRoute>
          } />
          
          <Route path="/admin/users" element={
            <RoleRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <ManageUsers />
            </RoleRoute>
          } />
          
          <Route path="/admin/deposits" element={
            <RoleRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <Deposits />
            </RoleRoute>
          } />
          
          <Route path="/admin/payouts" element={
            <RoleRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <Payouts />
            </RoleRoute>
          } />
          
          <Route path="/admin/trades" element={
            <RoleRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <Placeholder name="Trades" />
            </RoleRoute>
          } />
          
          <Route path="/admin/cms" element={
            <RoleRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <CMS />
            </RoleRoute>
          } />

        </Route>

        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
