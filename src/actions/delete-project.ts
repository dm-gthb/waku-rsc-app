'use server';

import { eq } from 'drizzle-orm';
import { getDB } from '../db';
import { projects } from '../db/schema';
import { delay } from '../utils';

export async function deleteProject(formData: FormData) {
  const projectId = formData.get('projectId') as string;

  if (!projectId) {
    return { error: 'Project ID is required.' };
  }

  const db = getDB();

  await delay(3000);

  try {
    // throw new Error('Simulated error for testing');
    const result = await db.delete(projects).where(eq(projects.id, projectId));
    console.log('Project deleted:', result);
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
