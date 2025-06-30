import '../styles.css';

import { type ReactNode } from 'react';

type RootLayoutProps = { children: ReactNode };

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="text-sm">
      <meta name="description" content="An internet website" />
      <link rel="icon" type="image/png" href="/images/favicon.png" />
      <main className="p-8">{children}</main>
    </div>
  );
}
