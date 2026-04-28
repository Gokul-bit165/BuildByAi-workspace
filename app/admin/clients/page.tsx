import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import Link from 'next/link';
import { Plus, Edit2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export default async function AdminClientsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-slate-400 mt-1">Manage external clients and portal access.</p>
        </div>
        <Link 
          href="/admin/clients/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Client
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="p-4 font-semibold text-slate-300">Client</th>
                <th className="p-4 font-semibold text-slate-300">Company</th>
                <th className="p-4 font-semibold text-slate-300">Added</th>
                <th className="p-4 font-semibold text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients && clients.length > 0 ? (
                clients.map((client: any) => (
                  <tr key={client.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full bg-slate-800 bg-cover bg-center shrink-0 border border-slate-700"
                          style={client.avatar_url ? { backgroundImage: `url(${client.avatar_url})` } : {}}
                        >
                          {!client.avatar_url && (
                            <span className="flex items-center justify-center w-full h-full font-bold text-slate-400">
                              {client.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-200">{client.name}</p>
                          <p className="text-xs text-slate-500">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">{client.company || '-'}</td>
                    <td className="p-4 text-slate-400 text-sm">
                      {format(new Date(client.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/portal/${client.portal_token}`} 
                          target="_blank" 
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                          title="View Portal"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link 
                          href={`/admin/clients/${client.id}`}
                          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
