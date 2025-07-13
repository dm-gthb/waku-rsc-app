'use client';

import { startTransition, useOptimistic, useState } from 'react';
import { Task } from '../db/types';
import { updateTaskCompletion } from '../actions/update-task-completion';
import { deleteTask } from '../actions/delete-task';
import { TaskList } from './task-list';
import { setTaskAndSubtasksCompletion } from '../utils/tasks';

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

  async function manageTaskCompletion(taskData: {
    taskId: string;
    isCompleting: boolean;
  }) {
    const { success, updatedTasks, error } = await updateTaskCompletion(taskData);
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

  function handleTaskCompleteStatusChange({
    taskId,
    isCompleted,
  }: {
    taskId: string;
    isCompleted: boolean;
  }) {
    const isCompleting = !isCompleted;
    const updateTasksOptimistically = (tasks: Array<TaskWithSubtasks>) => {
      let result = tasks.map((task): TaskWithSubtasks => {
        if (task.id === taskId) {
          return setTaskAndSubtasksCompletion(task, isCompleting);
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

    startTransition(async () => {
      setOptimisticTasks(updateTasksOptimistically(optimisticTasks));
      await manageTaskCompletion({ taskId, isCompleting });
    });
  }

  function handleTaskDelete(taskId: string) {
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

    startTransition(async () => {
      setOptimisticTasks(deleteTasksOptimistically(optimisticTasks));
      await manageTaskDeletion(taskId);
    });
  }

  async function manageTaskDeletion(taskId: string) {
    const result = await deleteTask(taskId);

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
      onTaskCompleteStatusChange={handleTaskCompleteStatusChange}
      onTaskDelete={handleTaskDelete}
    />
  );
}
