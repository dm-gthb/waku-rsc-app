import { Task } from '../db/types';

export function setTaskAndSubtasksCompletion<
  T extends { completedAt: string | null; subtasks?: Task[] },
>(task: T, isCompleted: boolean): T {
  const updatedTask = {
    ...task,
    completedAt: isCompleted ? new Date().toISOString() : null,
  };

  if (updatedTask.subtasks && updatedTask.subtasks.length > 0) {
    return {
      ...updatedTask,
      subtasks: updatedTask.subtasks.map((subtask) => ({
        ...subtask,
        completedAt: isCompleted ? new Date().toISOString() : null,
      })),
    };
  }

  return updatedTask;
}
