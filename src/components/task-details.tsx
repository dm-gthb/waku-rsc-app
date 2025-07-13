'use client';

import { useRouter } from 'waku';
import { useOptimistic, useState, useTransition } from 'react';
import { deleteTask } from '../actions/delete-task';
import { TaskWithSubtasks } from '../db/types';
import { TaskInfo } from './task-info';
import { Subtasks } from './subtasks';

export function TaskDetails({ task: initTask }: { task: TaskWithSubtasks }) {
  const router = useRouter();
  const [task, setTask] = useState(initTask);
  const [optimisticTask, setOptimisticTask] = useOptimistic(
    task,
    (_, newTask: TaskWithSubtasks) => newTask,
  );

  const [isDeletePending, startTransition] = useTransition();
  const handleTaskDelete = () => {
    startTransition(async () => {
      const { success } = await deleteTask(task.id);
      if (success) {
        router.replace(
          task.parentTaskId
            ? `/project/${task.projectId}/tasks/${task.parentTaskId}`
            : `/project/${task.projectId}`,
        );
      } else {
        alert('Failed to delete task');
      }
    });
  };

  return (
    <div className={`${isDeletePending ? 'opacity-50 pointer-events-none' : ''}`}>
      <TaskInfo
        task={optimisticTask}
        onInfoUpdate={setTask}
        onOptimisticUpdate={setOptimisticTask}
        onTaskDelete={handleTaskDelete}
        isDeletePending={isDeletePending}
      />
      <Subtasks
        task={optimisticTask}
        onOptimisticUpdate={setOptimisticTask}
        onSubtaskUpdate={setTask}
      />
    </div>
  );
}
