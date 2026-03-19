import { useEffect, useState } from 'react';
import { getAllJobs, filterJobs } from '../api/jobs';
import JobCard from '../components/JobCard';

const JOB_TYPES = ['', 'FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE'];

function SkeletonCard() {
  return (
    <div className="bg-surface-900 border border-white/[0.07] rounded-2xl p-5 space-y-3">
      <div className="flex justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-white/5 rounded-lg w-3/4 animate-pulse" />
          <div className="h-3 bg-white/5 rounded-lg w-1/2 animate-pulse" />
        </div>
        <div className="h-6 w-20 bg-white/5 rounded-full animate-pulse" />
      </div>
      <div className="flex gap-3">
        <div className="h-3 bg-white/5 rounded w-24 animate-pulse" />
        <div className="h-3 bg-white/5 rounded w-20 animate-pulse" />
      </div>
      <div className="flex gap-1.5">
        {[1,2,3].map(i => <div key={i} className="h-5 w-14 bg-white/5 rounded-md animate-pulse" />)}
      </div>
    </div>
  );
}

function FilterInput({ icon, ...props }) {
  return (
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">{icon}</span>}
      <input
        {...props}
        className={`w-full bg-surface-800 border border-white/[0.07] rounded-xl py-2.5 text-sm text-slate-200
                   placeholder:text-slate-600 transition focus:border-brand-500/40
                   ${icon ? 'pl-9 pr-3' : 'px-3'}`}
      />
    </div>
  );
}

export default function JobsPage() {
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: '', location: '', minSalary: '', maxSalary: '', skill: '', jobType: '',
  });

  const fetchJobs = async (params) => {
    setLoading(true);
    try {
      const active = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== ''));
      const { data } = Object.keys(active).length ? await filterJobs(active) : await getAllJobs();
      setJobs(data);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(filters); }, []);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleSearch = (e) => { e.preventDefault(); fetchJobs(filters); };
  const handleReset  = () => {
    const empty = { keyword: '', location: '', minSalary: '', maxSalary: '', skill: '', jobType: '' };
    setFilters(empty);
    fetchJobs(empty);
  };

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="flex-1">
      {/* Hero */}
      <div className="relative border-b border-white/[0.06] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-48 bg-brand-600/8 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-3 py-1 text-xs font-medium text-brand-400 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              {loading ? '…' : jobs.length} open positions
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              Find your next<br />
              <span className="gradient-text">dream role</span>
            </h1>
            <p className="text-slate-500 mt-3 text-sm leading-relaxed">
              Browse curated opportunities from top companies. Filter by skills, location, and salary.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filter bar */}
        <form onSubmit={handleSearch}
          className="bg-surface-900 border border-white/[0.07] rounded-2xl p-4 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <FilterInput
              name="keyword" value={filters.keyword} onChange={handleChange}
              placeholder="Role, keyword…"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>}
              className="lg:col-span-2"
            />
            <FilterInput
              name="location" value={filters.location} onChange={handleChange}
              placeholder="Location…"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
            />
            <FilterInput
              name="skill" value={filters.skill} onChange={handleChange}
              placeholder="Skill…"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>}
            />
            <div className="relative">
              <select name="jobType" value={filters.jobType} onChange={handleChange}
                className="w-full bg-surface-800 border border-white/[0.07] rounded-xl px-3 py-2.5 text-sm text-slate-400
                           transition focus:border-brand-500/40 appearance-none cursor-pointer">
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-surface-800">
                    {t ? t.replace('_', ' ') : 'All Types'}
                  </option>
                ))}
              </select>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            <div className="flex gap-2">
              <button type="submit"
                className="flex-1 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl px-3 py-2.5 transition shadow-lg shadow-brand-600/20">
                Search
              </button>
              {hasFilters && (
                <button type="button" onClick={handleReset}
                  className="px-3 py-2.5 text-sm rounded-xl border border-white/[0.07] text-slate-500 hover:text-white hover:bg-white/5 transition">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-surface-800 border border-white/[0.07] flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-600"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <p className="text-slate-400 font-medium">No jobs found</p>
            <p className="text-slate-600 text-sm mt-1">Try adjusting your filters</p>
            {hasFilters && (
              <button onClick={handleReset}
                className="mt-4 text-sm text-brand-400 hover:text-brand-300 transition">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-600 mb-4">{jobs.length} result{jobs.length !== 1 ? 's' : ''}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
              {jobs.map((job) => <JobCard key={job.id} job={job} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
