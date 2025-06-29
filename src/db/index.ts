import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import { getHonoContext } from '../lib/hono';

export function getDB() {
  const context = getHonoContext();
  if (!context || !context.env || !context.env.DB) {
    throw new Error('Database not available in the current context');
  }
  return drizzle(context.env.DB, { schema });
}
