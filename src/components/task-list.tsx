'use client';

import { Link } from 'waku';
import { Task } from '../db/types';
import { LinkIcon, TrashIcon } from '@heroicons/react/24/outline';

import { startTransition, useOptimistic, useState } from 'react';
import { manageTask } from '../actions/manage-task';
import { CompletionTaskButton } from './completion-task-button';
import { deleteTask } from '../actions/delete-task';

type TaskWithSubtasks = Task & { subtasks?: Task[] };

// rename to ProjectTaskList
export function TaskList({ tasks: initTasks }: { tasks: Array<TaskWithSubtasks> }) {
  const [tasks, setTasks] = useState(initTasks);
  const [optimisticTasks, setOptimisticTasks] = useOptimistic(
    tasks,
    (_initTasks, newTasks: Array<TaskWithSubtasks>) => newTasks,
  );

  async function manageTaskAction(formData: FormData) {
    const { success, updatedTasks, error } = await manageTask(formData);
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
      await manageTaskAction(formData);
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
    <List
      tasks={optimisticTasks}
      formAction={formAction}
      deleteFormAction={deleteTaskFormAction}
    />
  );
}

// rename to TaskList
export function List({
  tasks,
  isSubtaskList,
  formAction,
  deleteFormAction,
}: {
  tasks: Array<TaskWithSubtasks>;
  isSubtaskList?: boolean;
  formAction: (formData: FormData) => void;
  deleteFormAction: (formData: FormData) => void;
}) {
  return (
    <ul className={isSubtaskList ? 'pl-6' : ''}>
      {tasks.map((task) => (
        <li key={task.id}>
          <div className="flex gap-1 items-start border-b border-b-gray-200">
            <TaskItem
              task={task}
              formAction={formAction}
              deleteFormAction={deleteFormAction}
            />
          </div>

          {task.subtasks && task.subtasks.length > 0 && (
            <List
              tasks={task.subtasks}
              formAction={formAction}
              deleteFormAction={deleteFormAction}
              isSubtaskList
            />
          )}
        </li>
      ))}
    </ul>
  );
}

// rename to TaskListItem
function TaskItem({
  task,
  formAction,
  deleteFormAction,
}: {
  task: TaskWithSubtasks;
  formAction: (formData: FormData) => void;
  deleteFormAction?: (formData: FormData) => void;
}) {
  const isSubtask = Boolean(task.parentTaskId);
  return (
    <div className="flex items-start gap-2 w-full group py-3">
      <CompletionTaskButton task={task} formAction={formAction} />
      <Link
        to={`/project/${task.projectId}/tasks/${task.id}`}
        className="flex flex-col gap-1 w-full"
      >
        <span
          className={`block ${task.completedAt ? 'line-through text-gray-500 hover:text-black' : 'hover:underline'}`}
        >
          {task.title}
        </span>
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="flex gap-1 items-center text-gray-600">
            <LinkIcon className="inline-block w-3 h-3" />
            <span className="text-xs">
              {task.subtasks.filter(({ completedAt }) => completedAt !== null).length}/
              {task.subtasks.length}
            </span>
          </div>
        )}
      </Link>
      <form action={deleteFormAction}>
        <input type="hidden" name="taskId" value={task.id} />
        <button
          type="submit"
          className="hidden group-hover:flex items-center gap-1 cursor-pointer hover:border-transparent hover:text-red-500 p-1 -my-1"
        >
          <TrashIcon width={18} height={18} />
          <span className="sr-only">Delete task and its subtasks</span>
        </button>
      </form>
    </div>
  );
}
