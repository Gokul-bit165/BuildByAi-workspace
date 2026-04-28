'use client';

import { archiveProject } from '@/app/actions/projects';
import { useTransition } from 'react';
import { Archive } from 'lucide-react';

export default function ArchiveButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleArchive = () => {
    if (window.confirm('Are you sure you want to archive this project?')) {
      startTransition(async () => {
        await archiveProject(id);
      });
    }
  };

  return (
    <button 
      onClick={handleArchive} 
      disabled={isPending}
      className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors disabled:opacity-50"
      title="Archive"
    >
      <Archive className="w-4 h-4" />
    </button>
  );
}
