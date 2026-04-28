'use client';

import { useState, useRef } from 'react';
import { createBlogPost, updateBlogPost } from '@/app/actions/blog';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
);

export default function BlogForm({ initialData = null }: { initialData?: any }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string | undefined>(initialData?.content_md || '');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!content) {
      setError('Content is required');
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    
    try {
      if (initialData?.id) {
        const res = await updateBlogPost(initialData.id, formData, content);
        if (res?.error) setError(res.error);
      } else {
        const res = await createBlogPost(formData, content);
        if (res?.error) setError(res.error);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <Link href="/admin/blog" className="flex items-center text-slate-400 hover:text-white mb-6 group w-fit">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to blog posts
      </Link>

      <h1 className="text-3xl font-bold mb-8">
        {initialData ? 'Edit Blog Post' : 'Create New Post'}
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-800 text-red-400 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
            <input 
              type="text" 
              name="title" 
              required 
              defaultValue={initialData?.title}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Slug (Auto-generated if empty)</label>
            <input 
              type="text" 
              name="slug" 
              defaultValue={initialData?.slug}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tags (comma separated)</label>
            <input 
              type="text" 
              name="tags" 
              defaultValue={initialData?.tags?.join(', ')}
              placeholder="e.g. Next.js, AI, Supabase"
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Cover Image Upload</label>
            {initialData?.cover_image && (
              <div className="mb-4">
                <p className="text-xs text-slate-500 mb-2">Current Image:</p>
                <img src={initialData.cover_image} alt="Current cover" className="h-32 rounded-md object-cover border border-slate-700" />
              </div>
            )}
            <input 
              type="file" 
              name="cover_image" 
              accept="image/*"
              className="w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-slate-800 file:text-white hover:file:bg-slate-700"
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <input 
              type="checkbox" 
              name="is_published" 
              id="is_published"
              value="true"
              defaultChecked={!!initialData?.published_at}
              className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="is_published" className="text-sm font-medium text-slate-300">
              Publish immediately
            </label>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl" data-color-mode="dark">
          <label className="block text-sm font-medium text-slate-300 mb-4">Content (Markdown) *</label>
          <MDEditor
            value={content}
            onChange={setContent}
            height={500}
            className="w-full border-slate-700"
          />
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-md font-medium transition-colors"
          >
            {loading ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Post')}
          </button>
        </div>
      </form>
    </div>
  );
}
