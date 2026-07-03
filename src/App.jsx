import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeContextProvider } from './context/ThemeContext';
import { UIProvider } from './context/UIContext';
import GlobalLoader from './components/GlobalLoader';

import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Rooms = lazy(() => import('./pages/Rooms'));
const Bookings = lazy(() => import('./pages/Bookings'));
const Guests = lazy(() => import('./pages/Guests'));
const Billing = lazy(() => import('./pages/Billing'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const CalendarView = lazy(() => import('./pages/CalendarView'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ServerError = lazy(() => import('./pages/ServerError'));

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />; // Redirect to dashboard if not admin
  }
  return children;
};

function AppContent() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Suspense fallback={<GlobalLoader />}><Dashboard /></Suspense>} />
          <Route path="rooms" element={<Suspense fallback={<GlobalLoader />}><Rooms /></Suspense>} />
          <Route path="bookings" element={<Suspense fallback={<GlobalLoader />}><Bookings /></Suspense>} />
          <Route path="calendar" element={<Suspense fallback={<GlobalLoader />}><CalendarView /></Suspense>} />
          <Route path="guests" element={<Suspense fallback={<GlobalLoader />}><Guests /></Suspense>} />
          <Route path="billing" element={<Suspense fallback={<GlobalLoader />}><Billing /></Suspense>} />
          <Route path="reports" element={<Suspense fallback={<GlobalLoader />}><Reports /></Suspense>} />
          <Route path="settings" element={
            <AdminRoute>
              <Suspense fallback={<GlobalLoader />}><Settings /></Suspense>
            </AdminRoute>
          } />
        </Route>

        <Route path="/500" element={<Suspense fallback={<GlobalLoader />}><ServerError /></Suspense>} />
        <Route path="*" element={<Suspense fallback={<GlobalLoader />}><NotFound /></Suspense>} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ThemeContextProvider>
      <CssBaseline />
      <AuthProvider>
        <UIProvider>
          <AppContent />
        </UIProvider>
      </AuthProvider>
    </ThemeContextProvider>
  );
}

export default App;
