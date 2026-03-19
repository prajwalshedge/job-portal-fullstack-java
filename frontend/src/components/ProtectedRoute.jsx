import { Navigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';

export default function ProtectedRoute({ children, role, guestOnly }) {
  const { user, ready } = useAuth();

  if (!ready) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
    </div>
  );

  if (guestOnly && user)
    return <Navigate to={user.role === 'RECRUITER' ? '/dashboard' : '/jobs'} replace />;

  if (!guestOnly && !user) return <Navigate to="/login" replace />;

  if (role && user?.role !== role) return <Navigate to="/" replace />;

  return children;
}
