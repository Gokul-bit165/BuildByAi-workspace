import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import Link from 'next/link';
import { Plus, Edit2, ExternalLink } from 'lucide-react';
import ArchiveButton from '@/components/admin/ArchiveButton';

export default async function AdminProjectsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-slate-400 mt-1">Manage public portfolio projects.</p>
        </div>
        <Link 
          href="/admin/projects/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Project
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="p-4 font-semibold text-slate-300">Project</th>
                <th className="p-4 font-semibold text-slate-300">Status</th>
                <th className="p-4 font-semibold text-slate-300">Links</th>
                <th className="p-4 font-semibold text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects && projects.length > 0 ? (
                projects.map((project: any) => (
                  <tr key={project.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded bg-slate-800 bg-cover bg-center shrink-0 border border-slate-700"
                          style={project.cover_image ? { backgroundImage: `url(${project.cover_image})` } : {}}
                        />
                        <div>
                          <p className="font-bold text-slate-200">{project.title}</p>
                          <p className="text-xs text-slate-500">/{project.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium capitalize ${
                        project.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                        project.status === 'completed' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-slate-500/10 text-slate-400'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {project.github_url && (
                          <a href={project.github_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white" title="GitHub">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        {project.demo_url && (
                          <a href={project.demo_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white" title="Live Demo">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/projects/${project.id}`}
                          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        {project.status !== 'archived' && (
                          <ArchiveButton id={project.id} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    No projects found.
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
