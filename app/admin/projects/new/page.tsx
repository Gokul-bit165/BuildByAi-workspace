import ProjectForm from '@/components/admin/ProjectForm';
import { requireAdmin } from '@/lib/auth';

export default async function NewProjectPage() {
  await requireAdmin();

  return (
    <div className="max-w-7xl mx-auto">
      <ProjectForm />
    </div>
  );
}
