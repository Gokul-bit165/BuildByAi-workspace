import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';

export default async function BlogPage() {
  const supabase = await createClient();
  
  const { data: posts } = await supabase
    .from('blog_posts')
    .select(`
      id,
      title,
      slug,
      cover_image,
      published_at,
      tags,
      users:author_id (name, avatar_url)
    `)
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false });

  return (
    <div className="flex flex-col flex-grow p-8 max-w-5xl mx-auto w-full">
      <div className="py-12 md:py-20">
        <h1 className="text-5xl font-extrabold mb-6">Insights & Updates</h1>
        <p className="text-xl text-slate-400 max-w-2xl">
          Thoughts, learnings, and announcements from the BuildByAI team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {posts && posts.length > 0 ? (
          posts.map((post: any) => {
            const author = post.users;
            return (
              <Link href={`/blog/${post.slug}`} key={post.id} className="group flex flex-col">
                <div 
                  className="w-full h-64 bg-slate-800 rounded-2xl mb-6 bg-cover bg-center overflow-hidden border border-slate-800"
                  style={post.cover_image ? { backgroundImage: `url(${post.cover_image})` } : {}}
                >
                  <div className="w-full h-full bg-black/20 group-hover:bg-transparent transition-colors"></div>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex gap-2">
                    {post.tags?.map((t: string) => (
                      <span key={t} className="text-blue-400 text-sm font-semibold">{t}</span>
                    ))}
                  </div>
                  <span className="text-slate-500 text-sm">&bull;</span>
                  <span className="text-slate-500 text-sm">
                    {format(new Date(post.published_at), 'MMM d, yyyy')}
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors line-clamp-2">
                  {post.title}
                </h2>
                {author && (
                  <div className="flex items-center mt-auto">
                    <div 
                      className="w-8 h-8 rounded-full bg-slate-700 bg-cover bg-center mr-3"
                      style={author.avatar_url ? { backgroundImage: `url(${author.avatar_url})` } : {}}
                    />
                    <span className="text-slate-300 text-sm">{author.name}</span>
                  </div>
                )}
              </Link>
            );
          })
        ) : (
          <p className="text-slate-500 col-span-2 py-20">No blog posts published yet.</p>
        )}
      </div>
    </div>
  );
}
