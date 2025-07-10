'use server';
import { getDB } from '../db';
import { tasks } from '../db/schema';
import { delay } from '../utils';
import { requireUser } from '../utils/auth';

export async function createTask(_prevState: unknown, formData: FormData) {
  const db = getDB();
  const projectId = formData.get('projectId') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const label = formData.get('label') as string;
  const priorityInput = formData.get('priority') as string;
  const priority =
    priorityInput && ['low', 'medium', 'high'].includes(priorityInput)
      ? (priorityInput as 'low' | 'medium' | 'high')
      : undefined;
  const parentTaskId = formData.get('parentTaskId') as string;
  const completedAt = formData.get('completedAt') as string;

  if (!title || !projectId) {
    return { error: 'Title and project ID are required.' };
  }

  await delay(2000);

  try {
    await requireUser();
    const newTask = await db
      .insert(tasks)
      .values({
        id: crypto.randomUUID(),
        title,
        description: description || undefined,
        label: label || undefined,
        priority,
        parentTaskId,
        projectId,
        completedAt,
      })
      .returning();

    return { success: true, task: newTask[0], error: null };
  } catch (error) {
    console.error('Failed to create task:', error);
    return {
      success: false,
      error: 'Failed to create task. Please try again.',
      task: undefined,
    };
  }
}
