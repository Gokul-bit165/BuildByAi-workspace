import Navbar from '@/components/shared/Navbar';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-grow flex flex-col">
        {children}
      </main>
      <footer className="p-6 text-center text-slate-500 text-sm border-t border-slate-900 mt-auto">
        &copy; {new Date().getFullYear()} BuildByAI. All rights reserved.
      </footer>
    </div>
  );
}
