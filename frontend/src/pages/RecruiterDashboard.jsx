import { useEffect, useState } from 'react';
import { getMyJobs, createJob, deleteJob } from '../api/jobs';
import { getJobApplications, updateStatus } from '../api/applications';

const STATUSES = ['PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'HIRED'];

const STATUS_STYLES = {
  PENDING:     'bg-slate-500/10  text-slate-400  ring-1 ring-slate-500/20',
  REVIEWED:    'bg-brand-500/10  text-brand-400  ring-1 ring-brand-500/20',
  SHORTLISTED: 'bg-amber-500/10  text-amber-400  ring-1 ring-amber-500/20',
  REJECTED:    'bg-red-500/10    text-red-400    ring-1 ring-red-500/20',
  HIRED:       'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
};

const EMPTY_FORM = {
  title: '', description: '', company: '', location: '',
  minSalary: '', maxSalary: '', requiredSkills: '', experienceYears: '',
  jobType: 'FULL_TIME',
};

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-surface-800 border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 transition focus:border-brand-500/50";

export default function RecruiterDashboard() {
  const [jobs, setJobs]                 = useState([]);
  const [selectedJob, setSelectedJob]   = useState(null);
  const [applications, setApplications] = useState([]);
  const [showForm, setShowForm]         = useState(false);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [posting, setPosting]           = useState(false);
  const [tab, setTab]                   = useState('jobs');

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = () => getMyJobs().then((r) => setJobs(r.data)).catch(() => {});

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
      await createJob({
        ...form,
        minSalary:       form.minSalary       ? Number(form.minSalary)       : null,
        maxSalary:       form.maxSalary       ? Number(form.maxSalary)       : null,
        experienceYears: form.experienceYears ? Number(form.experienceYears) : null,
      });
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

  const totalApplicants = jobs.reduce((s, j) => s + (j.applicationCount || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Recruiter Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your job postings and applicants</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition shadow-lg
            ${showForm
              ? 'bg-surface-800 border border-white/10 text-slate-400 hover:text-white'
              : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/20'
            }`}>
          {showForm ? (
            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Cancel</>
          ) : (
            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Post Job</>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Active Postings', value: jobs.length },
          { label: 'Total Applicants', value: totalApplicants },
          { label: 'Hired', value: applications.filter(a => a.status === 'HIRED').length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-surface-900 border border-white/[0.07] rounded-2xl px-4 py-3">
            <p className="text-xs text-slate-600">{label}</p>
            <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Post Job Form */}
      {showForm && (
        <form onSubmit={handlePost}
          className="bg-surface-900 border border-white/[0.07] rounded-2xl p-6 mb-6 animate-slide-up">
          <h2 className="text-sm font-semibold text-white mb-5">New Job Posting</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Job Title *">
              <input name="title" value={form.title} onChange={handleFormChange} required className={inputCls} placeholder="e.g. Senior React Developer" />
            </FormField>
            <FormField label="Company *">
              <input name="company" value={form.company} onChange={handleFormChange} required className={inputCls} placeholder="e.g. Acme Corp" />
            </FormField>
            <FormField label="Location">
              <input name="location" value={form.location} onChange={handleFormChange} className={inputCls} placeholder="e.g. Bangalore / Remote" />
            </FormField>
            <FormField label="Required Skills">
              <input name="requiredSkills" value={form.requiredSkills} onChange={handleFormChange} className={inputCls} placeholder="React, Node.js, TypeScript" />
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="Description *">
                <textarea name="description" value={form.description} onChange={handleFormChange} required rows={4}
                  className={`${inputCls} resize-none`} placeholder="Describe the role, responsibilities, and requirements…" />
              </FormField>
            </div>
            <FormField label="Min Salary (₹)">
              <input type="number" name="minSalary" value={form.minSalary} onChange={handleFormChange} min={0} className={inputCls} placeholder="500000" />
            </FormField>
            <FormField label="Max Salary (₹)">
              <input type="number" name="maxSalary" value={form.maxSalary} onChange={handleFormChange} min={0} className={inputCls} placeholder="1200000" />
            </FormField>
            <FormField label="Experience (years)">
              <input type="number" name="experienceYears" value={form.experienceYears} onChange={handleFormChange} min={0} className={inputCls} placeholder="2" />
            </FormField>
            <FormField label="Job Type">
              <select name="jobType" value={form.jobType} onChange={handleFormChange} className={`${inputCls} appearance-none cursor-pointer`}>
                {['FULL_TIME','PART_TIME','CONTRACT','INTERNSHIP','REMOTE'].map((t) => (
                  <option key={t} value={t} className="bg-surface-800">{t.replace('_', ' ')}</option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="flex justify-end mt-5 pt-4 border-t border-white/[0.06]">
            <button type="submit" disabled={posting}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-brand-600/20 disabled:opacity-50">
              {posting ? 'Posting…' : 'Publish Job'}
            </button>
          </div>
        </form>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/[0.06] mb-5">
        {['jobs', 'applications'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition border-b-2 -mb-px
              ${tab === t ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
            {t}{t === 'applications' && selectedJob ? ` — ${selectedJob.title}` : ''}
          </button>
        ))}
      </div>

      {/* Jobs tab */}
      {tab === 'jobs' && (
        <div className="space-y-3">
          {jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-2xl bg-surface-800 border border-white/[0.07] flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-600"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
              </div>
              <p className="text-slate-400 font-medium text-sm">No job postings yet</p>
              <p className="text-slate-600 text-xs mt-1">Click "Post Job" to create your first listing</p>
            </div>
          ) : jobs.map((job) => (
            <div key={job.id}
              className="bg-surface-900 border border-white/[0.07] rounded-2xl px-5 py-4 flex items-center justify-between gap-4 card-hover hover:border-white/10">
              <div className="min-w-0">
                <h3 className="font-semibold text-white text-sm truncate">{job.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {job.company} · {job.location || 'Remote'} ·{' '}
                  <span className="text-slate-400 font-medium">{job.applicationCount} applicant{job.applicationCount !== 1 ? 's' : ''}</span>
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => loadApplications(job)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 transition">
                  View Applicants
                </button>
                <button onClick={() => handleDelete(job.id)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition">
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
          {applications.length === 0 ? (
            <div className="text-center py-20 text-slate-600 text-sm">No applications yet for this job.</div>
          ) : applications.map((app) => (
            <div key={app.id}
              className="bg-surface-900 border border-white/[0.07] rounded-2xl px-5 py-4 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                    {app.applicant?.fullName?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                  <p className="font-semibold text-white text-sm">{app.applicant?.fullName}</p>
                </div>
                <p className="text-xs text-slate-500 ml-9">{app.applicant?.email}</p>
                {app.coverLetter && (
                  <p className="text-xs text-slate-600 mt-2 ml-9 line-clamp-2 leading-relaxed">{app.coverLetter}</p>
                )}
                <p className="text-[11px] text-slate-700 mt-1.5 ml-9">
                  Applied {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[app.status]}`}>
                  {app.status}
                </span>
                <select
                  value={app.status}
                  onChange={(e) => handleStatusChange(app.id, e.target.value)}
                  className="text-xs bg-surface-800 border border-white/[0.08] rounded-lg px-2 py-1.5 text-slate-300 transition focus:border-brand-500/50 cursor-pointer">
                  {STATUSES.map((s) => <option key={s} value={s} className="bg-surface-800">{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
