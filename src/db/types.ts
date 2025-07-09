import {
  BuildQueryResult,
  DBQueryConfig,
  ExtractTablesWithRelations,
} from 'drizzle-orm/relations';
import * as schema from './schema';

export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;
export type Project = typeof schema.projects.$inferSelect;
export type NewProject = typeof schema.projects.$inferInsert;
export type Task = typeof schema.tasks.$inferSelect;
export type NewTask = typeof schema.tasks.$inferInsert;

type Schema = typeof schema;
type TSchema = ExtractTablesWithRelations<Schema>;

export type IncludeRelation<TableName extends keyof TSchema> = DBQueryConfig<
  'one' | 'many',
  boolean,
  TSchema,
  TSchema[TableName]
>['with'];

export type InferResultType<
  TableName extends keyof TSchema,
  With extends IncludeRelation<TableName> | undefined = undefined,
> = BuildQueryResult<
  TSchema,
  TSchema[TableName],
  {
    with: With;
  }
>;

export type TaskWithSubtasks = InferResultType<'tasks', { subtasks: true }>;
export type TaskWithOptionalSubtasks = InferResultType<'tasks', { subtasks?: true }>;

export type ProjectWithTasks = InferResultType<'projects', { tasks: true }>;
