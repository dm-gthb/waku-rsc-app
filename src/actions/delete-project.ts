'use server';

import { eq } from 'drizzle-orm';
import { getDB } from '../db';
import { projects } from '../db/schema';
import { requireUser, restrictDemoUser } from '../utils/auth';
import z from 'zod';

const deleteProjectSchema = z.object({
  projectId: z.string().nonempty('Project ID is required.'),
});

export async function deleteProject(projectId: string) {
  const { success, data } = deleteProjectSchema.safeParse({
    projectId,
  });

  if (!success) {
    return { error: 'Invalid project ID.' };
  }

  const db = getDB();

  try {
    const user = await requireUser();
    restrictDemoUser(user);

    await db.delete(projects).where(eq(projects.id, data.projectId));
    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Failed to delete project:', error);
    return {
      success: false,
      error: 'Failed to delete project.',
    };
  }
}
