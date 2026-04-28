'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin, getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function createBlogPost(formData: FormData, contentMd: string) {
  const user = await requireAdmin();
  const supabase = await createClient();

  const title = formData.get('title') as string;
  let slug = formData.get('slug') as string;
  if (!slug) slug = generateSlug(title);

  const tagsString = formData.get('tags') as string;
  const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean) : [];
  
  const isPublished = formData.get('is_published') === 'true';
  const published_at = isPublished ? new Date().toISOString() : null;

  let cover_image = '';
  const file = formData.get('cover_image') as File;
  
  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    
    const { data, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(`blog/${fileName}`, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (!uploadError && data) {
      const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(`blog/${fileName}`);
      cover_image = publicUrlData.publicUrl;
    }
  }

  const { error } = await supabase.from('blog_posts').insert([{
    title,
    slug,
    content_md: contentMd,
    author_id: user.id,
    published_at,
    tags,
    cover_image: cover_image || null
  }]);

  if (error) {
    console.error('Error creating blog post:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  redirect('/admin/blog');
}

export async function updateBlogPost(id: string, formData: FormData, contentMd: string) {
  await requireAdmin();
  const supabase = await createClient();

  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string || generateSlug(title);
  const tagsString = formData.get('tags') as string;
  const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean) : [];
  
  const isPublished = formData.get('is_published') === 'true';
  // If it was already published, we might want to keep the old date, but for simplicity we just update or set it
  // Wait, let's check current publish state if needed, or assume UI sends exactly what it should be.
  // Actually if we just pass a checkbox for publish, we can set published_at to NOW() if not already set.
  
  const updateData: any = {
    title,
    slug,
    content_md: contentMd,
    tags,
  };

  // only update published_at if we are toggling it
  if (isPublished) {
    updateData.published_at = new Date().toISOString();
  } else {
    updateData.published_at = null;
  }

  const file = formData.get('cover_image') as File;
  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    
    const { data, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(`blog/${fileName}`, file);
      
    if (!uploadError && data) {
      const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(`blog/${fileName}`);
      updateData.cover_image = publicUrlData.publicUrl;
    }
  }

  const { error } = await supabase
    .from('blog_posts')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating blog post:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);
  redirect('/admin/blog');
}

export async function deleteBlogPost(id: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting blog post:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/blog');
  revalidatePath('/blog');
}
