import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'active')
    .limit(3);

  return (
    <div className="flex flex-col items-center justify-center flex-grow p-8">
      {/* Hero Section */}
      <section className="w-full max-w-5xl flex flex-col items-center text-center py-20">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-br from-blue-400 to-purple-600 bg-clip-text text-transparent">
          We Build the Future with AI
        </h1>
        <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-3xl">
          BuildByAI is a student dev team crafting intelligent, high-performance web applications and digital experiences.
        </p>
        <div className="flex gap-4">
          <Link href="/projects" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-colors">
            View Our Work
          </Link>
          <Link href="/contact" className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-8 py-3 rounded-full font-semibold transition-colors">
            Get in Touch
          </Link>
        </div>
      </section>

      {/* Featured Projects Grid */}
      <section className="w-full max-w-7xl py-20">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl font-bold">Featured Work</h2>
          <Link href="/projects" className="text-blue-500 hover:text-blue-400">View all projects &rarr;</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects && projects.length > 0 ? (
            projects.map((project: any) => (
              <Link href={`/projects/${project.slug}`} key={project.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group block">
                <div 
                  className="h-48 bg-slate-800 group-hover:bg-slate-700 transition-colors bg-cover bg-center"
                  style={project.cover_image ? { backgroundImage: `url(${project.cover_image})` } : {}}
                ></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  <p className="text-slate-400 text-sm line-clamp-2">{project.description}</p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-slate-500 col-span-3 text-center py-10">No featured projects found.</p>
          )}
        </div>
      </section>

      {/* Services Section */}
      <section className="w-full max-w-7xl py-20 text-center">
        <h2 className="text-3xl font-bold mb-10">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-slate-900 rounded-xl border border-slate-800">
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center mb-6 mx-auto">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            </div>
            <h3 className="text-xl font-bold mb-4">Web Development</h3>
            <p className="text-slate-400">Modern, scalable, and blazingly fast web applications built with Next.js and React.</p>
          </div>
          <div className="p-8 bg-slate-900 rounded-xl border border-slate-800">
            <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center mb-6 mx-auto">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-xl font-bold mb-4">AI Integration</h3>
            <p className="text-slate-400">Embedding LLMs and machine learning features directly into your products.</p>
          </div>
          <div className="p-8 bg-slate-900 rounded-xl border border-slate-800">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center mb-6 mx-auto">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
            </div>
            <h3 className="text-xl font-bold mb-4">Cloud & Data</h3>
            <p className="text-slate-400">Robust architectures utilizing Supabase, Postgres, and serverless technologies.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full max-w-4xl py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to build something amazing?</h2>
        <p className="text-xl text-slate-400 mb-10">Let's discuss how we can bring your idea to life with cutting-edge technology.</p>
        <Link href="/contact" className="bg-white text-slate-950 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-200 transition-colors">
          Start a Project
        </Link>
      </section>
    </div>
  );
}
