import { sql } from 'drizzle-orm';
import { sqliteTable, text, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

const timestamps = {
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(current_timestamp)`),
};

const dateFields = {
  targetDate: text('target_date'),
  completedAt: text('completed_at'),
};

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text().unique().notNull(),
  name: text().notNull(),
  ...timestamps,
});

export const passwords = sqliteTable(
  'passwords',
  {
    hash: text().notNull(),
    userId: text('user_id')
      .references(() => users.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      })
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId] })],
);

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  priority: text('priority', { enum: ['low', 'medium', 'high'] })
    .notNull()
    .default('medium'),
  ...dateFields,
  ...timestamps,
});

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  parentTaskId: text('parent_task_id'),
  title: text('title').notNull(),
  description: text('description'),
  label: text('label'),
  priority: text('priority', { enum: ['low', 'medium', 'high'] }).default('medium'),
  ...dateFields,
  ...timestamps,
});

export const usersRelations = relations(users, ({ one, many }) => ({
  password: one(passwords),
  projects: many(projects),
}));

export const passwordsRelations = relations(passwords, ({ one }) => ({
  user: one(users, { fields: [passwords.userId], references: [users.id] }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  parentTask: one(tasks, {
    fields: [tasks.parentTaskId],
    references: [tasks.id],
    relationName: 'parentChild',
  }),
  subtasks: many(tasks, {
    relationName: 'parentChild',
  }),
}));
