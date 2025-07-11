import { Task } from '../db/types';

export function updateTaskCompletionStatus<
  T extends { completedAt: string | null; subtasks?: Task[] },
>(task: T, isCompleting: boolean): T {
  const updatedTask = {
    ...task,
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
}
