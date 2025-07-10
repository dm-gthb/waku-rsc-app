'use server';

import { eq } from 'drizzle-orm';
import { getDB } from '../db';
import { tasks } from '../db/schema';
import { delay } from '../utils';
import { requireUser } from '../utils/auth';

export async function deleteTask(formData: FormData) {
  const taskId = formData.get('taskId') as string;

  if (!taskId) {
    return { error: 'Task ID is required.' };
  }

  const db = getDB();

  await delay(3000);

  try {
    const user = await requireUser();

    if (!user) {
      return { error: 'User not authenticated.' };
    }

    const result = await db.delete(tasks).where(eq(tasks.id, taskId));
    console.log('Task deleted:', result);
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
