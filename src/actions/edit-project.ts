'use server';

import { eq } from 'drizzle-orm';
import z from 'zod';
import { getDB } from '../db';
import { projects } from '../db/schema';
import { delay } from '../utils';
import { requireUser } from '../utils/auth';

const editProjectSchema = z.object({
  projectId: z.string().nonempty('Project ID is required.'),
  title: z
    .string()
    .min(1, 'Title is required.')
    .max(100, 'Title must be at most 100 characters.'),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters.')
    .optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  targetDate: z.coerce.date().optional(),
});

export async function editProject(_prevState: unknown, formData: FormData) {
  const userData = {
    projectId: formData.get('projectId'),
    title: formData.get('title'),
    description: formData.get('description'),
    priority: formData.get('priority'),
    targetDate: formData.get('targetDate') as string,
  };

  const { success, error, data } = editProjectSchema.safeParse({
    ...userData,
    targetDate: userData.targetDate ? new Date(userData.targetDate) : undefined,
  });

  if (!success) {
    return {
      success: false,
      errors: Object.values(z.flattenError(error).fieldErrors).flat(),
    };
  }

  const { projectId, title, description, priority, targetDate } = data;

  const db = getDB();

  await delay(2000);

  try {
    await requireUser();
    await db
      .update(projects)
      .set({
        title,
        description,
        priority,
        targetDate: targetDate ? targetDate.toISOString() : undefined,
      })
      .where(eq(projects.id, projectId));

    const [updatedProject] = await db
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        priority: projects.priority,
        targetDate: projects.targetDate,
      })
      .from(projects)
      .where(eq(projects.id, projectId));

    return { success: true, errors: null, updatedProject };
  } catch (error) {
    console.error('Failed to update project:', error);
    return {
      success: false,
      errors: ['Failed to update project.'],
      updatedProject: undefined,
    };
  }
}
