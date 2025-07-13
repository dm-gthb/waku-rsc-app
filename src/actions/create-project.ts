'use server';

import z from 'zod';
import { getDB } from '../db';
import { projects } from '../db/schema';
import { requireUser, restrictDemoUser } from '../utils/auth';

const projectSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  targetDate: z.coerce.date().optional(),
});

export async function createProject(_prevState: unknown, formData: FormData) {
  const db = getDB();

  const userData = {
    title: formData.get('title'),
    description: formData.get('description'),
    priority: formData.get('priority'),
    targetDate: formData.get('targetDate') as string,
  };

  const { success, error, data } = projectSchema.safeParse({
    ...userData,
    targetDate: userData.targetDate ? new Date(userData.targetDate) : undefined,
  });

  if (!success) {
    return {
      success: false,
      errorMessage: '',
      fieldErrors: z.flattenError(error).fieldErrors,
    };
  }

  const { title, description, priority, targetDate } = data;

  try {
    const user = await requireUser();
    restrictDemoUser(user);

    const [newProject] = await db
      .insert(projects)
      .values({
        id: crypto.randomUUID(),
        userId: user.id,
        title,
        description,
        priority,
        targetDate: targetDate ? targetDate.toISOString() : undefined,
      })
      .returning();

    return { success: true, project: newProject, error: null };
  } catch (error) {
    console.error('Failed to create project:', error);
    return {
      success: false,
      errorMessage: 'Failed to create project. Please try again.',
    };
  }
}
