'use client';

import { useState } from 'react';
import { createClientRecord, updateClientRecord, regenerateClientToken } from '@/app/actions/clients';
import Link from 'next/link';
import { ArrowLeft, Copy, RefreshCw, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export default function ClientForm({ 
  initialData = null, 
  availableProjects = [] 
}: { 
  initialData?: any, 
  availableProjects?: any[] 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const linkedProjectIds = initialData?.projects?.map((p: any) => p.id) || [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      if (initialData?.id) {
        const res = await updateClientRecord(initialData.id, formData);
        if (res?.error) setError(res.error);
      } else {
        const res = await createClientRecord(formData);
        if (res?.error) setError(res.error);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!initialData?.id) return;
    if (!window.confirm('Are you sure? This will invalidate the current token instantly.')) return;
    
    setRegenerating(true);
    try {
      await regenerateClientToken(initialData.id);
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate token.');
    } finally {
      setRegenerating(false);
    }
  };

  const portalUrl = initialData ? `${typeof window !== 'undefined' ? window.location.origin : ''}/portal/${initialData.portal_token}` : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl">
      <Link href="/admin/clients" className="flex items-center text-slate-400 hover:text-white mb-6 group w-fit">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to clients manager
      </Link>

      <h1 className="text-3xl font-bold mb-8">
        {initialData ? 'Edit Client' : 'Add New Client'}
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-800 text-red-400 rounded-md">
          {error}
        </div>
      )}

      {initialData && (
        <div className="mb-8 bg-blue-900/20 border border-blue-800/50 p-6 rounded-xl">
          <h3 className="text-lg font-bold text-blue-400 mb-2">Client Portal Access</h3>
          <p className="text-slate-400 text-sm mb-4">
            This URL gives the client read-only access to their assigned projects. The token will expire on {format(new Date(initialData.token_expires_at), 'PPP')}.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-4 py-3 font-mono text-sm text-slate-300 overflow-x-auto whitespace-nowrap">
              {portalUrl}
            </div>
            <button 
              onClick={copyToClipboard}
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy URL'}
            </button>
            <button 
              onClick={handleRegenerate}
              type="button"
              disabled={regenerating}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-3 rounded-md flex items-center justify-center gap-2 transition-colors whitespace-nowrap disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Client Name *</label>
            <input 
              type="text" 
              name="name" 
              required 
              defaultValue={initialData?.name}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address *</label>
            <input 
              type="email" 
              name="email" 
              required 
              defaultValue={initialData?.email}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Company / Organization</label>
            <input 
              type="text" 
              name="company" 
              defaultValue={initialData?.company}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Avatar Upload</label>
            {initialData?.avatar_url && (
              <div className="mb-2">
                <img src={initialData.avatar_url} alt="Current avatar" className="w-12 h-12 rounded-full object-cover border border-slate-700" />
              </div>
            )}
            <input 
              type="file" 
              name="avatar" 
              accept="image/*"
              className="w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-slate-800 file:text-white hover:file:bg-slate-700"
            />
          </div>

          <div className="md:col-span-2 mt-4 pt-6 border-t border-slate-800">
            <h3 className="text-lg font-bold mb-4">Linked Projects</h3>
            <p className="text-sm text-slate-400 mb-4">Select the projects this client should have access to in their portal.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableProjects.length === 0 ? (
                <p className="text-slate-500 italic">No projects available to link.</p>
              ) : (
                availableProjects.map(project => (
                  <label key={project.id} className="flex items-start gap-3 p-4 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
                    <input 
                      type="checkbox" 
                      name="linked_projects" 
                      value={project.id}
                      defaultChecked={linkedProjectIds.includes(project.id)}
                      className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-bold text-slate-200 text-sm">{project.title}</p>
                      <p className="text-xs text-slate-400 truncate mt-1">/{project.slug}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-md font-medium transition-colors"
          >
            {loading ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Client')}
          </button>
        </div>
      </form>
    </div>
  );
}
