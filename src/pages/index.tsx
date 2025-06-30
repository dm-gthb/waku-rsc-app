import { getDB } from '../db';
import { delay } from '../utils';
import { ProjectList } from '../components/project-list';
import { Task } from '../db/types';

export default async function HomePage() {
  const db = getDB();
  const projects = await db.query.projects.findMany({
    with: {
      tasks: true,
    },
  });

  await delay(500);

  const projectsWithProgress = projects.map((project) => ({
    ...project,
    progress: calculateProjectProgress(project.tasks),
  }));

  return <ProjectList projects={projectsWithProgress} />;
}

export function calculateProjectProgress(tasks: Task[]): number | null {
  if (!tasks || tasks.length === 0) {
    return null;
  }

  const completedTasks = tasks.filter((task) => task.completedAt !== null);
  return Math.round((completedTasks.length / tasks.length) * 100);
}
