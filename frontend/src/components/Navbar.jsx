import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/authStore';

function BriefcaseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="12"/>
    </svg>
  );
}

function NavLink({ to, children }) {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== '/' && pathname.startsWith(to));
  return (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
        ${active
          ? 'bg-brand-500/15 text-brand-400'
          : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
        }`}
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); setMenuOpen(false); };

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] glass bg-surface-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:shadow-brand-500/40 transition-shadow">
            <BriefcaseIcon />
          </div>
          <span className="font-bold text-sm tracking-tight text-white">JobPortal</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1">
          <NavLink to="/jobs">Browse Jobs</NavLink>
          {user?.role === 'USER'      && <NavLink to="/profile">Profile</NavLink>}
          {user?.role === 'RECRUITER' && <NavLink to="/dashboard">Dashboard</NavLink>}
          {user?.role === 'ADMIN'     && <NavLink to="/admin">Admin</NavLink>}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {!user ? (
            <>
              <Link to="/login"
                className="hidden sm:block px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-white transition">
                Sign in
              </Link>
              <Link to="/register"
                className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition shadow-lg shadow-brand-600/20">
                Get started
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-white/5 transition group"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                  {initials}
                </div>
                <span className="hidden sm:block text-sm font-medium text-slate-300 group-hover:text-white transition">
                  {user.fullName?.split(' ')[0]}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 z-20 rounded-xl border border-white/10 bg-surface-900 shadow-2xl shadow-black/40 animate-fade-in overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/[0.06]">
                      <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="p-1">
                      {user?.role === 'USER'      && <DropdownLink to="/profile"   onClick={() => setMenuOpen(false)}>Profile</DropdownLink>}
                      {user?.role === 'RECRUITER' && <DropdownLink to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</DropdownLink>}
                      {user?.role === 'ADMIN'     && <DropdownLink to="/admin"     onClick={() => setMenuOpen(false)}>Admin Panel</DropdownLink>}
                      <DropdownLink to="/jobs" onClick={() => setMenuOpen(false)}>Browse Jobs</DropdownLink>
                    </div>
                    <div className="p-1 border-t border-white/[0.06]">
                      <button onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition">
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function DropdownLink({ to, children, onClick }) {
  return (
    <Link to={to} onClick={onClick}
      className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition">
      {children}
    </Link>
  );
}
