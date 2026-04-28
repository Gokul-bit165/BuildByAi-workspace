'use client';

import { deleteBlogPost } from '@/app/actions/blog';
import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';

export default function DeleteBlogButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to permanently delete this blog post?')) {
      startTransition(async () => {
        await deleteBlogPost(id);
      });
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={isPending}
      className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors disabled:opacity-50"
      title="Delete"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
