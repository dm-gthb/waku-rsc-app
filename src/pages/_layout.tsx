import '../styles.css';

import { type ReactNode } from 'react';
import { getCurrentUser } from '../utils/auth';
import { DemoModeProvider } from '../components/demo-mode-provider';

type RootLayoutProps = { children: ReactNode };

export default async function RootLayout({ children }: RootLayoutProps) {
  const user = await getCurrentUser();

  return (
    <DemoModeProvider isDemoMode={user?.role === 'demo'}>
      <div className="px-8 py-6">
        <meta name="description" content="An internet website" />
        <link rel="icon" type="image/png" href="/images/favicon.png" />
        <main className="max-w-5xl mx-auto">{children}</main>
      </div>
    </DemoModeProvider>
  );
}
