import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import Link from 'next/link';
import { FolderKanban, MessageSquare, Users, FileText } from 'lucide-react';

export default async function AdminDashboard() {
  await requireAdmin();
  const supabase = await createClient();

  // Fetch some basic stats
  const [
    { count: projectsCount },
    { count: inquiriesCount },
    { count: teamCount },
    { count: blogCount }
  ] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('contact_inquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('team_members').select('*', { count: 'exact', head: true }),
    supabase.from('blog_posts').select('*', { count: 'exact', head: true })
  ]);

  const stats = [
    { name: 'Total Projects', value: projectsCount || 0, icon: FolderKanban, href: '/admin/projects', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { name: 'New Inquiries', value: inquiriesCount || 0, icon: MessageSquare, href: '/admin/inquiries', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { name: 'Team Members', value: teamCount || 0, icon: Users, href: '/admin/team', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { name: 'Blog Posts', value: blogCount || 0, icon: FileText, href: '/admin/blog', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="max-w-6xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-4xl font-bold mb-1">{stat.value}</p>
              <p className="text-slate-400 font-medium">{stat.name}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/projects" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors">
            Add New Project
          </Link>
          <Link href="/admin/blog" className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-md font-medium transition-colors border border-slate-700">
            Write Blog Post
          </Link>
          <Link href="/admin/clients" className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-md font-medium transition-colors border border-slate-700">
            Invite Client
          </Link>
        </div>
      </div>
    </div>
  );
}
