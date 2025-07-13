import { TaskDetails } from '../../../../../../components/task-details';
import { getDB } from '../../../../../../db';
import { requireUser } from '../../../../../../utils/auth';

export default async function SubtaskPage({ subtaskId }: { subtaskId: string }) {
  await requireUser();
  const db = getDB();

  const task = await db.query.tasks.findFirst({
    where: (tasks, { eq }) => eq(tasks.id, subtaskId),
    with: {
      subtasks: {
        where: (tasks, { eq }) => eq(tasks.parentTaskId, subtaskId),
      },
    },
  });

  if (!task) {
    return <p>Task not found</p>;
  }

  return <TaskDetails task={task} key={task.id} />;
}
