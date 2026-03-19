import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/authStore';
import Navbar              from './components/Navbar';
import ProtectedRoute      from './components/ProtectedRoute';
import LoginPage           from './pages/LoginPage';
import RegisterPage        from './pages/RegisterPage';
import JobsPage            from './pages/JobsPage';
import JobDetailPage       from './pages/JobDetailPage';
import RecruiterDashboard  from './pages/RecruiterDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"          element={<Navigate to="/jobs" replace />} />
          <Route path="/login"     element={<LoginPage />} />
          <Route path="/register"  element={<RegisterPage />} />
          <Route path="/jobs"      element={<JobsPage />} />
          <Route path="/jobs/:id"  element={<JobDetailPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute role="RECRUITER">
              <RecruiterDashboard />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/jobs" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
