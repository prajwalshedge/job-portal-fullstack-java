import { useEffect, useState } from 'react';
import { getAllJobs, filterJobs } from '../api/jobs';
import JobCard from '../components/JobCard';

const JOB_TYPES = ['', 'FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE'];

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

  const handleReset = () => {
    const empty = { keyword: '', location: '', minSalary: '', maxSalary: '', skill: '', jobType: '' };
    setFilters(empty);
    fetchJobs(empty);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Next Job</h1>
      <p className="text-gray-500 mb-6">{jobs.length} open position{jobs.length !== 1 ? 's' : ''}</p>

      {/* Filter bar */}
      <form onSubmit={handleSearch}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <input name="keyword" value={filters.keyword} onChange={handleChange}
          placeholder="Keyword…"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2 md:col-span-1" />
        <input name="location" value={filters.location} onChange={handleChange}
          placeholder="Location…"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input name="skill" value={filters.skill} onChange={handleChange}
          placeholder="Skill…"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select name="jobType" value={filters.jobType} onChange={handleChange}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          {JOB_TYPES.map((t) => <option key={t} value={t}>{t ? t.replace('_', ' ') : 'All Types'}</option>)}
        </select>
        <div className="flex gap-2">
          <button type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-3 py-2 transition">
            Search
          </button>
          <button type="button" onClick={handleReset}
            className="flex-1 border border-gray-300 hover:bg-gray-50 text-sm rounded-lg px-3 py-2 transition">
            Reset
          </button>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading jobs…</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No jobs found. Try different filters.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      )}
    </div>
  );
}
