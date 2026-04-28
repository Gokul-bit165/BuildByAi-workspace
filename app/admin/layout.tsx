import Link from 'next/link';
import { requireAdmin, getCurrentUser } from '@/lib/auth';
import { LayoutDashboard, FolderKanban, Users, FileText, MessageSquare, Briefcase, Settings, LogOut } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Ensure the user is an admin before rendering the layout
  const user = await requireAdmin();
  const currentUser = await getCurrentUser();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Projects', href: '/admin/projects', icon: FolderKanban },
    { name: 'Team', href: '/admin/team', icon: Users },
    { name: 'Blog', href: '/admin/blog', icon: FileText },
    { name: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
    { name: 'Clients', href: '/admin/clients', icon: Briefcase },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Link href="/admin" className="text-xl font-bold text-blue-500">
            BuildByAI <span className="text-slate-300 text-sm ml-1">CMS</span>
          </Link>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-full bg-slate-700 bg-cover bg-center shrink-0"
              style={currentUser?.avatar_url ? { backgroundImage: `url(${currentUser.avatar_url})` } : {}}
            />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{currentUser?.name}</p>
              <p className="text-xs text-slate-400 truncate">{currentUser?.email}</p>
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 w-full px-2 py-2 rounded hover:bg-slate-800 transition-colors">
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="md:hidden h-16 border-b border-slate-800 flex items-center px-6 bg-slate-900">
          <span className="text-xl font-bold">Admin CMS</span>
        </div>
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
