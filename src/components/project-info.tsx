'use client';

import { useActionState, useState } from 'react';
import { ProjectWithTasks } from '../db/types';
import { editProject } from '../actions/edit-project';
import ActionButton from './action-button';
import { FormErrorList } from './form-errors-list';
import { DemoAlert } from './demo-alert';
import { useIsDemoMode } from '../context/demo-mode';

export function ProjectInfo({
  project: initProject,
  onProjectDelete,
  isDeletePending,
}: {
  project: ProjectWithTasks;
  onProjectDelete: () => void;
  isDeletePending?: boolean;
}) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [project, setProject] = useState(initProject);
  const { isDemo } = useIsDemoMode();
  const [formState, formAction, isEditPending] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      const result = await editProject(prevState, formData);

      if (result.success) {
        setIsEditMode(false);
        setProject((prev) => ({
          ...prev,
          title: formData.get('title') as string,
          description: formData.get('description') as string,
          priority: formData.get('priority') as 'low' | 'medium' | 'high',
          targetDate: formData.get('targetDate') as string,
        }));
      }

      return result;
    },
    {
      success: false,
      updatedProject: undefined,
      errors: null,
    },
  );

  if (isEditMode) {
    return (
      <form action={formAction} className="mb-4">
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
                placeholder="Project title"
                autoFocus
                required
              />
              <textarea
                rows={4}
                className="p-2 mb-2"
                name="description"
                placeholder="Project description"
                defaultValue={project.description ?? ''}
                maxLength={500}
              />
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col">
                  <label htmlFor="priority" className="text-sm text-gray-600 mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    id="priority"
                    className="p-2 border border-gray-300 rounded"
                    defaultValue={project.priority}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label htmlFor="targetDate" className="text-sm text-gray-600 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    name="targetDate"
                    id="targetDate"
                    className="p-2 border border-gray-300 rounded"
                    defaultValue={project.targetDate ?? ''}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 items-start">
              {isDemo ? (
                <DemoAlert>
                  <ActionButton disabled={isEditPending}>
                    {isEditPending ? 'Saving...' : 'Save'}
                  </ActionButton>
                </DemoAlert>
              ) : (
                <ActionButton disabled={isEditPending}>
                  {isEditPending ? 'Saving...' : 'Save'}
                </ActionButton>
              )}
              <ActionButton
                variant="secondary"
                disabled={isEditPending}
                onClick={() => setIsEditMode(false)}
              >
                Cancel
              </ActionButton>
            </div>
          </div>
          <div className="mt-2">
            <FormErrorList errors={formState.errors ?? null} />
          </div>
        </fieldset>
      </form>
    );
  }

  return (
    <div className="flex justify-between gap-4">
      <Info project={project} />
      <div className="flex flex-col sm:flex-row gap-2 items-start">
        <ActionButton onClick={() => setIsEditMode(true)}>Edit</ActionButton>
        {isDemo ? (
          <DemoAlert>
            <ActionButton variant="danger" disabled={isDeletePending}>
              Delete
            </ActionButton>
          </DemoAlert>
        ) : (
          <ActionButton
            variant="danger"
            disabled={isDeletePending}
            onClick={onProjectDelete}
          >
            Delete
          </ActionButton>
        )}
      </div>
    </div>
  );
}

function Info({ project }: { project: ProjectWithTasks }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{project.title}</h1>
      {project.description && <p className="mb-6">Description: {project.description}</p>}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mb-8">
        <div className="flex items-center gap-1">
          <span className="font-medium">Priority:</span>
          <span
            className={`px-2 py-1 rounded text-white ${
              project.priority === 'high'
                ? 'bg-red-500'
                : project.priority === 'medium'
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
            }`}
          >
            {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
          </span>
        </div>
        {project.targetDate && (
          <div className="flex items-center gap-1">
            <span className="font-medium">Target Date:</span>
            <span>{new Date(project.targetDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  );
}
