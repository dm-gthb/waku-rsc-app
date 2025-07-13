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
import { setTaskAndSubtasksCompletion } from '../utils/tasks';

export function TaskInfo({
  task,
  onInfoUpdate,
  onOptimisticUpdate,
  onTaskDelete,
  isDeletePending,
}: {
  task: TaskWithSubtasks;
  onInfoUpdate: Dispatch<SetStateAction<TaskWithSubtasks>>;
  onOptimisticUpdate: (action: TaskWithSubtasks) => void;
  onTaskDelete: () => void;
  isDeletePending?: boolean;
}) {
  const [isEditMode, setIsEditMode] = useState(false);
  const { isDemo } = useIsDemoMode();

  function handleTaskCompleteStatusChange({
    taskId,
    isCompleted,
  }: {
    taskId: string;
    isCompleted: boolean;
  }) {
    const isCompleting = !isCompleted;

    startTransition(async () => {
      onOptimisticUpdate(setTaskAndSubtasksCompletion(task, isCompleting));
      await manageTaskCompletion({ taskId, isCompleting });
    });
  }

  async function manageTaskCompletion(taskData: {
    taskId: string;
    isCompleting: boolean;
  }) {
    const { success, updatedTasks } = await updateTaskCompletion(taskData);
    if (success) {
      startTransition(() => {
        onInfoUpdate((prev) => {
          if (!updatedTasks || updatedTasks.length === 0) {
            return prev;
          }

          const updatedTasksMap = new Map(updatedTasks.map((task) => [task.id, task]));

          const mainTask = updatedTasksMap.get(task.id);
          if (!mainTask) {
            return prev;
          }
          return {
            ...prev,
            completedAt: mainTask.completedAt,
            subtasks: prev.subtasks.map((subtask) => {
              const updatedSubtask = updatedTasks.find((t) => t.id === subtask.id);
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
                  <ActionButton disabled={isPending} type="submit">
                    {isPending ? 'Saving...' : 'Save'}
                  </ActionButton>
                </DemoAlert>
              ) : (
                <ActionButton disabled={isPending} type="submit">
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
          <CompletionTaskButton
            isCompletedTask={Boolean(task.completedAt)}
            onClick={() =>
              handleTaskCompleteStatusChange({
                taskId: task.id,
                isCompleted: Boolean(task.completedAt),
              })
            }
          />
          <h1 className={`${task.completedAt ? 'line-through' : ''} text-2xl font-bold`}>
            {task.title}
          </h1>
        </div>
        {task.description && <p className="mb-8">{task.description}</p>}
      </div>
      <div className="flex gap-2 items-start">
        <ActionButton onClick={() => setIsEditMode(true)} disabled={isDeletePending}>
          Edit
        </ActionButton>
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
            onClick={onTaskDelete}
          >
            Delete
          </ActionButton>
        )}
      </div>
    </div>
  );
}
