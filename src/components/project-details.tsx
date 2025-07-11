'use client';

import { useActionState } from 'react';
import { useRouter } from 'waku';
import { ProjectWithTasks } from '../db/types';
import { deleteProject } from '../actions/delete-project';
import { ProjectInfo } from './project-info';
import { ProjectTasks } from './project-tasks';

export function ProjectDetails({ project }: { project: ProjectWithTasks }) {
  const router = useRouter();
  const [formState, deleteProjectFormAction, isPendingDeletion] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const result = await deleteProject(formData);

      if (result.success) {
        router.replace(`/`);
        return result;
      } else {
        alert('Failed to delete project: ' + result.error);
      }
    },
    {
      success: false,
      error: null,
    },
  );

  if (formState?.success) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-8">Success!</h1>
      </div>
    );
  }

  return (
    <div className={`${isPendingDeletion ? 'opacity-50 pointer-events-none' : ''}`}>
      <ProjectInfo
        deleteProjectFormAction={deleteProjectFormAction}
        project={project}
        isPendingDeletion={isPendingDeletion}
      />
      <ProjectTasks project={project} />
    </div>
  );
}
