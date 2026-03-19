import { useEffect, useState } from 'react';
import { getAnalytics, getAdminUsers, deleteUser, getAdminJobs, deleteAdminJob } from '../api/admin';

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, gradient, icon }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 border border-white/[0.07] ${gradient}`}>
      <div className="absolute top-3 right-3 opacity-20">{icon}</div>
      <p className="text-xs font-medium text-white/70 mb-1">{label}</p>
      <p className="text-3xl font-bold text-white">{value ?? '—'}</p>
    </div>
  );
}

// ── Bar Chart ─────────────────────────────────────────────────────────────────
function BarChart({ title, data, color = 'bg-brand-500' }) {
  if (!data || Object.keys(data).length === 0)
    return <p className="text-slate-600 text-sm">No data yet.</p>;

  const entries = Object.entries(data);
  const max     = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 mb-4">{title}</p>
      <div className="flex items-end gap-0.5 h-20">
        {entries.map(([label, val]) => (
          <div key={label} className="flex flex-col items-center flex-1 min-w-0 group relative">
            <div
              className={`w-full ${color} rounded-t opacity-80 hover:opacity-100 transition-all`}
              style={{ height: `${(val / max) * 76}px`, minHeight: val > 0 ? '3px' : '0' }}
            />
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] bg-surface-700 text-white px-1.5 py-0.5 rounded
                             opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 pointer-events-none">
              {label}: {val}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1.5 text-[10px] text-slate-700">
        <span>{entries[0]?.[0]}</span>
        <span>{entries[entries.length - 1]?.[0]}</span>
      </div>
    </div>
  );
}

// ── Pill Chart ────────────────────────────────────────────────────────────────
function PillChart({ title, data, colors }) {
  if (!data || Object.keys(data).length === 0) return null;
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 mb-4">{title}</p>
      <div className="space-y-2.5">
        {Object.entries(data).map(([key, val], i) => (
          <div key={key} className="flex items-center gap-3">
            <div className="w-20 text-[11px] text-slate-500 truncate">{key.replace('_', ' ')}</div>
            <div className="flex-1 bg-white/[0.04] rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full ${colors[i % colors.length]} transition-all`}
                style={{ width: `${(val / total) * 100}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-600 w-5 text-right">{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const STATUS_COLORS = ['bg-slate-500','bg-brand-500','bg-amber-500','bg-red-500','bg-emerald-500'];
const TYPE_COLORS   = ['bg-brand-500','bg-purple-500','bg-pink-500','bg-amber-500','bg-emerald-500'];

// ── Role badge ────────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const s = role === 'ADMIN'
    ? 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'
    : role === 'RECRUITER'
    ? 'bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20'
    : 'bg-brand-500/10 text-brand-400 ring-1 ring-brand-500/20';
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${s}`}>{role}</span>;
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [users,     setUsers]     = useState([]);
  const [jobs,      setJobs]      = useState([]);
  const [tab,       setTab]       = useState('overview');
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');

  useEffect(() => {
    Promise.all([getAnalytics(), getAdminUsers(), getAdminJobs()])
      .then(([a, u, j]) => { setAnalytics(a.data); setUsers(u.data); setJobs(j.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    await deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleDeleteJob = async (id) => {
    if (!confirm('Delete this job posting?')) return;
    await deleteAdminJob(id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const filteredUsers = users.filter((u) =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredJobs = jobs.filter((j) =>
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.company?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
    </div>
  );

  const TABS = ['overview', 'users', 'jobs'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Platform overview and management</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/[0.06] mb-6">
        {TABS.map((t) => (
          <button key={t} onClick={() => { setTab(t); setSearch(''); }}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition border-b-2 -mb-px
              ${tab === t ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="Job Seekers"  value={analytics.totalUsers}        gradient="bg-gradient-to-br from-brand-600 to-brand-800"
              icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} />
            <StatCard label="Recruiters"   value={analytics.totalRecruiters}   gradient="bg-gradient-to-br from-purple-600 to-purple-800"
              icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>} />
            <StatCard label="Total Jobs"   value={analytics.totalJobs}         gradient="bg-gradient-to-br from-indigo-600 to-indigo-800"
              icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>} />
            <StatCard label="Active Jobs"  value={analytics.activeJobs}        gradient="bg-gradient-to-br from-emerald-600 to-emerald-800"
              icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><polyline points="20 6 9 17 4 12"/></svg>} />
            <StatCard label="Applications" value={analytics.totalApplications} gradient="bg-gradient-to-br from-orange-600 to-orange-800"
              icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>} />
            <StatCard label="Resumes"      value={analytics.totalResumes}      gradient="bg-gradient-to-br from-pink-600 to-pink-800"
              icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Registrations — last 30 days', data: analytics.registrationsPerDay, color: 'bg-brand-500' },
              { title: 'Applications — last 30 days',  data: analytics.applicationsPerDay,  color: 'bg-purple-500' },
            ].map(({ title, data, color }) => (
              <div key={title} className="bg-surface-900 border border-white/[0.07] rounded-2xl p-5">
                <BarChart title={title} data={data} color={color} />
              </div>
            ))}
            <div className="bg-surface-900 border border-white/[0.07] rounded-2xl p-5">
              <PillChart title="Applications by Status" data={analytics.applicationsByStatus} colors={STATUS_COLORS} />
            </div>
            <div className="bg-surface-900 border border-white/[0.07] rounded-2xl p-5">
              <PillChart title="Jobs by Type" data={analytics.jobsByType} colors={TYPE_COLORS} />
            </div>
          </div>
        </div>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-slate-600">{filteredUsers.length} users</p>
            <div className="relative">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users…"
                className="bg-surface-800 border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 w-56 transition focus:border-brand-500/50" />
            </div>
          </div>

          <div className="bg-surface-900 border border-white/[0.07] rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-white/[0.06]">
                <tr>
                  {['Name', 'Email', 'Role', 'Skills', 'Apps', 'Resume', 'Joined', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3 font-medium text-white text-sm">{u.fullName}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{u.email}</td>
                    <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                    <td className="px-4 py-3 text-slate-600 text-xs max-w-[120px] truncate">{u.skills || '—'}</td>
                    <td className="px-4 py-3 text-center text-slate-400 text-sm">{u.applicationCount}</td>
                    <td className="px-4 py-3 text-center">
                      {u.hasResume
                        ? <span className="text-emerald-400 text-xs font-semibold">Yes</span>
                        : <span className="text-slate-700 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDeleteUser(u.id)}
                        className="text-[11px] font-semibold text-red-500 hover:text-red-400 transition">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <p className="text-center py-10 text-slate-600 text-sm">No users found.</p>
            )}
          </div>
        </div>
      )}

      {/* Jobs tab */}
      {tab === 'jobs' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-slate-600">{filteredJobs.length} jobs</p>
            <div className="relative">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search jobs…"
                className="bg-surface-800 border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 w-56 transition focus:border-brand-500/50" />
            </div>
          </div>

          <div className="bg-surface-900 border border-white/[0.07] rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-white/[0.06]">
                <tr>
                  {['Title', 'Company', 'Type', 'Location', 'Recruiter', 'Apps', 'Status', 'Posted', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredJobs.map((j) => (
                  <tr key={j.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3 font-medium text-white text-sm">{j.title}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{j.company}</td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] bg-white/[0.05] text-slate-400 px-2 py-0.5 rounded-md font-medium">
                        {j.jobType?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{j.location || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{j.recruiterName}</td>
                    <td className="px-4 py-3 text-center text-slate-400 text-sm">{j.applicationCount}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full
                        ${j.active ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' : 'bg-slate-500/10 text-slate-500'}`}>
                        {j.active ? 'Active' : 'Closed'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{new Date(j.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDeleteJob(j.id)}
                        className="text-[11px] font-semibold text-red-500 hover:text-red-400 transition">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredJobs.length === 0 && (
              <p className="text-center py-10 text-slate-600 text-sm">No jobs found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
