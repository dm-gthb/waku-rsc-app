import { Link } from 'waku';
import { ProjectWithTasks, Task } from '../db/types';

export function ProjectList({ projects }: { projects: Array<ProjectWithTasks> }) {
  const projectsWithProgress = projects.map((project) => ({
    ...project,
    progress: calculateProjectProgress(project.tasks),
  }));

  return (
    <>
      {projectsWithProgress.length > 0 ? (
        <div className="mb-4 border border-gray-200 rounded">
          <div className="grid grid-cols-13 border-b border-gray-200 bg-gray-50">
            <Line className="col-span-4">Name</Line>
            <Line className="col-span-3">Priority</Line>
            <Line className="col-span-3">Target Date</Line>
            <Line className="col-span-3">Status</Line>
          </div>

          <div className="flex flex-col">
            {projectsWithProgress.map(({ id, title, priority, targetDate, progress }) => (
              <Link
                key={id}
                to={`/project/${id}`}
                className="grid grid-cols-13 hover:bg-gray-50 border-b border-gray-100"
                unstable_prefetchOnEnter
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
      ) : (
        <p className="mb-4">
          No projects yet. To create your first project, click the button below.
        </p>
      )}
      <Link
        to="/project/create"
        className="inline-block cursor-pointer min-w-24 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
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
  return <div className={`p-3 ${className}`}>{children}</div>;
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

function calculateProjectProgress(tasks: Task[]): number | null {
  if (!tasks || tasks.length === 0) {
    return null;
  }

  const completedTasks = tasks.filter((task) => task.completedAt !== null);
  return Math.round((completedTasks.length / tasks.length) * 100);
}
