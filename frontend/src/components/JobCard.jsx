import { useNavigate } from 'react-router-dom';

const TYPE_STYLES = {
  FULL_TIME:  'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
  PART_TIME:  'bg-amber-500/10  text-amber-400  ring-1 ring-amber-500/20',
  CONTRACT:   'bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20',
  INTERNSHIP: 'bg-pink-500/10   text-pink-400   ring-1 ring-pink-500/20',
  REMOTE:     'bg-brand-500/10  text-brand-400  ring-1 ring-brand-500/20',
};

function MapPinIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}
function SalaryIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
}
function ClockIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}

export default function JobCard({ job }) {
  const navigate = useNavigate();
  const skills = job.requiredSkills ? job.requiredSkills.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <div
      onClick={() => navigate(`/jobs/${job.id}`)}
      className="group relative bg-surface-900 border border-white/[0.07] rounded-2xl p-5 cursor-pointer card-hover
                 hover:border-brand-500/30 hover:shadow-xl hover:shadow-brand-500/5"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-white text-[15px] leading-snug truncate group-hover:text-brand-300 transition-colors">
            {job.title}
          </h3>
          <p className="text-brand-400 text-sm font-medium mt-0.5 truncate">{job.company}</p>
        </div>
        <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full ${TYPE_STYLES[job.jobType] || 'bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/20'}`}>
          {job.jobType?.replace('_', ' ')}
        </span>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 mb-3">
        {job.location && (
          <span className="flex items-center gap-1.5">
            <MapPinIcon />{job.location}
          </span>
        )}
        {(job.minSalary || job.maxSalary) && (
          <span className="flex items-center gap-1.5">
            <SalaryIcon />
            {job.minSalary ? `₹${(job.minSalary/100000).toFixed(1)}L` : ''}
            {job.minSalary && job.maxSalary ? ' – ' : ''}
            {job.maxSalary ? `₹${(job.maxSalary/100000).toFixed(1)}L` : ''}
          </span>
        )}
        {job.experienceYears != null && (
          <span className="flex items-center gap-1.5">
            <ClockIcon />{job.experienceYears}+ yrs exp
          </span>
        )}
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {skills.slice(0, 5).map((s) => (
            <span key={s} className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.05] text-slate-400 font-medium">
              {s}
            </span>
          ))}
          {skills.length > 5 && (
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.05] text-slate-500">
              +{skills.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
        <p className="text-[11px] text-slate-600">
          {job.recruiterName} · {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </p>
        <span className="text-[11px] text-slate-600">{job.applicationCount} applied</span>
      </div>
    </div>
  );
}
