'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'waku';
import { ProjectWithTasks } from '../db/types';
import { TaskList } from './task-list';
import { editProject } from '../actions/edit-project';
import { createTask } from '../actions/create-task';
import { deleteProject } from '../actions/delete-project';

export function ProjectDetails({ project }: { project: ProjectWithTasks }) {
  const router = useRouter();
  const [_, deleteProjectFormAction, isPendingDeletion] = useActionState(
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
  return (
    <div className={`${isPendingDeletion ? 'opacity-50' : ''}`}>
      <ProjectInfo deleteProjectFormAction={deleteProjectFormAction} project={project} />
      <ProjectTasks project={project} />
    </div>
  );
}

function ProjectTasks({ project: initProject }: { project: ProjectWithTasks }) {
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
      <div className="mb-6">
        {project.tasks && project.tasks.length > 0 ? (
          <TaskList tasks={project.tasks} key={project.tasks.length} />
        ) : (
          <p>No tasks for project</p>
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
                <button
                  onClick={() => setIsEditMode(true)}
                  className="cursor-pointer min-w-24 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                >
                  {isPending ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditMode(false)}
                  className="cursor-pointer min-w-24 bg-gray-200 hover:bg-gray-300 font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </fieldset>
          {formState.error && <p className="text-red-500 mt-2">{formState.error}</p>}
        </form>
      ) : (
        <button
          onClick={() => setIsEditMode(true)}
          className="cursor-pointer min-w-24 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
        >
          + Add Task
        </button>
      )}
    </>
  );
}

function ProjectInfo({
  project: initProject,
  deleteProjectFormAction,
}: {
  project: ProjectWithTasks;
  deleteProjectFormAction: (formData: FormData) => void;
}) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [project, setProject] = useState(initProject);
  const [editProjectFormState, editProjectFormAction, isEditPending] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      const result = await editProject(prevState, formData);

      if (result.success) {
        setIsEditMode(false);
        setProject((prev) => ({
          ...prev,
          title: formData.get('title') as string,
          description: formData.get('description') as string,
        }));
      }

      return result;
    },
    {
      success: false,
      error: null,
      updatedProject: undefined,
    },
  );

  return (
    <div>
      {isEditMode ? (
        <form action={editProjectFormAction} className="mb-4">
          <fieldset
            disabled={isEditPending}
            className={`${isEditPending ? 'opacity-50' : ''}`}
          >
            <div className="flex justify-between gap-4">
              <div className="flex flex-col w-full border border-gray-300 p-2 rounded-lg">
                <input type="hidden" name="projectId" value={project.id} />
                <input
                  className="text-2xl font-bold mb-1 p-2"
                  name="title"
                  defaultValue={project.title ?? ''}
                  autoFocus
                />
                <textarea
                  rows={2}
                  className="p-2"
                  name="description"
                  placeholder="Project description"
                  defaultValue={project.description ?? ''}
                />
              </div>

              <div className="flex gap-2 items-start">
                <button
                  onClick={() => setIsEditMode(true)}
                  className="cursor-pointer min-w-24 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                >
                  {isEditPending ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditMode(false)}
                  className="cursor-pointer min-w-24 bg-gray-200 hover:bg-gray-300 font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </fieldset>
          {editProjectFormState.error && (
            <p className="text-red-500 mt-2">{editProjectFormState.error}</p>
          )}
        </form>
      ) : (
        <div className="flex justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-4">{project.title}</h1>
            {project.description && <p className="mb-8">{project.description}</p>}
          </div>
          <div className="flex gap-2 items-start">
            <button
              onClick={() => setIsEditMode(true)}
              className="cursor-pointer min-w-24 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
              Edit
            </button>
            <form action={deleteProjectFormAction}>
              <input type="hidden" name="projectId" value={project.id} />
              <button
                type="submit"
                className="cursor-pointer min-w-24 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              >
                Delete
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
