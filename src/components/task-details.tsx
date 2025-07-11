'use client';

import { useRouter } from 'waku';
import { useActionState, useOptimistic, useState } from 'react';
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

  const [deleteTaskFormState, deleteTaskFormAction, isPendingDeletion] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const result = await deleteTask(formData);

      if (result.success) {
        router.replace(`/project/${task.projectId}`);
        return result;
      } else {
        alert('Failed to delete task: ' + result.error);
      }
    },
    { success: false, error: null },
  );

  if (deleteTaskFormState?.success) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-8">Success!</h1>
      </div>
    );
  }

  return (
    <div className={`${isPendingDeletion ? 'opacity-50 pointer-events-none' : ''}`}>
      <TaskInfo
        task={optimisticTask}
        onInfoUpdate={setTask}
        onOptimisticUpdate={setOptimisticTask}
        deleteTaskFormAction={deleteTaskFormAction}
        isPendingDeletion={isPendingDeletion}
      />
      <Subtasks
        task={optimisticTask}
        onOptimisticUpdate={setOptimisticTask}
        onSubtaskUpdate={setTask}
      />
    </div>
  );
}
