'use server';

import { eq } from 'drizzle-orm';
import { getDB } from '../db';
import { tasks } from '../db/schema';
import { requireUser, restrictDemoUser } from '../utils/auth';
import z from 'zod';

const deleteTaskSchema = z.object({
  taskId: z.string().nonempty('Task ID is required.'),
});

export async function deleteTask(taskId: string) {
  const { success, data } = deleteTaskSchema.safeParse({
    taskId,
  });

  if (!success) {
    return { error: 'Invalid task ID.' };
  }

  const db = getDB();

  try {
    const user = await requireUser();
    restrictDemoUser(user);

    await db.delete(tasks).where(eq(tasks.id, data.taskId));
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
