'use client';

import { Link } from 'waku';
import { Task } from '../db/types';
import { LinkIcon } from '@heroicons/react/24/outline';
import { DoneButton } from './done-button';

export function TaskList({
  tasks,
  isSubtaskList,
}: {
  tasks: Array<Task & { subtasks?: Task[] }>;
  isSubtaskList?: boolean;
}) {
  return (
    <ul className={isSubtaskList ? 'pl-6' : ''}>
      {tasks.map((task) => (
        <li key={task.id} className="block">
          <div className="flex gap-1 items-start border-b border-b-gray-200">
            <DoneButton task={task} />
            <Link
              to={
                isSubtaskList
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
                    {
                      task.subtasks.filter(({ completedAt }) => completedAt !== null)
                        .length
                    }
                    /{task.subtasks.length}
                  </span>
                </div>
              )}
            </Link>
          </div>

          {task.subtasks && task.subtasks.length > 0 && (
            <TaskList tasks={task.subtasks} isSubtaskList />
          )}
        </li>
      ))}
    </ul>
  );
}
