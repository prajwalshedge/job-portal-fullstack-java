import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="bg-blue-700 text-white px-6 py-3 flex items-center justify-between shadow">
      <Link to="/" className="text-xl font-bold tracking-wide">💼 Job Portal</Link>

      <div className="flex items-center gap-5 text-sm font-medium">
        <Link to="/jobs" className="hover:text-blue-200 transition">Jobs</Link>

        {!user && (
          <>
            <Link to="/login"    className="hover:text-blue-200 transition">Login</Link>
            <Link to="/register" className="bg-white text-blue-700 px-3 py-1 rounded hover:bg-blue-100 transition">
              Register
            </Link>
          </>
        )}

        {user?.role === 'USER'      && <Link to="/profile"   className="hover:text-blue-200 transition">Profile</Link>}
        {user?.role === 'RECRUITER' && <Link to="/dashboard" className="hover:text-blue-200 transition">Dashboard</Link>}
        {user?.role === 'ADMIN'     && <Link to="/admin"     className="hover:text-blue-200 transition">Admin</Link>}

        {user && (
          <div className="flex items-center gap-3">
            <span className="text-blue-200">Hi, {user.fullName?.split(' ')[0]}</span>
            <button onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
