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
import { deleteTask } from '../actions/delete-task';
import { createTask } from '../actions/create-task';
import { TaskList } from './task-list';
import ActionButton from './action-button';

export function Subtasks({
  task,
  onSubtaskUpdate,
  onOptimisticUpdate,
}: {
  task: TaskWithSubtasks;
  onSubtaskUpdate: Dispatch<SetStateAction<TaskWithSubtasks>>;
  onOptimisticUpdate: (action: TaskWithSubtasks) => void;
}) {
  const [isEditMode, setIsEditMode] = useState(false);
  async function manageTaskCompletion(formData: FormData) {
    const { success, updatedTasks } = await updateTaskCompletion(formData);
    if (success && updatedTasks && updatedTasks.length > 0) {
      const updatedSubtasks = task.subtasks.map((subtask) => {
        const updatedSubtask = updatedTasks.find((t) => t.id === subtask.id);
        if (updatedSubtask) {
          return {
            ...subtask,
            ...updatedSubtask,
          };
        }
        return subtask;
      });

      const allSubtasksCompleted = updatedSubtasks.every(
        ({ completedAt }) => completedAt !== null,
      );

      startTransition(() => {
        onSubtaskUpdate((prev) => ({
          ...prev,
          completedAt: allSubtasksCompleted
            ? updatedSubtasks[0]?.completedAt || new Date().toISOString()
            : null,
          subtasks: updatedSubtasks,
        }));
      });
    }
  }

  function taskCompletionFormAction(formData: FormData) {
    const updatedSubtasks = task.subtasks.map((subtask) => {
      if (subtask.id === formData.get('taskId')) {
        return {
          ...subtask,
          completedAt:
            formData.get('isToCompleteIntension') === 'true'
              ? new Date().toISOString()
              : null,
        };
      }
      return subtask;
    });

    const allSubtasksCompleted = updatedSubtasks.every(
      ({ completedAt }) => completedAt !== null,
    );

    onOptimisticUpdate({
      ...task,
      completedAt: allSubtasksCompleted
        ? updatedSubtasks[0]?.completedAt || new Date().toISOString()
        : null,
      subtasks: updatedSubtasks,
    });

    startTransition(async () => {
      await manageTaskCompletion(formData);
    });
  }

  function taskDeletionFormAction(formData: FormData) {
    const taskId = formData.get('taskId') as string;

    onOptimisticUpdate({
      ...task,
      subtasks: task.subtasks.filter((subtask) => subtask.id !== taskId),
    });

    startTransition(async () => {
      await manageTaskDeletion(formData);
    });
  }

  async function manageTaskDeletion(formData: FormData) {
    const taskId = formData.get('taskId') as string;
    const result = await deleteTask(formData);
    if (result.success) {
      startTransition(() => {
        onSubtaskUpdate((prev) => ({
          ...prev,
          subtasks: prev.subtasks.filter((subtask) => subtask.id !== taskId),
        }));
      });
    } else {
      alert('Failed to delete task. Please try again.');
      console.error('Failed to delete task:', result.error);
    }
  }

  const [taskCreationFormState, taskCreationFormAction, isPendingCreation] =
    useActionState(
      async (_prevState: unknown, formData: FormData) => {
        const result = await createTask(_prevState, formData);
        if (result.success) {
          setIsEditMode(false);
          onSubtaskUpdate((prev) => ({
            ...prev,
            subtasks: [...prev.subtasks, ...(result.task ? [result.task] : [])],
          }));
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
    <div>
      {task.subtasks && task.subtasks.length > 0 && (
        <>
          <h3 className="font-semibold">Sub-tasks</h3>
          <div className="mb-6">
            <TaskList
              tasks={task.subtasks}
              formAction={taskCompletionFormAction}
              deleteFormAction={taskDeletionFormAction}
            />
          </div>
        </>
      )}
      {isEditMode ? (
        <form action={taskCreationFormAction} className="mb-4">
          <fieldset
            disabled={isPendingCreation}
            className={`${isPendingCreation ? 'opacity-50' : ''}`}
          >
            <input type="hidden" name="projectId" value={task.projectId} />
            <input type="hidden" name="parentTaskId" value={task.id ?? ''} />
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
                <ActionButton disabled={isPendingCreation}>
                  {isPendingCreation ? 'Saving...' : 'Save'}
                </ActionButton>
                <ActionButton
                  variant="secondary"
                  disabled={isPendingCreation}
                  onClick={() => setIsEditMode(false)}
                >
                  Cancel
                </ActionButton>
              </div>
            </div>
          </fieldset>
          {taskCreationFormState.error && (
            <p className="text-red-500 mt-2">{taskCreationFormState.error}</p>
          )}
        </form>
      ) : Boolean(task.completedAt) ? null : task.parentTaskId ? null : (
        <ActionButton onClick={() => setIsEditMode(true)}>+ Add Subtask</ActionButton>
      )}
    </div>
  );
}
