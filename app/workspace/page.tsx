import { requireUser, getCurrentUser } from '@/lib/auth';
import Link from 'next/link';
import { Briefcase, FileText, MessageSquare, Clock } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function WorkspaceDashboard() {
  await requireUser();
  const currentUser = await getCurrentUser();

  // If the user is an admin, they should probably be on the admin dashboard
  if (currentUser?.role === 'admin') {
    redirect('/admin');
  }

  const stats = [
    { name: 'Active Projects', value: 0, icon: Briefcase, href: '/workspace/projects', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { name: 'Recent Files', value: 0, icon: FileText, href: '/workspace/files', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { name: 'Unread Messages', value: 0, icon: MessageSquare, href: '/workspace/messages', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { name: 'Pending Tasks', value: 0, icon: Clock, href: '/workspace', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {currentUser?.name?.split(' ')[0] || 'User'}</h1>
        <p className="text-slate-400 mt-2">Here is what's happening with your workspace today.</p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-400" />
            Recent Projects
          </h2>
          <div className="text-center py-8 text-slate-400">
            <p>No active projects found.</p>
            <Link href="/workspace/projects" className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block">
              View all projects &rarr;
            </Link>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            Recent Activity
          </h2>
          <div className="text-center py-8 text-slate-400">
            <p>No recent activity.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
