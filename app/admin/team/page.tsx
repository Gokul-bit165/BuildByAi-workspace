import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import TeamList from '@/components/admin/TeamList';

export default async function AdminTeamPage() {
  await requireAdmin();
  const supabase = await createClient();

  // Fetch team members sorted by display_order
  const { data: teamMembers } = await supabase
    .from('team_members')
    .select(`
      id,
      user_id,
      role_title,
      display_order,
      is_visible,
      users (name, email, avatar_url)
    `)
    .order('display_order', { ascending: true });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Team Manager</h1>
          <p className="text-slate-400 mt-1">Manage team members, roles, and order.</p>
        </div>
        <Link 
          href="/admin/team/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Member
        </Link>
      </div>

      <TeamList initialMembers={teamMembers || []} />
    </div>
  );
}
