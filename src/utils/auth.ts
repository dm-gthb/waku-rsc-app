import { getSignedCookie, setSignedCookie, deleteCookie } from 'hono/cookie';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { unstable_redirect } from 'waku/router/server';
import { getHonoContext } from '../lib/hono';
import { getDB } from '../db';
import { passwords, users } from '../db/schema';
import { User } from '../db/types';

export async function getCurrentUser() {
  console.log('Getting current user');
  const context = getHonoContext();

  if (!context) {
    return null;
  }

  try {
    const userId = await getSignedCookie(
      context,
      context.env.USER_SESSION_SIGNING_SECRET,
      'user_session',
    );

    console.log('User ID from cookie:', userId);

    if (!userId) {
      console.log('No user session found');
      return null;
    }

    const db = getDB();

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
    });

    if (!user) {
      console.log(`User ${userId} not found, logging out`);
      throw await deleteSession();
    }

    console.log('Current user:', user);
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function deleteSession() {
  const context = getHonoContext();

  if (!context) {
    throw new Error('Hono context not available');
  }

  deleteCookie(context, 'user_session', {
    path: '/',
  });

  console.log('User logged out');
}

export async function createSession(userId: string) {
  try {
    const context = getHonoContext();

    if (!context) {
      return {
        success: false,
        errorMessage: 'Hono context not available',
      };
    }

    const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

    await setSignedCookie(
      context,
      'user_session',
      userId,
      context.env.USER_SESSION_SIGNING_SECRET,
      {
        path: '/',
        secure: true,
        httpOnly: true,
        expires: new Date(Date.now() + MILLISECONDS_IN_DAY * 7),
        sameSite: 'lax',
      },
    );

    return true;
  } catch (error) {
    console.error('Error creating session:', error);
    return false;
  }
}

export async function createUser(email: string, name: string, password: string) {
  const db = getDB();
  try {
    const [createdUser] = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: email.toLowerCase(),
        name: name.toLowerCase(),
      })
      .returning();

    if (!createdUser) {
      throw new Error('Failed to create user');
    }

    await db.insert(passwords).values({
      hash: await bcrypt.hash(password, 10),
      userId: createdUser.id,
    });

    return createdUser;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

export async function getUserByEmail(email: string) {
  const db = getDB();
  try {
    const [result] = await db.select().from(users).where(eq(users.email, email));
    return result ?? null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

export async function getPasswordByUserId(userId: string) {
  const db = getDB();
  return await db.query.passwords.findFirst({
    where: (passwords, { eq }) => eq(passwords.userId, userId),
  });
}

export async function checkIsValidPassword({
  password,
  hash,
}: {
  password: string;
  hash: string;
}) {
  return await bcrypt.compare(password, hash);
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw unstable_redirect('/');
  }
  return user;
}

export async function requireAnonymous() {
  const user = await getCurrentUser();
  if (user) {
    throw unstable_redirect('/');
  }
}

export function restrictDemoUser(user: User) {
  if (user.role === 'demo') {
    console.log('Demo user restriction triggered');
    throw new Error('Demo users are not allowed to perform this action.');
  }
}
