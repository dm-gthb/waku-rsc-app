'use server';

import { eq } from 'drizzle-orm';
import z from 'zod';
import { getDB } from '../db';
import { tasks } from '../db/schema';
import { delay } from '../utils';
import { requireUser, restrictDemoUser } from '../utils/auth';

const editTaskSchema = z.object({
  taskId: z.string().nonempty('Task ID is required.'),
  title: z
    .string()
    .min(1, 'Title is required.')
    .max(100, 'Title must be at most 100 characters.'),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters.')
    .optional(),
});

export async function editTask(_prevState: unknown, formData: FormData) {
  const userData = {
    taskId: formData.get('taskId'),
    title: formData.get('title'),
    description: formData.get('description'),
  };

  const { success, data } = editTaskSchema.safeParse(userData);

  if (!success) {
    return {
      success: false,
      error: 'Invalid input data.',
    };
  }

  const db = getDB();

  await delay(3000);

  const { taskId, title, description } = data;

  try {
    const user = await requireUser();
    restrictDemoUser(user);

    const updateData: Record<string, any> = { title, description };
    await db.update(tasks).set(updateData).where(eq(tasks.id, taskId));

    const [updatedTask] = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        projectId: tasks.projectId,
        completedAt: tasks.completedAt,
      })
      .from(tasks)
      .where(eq(tasks.id, taskId));

    return { success: true, error: null, updatedTask };
  } catch (error) {
    console.error('Failed to update task:', error);
    return {
      success: false,
      error: 'Failed to update task.',
      updatedTask: undefined,
    };
  }
}
