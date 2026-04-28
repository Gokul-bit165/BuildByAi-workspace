import TeamForm from '@/components/admin/TeamForm';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export default async function NewTeamMemberPage() {
  await requireAdmin();
  const supabase = await createClient();

  // Fetch users that are NOT already in the team_members table
  const { data: teamMembers } = await supabase.from('team_members').select('user_id');
  const existingUserIds = teamMembers?.map(t => t.user_id) || [];

  let query = supabase.from('users').select('id, name, email');
  if (existingUserIds.length > 0) {
    // Note: Supabase not.in syntax expects a format like `(val1,val2)`
    const notInString = `(${existingUserIds.join(',')})`;
    query = query.not('id', 'in', notInString);
  }

  const { data: availableUsers } = await query;

  return (
    <div className="max-w-7xl mx-auto">
      <TeamForm availableUsers={availableUsers || []} />
    </div>
  );
}
