'use client';

import { createContext, use } from 'react';

export const DemoModeContext = createContext<
  { isDemo: boolean; setIsDemo: (isDemo: boolean) => void } | undefined
>(undefined);

export function useIsDemoMode() {
  const context = use(DemoModeContext);
  if (context === undefined) {
    throw new Error(`useIsDemoMode must be used within a DemoModeProvider`);
  }

  return context;
}
