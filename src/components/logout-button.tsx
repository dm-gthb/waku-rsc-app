'use client';

import { useTransition } from 'react';
import { useRouter } from 'waku';
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';
import { logout } from '../actions/auth';
import { useIsDemoMode } from '../context/demo-mode';

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { setIsDemo } = useIsDemoMode();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
      setIsDemo(false);
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
      <span className="hidden sm:inline-block">Logout</span>
    </button>
  );
}
