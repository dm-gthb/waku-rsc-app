'use server';

import z from 'zod';
import { delay } from '../utils';
import {
  checkIsValidPassword,
  createSession,
  createUser,
  deleteSession,
  getPasswordByUserId,
  getUserByEmail,
} from '../utils/auth';

const loginSchema = z.object({
  email: z.email().nonempty('Email is required'),
  password: z.string().nonempty('Password is required'),
});

const signUpSchema = z.object({
  email: z.email().nonempty('Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().nonempty('Name is required'),
});

export async function signUp(_prev: unknown, formData: FormData) {
  try {
    await delay(1000);

    const userData = {
      email: formData.get('email'),
      password: formData.get('password'),
      name: formData.get('name'),
    };

    const { success, data, error } = signUpSchema.safeParse(userData);

    if (!success) {
      return {
        success: false,
        errorMessage: 'Validation failed',
        fieldErrors: z.flattenError(error).fieldErrors,
      };
    }
    const { email, password, name } = data;

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return {
        success: false,
        errorMessage: 'Validation failed',
        fieldErrors: {
          email: ['User with this email already exists'],
        },
      };
    }

    const user = await createUser(email, name, password);

    if (!user) {
      return {
        success: false,
        errorMessage: 'Failed to create user',
        fieldErrors: null,
      };
    }

    await createSession(user.id);

    return {
      success: true,
      errorMessage: '',
      fieldErrors: null,
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      success: false,
      errorMessage: 'An error occurred while creating your account',
      fieldErrors: null,
    };
  }
}

export async function login(_prev: unknown, formData: FormData) {
  try {
    await delay(1000);

    const userData = {
      email: formData.get('email'),
      password: formData.get('password'),
    };
    const { success, data, error } = loginSchema.safeParse(userData);

    if (!success) {
      console.log(z.flattenError(error).fieldErrors);
      return {
        success: false,
        errorMessage: 'Validation failed',
        fieldErrors: z.flattenError(error).fieldErrors,
      };
    }

    const { email, password } = data;

    const user = await getUserByEmail(email);

    if (!user) {
      return {
        success: false,
        errorMessage: 'Invalid email or password',
        fieldErrors: null,
      };
    }

    const userPassword = await getPasswordByUserId(user.id);
    if (!userPassword) {
      return {
        success: false,
        errorMessage: 'Invalid email or password',
        fieldErrors: null,
      };
    }

    const isPasswordValid = await checkIsValidPassword({
      password,
      hash: userPassword.hash,
    });
    if (!isPasswordValid) {
      return {
        success: false,
        errorMessage: 'Invalid email or password',
        fieldErrors: null,
      };
    }

    await createSession(user.id);

    return {
      success: true,
      errorMessage: '',
      fieldErrors: null,
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      success: false,
      errorMessage: 'An error occurred while signing in',
      fieldErrors: null,
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
