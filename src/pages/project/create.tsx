import { CreateProjectForm } from '../../components/create-project';
import { requireUser } from '../../utils/auth';

export default async function CreateProject() {
  await requireUser();
  return (
    <div className="max-w-2xl mx-auto p-6">
      <CreateProjectForm />
    </div>
  );
}
