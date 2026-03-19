import { useEffect, useState } from 'react';
import { getMyJobs, createJob, deleteJob } from '../api/jobs';
import { getJobApplications, updateStatus } from '../api/applications';

const STATUSES = ['PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'HIRED'];
const STATUS_COLORS = {
  PENDING:     'bg-gray-100 text-gray-600',
  REVIEWED:    'bg-blue-100 text-blue-600',
  SHORTLISTED: 'bg-yellow-100 text-yellow-700',
  REJECTED:    'bg-red-100 text-red-600',
  HIRED:       'bg-green-100 text-green-700',
};

const EMPTY_FORM = {
  title: '', description: '', company: '', location: '',
  minSalary: '', maxSalary: '', requiredSkills: '', experienceYears: '',
  jobType: 'FULL_TIME',
};

export default function RecruiterDashboard() {
  const [jobs, setJobs]               = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [posting, setPosting]         = useState(false);
  const [tab, setTab]                 = useState('jobs'); // 'jobs' | 'applications'

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = () =>
    getMyJobs().then((r) => setJobs(r.data)).catch(() => {});

  const loadApplications = (job) => {
    setSelectedJob(job);
    setTab('applications');
    getJobApplications(job.id).then((r) => setApplications(r.data)).catch(() => {});
  };

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePost = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      const payload = {
        ...form,
        minSalary:       form.minSalary       ? Number(form.minSalary)       : null,
        maxSalary:       form.maxSalary       ? Number(form.maxSalary)       : null,
        experienceYears: form.experienceYears ? Number(form.experienceYears) : null,
      };
      await createJob(payload);
      setForm(EMPTY_FORM);
      setShowForm(false);
      loadJobs();
    } catch {
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this job posting?')) return;
    await deleteJob(id);
    loadJobs();
    if (selectedJob?.id === id) { setSelectedJob(null); setApplications([]); setTab('jobs'); }
  };

  const handleStatusChange = async (appId, status) => {
    await updateStatus(appId, status);
    setApplications((prev) => prev.map((a) => a.id === appId ? { ...a, status } : a));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruiter Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">{jobs.length} active posting{jobs.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          {showForm ? '✕ Cancel' : '+ Post Job'}
        </button>
      </div>

      {/* Post Job Form */}
      {showForm && (
        <form onSubmit={handlePost}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <h2 className="col-span-full text-lg font-semibold text-gray-800">New Job Posting</h2>

          {[
            { name: 'title',       label: 'Job Title',    required: true },
            { name: 'company',     label: 'Company',      required: true },
            { name: 'location',    label: 'Location' },
            { name: 'requiredSkills', label: 'Required Skills (comma-separated)' },
          ].map(({ name, label, required }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input name={name} value={form[name]} onChange={handleFormChange} required={required}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}

          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleFormChange} required rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary (₹)</label>
            <input type="number" name="minSalary" value={form.minSalary} onChange={handleFormChange} min={0}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary (₹)</label>
            <input type="number" name="maxSalary" value={form.maxSalary} onChange={handleFormChange} min={0}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
            <input type="number" name="experienceYears" value={form.experienceYears} onChange={handleFormChange} min={0}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
            <select name="jobType" value={form.jobType} onChange={handleFormChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {['FULL_TIME','PART_TIME','CONTRACT','INTERNSHIP','REMOTE'].map((t) => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div className="col-span-full flex justify-end">
            <button type="submit" disabled={posting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition disabled:opacity-50">
              {posting ? 'Posting…' : 'Post Job'}
            </button>
          </div>
        </form>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {['jobs', 'applications'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition border-b-2 -mb-px
              ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t}{t === 'applications' && selectedJob ? ` — ${selectedJob.title}` : ''}
          </button>
        ))}
      </div>

      {/* Jobs tab */}
      {tab === 'jobs' && (
        <div className="space-y-3">
          {jobs.length === 0 && (
            <div className="text-center py-16 text-gray-400">No job postings yet. Click "+ Post Job" to get started.</div>
          )}
          {jobs.map((job) => (
            <div key={job.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">{job.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {job.company} · {job.location || 'Remote'} · {job.applicationCount} applicant{job.applicationCount !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => loadApplications(job)}
                  className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg transition font-medium">
                  View Applicants
                </button>
                <button onClick={() => handleDelete(job.id)}
                  className="text-sm bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition font-medium">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Applications tab */}
      {tab === 'applications' && (
        <div className="space-y-3">
          {applications.length === 0 && (
            <div className="text-center py-16 text-gray-400">No applications yet for this job.</div>
          )}
          {applications.map((app) => (
            <div key={app.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-900">{app.applicant?.fullName}</p>
                <p className="text-sm text-gray-500">{app.applicant?.email}</p>
                {app.coverLetter && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{app.coverLetter}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Applied {new Date(app.appliedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[app.status]}`}>
                  {app.status}
                </span>
                <select
                  value={app.status}
                  onChange={(e) => handleStatusChange(app.id, e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
