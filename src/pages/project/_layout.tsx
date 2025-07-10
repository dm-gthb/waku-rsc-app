import { Breadcrumbs } from '../../components/breadcrumbs';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="mb-6">
        <Breadcrumbs />
      </header>
      {children}
    </>
  );
}
