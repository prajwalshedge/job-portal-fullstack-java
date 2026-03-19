import { Navigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';

/**
 * Two modes:
 *  1. <ProtectedRoute>          — requires any authenticated user
 *  2. <ProtectedRoute role="RECRUITER"> — requires a specific role
 *  3. <ProtectedRoute guestOnly> — redirects logged-in users away (login/register pages)
 */
export default function ProtectedRoute({ children, role, guestOnly }) {
  const { user, ready } = useAuth();

  if (!ready) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      Loading…
    </div>
  );

  // Guest-only pages: redirect authenticated users to their home
  if (guestOnly && user) {
    return <Navigate to={user.role === 'RECRUITER' ? '/dashboard' : '/jobs'} replace />;
  }

  // Protected pages: redirect unauthenticated users to login
  if (!guestOnly && !user) return <Navigate to="/login" replace />;

  // Role-restricted pages: redirect wrong-role users to home
  if (role && user?.role !== role) return <Navigate to="/" replace />;

  return children;
}
