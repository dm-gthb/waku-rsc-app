import { TaskDetails } from '../../../../../components/task-details';
import { getDB } from '../../../../../db';
import { requireUser } from '../../../../../utils/auth';

export default async function TaskPage({ taskId }: { taskId: string }) {
  await requireUser();
  const db = getDB();

  const task = await db.query.tasks.findFirst({
    where: (tasks, { eq }) => eq(tasks.id, taskId),
    with: {
      subtasks: {
        where: (tasks, { eq }) => eq(tasks.parentTaskId, taskId),
      },
    },
  });

  if (!task) {
    return <p>Task not found</p>;
  }

  return <TaskDetails task={task} key={task.id} />;
}
