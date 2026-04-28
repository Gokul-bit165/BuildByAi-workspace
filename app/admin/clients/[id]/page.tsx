import ClientForm from '@/components/admin/ClientForm';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const supabase = await createClient();
  
  // Fetch client details
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (!client) {
    notFound();
  }

  // Fetch currently linked projects
  const { data: linkedProjectsData } = await supabase
    .from('client_projects')
    .select('project_id')
    .eq('client_id', id);
    
  const linkedProjectIds = linkedProjectsData?.map(lp => lp.project_id) || [];

  // Fetch all projects to allow linking
  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, slug')
    .order('created_at', { ascending: false });

  // Attach linked projects to initialData structure for the form
  const initialData = {
    ...client,
    projects: linkedProjectIds.map(pid => ({ id: pid }))
  };

  return (
    <div className="max-w-7xl mx-auto">
      <ClientForm initialData={initialData} availableProjects={projects || []} />
    </div>
  );
}
