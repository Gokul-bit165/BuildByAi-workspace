import { createClient } from '@/lib/supabase/server';
import { Github } from 'lucide-react';

export default async function TeamPage() {
  const supabase = await createClient();
  
  // Fetch visible team members and their associated user details
  const { data: teamMembers } = await supabase
    .from('team_members')
    .select(`
      id,
      role_title,
      display_order,
      users:user_id (
        name,
        avatar_url,
        github_username,
        bio
      )
    `)
    .eq('is_visible', true)
    .order('display_order', { ascending: true });

  return (
    <div className="flex flex-col flex-grow p-8 max-w-7xl mx-auto w-full">
      <div className="text-center py-16 max-w-3xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-6">Meet the Team</h1>
        <p className="text-xl text-slate-400">
          We are a collective of driven student developers, designers, and AI enthusiasts.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {teamMembers && teamMembers.length > 0 ? (
          teamMembers.map((member: any) => {
            const user = member.users;
            if (!user) return null;
            return (
              <div key={member.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center text-center">
                <div 
                  className="w-24 h-24 rounded-full bg-slate-800 mb-4 bg-cover bg-center"
                  style={user.avatar_url ? { backgroundImage: `url(${user.avatar_url})` } : {}}
                >
                  {!user.avatar_url && (
                    <span className="flex items-center justify-center w-full h-full text-2xl font-bold text-slate-600">
                      {user.name.charAt(0)}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-1">{user.name}</h3>
                <p className="text-blue-400 text-sm font-medium mb-4">{member.role_title}</p>
                <p className="text-slate-400 text-sm mb-6 flex-grow">{user.bio}</p>
                {user.github_username && (
                  <a 
                    href={`https://github.com/${user.github_username}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-slate-500 col-span-4 text-center py-20">The team is currently assembling.</p>
        )}
      </div>
    </div>
  );
}
