'use server';

import { eq } from 'drizzle-orm';
import { getDB } from '../db';
import { tasks } from '../db/schema';
import { delay } from '../utils';

export async function manageTask(_prevState: unknown, formData: FormData) {
  const taskId = formData.get('taskId') as string;
  const isToCompleteIntension = formData.get('isToCompleteIntension') as string;
  const isCompleting = isToCompleteIntension === 'true';

  const db = getDB();
  let originalCompletedAt: string | null = null;

  await delay(400);

  try {
    const currentTaskState = await db
      .select({ completedAt: tasks.completedAt })
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .get();

    if (currentTaskState) {
      originalCompletedAt = currentTaskState.completedAt;
    }

    await db
      .update(tasks)
      .set({ completedAt: isCompleting ? new Date().toISOString() : null })
      .where(eq(tasks.id, taskId));

    try {
      await db
        .update(tasks)
        .set({ completedAt: isCompleting ? new Date().toISOString() : null })
        .where(eq(tasks.parentTaskId, taskId));
    } catch (subtaskError) {
      console.error('Error updating subtasks, attempting rollback:', subtaskError);

      await db
        .update(tasks)
        .set({ completedAt: originalCompletedAt })
        .where(eq(tasks.id, taskId));

      throw new Error('Failed to update subtasks and rolled back main task update');
    }

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Error updating task completion status:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update task completion status',
    };
  }
}
