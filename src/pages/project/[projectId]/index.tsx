import { getDB } from '../../../db';
import { delay } from '../../../utils';
import { TaskList } from '../../../components/task-list';

export default async function ProjectDetails({ projectId }: { projectId: string }) {
  const db = getDB();
  const project = await db.query.projects.findFirst({
    where: (projects, { eq }) => eq(projects.id, projectId),
    with: {
      tasks: {
        where: (tasks, { eq }) => eq(tasks.projectId, projectId),
        with: {
          subtasks: true,
        },
      },
    },
  });

  if (!project) {
    return <p>Project not found</p>;
  }

  await delay(500);

  const { tasks } = project;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{project.title}</h1>

      {project.description && <p className="mb-8">{project.description}</p>}

      <div className="flex flex-col gap-2 text-sm text-gray-600 mb-8">
        {project.targetDate && (
          <p>Target date: {new Date(project.targetDate).toLocaleDateString()}</p>
        )}
        <p>Project ID: {project.id}</p>
        {project.completedAt && (
          <p>Completed at: {new Date(project.completedAt).toLocaleDateString()}</p>
        )}
      </div>

      {tasks && tasks.length > 0 ? (
        <TaskList tasks={tasks} />
      ) : (
        <p>No tasks for project</p>
      )}
    </div>
  );
}
