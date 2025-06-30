import { Link } from 'waku';
import { getDB } from '../../../../../db';
import { delay } from '../../../../../utils';

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
      <Link
        to={`/project/${task.projectId}/tasks`}
        className="hover:underline inline-block mb-6 p-2 -ml-2"
      >
        Back to project tasks
      </Link>
      <h1 className="text-2xl font-bold mb-4">{task.title}</h1>

      {task.description && <p className="mb-8">{task.description}</p>}

      {subtasks && subtasks.length > 0 && (
        <>
          <h2 className="text-md font-semibold mb-1">
            Subtasks {subtasks.filter(({ completedAt }) => completedAt !== null).length} /{' '}
            {subtasks.length}
          </h2>
          <ul className="pl-6">
            {subtasks.map((subtask) => (
              <li key={subtask.id} className="border-b border-b-gray-100 py-3 block">
                <Link to={`/project/${task.projectId}/tasks/subtasks/${subtask.id}`}>
                  {subtask.title}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
