import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Github, Globe, ArrowLeft } from 'lucide-react';

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const supabase = await createClient();
  
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!project) {
    notFound();
  }

  return (
    <div className="flex flex-col flex-grow p-8 max-w-4xl mx-auto w-full">
      <Link href="/projects" className="flex items-center text-slate-400 hover:text-white mb-8 group w-fit">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to projects
      </Link>

      <div 
        className="w-full h-64 md:h-96 bg-slate-800 rounded-2xl mb-8 bg-cover bg-center border border-slate-800"
        style={project.cover_image ? { backgroundImage: `url(${project.cover_image})` } : {}}
      ></div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{project.title}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags?.map((t: string) => (
              <Link href={`/projects?tag=${t}`} key={t} className="bg-slate-800 text-slate-300 text-sm px-3 py-1 rounded-full hover:bg-slate-700 transition-colors">
                {t}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex gap-3 shrink-0">
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noreferrer" className="flex items-center justify-center w-12 h-12 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors text-white">
              <Github className="w-5 h-5" />
            </a>
          )}
          {project.demo_url && (
            <a href={project.demo_url} target="_blank" rel="noreferrer" className="flex items-center px-6 h-12 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors text-white font-medium">
              <Globe className="w-5 h-5 mr-2" />
              Live Demo
            </a>
          )}
        </div>
      </div>

      <div className="prose prose-invert max-w-none prose-lg text-slate-300">
        <p className="whitespace-pre-wrap">{project.description}</p>
      </div>
    </div>
  );
}
