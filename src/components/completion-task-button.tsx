import { Task } from '../db/types';

export function CompletionTaskButton({
  task,
  formAction,
}: {
  task: Task;
  formAction: (formData: FormData) => void;
}) {
  const isCompleted = Boolean(task.completedAt);
  return (
    <form action={formAction} className="flex">
      <input type="hidden" name="taskId" value={task.id} />
      <input
        type="hidden"
        name="isToCompleteIntension"
        value={task.completedAt ? 'false' : 'true'}
      />
      <button className="cursor-pointer group/button" type="submit">
        <div
          className={`border-1 border-gray-400 w-5 h-5 rounded-full ${isCompleted ? 'bg-gray-400' : ''}`}
        >
          <div
            className={`w-1.5 h-3 border-l ${isCompleted ? 'border-white opactity-100' : 'border-gray-500 opacity-0'} group-hover/button:opacity-100 border-t rotate-220 translate-x-1.5 translate-y-[1px] transition-opacity`}
          />
        </div>
      </button>
    </form>
  );
}
