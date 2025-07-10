import { getDB } from '../db';
import { delay } from '../utils';
import { ProjectList } from '../components/project-list';

export default async function HomePage() {
  const db = getDB();
  const projects = await db.query.projects.findMany({
    with: {
      tasks: true,
    },
  });

  await delay(500);

  return <ProjectList projects={projects} />;
}
