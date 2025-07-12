'use client';

import { User } from '../db/types';
import { UserContext } from '../context/user';

export function UserProvider({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User | null;
}) {
  return <UserContext value={{ user }}>{children}</UserContext>;
}
