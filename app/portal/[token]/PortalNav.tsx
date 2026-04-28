'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Folder, MessageSquare, MessageCircle, CheckSquare } from 'lucide-react';

export default function PortalNav({ token }: { token: string }) {
  const pathname = usePathname();
  
  const basePath = `/portal/${token}`;
  
  const nav = [
    { name: 'Dashboard', href: basePath, icon: LayoutDashboard, exact: true },
    { name: 'Files', href: `${basePath}/files`, icon: Folder, exact: false },
    { name: 'Messages', href: `${basePath}/messages`, icon: MessageSquare, exact: false },
    { name: 'Feedback', href: `${basePath}/feedback`, icon: MessageCircle, exact: false },
    { name: 'Approve', href: `${basePath}/approve`, icon: CheckSquare, exact: false },
  ];

  return (
    <nav className="flex space-x-1 sm:space-x-8 overflow-x-auto pb-[-1px]">
      {nav.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-2 whitespace-nowrap py-4 px-3 border-b-2 text-sm font-medium transition-colors ${
              isActive
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <item.icon className={`w-4 h-4 ${isActive ? 'text-blue-500' : 'text-slate-500'}`} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
