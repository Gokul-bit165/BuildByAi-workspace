'use client';

import { useState } from 'react';
import { createTeamMember, updateTeamMember } from '@/app/actions/team';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TeamForm({ 
  initialData = null, 
  availableUsers = [] 
}: { 
  initialData?: any, 
  availableUsers?: any[] 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      if (initialData?.id) {
        const res = await updateTeamMember(initialData.id, formData);
        if (res?.error) setError(res.error);
      } else {
        const res = await createTeamMember(formData);
        if (res?.error) setError(res.error);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <Link href="/admin/team" className="flex items-center text-slate-400 hover:text-white mb-6 group w-fit">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to team manager
      </Link>

      <h1 className="text-3xl font-bold mb-8">
        {initialData ? 'Edit Team Member' : 'Add Team Member'}
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-800 text-red-400 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900 border border-slate-800 p-8 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Linked User Selection or Display */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Linked User Account *</label>
            {initialData ? (
              <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-md flex items-center gap-3">
                <input type="hidden" name="user_id" value={initialData.user_id} />
                <div 
                  className="w-8 h-8 rounded-full bg-slate-700 bg-cover bg-center shrink-0 border border-slate-600"
                  style={initialData.users?.avatar_url ? { backgroundImage: `url(${initialData.users.avatar_url})` } : {}}
                />
                <span className="text-white font-medium">{initialData.users?.email}</span>
                <span className="text-slate-400 text-sm">({initialData.users?.name})</span>
              </div>
            ) : (
              <select 
                name="user_id" 
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a user account...</option>
                {availableUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.email} ({u.name})
                  </option>
                ))}
              </select>
            )}
            {!initialData && availableUsers.length === 0 && (
              <p className="text-xs text-red-400 mt-2">All registered users are already on the team.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Role Title *</label>
            <input 
              type="text" 
              name="role_title" 
              required 
              defaultValue={initialData?.role_title}
              placeholder="e.g. Lead Frontend Developer"
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col justify-center">
            <label className="block text-sm font-medium text-slate-300 mb-2">Visibility</label>
            <div className="flex items-center gap-3 mt-2">
              <input 
                type="checkbox" 
                name="is_visible" 
                id="is_visible"
                value="true"
                defaultChecked={initialData ? initialData.is_visible : true}
                className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is_visible" className="text-sm font-medium text-slate-300">
                Show on public website
              </label>
            </div>
          </div>

          <div className="md:col-span-2 mt-4 pt-6 border-t border-slate-800">
            <h3 className="text-lg font-bold mb-4">Profile Information</h3>
            <p className="text-sm text-slate-400 mb-6">Updating these details will update the underlying user account for the whole app.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Display Name *</label>
            <input 
              type="text" 
              name="name" 
              required 
              defaultValue={initialData?.users?.name}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">GitHub Username</label>
            <input 
              type="text" 
              name="github_username" 
              defaultValue={initialData?.users?.github_username}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Short Bio</label>
            <textarea 
              name="bio" 
              rows={3}
              defaultValue={initialData?.users?.bio}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            ></textarea>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Avatar Upload</label>
            {initialData?.users?.avatar_url && (
              <div className="mb-4">
                <img src={initialData.users.avatar_url} alt="Current avatar" className="w-16 h-16 rounded-full object-cover border border-slate-700" />
              </div>
            )}
            <input 
              type="file" 
              name="avatar" 
              accept="image/*"
              className="w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-slate-800 file:text-white hover:file:bg-slate-700"
            />
          </div>

        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-md font-medium transition-colors"
          >
            {loading ? 'Saving...' : (initialData ? 'Save Changes' : 'Add Member')}
          </button>
        </div>
      </form>
    </div>
  );
}
