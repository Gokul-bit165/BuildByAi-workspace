import { validatePortalToken } from '@/lib/portal';
import { createServiceClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import { MessageSquare, Send } from 'lucide-react';

export default async function PortalMessages({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params;
  const token = resolvedParams.token;
  
  const { client, projects } = await validatePortalToken(token);
  const supabase = await createServiceClient();

  const projectIds = projects.map((p: any) => p.id);
  
  // We'll use a specific channel format for project chats, e.g., 'project_{id}'
  let messages: any[] = [];
  if (projectIds.length > 0) {
    const channelFilters = projectIds.map((id: string) => `project_${id}`);
    const { data } = await supabase
      .from('messages')
      .select('*, users:sender_id(name, avatar_url)')
      .in('channel', channelFilters)
      .order('created_at', { ascending: true });
    
    messages = data || [];
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 h-[75vh] flex flex-col">
      <div className="mb-6 border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-blue-400" />
          Project Chat
        </h2>
        <p className="text-slate-400 mt-1">Direct communication with the team.</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-4 mb-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
            <p>No messages yet. The team will reach out here.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isClient = !msg.sender_id; // Client messages have no sender_id in this MVP
            return (
              <div key={msg.id} className={`flex gap-4 ${isClient ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-slate-700 shrink-0 bg-cover bg-center"
                     style={msg.users?.avatar_url ? { backgroundImage: `url(${msg.users.avatar_url})` } : (isClient && client.avatar_url ? { backgroundImage: `url(${client.avatar_url})` } : {})}
                />
                <div className={`max-w-[80%] ${isClient ? 'items-end text-right' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-300">
                      {isClient ? client.name : (msg.users?.name || 'Team Member')}
                    </span>
                    <span className="text-xs text-slate-500">
                      {format(new Date(msg.created_at), 'h:mm a')}
                    </span>
                  </div>
                  <div className={`p-4 rounded-2xl ${isClient ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}`}>
                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-slate-800">
        <form className="flex gap-4">
          <input 
            type="text" 
            placeholder="Type your message..." 
            disabled
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button 
            type="button"
            disabled
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-xs text-slate-500 mt-2 text-center">Messaging is currently in view-only mode for this demo.</p>
      </div>
    </div>
  );
}
