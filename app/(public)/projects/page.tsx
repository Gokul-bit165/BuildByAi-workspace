import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const params = await searchParams;
  const tag = params.tag;
  const supabase = await createClient();
  
  let query = supabase.from('projects').select('*').eq('status', 'active');
  if (tag) {
    query = query.contains('tags', [tag]);
  }
  
  const { data: projects } = await query;

  return (
    <div className="flex flex-col flex-grow p-8 max-w-7xl mx-auto w-full">
      <h1 className="text-4xl font-bold mb-4">Our Projects</h1>
      <p className="text-slate-400 mb-8 max-w-2xl">
        Explore our portfolio of student-led projects, ranging from AI applications to full-stack platforms.
      </p>
      
      {tag && (
        <div className="mb-6 flex items-center gap-2">
          <span className="text-slate-300">Filtered by:</span>
          <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
            {tag}
          </span>
          <Link href="/projects" className="text-sm text-slate-500 hover:text-slate-300 underline ml-2">
            Clear filter
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects && projects.length > 0 ? (
          projects.map((project: any) => (
            <Link href={`/projects/${project.slug}`} key={project.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group block">
              <div 
                className="h-48 bg-slate-800 group-hover:bg-slate-700 transition-colors bg-cover bg-center"
                style={project.cover_image ? { backgroundImage: `url(${project.cover_image})` } : {}}
              ></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{project.title}</h3>
                </div>
                <p className="text-slate-400 text-sm mb-4 line-clamp-3">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags?.map((t: string) => (
                    <span key={t} className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-slate-500 col-span-3 text-center py-20">No projects found.</p>
        )}
      </div>
    </div>
  );
}
