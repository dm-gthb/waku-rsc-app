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

const defaultAuthResponse = {
  success: false,
  errorMessage: '',
  fieldErrors: null,
  user: null,
};

export async function signUp(_prev: unknown, formData: FormData) {
  try {
    await delay(1000);

    const userData = {
      email: formData.get('email'),
      password: formData.get('password'),
      name: formData.get('name'),
      user: null,
    };

    const { success, data, error } = signUpSchema.safeParse(userData);

    if (!success) {
      return {
        ...defaultAuthResponse,
        errorMessage: 'Validation failed',
        fieldErrors: z.flattenError(error).fieldErrors,
      };
    }
    const { email, password, name } = data;

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return {
        ...defaultAuthResponse,
        fieldErrors: {
          email: ['User with this email already exists'],
        },
      };
    }

    const user = await createUser(email, name, password);

    if (!user) {
      return {
        ...defaultAuthResponse,
        errorMessage: 'Failed to create user',
      };
    }

    await createSession(user.id);

    return {
      ...defaultAuthResponse,
      success: true,
      user: { role: user.role },
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      ...defaultAuthResponse,
      errorMessage: 'An error occurred while creating your account',
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
        ...defaultAuthResponse,
        errorMessage: 'Validation failed',
        fieldErrors: z.flattenError(error).fieldErrors,
      };
    }

    const { email, password } = data;

    const user = await getUserByEmail(email);

    if (!user) {
      return {
        ...defaultAuthResponse,
        errorMessage: 'Invalid email or password',
      };
    }

    const userPassword = await getPasswordByUserId(user.id);
    if (!userPassword) {
      return {
        errorMessage: 'Invalid email or password',
      };
    }

    const isPasswordValid = await checkIsValidPassword({
      password,
      hash: userPassword.hash,
    });
    if (!isPasswordValid) {
      return {
        ...defaultAuthResponse,
        errorMessage: 'Invalid email or password',
      };
    }

    await createSession(user.id);
    return {
      ...defaultAuthResponse,
      success: true,
      user: { role: user.role },
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      ...defaultAuthResponse,
      errorMessage: 'An error occurred while signing in',
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
