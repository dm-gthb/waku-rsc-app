'use client';

import { startTransition, useOptimistic, useState } from 'react';
import { Task } from '../db/types';
import { updateTaskCompletion } from '../actions/update-task-completion';
import { deleteTask } from '../actions/delete-task';
import { TaskList } from './task-list';

type TaskWithSubtasks = Task & { subtasks?: Task[] };

export function ProjectTaskList({
  tasks: initTasks,
}: {
  tasks: Array<TaskWithSubtasks>;
}) {
  const [tasks, setTasks] = useState(initTasks);
  const [optimisticTasks, setOptimisticTasks] = useOptimistic(
    tasks,
    (_initTasks, newTasks: Array<TaskWithSubtasks>) => newTasks,
  );

  async function manageTaskCompletion(formData: FormData) {
    const { success, updatedTasks, error } = await updateTaskCompletion(formData);
    startTransition(() => {
      if (success && updatedTasks && updatedTasks.length > 0) {
        setTasks((currentTasks) => {
          const updatedTasksMap = new Map(updatedTasks.map((task) => [task.id, task]));
          const updateTasksRecursively = (taskList: Array<TaskWithSubtasks>) => {
            return taskList.map((task): TaskWithSubtasks => {
              const updatedTask = updatedTasksMap.get(task.id);
              const mergedTask = updatedTask ? { ...task, ...updatedTask } : task;

              if (mergedTask.subtasks && mergedTask.subtasks.length > 0) {
                return {
                  ...mergedTask,
                  subtasks: updateTasksRecursively(mergedTask.subtasks),
                };
              }

              return mergedTask;
            });
          };

          return updateTasksRecursively(currentTasks);
        });
      } else if (error) {
        setTasks((currentTasks) => [...currentTasks]);
      }
    });
  }

  function formAction(formData: FormData) {
    const taskId = formData.get('taskId') as string;
    const isCompleting = formData.get('isToCompleteIntension') === 'true';

    const updateTasksOptimistically = (tasks: Array<TaskWithSubtasks>) => {
      let result = tasks.map((task): TaskWithSubtasks => {
        if (task.id === taskId) {
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

        if (task.subtasks && task.subtasks.length > 0) {
          return {
            ...task,
            subtasks: updateTasksOptimistically(task.subtasks),
          };
        }

        return task;
      });

      result = result.map((task) => {
        if (task.subtasks && task.subtasks.length > 0) {
          const allCompleted = task.subtasks.every(
            (subtask) => subtask.completedAt !== null,
          );

          return {
            ...task,
            completedAt: allCompleted
              ? task.subtasks[0]?.completedAt || new Date().toISOString()
              : null,
          };
        }
        return task;
      });

      return result;
    };

    setOptimisticTasks(updateTasksOptimistically(optimisticTasks));

    startTransition(async () => {
      await manageTaskCompletion(formData);
    });
  }

  function deleteTaskFormAction(formData: FormData) {
    const taskId = formData.get('taskId') as string;

    const deleteTasksOptimistically = (tasks: Array<TaskWithSubtasks>) => {
      const deleteTaskRecursively = (taskList: Array<TaskWithSubtasks>) => {
        return taskList.reduce((acc: Array<TaskWithSubtasks>, task) => {
          if (task.id === taskId) {
            return acc;
          }

          if (task.subtasks && task.subtasks.length > 0) {
            const updatedSubtasks = deleteTaskRecursively(task.subtasks);
            if (updatedSubtasks.length > 0) {
              acc.push({ ...task, subtasks: updatedSubtasks });
            }
          } else {
            acc.push(task);
          }

          return acc;
        }, []);
      };

      return deleteTaskRecursively(tasks);
    };

    setOptimisticTasks(deleteTasksOptimistically(optimisticTasks));

    startTransition(async () => {
      await manageTaskDeletion(formData);
    });
  }

  async function manageTaskDeletion(formData: FormData) {
    const taskId = formData.get('taskId') as string;
    const result = await deleteTask(formData);

    startTransition(() => {
      if (result.success) {
        setTasks((currentTasks) => {
          const filterTasksRecursively = (taskList: Array<TaskWithSubtasks>) => {
            return taskList.reduce((acc: Array<TaskWithSubtasks>, task) => {
              if (task.id === taskId) {
                return acc; // Skip this task (delete it)
              }

              if (task.subtasks && task.subtasks.length > 0) {
                const filteredSubtasks = filterTasksRecursively(task.subtasks);
                acc.push({ ...task, subtasks: filteredSubtasks });
              } else {
                acc.push(task);
              }

              return acc;
            }, []);
          };

          return filterTasksRecursively(currentTasks);
        });
      } else {
        alert('Failed to delete task. Please try again.');
        console.error('Failed to delete task:', result.error);
      }
    });
  }

  return (
    <TaskList
      tasks={optimisticTasks}
      formAction={formAction}
      deleteFormAction={deleteTaskFormAction}
    />
  );
}
