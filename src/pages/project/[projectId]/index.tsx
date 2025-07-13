import { getDB } from '../../../db';
import { ProjectDetails } from '../../../components/project-details';
import { requireUser } from '../../../utils/auth';

export default async function ProjectDetailsPage({ projectId }: { projectId: string }) {
  await requireUser();
  const db = getDB();
  const project = await db.query.projects.findFirst({
    where: (projects, { eq }) => eq(projects.id, projectId),
    with: {
      tasks: {
        where: (tasks, { eq, and, isNull }) =>
          and(eq(tasks.projectId, projectId), isNull(tasks.parentTaskId)),
        with: {
          subtasks: true,
        },
      },
    },
  });

  if (!project) {
    return <p>Project not found</p>;
  }

  return <ProjectDetails project={project} />;
}
