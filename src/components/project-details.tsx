'use client';

import { useTransition } from 'react';
import { useRouter } from 'waku';
import { ProjectWithTasks } from '../db/types';
import { deleteProject } from '../actions/delete-project';
import { ProjectInfo } from './project-info';
import { ProjectTasks } from './project-tasks';

export function ProjectDetails({ project }: { project: ProjectWithTasks }) {
  const router = useRouter();
  const [isDeletePending, startTransition] = useTransition();

  const handleProjectDelete = () => {
    startTransition(async () => {
      const { success } = await deleteProject(project.id);
      if (success) {
        router.replace(`/`);
      } else {
        alert('Failed to delete project');
      }
    });
  };

  return (
    <div className={`${isDeletePending ? 'opacity-50 pointer-events-none' : ''}`}>
      <ProjectInfo
        onProjectDelete={handleProjectDelete}
        project={project}
        isDeletePending={isDeletePending}
      />
      <ProjectTasks project={project} />
    </div>
  );
}
