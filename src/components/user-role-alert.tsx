'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import * as Dialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';

export function UserRoleAlert({ children }: { children: ReactNode }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-10 shadow-lg focus:outline-none">
          <Dialog.Title className="sr-only">User Demo Role</Dialog.Title>
          <Dialog.Description className="sr-only">
            User Demo Role permissions info
          </Dialog.Description>
          <div>
            <p className="mb-4">
              ⚠️ Your account role is{' '}
              <span className="rounded bg-gray-100 px-2 py-1 font-mono text-sm">
                demo
              </span>
              .
            </p>
            <p>
              Demo user can browse pre-created projects and tasks and change completion
              task status.
            </p>
            <p className="mb-4">
              <span className="font-bold">
                Creating, editing, and deleting data is disabled
              </span>{' '}
              to keep the demo clean.
            </p>
            <p>
              You can sign up for your own account and use all features without
              restrictions.
            </p>
          </div>
          <Dialog.Close className="absolute top-2 right-2 cursor-pointer p-1">
            <XMarkIcon width={24} height={24} />
            <span className="sr-only">close</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
