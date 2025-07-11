'use server';

import { eq } from 'drizzle-orm';
import { getDB } from '../db';
import { projects } from '../db/schema';
import { delay } from '../utils';
import { requireUser } from '../utils/auth';
import z from 'zod';

const deleteProjectSchema = z.object({
  projectId: z.string().nonempty('Project ID is required.'),
});

export async function deleteProject(formData: FormData) {
  const projectId = formData.get('projectId') as string;

  const { success } = deleteProjectSchema.safeParse({
    projectId: formData.get('projectId'),
  });

  if (!success) {
    return { error: 'Invalid project ID.' };
  }

  const db = getDB();

  await delay(3000);

  try {
    await requireUser();
    await db.delete(projects).where(eq(projects.id, projectId));
    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Failed to delete task:', error);
    return {
      success: false,
      error: 'Failed to delete task and its subtasks.',
    };
  }
}
