import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
      <Link href="/" className="text-2xl font-bold tracking-tighter text-blue-500">
        BuildByAI
      </Link>
      <div className="flex gap-6 items-center">
        <Link href="/projects" className="text-sm font-medium hover:text-blue-400 transition-colors">Projects</Link>
        <Link href="/team" className="text-sm font-medium hover:text-blue-400 transition-colors">Team</Link>
        <Link href="/blog" className="text-sm font-medium hover:text-blue-400 transition-colors">Blog</Link>
        <Link href="/contact" className="text-sm font-medium hover:text-blue-400 transition-colors">Contact</Link>
        <Link href="/workspace" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Workspace
        </Link>
      </div>
    </nav>
  );
}
