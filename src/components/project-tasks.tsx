'use client';

import { useState } from 'react';
import { ProjectWithTasks } from '../db/types';
import { ProjectTaskList } from './project-task-list';
import { CreateTaskForm } from './create-task-form';

export function ProjectTasks({ project: initProject }: { project: ProjectWithTasks }) {
  const [project, setProject] = useState(initProject);
  return (
    <>
      <div className="mb-4">
        {project.tasks && project.tasks.length > 0 ? (
          <ProjectTaskList tasks={project.tasks} key={project.tasks.length} />
        ) : (
          <p>No tasks for project. To add a task, click the button below.</p>
        )}
      </div>
      <CreateTaskForm
        projectId={project.id}
        onTaskCreation={(createdTask) => {
          setProject((prev) => {
            if (createdTask) {
              return {
                ...prev,
                tasks: [...prev.tasks, createdTask],
              };
            }
            return prev;
          });
        }}
      />
    </>
  );
}
