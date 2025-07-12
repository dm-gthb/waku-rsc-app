import '../styles.css';

import { type ReactNode } from 'react';

import { UserProvider } from '../components/user-provider';
import { getCurrentUser } from '../utils/auth';

type RootLayoutProps = { children: ReactNode };

export default async function RootLayout({ children }: RootLayoutProps) {
  const user = await getCurrentUser();
  return (
    <UserProvider user={user}>
      <div className="px-8 py-6">
        <meta name="description" content="An internet website" />
        <link rel="icon" type="image/png" href="/images/favicon.png" />
        <main className="max-w-5xl mx-auto">{children}</main>
      </div>
    </UserProvider>
  );
}
