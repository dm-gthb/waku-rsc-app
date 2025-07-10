'use server';

import { delay } from '../utils';
import {
  checkIsValidPassword,
  createSession,
  createUser,
  deleteSession,
  getPasswordByUserId,
  getUserByEmail,
} from '../utils/auth';

export async function signUp(_prev: unknown, formData: FormData) {
  try {
    await delay(1000);

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return {
        success: false,
        message: 'User with this email already exists',
        errors: ['User with this email already exists'],
      };
    }

    const user = await createUser(email, name, password);

    if (!user) {
      return {
        success: false,
        message: 'Failed to create user',
        errors: ['Failed to create user'],
      };
    }

    await createSession(user.id);

    return {
      success: true,
      message: 'Account created successfully',
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      success: false,
      message: 'An error occurred while creating your account',
      errors: ['Failed to create account'],
    };
  }
}

export async function login(_prev: unknown, formData: FormData) {
  try {
    await delay(1000);

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const user = await getUserByEmail(email);
    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password',
        errors: ['Invalid email or password'],
      };
    }

    const userPassword = await getPasswordByUserId(user.id);
    if (!userPassword) {
      return {
        success: false,
        message: 'Invalid email or password',
        errors: ['Invalid email or password'],
      };
    }

    const isPasswordValid = await checkIsValidPassword({
      password,
      hash: userPassword.hash,
    });
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid email or password',
        errors: ['Invalid email or password'],
      };
    }

    await createSession(user.id);

    return {
      success: true,
      message: 'Signed in successfully',
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      success: false,
      message: 'An error occurred while signing in',
      errors: ['Failed to sign in'],
    };
  }
}

export async function logout() {
  try {
    await deleteSession();
  } catch (error) {
    console.error('Logout error:', error);
  }
}
