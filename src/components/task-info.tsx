'use client';

import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useState,
} from 'react';
import { TaskWithSubtasks } from '../db/types';
import { updateTaskCompletion } from '../actions/update-task-completion';
import { editTask } from '../actions/edit-task';
import { CompletionTaskButton } from './completion-task-button';
import ActionButton from './action-button';
import { DemoAlert } from './demo-alert';
import { useIsDemoMode } from '../context/demo-mode';

export function TaskInfo({
  task,
  onInfoUpdate,
  onOptimisticUpdate,
  deleteTaskFormAction,
  isPendingDeletion,
}: {
  task: TaskWithSubtasks;
  onInfoUpdate: Dispatch<SetStateAction<TaskWithSubtasks>>;
  onOptimisticUpdate: (action: TaskWithSubtasks) => void;
  deleteTaskFormAction: (formData: FormData) => void;
  isPendingDeletion?: boolean;
}) {
  const [isEditMode, setIsEditMode] = useState(false);
  const { isDemo } = useIsDemoMode();
  function completionFormAction(formData: FormData) {
    const isCompleting = formData.get('isToCompleteIntension') === 'true';

    const updateTaskWithSubtasks = (taskToUpdate: TaskWithSubtasks): TaskWithSubtasks => {
      const updatedTask = {
        ...taskToUpdate,
        completedAt: isCompleting ? new Date().toISOString() : null,
      };

      if (updatedTask.subtasks && updatedTask.subtasks.length > 0) {
        return {
          ...updatedTask,
          subtasks: updatedTask.subtasks.map((subtask) => ({
            ...subtask,
            completedAt: isCompleting ? new Date().toISOString() : null,
          })),
        };
      }

      return updatedTask;
    };

    onOptimisticUpdate(updateTaskWithSubtasks(task));

    startTransition(async () => {
      await manageTaskCompletion(formData);
    });
  }

  async function manageTaskCompletion(formData: FormData) {
    const result = await updateTaskCompletion(formData);

    if (result.success) {
      startTransition(() => {
        onInfoUpdate((prev) => {
          if (!result.updatedTasks || result.updatedTasks.length === 0) {
            return prev;
          }

          const updatedTasksMap = new Map(
            result.updatedTasks.map((task) => [task.id, task]),
          );

          const mainTask = updatedTasksMap.get(task.id);
          if (!mainTask) {
            return prev;
          }
          return {
            ...prev,
            completedAt: mainTask.completedAt,
            subtasks: prev.subtasks.map((subtask) => {
              const updatedSubtask = result.updatedTasks.find((t) => t.id === subtask.id);
              if (updatedSubtask) {
                return {
                  ...subtask,
                  completedAt: updatedSubtask.completedAt,
                };
              }
              return subtask;
            }),
          };
        });
      });
    }
  }

  const [formState, infoFormAction, isPending] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      const result = await editTask(prevState, formData);

      if (result.success) {
        setIsEditMode(false);
        onInfoUpdate((prev) => ({
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
      updatedTask: undefined,
    },
  );

  if (isEditMode) {
    return (
      <form action={infoFormAction} className="mb-4">
        <fieldset disabled={isPending} className={`${isPending ? 'opacity-50' : ''}`}>
          <div className="flex justify-between gap-4">
            <div className="flex flex-col w-full border border-gray-300 p-2 rounded-lg">
              <input type="hidden" name="taskId" value={task.id} />
              <input
                className="text-2xl font-bold mb-1 p-2"
                name="title"
                defaultValue={task.title ?? ''}
                autoFocus
              />
              <textarea
                rows={4}
                className="p-2"
                name="description"
                placeholder="Task description"
                defaultValue={task.description ?? ''}
              />
            </div>

            <div className="flex gap-2 items-start">
              {isDemo ? (
                <DemoAlert>
                  <ActionButton disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save'}
                  </ActionButton>
                </DemoAlert>
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
        </fieldset>
        {formState.error && <p className="text-red-500 mt-2">{formState.error}</p>}
      </form>
    );
  }

  return (
    <div className="flex justify-between gap-4">
      <div>
        <div className="flex items-center mb-4 gap-2">
          <CompletionTaskButton task={task} formAction={completionFormAction} />
          <h1 className={`${task.completedAt ? 'line-through' : ''} text-2xl font-bold`}>
            {task.title}
          </h1>
        </div>
        {task.description && <p className="mb-8">{task.description}</p>}
      </div>
      <div className="flex gap-2 items-start">
        <ActionButton onClick={() => setIsEditMode(true)} disabled={isPendingDeletion}>
          Edit
        </ActionButton>
        <form action={deleteTaskFormAction}>
          <input type="hidden" name="taskId" value={task.id} />
          {isDemo ? (
            <DemoAlert>
              <ActionButton variant="danger" disabled={isPendingDeletion}>
                Delete
              </ActionButton>
            </DemoAlert>
          ) : (
            <ActionButton variant="danger" disabled={isPendingDeletion}>
              Delete
            </ActionButton>
          )}
        </form>
      </div>
    </div>
  );
}
