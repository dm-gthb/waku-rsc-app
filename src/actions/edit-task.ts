'use server';

import { eq } from 'drizzle-orm';
import { getDB } from '../db';
import { tasks } from '../db/schema';
import { delay } from '../utils';
import { requireUser } from '../utils/auth';

export async function editTask(_prevState: unknown, formData: FormData) {
  const taskId = formData.get('taskId') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const priority = formData.get('priority') as 'low' | 'medium' | 'high' | null;

  if (!taskId || !title) {
    return { error: 'Task ID and title are required.' };
  }

  const db = getDB();

  await delay(3000);

  try {
    await requireUser();
    const updateData: Record<string, any> = { title, description };
    if (priority) {
      updateData.priority = priority;
    }

    await db.update(tasks).set(updateData).where(eq(tasks.id, taskId));

    const updatedTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        priority: tasks.priority,
        projectId: tasks.projectId,
        completedAt: tasks.completedAt,
      })
      .from(tasks)
      .where(eq(tasks.id, taskId));

    return { success: true, error: null, updatedTask: updatedTasks[0] };
  } catch (error) {
    console.error('Failed to update task:', error);
    return {
      success: false,
      error: 'Failed to update task.',
      updatedTask: undefined,
    };
  }
}
