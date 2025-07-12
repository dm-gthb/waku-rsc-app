import { createContext, use } from 'react';
import { User } from '../db/types';

export const UserContext = createContext<{ user: User | null } | null>(null);

export function useUser() {
  const context = use(UserContext);
  if (!context) {
    throw new Error(`useUser must be used within a UserProvider`);
  }

  return context;
}
