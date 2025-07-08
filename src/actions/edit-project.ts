'use server';

import { eq } from 'drizzle-orm';
import { getDB } from '../db';
import { projects } from '../db/schema';
import { delay } from '../utils';

export async function editProject(_prevState: unknown, formData: FormData) {
  const projectId = formData.get('projectId') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;

  if (!projectId || !title) {
    return { error: 'Project ID and title are required.' };
  }

  const db = getDB();

  await delay(2000);

  try {
    // throw new Error('Simulated error for testing');
    await db
      .update(projects)
      .set({ title, description })
      .where(eq(projects.id, projectId));

    const updatedProjects = await db
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
      })
      .from(projects)
      .where(eq(projects.id, projectId));

    return { success: true, error: null, updatedProject: updatedProjects[0] };
  } catch (error) {
    console.error('Failed to update project:', error);
    return {
      success: false,
      error: 'Failed to update project.',
      updatedProject: undefined,
    };
  }
}
