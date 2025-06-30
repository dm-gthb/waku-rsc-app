'use client';

import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Link, useRouter } from 'waku';

export function Breadcrumbs() {
  const router = useRouter();

  const isTasksPage = router.path.includes('/tasks');
  const isTaskDetailPage = isTasksPage && router.path.split('/').length > 4;
  const isSubtaskPage = isTasksPage && router.path.split('/').length > 5;

  const pathSegments = router.path.split('/').filter(Boolean);
  const projectId =
    pathSegments.length >= 2 && pathSegments[0] === 'project' ? pathSegments[1] : '';
  const taskId =
    pathSegments.length >= 4 && pathSegments[2] === 'tasks' ? pathSegments[3] : '';

  return (
    <div className="border-b border-gray-200 pb-2">
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li className="flex items-center">
            <Link to="/" className="text-gray-600 hover:text-gray-900 hover:underline">
              Projects
            </Link>
          </li>

          {isTasksPage && (
            <li className="flex items-center">
              <ChevronRightIcon className="w-4 h-4 text-gray-500 mx-1" />
              {isTaskDetailPage ? (
                <Link
                  to={`/project/${projectId}/tasks`}
                  className="text-gray-600 hover:text-gray-900 hover:underline"
                >
                  Project Tasks
                </Link>
              ) : (
                <span className="font-semibold text-gray-900">Project Tasks</span>
              )}
            </li>
          )}

          {isTaskDetailPage && (
            <li className="flex items-center">
              <ChevronRightIcon className="w-4 h-4 text-gray-500 mx-1" />
              {isSubtaskPage ? (
                <Link
                  to={`/project/${projectId}/tasks/${taskId}`}
                  className="text-gray-600 hover:text-gray-900 hover:underline"
                >
                  Task
                </Link>
              ) : (
                <span className="font-semibold text-gray-900">Task</span>
              )}
            </li>
          )}

          {isSubtaskPage && (
            <li className="flex items-center">
              <ChevronRightIcon className="w-4 h-4 text-gray-500 mx-1" />
              <span className="font-semibold text-gray-900">Subtask</span>
            </li>
          )}
        </ol>
      </nav>
    </div>
  );
}
