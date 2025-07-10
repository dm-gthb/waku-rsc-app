import { getDB } from '../db';
import { delay } from '../utils';
import { ProjectList } from '../components/project-list';
import { getCurrentUser } from '../utils/auth';
import { unstable_redirect } from 'waku/router/server';
import { LogoutButton } from '../components/logout-button';

export default async function HomePage() {
  const user = await getCurrentUser();
  console.log('Current user:', user);

  if (!user) {
    unstable_redirect('/login');
  }

  const db = getDB();
  const projects = await db.query.projects.findMany({
    where: (projects, { eq }) => eq(projects.userId, user.id),
    with: {
      tasks: true,
    },
  });

  await delay(500);

  return (
    <>
      <header className="pb-3 flex items-center justify-between mb-6">
        <h1 className="font-semibold">Projects</h1>
        <LogoutButton />
      </header>
      <ProjectList projects={projects} />
    </>
  );
}
