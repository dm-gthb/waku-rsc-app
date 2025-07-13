'use client';

import { Dispatch, SetStateAction, startTransition } from 'react';
import { TaskWithSubtasks } from '../db/types';
import { updateTaskCompletion } from '../actions/update-task-completion';
import { deleteTask } from '../actions/delete-task';
import { TaskList } from './task-list';
import { CreateTaskForm } from './create-task-form';

export function Subtasks({
  task,
  onSubtaskUpdate,
  onOptimisticUpdate,
}: {
  task: TaskWithSubtasks;
  onSubtaskUpdate: Dispatch<SetStateAction<TaskWithSubtasks>>;
  onOptimisticUpdate: (action: TaskWithSubtasks) => void;
}) {
  async function manageTaskCompletion(taskData: {
    taskId: string;
    isCompleting: boolean;
  }) {
    const { success, updatedTasks } = await updateTaskCompletion(taskData);
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

  function handleTaskCompleteStatusChange({
    taskId,
    isCompleted,
  }: {
    taskId: string;
    isCompleted: boolean;
  }) {
    const isCompleting = !isCompleted;
    const updatedSubtasks = task.subtasks.map((subtask) => {
      if (subtask.id === taskId) {
        return {
          ...subtask,
          completedAt: isCompleting ? new Date().toISOString() : null,
        };
      }
      return subtask;
    });

    const allSubtasksCompleted = updatedSubtasks.every(
      ({ completedAt }) => completedAt !== null,
    );

    startTransition(async () => {
      onOptimisticUpdate({
        ...task,
        completedAt: allSubtasksCompleted
          ? updatedSubtasks[0]?.completedAt || new Date().toISOString()
          : null,
        subtasks: updatedSubtasks,
      });
      await manageTaskCompletion({ taskId, isCompleting });
    });
  }

  function handleTaskDelete(taskId: string) {
    startTransition(async () => {
      onOptimisticUpdate({
        ...task,
        subtasks: task.subtasks.filter((subtask) => subtask.id !== taskId),
      });
      await manageTaskDeletion(taskId);
    });
  }

  async function manageTaskDeletion(taskId: string) {
    const result = await deleteTask(taskId);
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

  return (
    <div>
      {task.subtasks && task.subtasks.length > 0 && (
        <>
          <h3 className="font-semibold">Sub-tasks</h3>
          <div className="mb-6">
            <TaskList
              tasks={task.subtasks}
              onTaskCompleteStatusChange={handleTaskCompleteStatusChange}
              onTaskDelete={handleTaskDelete}
            />
          </div>
        </>
      )}
      {!task.parentTaskId && !Boolean(task.completedAt) && (
        <CreateTaskForm
          projectId={task.projectId}
          parentTaskId={task.id}
          onTaskCreation={(createdTask) => {
            if (createdTask) {
              onSubtaskUpdate((prev) => ({
                ...prev,
                subtasks: [...prev.subtasks, createdTask],
              }));
            }
          }}
        />
      )}
    </div>
  );
}
