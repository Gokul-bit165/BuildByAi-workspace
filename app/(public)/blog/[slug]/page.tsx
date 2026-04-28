import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft } from 'lucide-react';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const supabase = await createClient();
  
  const { data: post } = await supabase
    .from('blog_posts')
    .select(`
      *,
      users:author_id (name, avatar_url, bio)
    `)
    .eq('slug', slug)
    .single();

  if (!post) {
    notFound();
  }

  const author = post.users;

  return (
    <article className="flex flex-col flex-grow p-8 max-w-3xl mx-auto w-full py-16">
      <Link href="/blog" className="flex items-center text-slate-400 hover:text-white mb-12 group w-fit">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to blog
      </Link>

      <div className="mb-10 text-center">
        <div className="flex justify-center gap-2 mb-6">
          {post.tags?.map((t: string) => (
            <span key={t} className="text-blue-500 font-medium text-sm">{t}</span>
          ))}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">{post.title}</h1>
        
        <div className="flex items-center justify-center text-slate-400">
          {author && (
            <div className="flex items-center mr-6">
              <div 
                className="w-10 h-10 rounded-full bg-slate-700 bg-cover bg-center mr-3"
                style={author.avatar_url ? { backgroundImage: `url(${author.avatar_url})` } : {}}
              />
              <span className="font-medium text-slate-200">{author.name}</span>
            </div>
          )}
          {post.published_at && (
            <span>{format(new Date(post.published_at), 'MMMM d, yyyy')}</span>
          )}
        </div>
      </div>

      {post.cover_image && (
        <div 
          className="w-full h-64 md:h-96 bg-slate-800 rounded-2xl mb-12 bg-cover bg-center"
          style={{ backgroundImage: `url(${post.cover_image})` }}
        />
      )}

      <div className="prose prose-invert prose-lg prose-blue max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content_md}
        </ReactMarkdown>
      </div>

      {author && (
        <div className="mt-20 p-8 bg-slate-900 border border-slate-800 rounded-2xl flex items-start gap-6">
          <div 
            className="w-16 h-16 rounded-full bg-slate-700 bg-cover bg-center shrink-0"
            style={author.avatar_url ? { backgroundImage: `url(${author.avatar_url})` } : {}}
          />
          <div>
            <h3 className="text-xl font-bold mb-2">Written by {author.name}</h3>
            {author.bio && <p className="text-slate-400">{author.bio}</p>}
          </div>
        </div>
      )}
    </article>
  );
}
