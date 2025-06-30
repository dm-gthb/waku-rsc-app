import { Link } from 'waku';
import { delay } from '../../../../../../../utils';
import { getDB } from '../../../../../../../db';

export default async function SubtaskPage({ subtaskId }: { subtaskId: string }) {
  const db = getDB();

  const task = await db.query.tasks.findFirst({
    where: (tasks, { eq }) => eq(tasks.id, subtaskId),
    with: {
      parentTask: {
        columns: {
          id: true,
          title: true,
        },
      },
    },
  });

  await delay(500);

  if (!task) {
    return <p>Task not found</p>;
  }

  return (
    <div>
      <h1>
        {task.title} (subtask for {task.parentTask?.title})
      </h1>
    </div>
  );
}
