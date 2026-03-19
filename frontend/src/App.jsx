import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }       from './store/authStore';
import Navbar                 from './components/Navbar';
import ProtectedRoute         from './components/ProtectedRoute';
import LoginPage              from './pages/LoginPage';
import RegisterPage           from './pages/RegisterPage';
import JobsPage               from './pages/JobsPage';
import JobDetailPage          from './pages/JobDetailPage';
import RecruiterDashboard     from './pages/RecruiterDashboard';
import ProfilePage            from './pages/ProfilePage';
import AdminDashboard         from './pages/AdminDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<Navigate to="/jobs" replace />} />

            {/* Guest-only — redirect logged-in users away */}
            <Route path="/login"    element={<ProtectedRoute guestOnly><LoginPage /></ProtectedRoute>} />
            <Route path="/register" element={<ProtectedRoute guestOnly><RegisterPage /></ProtectedRoute>} />

            {/* Public */}
            <Route path="/jobs"     element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />

            {/* Job seeker */}
            <Route path="/profile" element={
              <ProtectedRoute role="USER"><ProfilePage /></ProtectedRoute>
            } />

            {/* Recruiter */}
            <Route path="/dashboard" element={
              <ProtectedRoute role="RECRUITER"><RecruiterDashboard /></ProtectedRoute>
            } />

            {/* Admin */}
            <Route path="/admin" element={
              <ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/jobs" replace />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}
