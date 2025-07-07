'use client';

import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Link, useRouter } from 'waku';

type BreadcrumbItem = {
  label: string;
  path: string;
  isActive?: boolean;
};

export function Breadcrumbs() {
  const { breadcrumbs } = useBreadcrumbs();
  return (
    <div className={`${breadcrumbs.length > 1 ? 'border-b border-gray-200' : ''} pb-2`}>
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1">
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={breadcrumb.path} className="flex items-center gap-1">
              {index > 0 && <ChevronRightIcon className="w-4 h-4 text-gray-500 mx-1" />}
              <BreadcrumbLink item={breadcrumb} />
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}

const BreadcrumbLink = ({ item }: { item: BreadcrumbItem }) => {
  if (item.isActive) {
    return <span className="font-semibold text-gray-900">{item.label}</span>;
  }

  return (
    <Link
      // @ts-ignore
      to={item.path}
      className="text-gray-600 hover:text-gray-900 hover:underline"
    >
      {item.label}
    </Link>
  );
};

function useBreadcrumbs() {
  const router = useRouter();
  const pathSegments = router.path.split('/').filter(Boolean);

  const projectId = pathSegments[0] === 'project' ? pathSegments[1] : '';
  const taskId =
    pathSegments[2] === 'tasks' && pathSegments.length > 3 ? pathSegments[3] : '';
  const subtaskId =
    pathSegments[4] === 'subtasks' && pathSegments.length > 5 ? pathSegments[5] : '';

  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: 'Projects',
      path: '/',
      isActive: router.path === '/',
    },
  ];

  if (projectId) {
    if (pathSegments.includes('tasks')) {
      breadcrumbs.push({
        label: 'Project Tasks',
        path: `/project/${projectId}/tasks`,
        isActive: pathSegments.length === 3,
      });

      if (taskId) {
        breadcrumbs.push({
          label: 'Task',
          path: `/project/${projectId}/tasks/${taskId}`,
          isActive: !subtaskId,
        });

        if (subtaskId) {
          breadcrumbs.push({
            label: 'Subtask',
            path: `/project/${projectId}/tasks/${taskId}/subtasks/${subtaskId}`,
            isActive: true,
          });
        }
      }
    } else {
      breadcrumbs.push({
        label: 'Project Tasks',
        path: `/project/${projectId}/tasks`,
        isActive: false,
      });

      breadcrumbs.push({
        label: 'Project Details',
        path: `/project/${projectId}`,
        isActive: true,
      });
    }
  }

  return { breadcrumbs };
}
