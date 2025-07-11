'use server';
import z from 'zod';
import { getDB } from '../db';
import { tasks } from '../db/schema';
import { delay } from '../utils';
import { requireUser } from '../utils/auth';

const taskSchema = z.object({
  projectId: z.string().nonempty(),
  parentTaskId: z
    .string()
    .transform((val) => (val === '' ? null : val))
    .nullable(),
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters long')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
});

export async function createTask(_prevState: unknown, formData: FormData) {
  const data = {
    projectId: formData.get('projectId'),
    parentTaskId: formData.get('parentTaskId'),
    title: formData.get('title'),
    description: formData.get('description'),
  };

  const { success, error, data: validatedData } = taskSchema.safeParse(data);

  if (!success) {
    console.log(z.flattenError(error).fieldErrors);
    return {
      success: false,
      errors: Object.values(z.flattenError(error).fieldErrors).flat(),
    };
  }

  const { projectId, parentTaskId, title, description } = validatedData;

  await delay(2000);

  try {
    const db = getDB();
    await requireUser();
    const [newTask] = await db
      .insert(tasks)
      .values({
        id: crypto.randomUUID(),
        title,
        description,
        parentTaskId,
        projectId,
        priority: 'medium',
      })
      .returning();

    return { success: true, task: newTask, errors: null };
  } catch (error) {
    console.error('Failed to create task:', error);
    return {
      success: false,
      errors: ['Failed to create task. Please try again.'],
      task: undefined,
    };
  }
}
