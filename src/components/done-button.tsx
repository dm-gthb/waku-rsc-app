'use client';

import { Task } from '../db/types';
import { manageTask } from '../actions/manage-task';
import { useActionState } from 'react';
import { useRouter } from 'waku';

export function DoneButton({ task }: { task: Task }) {
  const router = useRouter();
  const isCompleted = Boolean(task.completedAt);
  const [_formState, formAction, isPending] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      const optimisticScrollY = window.scrollY;
      const result = await manageTask(prevState, formData);

      if (result.success) {
        // simpliest solution to update with actual server state data, since waku does not have granular revalidation yet
        await router.reload();
        window.scrollTo(0, optimisticScrollY);
      }

      return result;
    },
    {
      success: false,
      error: null,
    },
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="taskId" value={task.id} />
      <input
        type="hidden"
        name="isToCompleteIntension"
        value={task.completedAt ? 'false' : 'true'}
      />
      <button
        className={`cursor-pointer group translate-y-2 p-1`}
        type="submit"
        disabled={isPending}
      >
        <div
          className={`border-1 border-gray-400 w-5 h-5 rounded-full ${isCompleted ? 'bg-gray-400' : ''}`}
        >
          <div
            className={`w-1.5 h-3 border-l ${isCompleted ? 'border-white opactity-100' : 'border-gray-500 opacity-0'} group-hover:opacity-100 border-t rotate-220 translate-x-1.5 translate-y-[1px] transition-opacity`}
          />
        </div>
      </button>
    </form>
  );
}
