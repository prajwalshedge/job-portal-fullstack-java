import { useEffect, useRef, useState } from 'react';
import { uploadResume, getResume, deleteResume } from '../api/resume';
import { getMyApplications } from '../api/applications';
import { getMyMatchScore }   from '../api/match';
import { useAuth }           from '../store/authStore';

const VERDICT_STYLES = {
  EXCELLENT: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
  GOOD:      'bg-brand-500/10   text-brand-400   ring-1 ring-brand-500/20',
  FAIR:      'bg-amber-500/10   text-amber-400   ring-1 ring-amber-500/20',
  LOW:       'bg-red-500/10     text-red-400     ring-1 ring-red-500/20',
};

const STATUS_STYLES = {
  PENDING:     'bg-slate-500/10  text-slate-400  ring-1 ring-slate-500/20',
  REVIEWED:    'bg-brand-500/10  text-brand-400  ring-1 ring-brand-500/20',
  SHORTLISTED: 'bg-amber-500/10  text-amber-400  ring-1 ring-amber-500/20',
  REJECTED:    'bg-red-500/10    text-red-400    ring-1 ring-red-500/20',
  HIRED:       'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
};

function SectionCard({ title, action, children }) {
  return (
    <div className="bg-surface-900 border border-white/[0.07] rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function ProfilePage() {
  const { user }                      = useAuth();
  const fileRef                       = useRef();
  const [resume, setResume]           = useState(null);
  const [applications, setApps]       = useState([]);
  const [scores, setScores]           = useState({});
  const [uploading, setUploading]     = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver]       = useState(false);

  useEffect(() => {
    getResume().then((r) => setResume(r.data)).catch(() => {});
    getMyApplications().then((r) => {
      setApps(r.data);
      r.data.forEach((app) => {
        getMyMatchScore(app.job?.id)
          .then((s) => setScores((prev) => ({ ...prev, [app.job?.id]: s.data })))
          .catch(() => {});
      });
    }).catch(() => {});
  }, []);

  const doUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const { data } = await uploadResume(file);
      setResume(data);
    } catch (err) {
      setUploadError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleUpload  = (e) => doUpload(e.target.files?.[0]);
  const handleDrop    = (e) => { e.preventDefault(); setDragOver(false); doUpload(e.dataTransfer.files?.[0]); };
  const handleDelete  = async () => {
    if (!confirm('Remove your resume?')) return;
    await deleteResume();
    setResume(null);
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5 animate-fade-in">

      {/* Profile header */}
      <div className="bg-surface-900 border border-white/[0.07] rounded-2xl p-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-xl shadow-brand-500/20 shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-white truncate">{user?.fullName}</h1>
          <p className="text-slate-500 text-sm truncate">{user?.email}</p>
          <span className="inline-block mt-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 ring-1 ring-brand-500/20">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Resume */}
      <SectionCard
        title="Resume"
        action={
          <button onClick={() => fileRef.current.click()} disabled={uploading}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition disabled:opacity-50">
            {uploading ? 'Uploading…' : resume ? 'Replace' : 'Upload PDF'}
          </button>
        }
      >
        <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleUpload} />

        {uploadError && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p className="text-red-400 text-sm">{uploadError}</p>
          </div>
        )}

        {resume ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-surface-800 border border-white/[0.06] rounded-xl px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{resume.originalFilename}</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {(resume.fileSizeBytes / 1024).toFixed(1)} KB · {new Date(resume.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button onClick={handleDelete}
                className="text-xs text-red-400 hover:text-red-300 font-medium transition shrink-0 ml-3">
                Remove
              </button>
            </div>

            {resume.extractedSkills?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Extracted Skills</p>
                <div className="flex flex-wrap gap-2">
                  {resume.extractedSkills.map((s) => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition
              ${dragOver ? 'border-brand-500/50 bg-brand-500/5' : 'border-white/[0.08] hover:border-white/15 hover:bg-white/[0.02]'}`}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-600 mx-auto mb-3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <p className="text-sm font-medium text-slate-400">Drop your PDF here or click to browse</p>
            <p className="text-xs text-slate-600 mt-1">Max 5 MB · Skills auto-extracted</p>
          </div>
        )}
      </SectionCard>

      {/* Applications */}
      <SectionCard title={`My Applications (${applications.length})`}>
        {applications.length === 0 ? (
          <div className="text-center py-8">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-700 mx-auto mb-3"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
            <p className="text-slate-500 text-sm">No applications yet</p>
            <p className="text-slate-600 text-xs mt-1">Browse jobs and apply to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => {
              const score = scores[app.job?.id];
              return (
                <div key={app.id}
                  className="flex items-center justify-between gap-4 bg-surface-800 border border-white/[0.06] rounded-xl px-4 py-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{app.job?.title}</p>
                    <p className="text-xs text-slate-500 truncate">{app.job?.company}</p>
                    <p className="text-[11px] text-slate-700 mt-0.5">
                      Applied {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[app.status]}`}>
                      {app.status}
                    </span>
                    {score && (
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${VERDICT_STYLES[score.verdict]}`}>
                        {score.score}% match
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
