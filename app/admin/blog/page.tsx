import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import Link from 'next/link';
import { Plus, Edit2, ExternalLink } from 'lucide-react';
import DeleteBlogButton from '@/components/admin/DeleteBlogButton';
import { format } from 'date-fns';

export default async function AdminBlogPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*, users:author_id(name)')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <p className="text-slate-400 mt-1">Manage articles and announcements.</p>
        </div>
        <Link 
          href="/admin/blog/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Post
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="p-4 font-semibold text-slate-300">Title</th>
                <th className="p-4 font-semibold text-slate-300">Author</th>
                <th className="p-4 font-semibold text-slate-300">Status</th>
                <th className="p-4 font-semibold text-slate-300">Date</th>
                <th className="p-4 font-semibold text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts && posts.length > 0 ? (
                posts.map((post: any) => (
                  <tr key={post.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-200">{post.title}</span>
                        <span className="text-xs text-slate-500">/{post.slug}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">{post.users?.name || 'Unknown'}</td>
                    <td className="p-4">
                      {post.published_at ? (
                        <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400">
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-amber-500/10 text-amber-400">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400 text-sm">
                      {format(new Date(post.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {post.published_at && (
                          <Link 
                            href={`/blog/${post.slug}`} 
                            target="_blank" 
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                            title="View Live"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                        <Link 
                          href={`/admin/blog/${post.id}`}
                          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <DeleteBlogButton id={post.id} /> 
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No blog posts found.
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
