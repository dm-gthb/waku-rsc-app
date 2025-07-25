'use client';

import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Link, useRouter } from 'waku';
import { LogoutButton } from './logout-button';

type BreadcrumbItem = {
  label: string;
  path: string;
  isActive?: boolean;
};

export function Breadcrumbs() {
  const { breadcrumbs } = useBreadcrumbs();
  return (
    <div
      className={`border-b ${breadcrumbs.length > 1 ? 'border-gray-200' : 'border-transparent'} flex justify-between pb-2`}
    >
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
      <LogoutButton />
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

  const isProjectRoute = pathSegments[0] === 'project';
  const projectId = isProjectRoute && pathSegments[1] !== 'create' ? pathSegments[1] : '';
  const isCreateProject = isProjectRoute && pathSegments[1] === 'create';
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

  if (isCreateProject) {
    breadcrumbs.push({
      label: 'New Project',
      path: '/project/create',
      isActive: true,
    });
  } else if (projectId) {
    breadcrumbs.push({
      label: 'Project Details',
      path: `/project/${projectId}`,
      isActive: pathSegments.length === 2,
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
  }

  return { breadcrumbs };
}
