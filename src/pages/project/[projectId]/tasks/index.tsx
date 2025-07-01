import { Link } from 'waku';
import { getDB } from '../../../../db';
import { delay } from '../../../../utils';
import { TaskList } from '../../../../components/task-list';

export default async function ProjectTasksPage({ projectId }: { projectId: string }) {
  const db = getDB();

  const tasks = await db.query.tasks.findMany({
    where: (tasks, { eq, and, isNull }) =>
      and(eq(tasks.projectId, projectId), isNull(tasks.parentTaskId)),
    with: {
      subtasks: true,
    },
  });

  const project = await db.query.projects.findFirst({
    where: (projects, { eq }) => eq(projects.id, projectId),
  });

  await delay(500);

  if (!project) {
    return <p>Project not found</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        <Link to={`/project/${projectId}`}>{project.title}</Link>
      </h1>
      <div className="flex flex-col">
        <TaskList tasks={tasks} />
      </div>
    </div>
  );
}
