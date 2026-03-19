import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobById } from '../api/jobs';
import { useAuth } from '../store/authStore';
import ApplyModal from '../components/ApplyModal';

export default function JobDetailPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const [job, setJob]           = useState(null);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [applied, setApplied]   = useState(false);

  useEffect(() => {
    getJobById(id)
      .then((r) => setJob(r.data))
      .catch(() => navigate('/jobs'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading…</div>;
  if (!job)    return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={() => navigate('/jobs')}
        className="text-blue-600 hover:underline text-sm mb-6 flex items-center gap-1">
        ← Back to Jobs
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-blue-600 font-semibold mt-1">{job.company}</p>
          </div>
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
            {job.jobType?.replace('_', ' ')}
          </span>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-sm text-gray-600">
          {job.location && (
            <div><p className="text-xs text-gray-400 mb-0.5">Location</p><p className="font-medium">📍 {job.location}</p></div>
          )}
          {(job.minSalary || job.maxSalary) && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Salary</p>
              <p className="font-medium">
                💰 {job.minSalary ? `₹${job.minSalary.toLocaleString()}` : ''}
                {job.minSalary && job.maxSalary ? ' – ' : ''}
                {job.maxSalary ? `₹${job.maxSalary.toLocaleString()}` : ''}
              </p>
            </div>
          )}
          {job.experienceYears != null && (
            <div><p className="text-xs text-gray-400 mb-0.5">Experience</p><p className="font-medium">🧑‍💻 {job.experienceYears}+ years</p></div>
          )}
          {job.deadline && (
            <div><p className="text-xs text-gray-400 mb-0.5">Deadline</p><p className="font-medium">📅 {new Date(job.deadline).toLocaleDateString()}</p></div>
          )}
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="font-semibold text-gray-800 mb-2">Job Description</h2>
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
        </div>

        {/* Skills */}
        {job.requiredSkills && (
          <div className="mb-6">
            <h2 className="font-semibold text-gray-800 mb-2">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.split(',').map((s) => (
                <span key={s} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                  {s.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 mb-6">
          Posted by {job.recruiterName} · {new Date(job.createdAt).toLocaleDateString()}
          {' · '}{job.applicationCount} applicant{job.applicationCount !== 1 ? 's' : ''}
        </p>

        {/* CTA */}
        {applied ? (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm font-medium">
            ✅ Application submitted successfully!
          </div>
        ) : user?.role === 'USER' ? (
          <button onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition">
            Apply Now
          </button>
        ) : !user ? (
          <button onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition">
            Login to Apply
          </button>
        ) : null}
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
