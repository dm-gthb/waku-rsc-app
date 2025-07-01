import { getDB } from '../../../../../db';
import { delay } from '../../../../../utils';
import { TaskList } from '../../../../../components/task-list';

export default async function TaskPage({ taskId }: { taskId: string }) {
  const db = getDB();

  const task = await db.query.tasks.findFirst({
    where: (tasks, { eq }) => eq(tasks.id, taskId),
    with: {
      subtasks: {
        where: (tasks, { eq }) => eq(tasks.parentTaskId, taskId),
      },
    },
  });

  await delay(500);

  if (!task) {
    return <p>Task not found</p>;
  }

  const { subtasks } = task;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{task.title}</h1>

      {task.description && <p className="mb-8">{task.description}</p>}

      {subtasks && subtasks.length > 0 && (
        <>
          <h2 className="text-md font-semibold mb-1">
            Subtasks {subtasks.filter(({ completedAt }) => completedAt !== null).length} /{' '}
            {subtasks.length}
          </h2>
          <TaskList tasks={subtasks} isSubtaskList />
        </>
      )}
    </div>
  );
}
