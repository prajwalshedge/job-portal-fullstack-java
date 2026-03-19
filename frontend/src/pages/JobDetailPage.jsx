import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobById } from '../api/jobs';
import { useAuth } from '../store/authStore';
import ApplyModal from '../components/ApplyModal';

const TYPE_STYLES = {
  FULL_TIME:  'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
  PART_TIME:  'bg-amber-500/10  text-amber-400  ring-1 ring-amber-500/20',
  CONTRACT:   'bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20',
  INTERNSHIP: 'bg-pink-500/10   text-pink-400   ring-1 ring-pink-500/20',
  REMOTE:     'bg-brand-500/10  text-brand-400  ring-1 ring-brand-500/20',
};

function MetaItem({ icon, label, value }) {
  return (
    <div className="bg-surface-800 border border-white/[0.06] rounded-xl p-3">
      <p className="text-[11px] text-slate-600 mb-1 flex items-center gap-1.5">{icon}{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export default function JobDetailPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const [job, setJob]             = useState(null);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [applied, setApplied]     = useState(false);

  useEffect(() => {
    getJobById(id)
      .then((r) => setJob(r.data))
      .catch(() => navigate('/jobs'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
    </div>
  );
  if (!job) return null;

  const skills = job.requiredSkills ? job.requiredSkills.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate('/jobs')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition mb-6 group">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className="group-hover:-translate-x-0.5 transition-transform">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back to jobs
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header card */}
          <div className="bg-surface-900 border border-white/[0.07] rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h1 className="text-xl font-bold text-white leading-tight">{job.title}</h1>
                <p className="text-brand-400 font-semibold mt-1">{job.company}</p>
              </div>
              <span className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full ${TYPE_STYLES[job.jobType] || 'bg-slate-500/10 text-slate-400'}`}>
                {job.jobType?.replace('_', ' ')}
              </span>
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {job.location && (
                <MetaItem
                  icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
                  label="Location" value={job.location}
                />
              )}
              {(job.minSalary || job.maxSalary) && (
                <MetaItem
                  icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
                  label="Salary"
                  value={`${job.minSalary ? `₹${(job.minSalary/100000).toFixed(1)}L` : ''}${job.minSalary && job.maxSalary ? ' – ' : ''}${job.maxSalary ? `₹${(job.maxSalary/100000).toFixed(1)}L` : ''}`}
                />
              )}
              {job.experienceYears != null && (
                <MetaItem
                  icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                  label="Experience" value={`${job.experienceYears}+ years`}
                />
              )}
              {job.deadline && (
                <MetaItem
                  icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                  label="Deadline" value={new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                />
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-surface-900 border border-white/[0.07] rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-3">Job Description</h2>
            <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="bg-surface-900 border border-white/[0.07] rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-white mb-3">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s} className="text-xs px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Apply card */}
          <div className="bg-surface-900 border border-white/[0.07] rounded-2xl p-5 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-slate-600">{job.applicationCount} applicant{job.applicationCount !== 1 ? 's' : ''}</span>
              <span className="text-xs text-slate-600">
                {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            </div>

            {applied ? (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                <p className="text-emerald-400 text-sm font-medium">Application submitted!</p>
              </div>
            ) : user?.role === 'USER' ? (
              <button onClick={() => setShowModal(true)}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold
                           transition shadow-lg shadow-brand-600/20">
                Apply Now
              </button>
            ) : !user ? (
              <button onClick={() => navigate('/login')}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold
                           transition shadow-lg shadow-brand-600/20">
                Sign in to Apply
              </button>
            ) : null}

            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <p className="text-xs text-slate-600">Posted by</p>
              <p className="text-sm font-medium text-slate-300 mt-0.5">{job.recruiterName}</p>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <ApplyModal
          job={job}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); setApplied(true); }}
        />
      )}
    </div>
  );
}
