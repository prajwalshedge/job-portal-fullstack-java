import { Navigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';

export default function ProtectedRoute({ children, role }) {
  const { user, ready } = useAuth();

  if (!ready) return (
    <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>
  );

  if (!user) return <Navigate to="/login" replace />;

  if (role && user.role !== role) return <Navigate to="/" replace />;

  return children;
}
