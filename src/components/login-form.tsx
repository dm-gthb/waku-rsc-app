'use client';

import { useActionState } from 'react';
import { Link, useRouter } from 'waku';
import { FormErrorList } from '../components/form-errors-list';
import { Spinner } from '../components/spinner';
import { login } from '../actions/auth';
import { useIsDemoMode } from '../context/demo-mode';

const classNames = {
  input:
    'aria-[invalid]:border-red-500 p-3 border-2 rounded dark:bg-transparent disabled:text-gray-400 border-gray-200',
  formGroup: 'flex flex-col gap-1 mb-3',
};

export default function LoginPage() {
  const router = useRouter();
  const { setIsDemo } = useIsDemoMode();
  const [formState, formAction, isPending] = useActionState(
    async (prev: unknown, formData: FormData) => {
      const result = await login(prev, formData);
      if (result.success) {
        setIsDemo(result.user?.role === 'demo');
        router.push('/');
      }

      return result;
    },
    {
      success: false,
      errorMessage: '',
      fieldErrors: null,
      user: null,
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
      <h1 className="text-2xl font-bold mb-6">Log in to your account</h1>
      <DemoDataInfo />
      <div className="mb-4 w-full sm:w-96">
        <div>
          <form action={formAction}>
            <fieldset disabled={false}>
              <div className={classNames.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={classNames.input}
                  autoComplete="email"
                  autoFocus
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
            <div className="min-h-6 mb-0 text-center">
              <FormErrorList errors={errorMessage ? [errorMessage] : null} />
            </div>
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
                <span>Login</span>
              )}
            </button>
          </form>
        </div>
      </div>
      <div>
        Don't have an account?{' '}
        <Link
          to="/signup"
          className="underline disabled:cursor-not-allowed disabled:text-gray-400"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}

function DemoDataInfo() {
  return (
    <div className="mb-4 p-4 bg-gray-100 border border-gray-200 rounded">
      <p className="text-center mb-1">Demo account with sample data:</p>
      <p>
        <span className="font-semibold">Email:</span> <code>demo@example.com</code>
      </p>
      <p>
        <span className="font-semibold">Password:</span> <code>demo123</code>
      </p>
    </div>
  );
}
