'use client';

import { useActionState } from 'react';
import { Link, useRouter } from 'waku';
import { FormErrorList } from '../components/form-errors-list';
import { Spinner } from '../components/spinner';
import { signUp } from '../actions/auth';

const classNames = {
  input:
    'aria-[invalid]:border-red-500 p-3 border-2 rounded dark:bg-transparent disabled:text-gray-400 border-gray-200',
  formGroup: 'flex flex-col gap-1 mb-3',
};

export default function SignupPage() {
  const router = useRouter();
  const [formState, formAction, isPending] = useActionState(
    async (prev: unknown, formData: FormData) => {
      const result = await signUp(prev, formData);
      if (result.success) {
        router.push('/login');
      }

      return result;
    },
    {
      success: false,
      errorMessage: '',
      fieldErrors: null,
    },
  );

  const { success, fieldErrors, errorMessage } = formState;

  if (success) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-8">Success!</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-8 py-4">
      <h1 className="text-2xl font-bold mb-2">Create new account</h1>
      <div className="min-h-6 mb-4">
        <FormErrorList errors={errorMessage ? [errorMessage] : null} />
      </div>
      <div className="mb-4 w-full sm:w-96">
        <div>
          <form action={formAction}>
            <fieldset disabled={false}>
              <div className={classNames.formGroup}>
                <label htmlFor={'name'}>Name</label>
                <input
                  id="name"
                  name="name"
                  className={classNames.input}
                  autoComplete="name"
                  autoFocus
                  required
                />
                <div className="min-h-6">
                  <FormErrorList errors={fieldErrors?.name ?? null} />
                </div>
              </div>
              <div className={classNames.formGroup}>
                <label htmlFor={'email'}>Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={classNames.input}
                  autoComplete="email"
                  required
                />
                <div className="min-h-6">
                  <FormErrorList errors={fieldErrors?.email ?? null} />
                </div>
              </div>
              <div className={classNames.formGroup}>
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className={`${classNames.input} w-full pr-11`}
                  autoComplete="current-password"
                  required
                  minLength={6}
                />
                <div className="min-h-6">
                  <FormErrorList errors={fieldErrors?.password ?? null} />
                </div>
              </div>
            </fieldset>
            <button
              type="submit"
              disabled={isPending}
              className="w-full cursor-pointer rounded-full bg-gray-500 px-10 py-3 text-center text-white font-bold transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-400 mt-1 min-h-14"
            >
              {isPending ? (
                <Spinner
                  width={20}
                  height={20}
                  className="inline animate-spin fill-gray-500 text-center text-gray-50 dark:fill-gray-50 dark:text-gray-600"
                />
              ) : (
                <span>Signup</span>
              )}
            </button>
          </form>
        </div>
      </div>
      <div>
        Already have an account?{' '}
        <Link
          to="/login"
          className="underline disabled:cursor-not-allowed disabled:text-gray-400"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
