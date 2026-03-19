import { useEffect, useRef, useState } from 'react';
import { uploadResume, getResume, deleteResume } from '../api/resume';
import { getMyApplications } from '../api/applications';
import { getMyMatchScore }   from '../api/match';
import { useAuth }           from '../store/authStore';

const VERDICT_COLORS = {
  EXCELLENT: 'bg-green-100 text-green-700',
  GOOD:      'bg-blue-100 text-blue-700',
  FAIR:      'bg-yellow-100 text-yellow-700',
  LOW:       'bg-red-100 text-red-600',
};

const STATUS_COLORS = {
  PENDING:     'bg-gray-100 text-gray-600',
  REVIEWED:    'bg-blue-100 text-blue-600',
  SHORTLISTED: 'bg-yellow-100 text-yellow-700',
  REJECTED:    'bg-red-100 text-red-600',
  HIRED:       'bg-green-100 text-green-700',
};

export default function ProfilePage() {
  const { user }                    = useAuth();
  const fileRef                     = useRef();
  const [resume, setResume]         = useState(null);
  const [applications, setApps]     = useState([]);
  const [scores, setScores]         = useState({});   // jobId → matchScore
  const [uploading, setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    getResume().then((r) => setResume(r.data)).catch(() => {});
    getMyApplications().then((r) => {
      setApps(r.data);
      // Fetch match score for each application
      r.data.forEach((app) => {
        getMyMatchScore(app.job?.id)
          .then((s) => setScores((prev) => ({ ...prev, [app.job?.id]: s.data })))
          .catch(() => {});
      });
    }).catch(() => {});
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
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

  const handleDelete = async () => {
    if (!confirm('Remove your resume?')) return;
    await deleteResume();
    setResume(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

      {/* User info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">{user?.fullName}</h1>
        <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
        <span className="inline-block mt-2 bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          {user?.role}
        </span>
      </div>

      {/* Resume section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Resume</h2>
          <button onClick={() => fileRef.current.click()}
            disabled={uploading}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50">
            {uploading ? 'Uploading…' : resume ? 'Replace Resume' : 'Upload Resume'}
          </button>
          <input ref={fileRef} type="file" accept="application/pdf"
            className="hidden" onChange={handleUpload} />
        </div>

        {uploadError && <p className="text-red-500 text-sm mb-3">{uploadError}</p>}

        {resume ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">📄 {resume.originalFilename}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {(resume.fileSizeBytes / 1024).toFixed(1)} KB ·
                  Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <button onClick={handleDelete}
                className="text-red-500 hover:text-red-700 text-sm font-medium transition">
                Remove
              </button>
            </div>

            {resume.extractedSkills?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Extracted Skills</p>
                <div className="flex flex-wrap gap-2">
                  {resume.extractedSkills.map((s) => (
                    <span key={s} className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No resume uploaded yet. Upload a PDF to auto-extract your skills.</p>
        )}
      </div>

      {/* Applications */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          My Applications <span className="text-gray-400 font-normal text-base">({applications.length})</span>
        </h2>

        {applications.length === 0 ? (
          <p className="text-gray-400 text-sm">You haven't applied to any jobs yet.</p>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => {
              const score = scores[app.job?.id];
              return (
                <div key={app.id}
                  className="border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{app.job?.title}</p>
                    <p className="text-sm text-gray-500">{app.job?.company}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Applied {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[app.status]}`}>
                      {app.status}
                    </span>
                    {score && (
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${VERDICT_COLORS[score.verdict]}`}>
                        {score.score}% match
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
