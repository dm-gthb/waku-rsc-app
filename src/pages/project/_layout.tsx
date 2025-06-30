import { Breadcrumbs } from '../../components/breadcrumbs';

export default function ProjectsContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-6">
        <Breadcrumbs />
      </div>
      {children}
    </div>
  );
}
