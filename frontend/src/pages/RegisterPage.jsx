import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerApi } from '../api/auth';
import { useAuth } from '../store/authStore';

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-400 mb-1.5">{label}</label>
      <input
        {...props}
        className="w-full bg-surface-800 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white
                   placeholder:text-slate-600 transition focus:border-brand-500/50"
      />
    </div>
  );
}

const ROLES = [
  {
    value: 'USER',
    label: 'Job Seeker',
    desc: 'Find and apply to jobs',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    value: 'RECRUITER',
    label: 'Recruiter',
    desc: 'Post jobs and hire talent',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      </svg>
    ),
  },
];

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ fullName: '', email: '', password: '', role: 'USER' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await registerApi(form);
      login({ accessToken: data.accessToken, refreshToken: data.refreshToken },
            { email: data.email, fullName: data.fullName, role: data.role });
      navigate(data.role === 'RECRUITER' ? '/dashboard' : '/jobs');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-slide-up">
        <div className="flex justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-xl shadow-brand-500/30">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
            </svg>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
          <p className="text-slate-500 text-sm mt-1.5">Join thousands of professionals on JobPortal</p>
        </div>

        <div className="bg-surface-900 border border-white/[0.07] rounded-2xl p-6 shadow-2xl shadow-black/40">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full name" type="text" name="fullName" required
              value={form.fullName} onChange={handleChange} placeholder="Jane Smith" />
            <Input label="Email address" type="email" name="email" required
              value={form.email} onChange={handleChange} placeholder="you@example.com" />
            <Input label="Password" type="password" name="password" required minLength={6}
              value={form.password} onChange={handleChange} placeholder="Min. 6 characters" />

            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">I am a…</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition
                      ${form.role === r.value
                        ? 'border-brand-500/50 bg-brand-500/10 text-brand-300'
                        : 'border-white/[0.07] bg-surface-800 text-slate-500 hover:border-white/15 hover:text-slate-300'
                      }`}
                  >
                    <span className={form.role === r.value ? 'text-brand-400' : ''}>{r.icon}</span>
                    <span className="text-xs font-semibold">{r.label}</span>
                    <span className="text-[10px] opacity-70">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold
                         transition shadow-lg shadow-brand-600/20 disabled:opacity-50">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12"/></svg>
                  Creating account…
                </span>
              ) : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-600 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
