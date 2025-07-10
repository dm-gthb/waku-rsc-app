'use server';

import { getDB } from '../db';
import { projects } from '../db/schema';
import { delay } from '../utils';

export async function createProject(_prevState: unknown, formData: FormData) {
  const db = getDB();
  // const userId = formData.get('userId') as string;
  const userId = 'user_1'; // replace later
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const priorityInput = formData.get('priority') as string;
  const priority =
    priorityInput && ['low', 'medium', 'high'].includes(priorityInput)
      ? (priorityInput as 'low' | 'medium' | 'high')
      : 'medium';
  const targetDate = formData.get('targetDate') as string;

  if (!title || !userId) {
    return { error: 'Title and user ID are required.' };
  }

  await delay(2000);

  try {
    // throw new Error('Simulated error');
    const newProject = await db
      .insert(projects)
      .values({
        id: crypto.randomUUID(),
        userId,
        title,
        description: description || undefined,
        priority,
        targetDate: targetDate || undefined,
      })
      .returning();

    return { success: true, project: newProject[0], error: null };
  } catch (error) {
    console.error('Failed to create project:', error);
    return {
      success: false,
      error: 'Failed to create project. Please try again.',
      project: undefined,
    };
  }
}
