import { validatePortalToken } from '@/lib/portal';
import { createServiceClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import { FileText, Download, FolderOpen } from 'lucide-react';

export default async function PortalFiles({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params;
  const token = resolvedParams.token;
  
  const { projects } = await validatePortalToken(token);
  const supabase = await createServiceClient();

  const projectIds = projects.map((p: any) => p.id);

  let files: any[] = [];
  if (projectIds.length > 0) {
    const { data } = await supabase
      .from('files')
      .select('*, users:uploaded_by(name)')
      .in('client_project_id', projectIds)
      .eq('is_client_visible', true)
      .order('created_at', { ascending: false });
    
    files = data || [];
  }

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <FolderOpen className="w-6 h-6 text-blue-400" />
              Project Files
            </h2>
            <p className="text-slate-400">Documents and deliverables shared with you.</p>
          </div>
        </div>

        {files.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-xl">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No files have been shared yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {files.map((file) => (
              <div key={file.id} className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl flex flex-col group hover:bg-slate-800 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
                    <FileText className="w-6 h-6" />
                  </div>
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    title="Download / View"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
                <h3 className="font-bold text-slate-200 mb-1 truncate" title={file.name}>{file.name}</h3>
                <div className="mt-auto pt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>Uploaded by {file.users?.name || 'Team'}</span>
                  <span>{format(new Date(file.created_at), 'MMM d, yyyy')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
