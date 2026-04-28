import BlogForm from '@/components/admin/BlogForm';
import { requireAdmin } from '@/lib/auth';

export default async function NewBlogPage() {
  await requireAdmin();

  return (
    <div className="max-w-7xl mx-auto">
      <BlogForm />
    </div>
  );
}
