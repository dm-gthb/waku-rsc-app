'use client';

import { Link } from 'waku';
import { LinkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Task } from '../db/types';
import { CompletionTaskButton } from './completion-task-button';
import { UserRoleAlert } from './user-role-alert';
import { useUser } from '../context/user';

type TaskWithSubtasks = Task & { subtasks?: Task[] };

export function TaskList({
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
            <TaskListItem
              task={task}
              formAction={formAction}
              deleteFormAction={deleteFormAction}
            />
          </div>

          {task.subtasks && task.subtasks.length > 0 && (
            <TaskList
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

function TaskListItem({
  task,
  formAction,
  deleteFormAction,
}: {
  task: TaskWithSubtasks;
  formAction: (formData: FormData) => void;
  deleteFormAction?: (formData: FormData) => void;
}) {
  const { user } = useUser();
  const isSubtask = Boolean(task.parentTaskId);
  return (
    <div className="flex items-start gap-2 w-full group py-3">
      <CompletionTaskButton task={task} formAction={formAction} />
      <Link
        to={
          isSubtask
            ? `/project/${task.projectId}/tasks/${task.parentTaskId}/subtasks/${task.id}`
            : `/project/${task.projectId}/tasks/${task.id}`
        }
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
        {user?.role === 'demo' ? (
          <UserRoleAlert>
            <button className="relative z-10 hidden group-hover:flex items-center gap-1 cursor-pointer hover:border-transparent hover:text-red-500 p-1 -my-1">
              <TrashIcon width={18} height={18} />
              <span className="sr-only">Delete task and its subtasks</span>
            </button>
          </UserRoleAlert>
        ) : (
          <button className="relative z-10 hidden group-hover:flex items-center gap-1 cursor-pointer hover:border-transparent hover:text-red-500 p-1 -my-1">
            <TrashIcon width={18} height={18} />
            <span className="sr-only">Delete task and its subtasks</span>
          </button>
        )}
      </form>
    </div>
  );
}
