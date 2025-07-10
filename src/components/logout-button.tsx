'use client';

import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';
import { logout } from '../actions/auth';
import { useTransition } from 'react';
import { useRouter } from 'waku';

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
      router.push('/login');
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="cursor-pointer flex items-center gap-1.5"
    >
      <ArrowRightStartOnRectangleIcon width={20} height={20} />
      <span>Logout</span>
    </button>
  );
}
