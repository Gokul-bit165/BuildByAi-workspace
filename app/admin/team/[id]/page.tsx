import TeamForm from '@/components/admin/TeamForm';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const supabase = await createClient();
  const { data: member } = await supabase
    .from('team_members')
    .select(`
      *,
      users (name, email, avatar_url, bio, github_username)
    `)
    .eq('id', id)
    .single();

  if (!member) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto">
      <TeamForm initialData={member} />
    </div>
  );
}
