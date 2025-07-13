'use client';

import { ReactNode, useState } from 'react';
import { DemoModeContext } from '../context/demo-mode';

export const DemoModeProvider = function DemoModeProvider({
  children,
  isDemoMode,
}: {
  children: ReactNode;
  isDemoMode: boolean;
}) {
  const [isDemo, setIsDemo] = useState(isDemoMode);
  return <DemoModeContext value={{ isDemo, setIsDemo }}>{children}</DemoModeContext>;
};
