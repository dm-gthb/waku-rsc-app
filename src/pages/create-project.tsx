import { Link } from 'waku';
import { CreateProjectForm } from '../components/create-project';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

export default async function CreateProject() {
  return (
    <>
      <Link to="/" className="underline mb-6 flex items-center">
        <ChevronLeftIcon width={20} height={20} className="inline-block mr-2" />
        Back to projects
      </Link>
      <div className="max-w-2xl mx-auto p-6">
        <CreateProjectForm />
      </div>
    </>
  );
}
