'use client';

import { useActionState } from 'react';
import { createProject } from '../actions/create-project';
import { useRouter } from 'waku';
import { FormErrorList } from './form-errors-list';

export function CreateProjectForm() {
  const router = useRouter();
  const [formState, formAction, isPending] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const result = await createProject(_prevState, formData);
      if (result.success && result.project) {
        router.push(`/project/${result.project.id}`);
      }

      return result;
    },
    { success: false, error: null, project: undefined },
  );

  if (formState.success) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-8">Success!</h1>
      </div>
    );
  }

  const inputClassName = 'border border-gray-200 rounded p-2';
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Create Project</h1>
      <form action={formAction} className="space-y-4">
        <fieldset
          disabled={isPending}
          className={`${isPending ? 'opacity-50' : ''} flex flex-col gap-5`}
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              name="title"
              id="title"
              required
              className={inputClassName}
            />
            <FormErrorList errors={formState.fieldErrors?.title ?? null} />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="description">Description</label>
            <textarea
              name="description"
              id="description"
              rows={3}
              className={inputClassName}
              maxLength={500}
            />
            <FormErrorList errors={formState.fieldErrors?.description ?? null} />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="priority">Priority</label>
            <select
              name="priority"
              id="priority"
              defaultValue="medium"
              className={inputClassName}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <FormErrorList errors={formState.fieldErrors?.priority ?? null} />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="targetDate">Target Date</label>
            <input
              type="date"
              name="targetDate"
              id="targetDate"
              className={inputClassName}
            />
            <FormErrorList errors={formState.fieldErrors?.targetDate ?? null} />
          </div>
          <button
            type="submit"
            className="w-full bg-gray-500 hover:bg-gray-600 cursor-pointer text-white font-bold py-2 px-4 rounded"
          >
            {isPending ? 'Creating...' : 'Create Project'}
          </button>
        </fieldset>
        <FormErrorList
          errors={formState.errorMessage ? [formState.errorMessage] : null}
        />
      </form>
    </>
  );
}
