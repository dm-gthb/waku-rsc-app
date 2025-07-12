'use client';

import { Task } from '../db/types';
import { useActionState, useState } from 'react';
import { FormErrorList } from './form-errors-list';
import ActionButton from './action-button';
import { createTask } from '../actions/create-task';
import { UserRoleAlert } from './user-role-alert';
import { useUser } from '../context/user';

export function CreateTaskForm({
  projectId,
  onTaskCreation,
  parentTaskId,
}: {
  projectId: string;
  onTaskCreation: (task: Task | undefined) => void;
  parentTaskId?: string;
}) {
  const [isEditMode, setIsEditMode] = useState(false);
  const { user } = useUser();
  const [formState, formAction, isPending] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const result = await createTask(_prevState, formData);
      if (result.success) {
        setIsEditMode(false);
        onTaskCreation(result.task);
      }

      return result;
    },
    {
      success: false,
      errors: null,
      task: undefined,
    },
  );

  return isEditMode ? (
    <form action={formAction} className="mb-4">
      <fieldset disabled={isPending} className={`${isPending ? 'opacity-50' : ''}`}>
        <input type="hidden" name="projectId" value={projectId} />
        {parentTaskId && <input type="hidden" name="parentTaskId" value={parentTaskId} />}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col w-full border border-gray-300 p-2 rounded-lg">
            <input
              name="title"
              autoFocus
              placeholder="Task name"
              className="w-full mb-1 font-bold p-2"
              required
            />
            <textarea
              rows={2}
              name="description"
              placeholder="Description"
              className="w-full p-2"
            />
          </div>

          <div className="flex justify-between">
            <FormErrorList errors={formState.errors} />
            <div className="flex gap-2 items-start ml-auto">
              {user?.role === 'demo' ? (
                <UserRoleAlert>
                  <ActionButton disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save'}
                  </ActionButton>
                </UserRoleAlert>
              ) : (
                <ActionButton disabled={isPending}>
                  {isPending ? 'Saving...' : 'Save'}
                </ActionButton>
              )}
              <ActionButton
                variant="secondary"
                disabled={isPending}
                onClick={() => setIsEditMode(false)}
              >
                Cancel
              </ActionButton>
            </div>
          </div>
        </div>
      </fieldset>
    </form>
  ) : (
    <ActionButton onClick={() => setIsEditMode(true)}>
      {parentTaskId ? '+ Add Subtask' : '+ Add Task'}
    </ActionButton>
  );
}
