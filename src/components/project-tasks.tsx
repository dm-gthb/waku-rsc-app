'use client';

import { useActionState, useState } from 'react';
import { ProjectWithTasks } from '../db/types';
import { createTask } from '../actions/create-task';
import { ProjectTaskList } from './project-task-list';
import ActionButton from './action-button';

export function ProjectTasks({ project: initProject }: { project: ProjectWithTasks }) {
  const [project, setProject] = useState(initProject);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formState, formAction, isPending] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const result = await createTask(_prevState, formData);
      if (result.success) {
        setIsEditMode(false);
        setProject((prev) => {
          if (result.task) {
            return {
              ...prev,
              tasks: [...prev.tasks, result.task],
            };
          }
          return prev;
        });
      }

      return {
        success: result.success,
        error: result.error,
        task: result.task,
      };
    },
    {
      success: false,
      error: null,
      task: undefined,
    },
  );

  return (
    <>
      <div className="mb-4">
        {project.tasks && project.tasks.length > 0 ? (
          <ProjectTaskList tasks={project.tasks} key={project.tasks.length} />
        ) : (
          <p>No tasks for project. To add a task, click the button below.</p>
        )}
      </div>
      {isEditMode ? (
        <form action={formAction} className="mb-4">
          <fieldset disabled={isPending} className={`${isPending ? 'opacity-50' : ''}`}>
            <input type="hidden" name="projectId" value={project.id} />
            <div className="flex flex-col items-end gap-2">
              <div className="flex flex-col w-full border border-gray-300 p-2 rounded-lg">
                <input
                  name="title"
                  autoFocus
                  placeholder="Task name"
                  className="w-full mb-1 font-bold p-2"
                />
                <textarea
                  rows={2}
                  name="description"
                  placeholder="Description"
                  className="w-full p-2"
                />
              </div>

              <div className="flex gap-2 items-start">
                <ActionButton disabled={isPending}>
                  {isPending ? 'Saving...' : 'Save'}
                </ActionButton>
                <ActionButton
                  variant="secondary"
                  disabled={isPending}
                  onClick={() => setIsEditMode(false)}
                >
                  Cancel
                </ActionButton>
              </div>
            </div>
          </fieldset>
          {formState.error && <p className="text-red-500 mt-2">{formState.error}</p>}
        </form>
      ) : (
        <ActionButton onClick={() => setIsEditMode(true)}>+ Add Task</ActionButton>
      )}
    </>
  );
}
