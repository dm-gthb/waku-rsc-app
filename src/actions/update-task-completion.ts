'use server';

import { eq } from 'drizzle-orm';
import z from 'zod';
import { getDB } from '../db';
import { tasks } from '../db/schema';
import { delay } from '../utils';
import { requireUser } from '../utils/auth';

const updateTaskCompletionSchema = z.object({
  taskId: z.string().nonempty('Task ID is required.'),
  isToCompleteIntension: z.coerce.boolean(),
});

export async function updateTaskCompletion(formData: FormData) {
  const { success, data } = updateTaskCompletionSchema.safeParse({
    taskId: formData.get('taskId'),
    isToCompleteIntension: formData.get('isToCompleteIntension'),
  });

  if (!success) {
    return {
      success: false,
      error: 'Invalid input data.',
      updatedTasks: [],
    };
  }

  const { taskId, isToCompleteIntension } = data;
  const isCompleting = isToCompleteIntension === true;

  const db = getDB();
  let originalCompletedAt: string | null = null;
  const updatedTaskIds = new Set<string>([taskId]);

  await delay(2000);

  try {
    await requireUser();
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
      const subtasks = await db
        .select({ id: tasks.id })
        .from(tasks)
        .where(eq(tasks.parentTaskId, taskId));

      subtasks.forEach((subtask) => updatedTaskIds.add(subtask.id));

      await db
        .update(tasks)
        .set({ completedAt: isCompleting ? new Date().toISOString() : null })
        .where(eq(tasks.parentTaskId, taskId));

      const taskInfo = await db
        .select({ parentTaskId: tasks.parentTaskId })
        .from(tasks)
        .where(eq(tasks.id, taskId))
        .get();

      if (taskInfo?.parentTaskId) {
        const parentId = taskInfo.parentTaskId;
        const allSiblingTasks = await db
          .select({ id: tasks.id, completedAt: tasks.completedAt })
          .from(tasks)
          .where(eq(tasks.parentTaskId, parentId));

        const allCompleted = allSiblingTasks.every((task) => task.completedAt !== null);

        updatedTaskIds.add(parentId);

        await db
          .update(tasks)
          .set({
            completedAt: allCompleted ? new Date().toISOString() : null,
          })
          .where(eq(tasks.id, parentId));
      }

      const updatedTasks = await db.select().from(tasks).where(eq(tasks.id, taskId));

      const updatedSubtasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.parentTaskId, taskId));

      let parentTask: typeof updatedTasks = [];
      if (taskInfo?.parentTaskId && updatedTaskIds.has(taskInfo.parentTaskId)) {
        parentTask = await db
          .select()
          .from(tasks)
          .where(eq(tasks.id, taskInfo.parentTaskId));
      }

      const allUpdatedTasks = [...updatedTasks, ...updatedSubtasks, ...parentTask];

      return {
        success: true,
        error: null,
        updatedTasks: allUpdatedTasks,
      };
    } catch (subtaskError) {
      console.error('Error updating subtasks, attempting rollback:', subtaskError);

      await db
        .update(tasks)
        .set({ completedAt: originalCompletedAt })
        .where(eq(tasks.id, taskId));

      throw new Error('Failed to update subtasks and rolled back main task update');
    }
  } catch (error) {
    console.error('Error updating task completion status:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update task completion status',
      updatedTasks: [],
    };
  }
}
