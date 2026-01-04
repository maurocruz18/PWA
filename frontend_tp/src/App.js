import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Admin from './pages/Admin';
import AdminPTRequests from './pages/AdminPTRequests';
import Workouts from './pages/Workouts';
import MyWorkouts from './pages/MyWorkouts';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import MyClients from './pages/MyClients';
import SelectPT from './pages/SelectPT';
import ClientHistory from './pages/ClientHistory';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminClientRequests from './pages/AdminClientRequests';
import QRCodeLogin from './pages/QRCodeLogin';

const DashboardRouter = () => {
  const { isAdmin } = useAuth();

  if (isAdmin) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return <Dashboard />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <ToastContainer position="top-right" autoClose={3000} />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/qr-login" element={<QRCodeLogin />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DashboardRouter />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AdminDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Admin />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/pt-requests"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AdminPTRequests />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/client-requests"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AdminClientRequests />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/workouts"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Workouts />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-workouts"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <MyWorkouts />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-clients"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <MyClients />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/client-history/:clientId"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ClientHistory />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/select-pt"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <SelectPT />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Messages />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Profile />
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;