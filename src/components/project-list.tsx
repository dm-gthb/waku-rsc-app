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
        <div className="flex border-b border-gray-200 -mx-8">
          {['Name', 'Priority', 'Target Date', 'Status'].map((title) => (
            <Line key={title}>{title}</Line>
          ))}
        </div>

        <div className="flex flex-col -mx-8">
          {projects.map(({ id, title, priority, targetDate, progress }) => (
            <Link key={id} to={`/project/${id}/tasks`} className="flex hover:bg-gray-50 ">
              <Line>{title}</Line>
              <Line>{priority}</Line>
              <Line>
                {targetDate
                  ? new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric',
                    }).format(new Date(targetDate))
                  : ''}
              </Line>
              <Line>{progress !== null ? `${progress}%` : 'N/A'}</Line>
            </Link>
          ))}
        </div>
      </div>
      <Link
        to="/create-project"
        className="cursor-pointer min-w-24 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
      >
        + Add Project
      </Link>
    </>
  );
}

function Line({ children }: { children: string }) {
  return <div className="flex-1 py-3 px-8">{children}</div>;
}
