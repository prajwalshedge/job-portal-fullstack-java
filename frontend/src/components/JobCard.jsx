import { useNavigate } from 'react-router-dom';

const TYPE_COLORS = {
  FULL_TIME:  'bg-green-100 text-green-700',
  PART_TIME:  'bg-yellow-100 text-yellow-700',
  CONTRACT:   'bg-purple-100 text-purple-700',
  INTERNSHIP: 'bg-pink-100 text-pink-700',
  REMOTE:     'bg-blue-100 text-blue-700',
};

export default function JobCard({ job }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/jobs/${job.id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 cursor-pointer
                 hover:shadow-md hover:border-blue-200 transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg leading-tight">{job.title}</h3>
          <p className="text-blue-600 font-medium text-sm mt-0.5">{job.company}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${TYPE_COLORS[job.jobType] || 'bg-gray-100 text-gray-600'}`}>
          {job.jobType?.replace('_', ' ')}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
        {job.location && <span>📍 {job.location}</span>}
        {(job.minSalary || job.maxSalary) && (
          <span>
            💰 {job.minSalary ? `₹${job.minSalary.toLocaleString()}` : ''}
            {job.minSalary && job.maxSalary ? ' – ' : ''}
            {job.maxSalary ? `₹${job.maxSalary.toLocaleString()}` : ''}
          </span>
        )}
        {job.experienceYears != null && <span>🧑‍💻 {job.experienceYears}+ yrs</span>}
      </div>

      {job.requiredSkills && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.requiredSkills.split(',').slice(0, 5).map((s) => (
            <span key={s} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
              {s.trim()}
            </span>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-gray-400">
        Posted by {job.recruiterName} · {new Date(job.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}
