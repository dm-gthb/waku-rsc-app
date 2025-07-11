import '../styles.css';

import { type ReactNode } from 'react';

type RootLayoutProps = { children: ReactNode };

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="px-8 py-6">
      <meta name="description" content="An internet website" />
      <link rel="icon" type="image/png" href="/images/favicon.png" />
      <main className="max-w-5xl mx-auto">{children}</main>
    </div>
  );
}
