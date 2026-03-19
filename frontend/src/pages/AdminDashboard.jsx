import { useEffect, useState } from 'react';
import { getAnalytics, getAdminUsers, deleteUser, getAdminJobs, deleteAdminJob } from '../api/admin';

// ── Tiny reusable components ──────────────────────────────────────────────────

function StatCard({ label, value, color }) {
  return (
    <div className={`rounded-2xl p-5 text-white shadow-sm ${color}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="text-4xl font-bold mt-1">{value ?? '—'}</p>
    </div>
  );
}

function BarChart({ title, data }) {
  if (!data || Object.keys(data).length === 0)
    return <p className="text-gray-400 text-sm">No data yet.</p>;

  const max    = Math.max(...Object.values(data), 1);
  const entries = Object.entries(data);

  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-3">{title}</p>
      <div className="flex items-end gap-1 h-24">
        {entries.map(([label, val]) => (
          <div key={label} className="flex flex-col items-center flex-1 min-w-0 group relative">
            <div
              className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-all"
              style={{ height: `${(val / max) * 88}px` }}
            />
            {/* Tooltip */}
            <span className="absolute -top-6 text-xs bg-gray-800 text-white px-1.5 py-0.5 rounded
                             opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
              {label}: {val}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-400">
        <span>{entries[0]?.[0]}</span>
        <span>{entries[entries.length - 1]?.[0]}</span>
      </div>
    </div>
  );
}

function PillChart({ title, data, colors }) {
  if (!data || Object.keys(data).length === 0) return null;
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-3">{title}</p>
      <div className="space-y-2">
        {Object.entries(data).map(([key, val], i) => (
          <div key={key} className="flex items-center gap-2">
            <div className="w-24 text-xs text-gray-600 truncate">{key}</div>
            <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full ${colors[i % colors.length]}`}
                style={{ width: `${(val / total) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-6 text-right">{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const STATUS_PILL_COLORS = [
  'bg-gray-400','bg-blue-400','bg-yellow-400','bg-red-400','bg-green-500',
];
const TYPE_PILL_COLORS = [
  'bg-blue-500','bg-purple-500','bg-pink-500','bg-yellow-500','bg-green-500',
];

// ── Main dashboard ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [users,     setUsers]     = useState([]);
  const [jobs,      setJobs]      = useState([]);
  const [tab,       setTab]       = useState('overview');
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');

  useEffect(() => {
    Promise.all([getAnalytics(), getAdminUsers(), getAdminJobs()])
      .then(([a, u, j]) => {
        setAnalytics(a.data);
        setUsers(u.data);
        setJobs(j.data);
      })
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
    <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>
  );

  const TABS = ['overview', 'users', 'jobs'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Platform overview and management</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map((t) => (
          <button key={t} onClick={() => { setTab(t); setSearch(''); }}
            className={`px-5 py-2.5 text-sm font-medium capitalize transition border-b-2 -mb-px
              ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Overview tab ── */}
      {tab === 'overview' && analytics && (
        <div className="space-y-8">
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label="Job Seekers"   value={analytics.totalUsers}        color="bg-blue-600" />
            <StatCard label="Recruiters"    value={analytics.totalRecruiters}   color="bg-purple-600" />
            <StatCard label="Total Jobs"    value={analytics.totalJobs}         color="bg-indigo-600" />
            <StatCard label="Active Jobs"   value={analytics.activeJobs}        color="bg-green-600" />
            <StatCard label="Applications"  value={analytics.totalApplications} color="bg-orange-500" />
            <StatCard label="Resumes"       value={analytics.totalResumes}      color="bg-pink-600" />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <BarChart title="Registrations — last 30 days" data={analytics.registrationsPerDay} />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <BarChart title="Applications — last 30 days" data={analytics.applicationsPerDay} />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <PillChart title="Applications by Status" data={analytics.applicationsByStatus} colors={STATUS_PILL_COLORS} />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <PillChart title="Jobs by Type" data={analytics.jobsByType} colors={TYPE_PILL_COLORS} />
            </div>
          </div>
        </div>
      )}

      {/* ── Users tab ── */}
      {tab === 'users' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">{filteredUsers.length} users</p>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64
                         focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  {['Name', 'Email', 'Role', 'Skills', 'Apps', 'Resume', 'Joined', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.fullName}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                        ${u.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                          u.role === 'RECRUITER' ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                      {u.skills || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">{u.applicationCount}</td>
                    <td className="px-4 py-3 text-center">
                      {u.hasResume ? '✅' : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDeleteUser(u.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium transition">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <p className="text-center py-10 text-gray-400 text-sm">No users found.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Jobs tab ── */}
      {tab === 'jobs' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">{filteredJobs.length} jobs</p>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or company…"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64
                         focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  {['Title', 'Company', 'Type', 'Location', 'Recruiter', 'Apps', 'Status', 'Posted', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredJobs.map((j) => (
                  <tr key={j.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">{j.title}</td>
                    <td className="px-4 py-3 text-gray-500">{j.company}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {j.jobType?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{j.location || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{j.recruiterName}</td>
                    <td className="px-4 py-3 text-center">{j.applicationCount}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                        ${j.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {j.active ? 'Active' : 'Closed'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(j.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDeleteJob(j.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium transition">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredJobs.length === 0 && (
              <p className="text-center py-10 text-gray-400 text-sm">No jobs found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
