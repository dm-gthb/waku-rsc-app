import { Link } from 'waku';
import { Project } from '../db/types';

type ProjectWithProgress = Project & {
  progress: number | null;
  tasks?: any[];
};

export function ProjectList({ projects }: { projects: Array<ProjectWithProgress> }) {
  return (
    <>
      <div className="mb-6">
        <div className="grid grid-cols-13 border-b border-gray-200 -mx-8">
          <Line className="col-span-4">Name</Line>
          <Line className="col-span-3">Priority</Line>
          <Line className="col-span-3">Target Date</Line>
          <Line className="col-span-3">Status</Line>
        </div>

        <div className="flex flex-col -mx-8">
          {projects.map(({ id, title, priority, targetDate, progress }) => (
            <Link
              key={id}
              to={`/project/${id}`}
              className="grid grid-cols-13 hover:bg-gray-50 border-b border-gray-100"
            >
              <Line className="col-span-4">{title}</Line>
              <Line className={`col-span-3 ${getPriorityColor(priority)} font-medium`}>
                {priority}
              </Line>
              <Line className="col-span-3 whitespace-nowrap">
                {targetDate
                  ? new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric',
                    }).format(new Date(targetDate))
                  : ''}
              </Line>
              <Line className="col-span-3">
                {progress !== null ? (
                  <span
                    className={`inline-block min-w-12 py-1 px-2 rounded-full text-xs font-medium ${getProgressColor(progress)}`}
                  >
                    {progress}%
                  </span>
                ) : (
                  <span className="text-gray-500">N/A</span>
                )}
              </Line>
            </Link>
          ))}
        </div>
      </div>
      <Link
        to="/create-project"
        className="cursor-pointer min-w-24 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 ml-4 rounded"
      >
        + Add Project
      </Link>
    </>
  );
}

function Line({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex-1 py-3 px-12 ${className}`} style={{ minWidth: 0 }}>
      {children}
    </div>
  );
}

function getPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'text-red-600';
    case 'medium':
      return 'text-amber-600';
    case 'low':
      return 'text-green-600';
    default:
      return '';
  }
}

function getProgressColor(progress: number): string {
  if (progress === 100) return 'bg-green-100 text-green-800';
  if (progress >= 50) return 'bg-blue-100 text-blue-800';
  if (progress > 0) return 'bg-amber-100 text-amber-800';
  return 'bg-gray-100 text-gray-800';
}
