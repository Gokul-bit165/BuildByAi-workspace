import { validatePortalToken } from '@/lib/portal';
import Link from 'next/link';
import { FileText, MessageSquare, Folder, CheckSquare, MessageCircle, LogOut } from 'lucide-react';
import PortalNav from './PortalNav';

export default async function PortalLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode,
  params: Promise<{ token: string }>
}) {
  const resolvedParams = await params;
  const token = resolvedParams.token;
  
  // This will throw 404 or Error if invalid
  const { client } = await validatePortalToken(token);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-50">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div 
                className="w-10 h-10 rounded-full bg-slate-800 bg-cover bg-center border border-slate-700"
                style={client.avatar_url ? { backgroundImage: `url(${client.avatar_url})` } : {}}
              >
                {!client.avatar_url && (
                  <span className="flex items-center justify-center w-full h-full font-bold text-slate-400">
                    {client.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-100">{client.name}</h1>
                <p className="text-xs text-blue-400 font-medium">BuildByAI Client Portal</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <a href="mailto:support@buildbyai.example.com" className="text-sm text-slate-400 hover:text-white transition-colors">
                Support
              </a>
            </div>
          </div>

          <PortalNav token={token} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>
    </div>
  );
}
