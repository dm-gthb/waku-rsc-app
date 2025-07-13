'use client';

import { Link } from 'waku';
import { LinkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Task } from '../db/types';
import { CompletionTaskButton } from './completion-task-button';
import { DemoAlert } from './demo-alert';
import { useIsDemoMode } from '../context/demo-mode';

type TaskWithSubtasks = Task & { subtasks?: Task[] };

export function TaskList({
  tasks,
  onTaskCompleteStatusChange,
  onTaskDelete,
  isSubtaskList,
}: {
  tasks: Array<TaskWithSubtasks>;
  onTaskCompleteStatusChange: (data: { taskId: string; isCompleted: boolean }) => void;
  onTaskDelete: (taskId: string) => void;
  isSubtaskList?: boolean;
}) {
  return (
    <ul className={isSubtaskList ? 'pl-6' : ''}>
      {tasks.map((task) => (
        <li key={task.id}>
          <div className="flex gap-1 items-start border-b border-b-gray-200">
            <TaskListItem
              task={task}
              onTaskCompleteStatusChange={onTaskCompleteStatusChange}
              onTaskDelete={onTaskDelete}
            />
          </div>

          {task.subtasks && task.subtasks.length > 0 && (
            <TaskList
              tasks={task.subtasks}
              onTaskCompleteStatusChange={onTaskCompleteStatusChange}
              onTaskDelete={onTaskDelete}
              isSubtaskList
            />
          )}
        </li>
      ))}
    </ul>
  );
}

function TaskListItem({
  task,
  onTaskCompleteStatusChange,
  onTaskDelete,
}: {
  task: TaskWithSubtasks;
  onTaskCompleteStatusChange: (data: { taskId: string; isCompleted: boolean }) => void;
  onTaskDelete: (taskId: string) => void;
}) {
  const { isDemo } = useIsDemoMode();
  const isSubtask = Boolean(task.parentTaskId);
  return (
    <div className="flex items-start gap-2 w-full group py-3">
      <CompletionTaskButton
        isCompletedTask={Boolean(task.completedAt)}
        onClick={() =>
          onTaskCompleteStatusChange({
            taskId: task.id,
            isCompleted: Boolean(task.completedAt),
          })
        }
      />
      <Link
        to={
          isSubtask
            ? `/project/${task.projectId}/tasks/${task.parentTaskId}/subtasks/${task.id}`
            : `/project/${task.projectId}/tasks/${task.id}`
        }
        className="flex flex-col gap-1 w-full"
        unstable_prefetchOnEnter
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
      {isDemo ? (
        <DemoAlert>
          <button className="relative z-10 hidden group-hover:flex items-center gap-1 cursor-pointer hover:border-transparent hover:text-red-500 p-1 -my-1">
            <TrashIcon width={18} height={18} />
            <span className="sr-only">Delete task and its subtasks</span>
          </button>
        </DemoAlert>
      ) : (
        <button
          onClick={() => onTaskDelete(task.id)}
          className="relative z-10 hidden group-hover:flex items-center gap-1 cursor-pointer hover:border-transparent hover:text-red-500 p-1 -my-1"
        >
          <TrashIcon width={18} height={18} />
          <span className="sr-only">Delete task and its subtasks</span>
        </button>
      )}
    </div>
  );
}
