import ClientForm from '@/components/admin/ClientForm';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export default async function NewClientPage() {
  await requireAdmin();
  const supabase = await createClient();

  // Fetch projects to allow linking
  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, slug')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto">
      <ClientForm availableProjects={projects || []} />
    </div>
  );
}
