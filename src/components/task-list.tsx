'use client';

import { Link } from 'waku';
import { Task } from '../db/types';
import { LinkIcon } from '@heroicons/react/24/outline';

import { startTransition, useOptimistic, useState } from 'react';
import { manageTask } from '../actions/manage-task';
import { CompletionTaskButton } from './completion-task-button';

type TaskWithSubtasks = Task & { subtasks?: Task[] };

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

  return <List tasks={optimisticTasks} formAction={formAction} />;
}

export function List({
  tasks,
  isSubtaskList,
  formAction,
}: {
  tasks: Array<TaskWithSubtasks>;
  isSubtaskList?: boolean;
  formAction: (formData: FormData) => void;
}) {
  return (
    <ul className={isSubtaskList ? 'pl-6' : ''}>
      {tasks.map((task) => (
        <li key={task.id} className="block">
          <div className="flex gap-1 items-start border-b border-b-gray-200">
            <TaskItem task={task} formAction={formAction} />
          </div>

          {task.subtasks && task.subtasks.length > 0 && (
            <List tasks={task.subtasks} formAction={formAction} isSubtaskList />
          )}
        </li>
      ))}
    </ul>
  );
}

function TaskItem({
  task,
  formAction,
}: {
  task: TaskWithSubtasks;
  formAction: (formData: FormData) => void;
}) {
  const isSubtask = Boolean(task.parentTaskId);
  return (
    <>
      <CompletionTaskButton task={task} formAction={formAction} />
      <Link
        to={
          isSubtask
            ? `/project/${task.projectId}/tasks/${task.parentTaskId}/subtasks/${task.id}`
            : `/project/${task.projectId}/tasks/${task.id}`
        }
        className="flex flex-col gap-1 py-3 group"
      >
        <div
          className={`${task.completedAt ? 'line-through text-gray-500' : 'group-hover:underline'}`}
        >
          {task.title}
        </div>
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
    </>
  );
}
