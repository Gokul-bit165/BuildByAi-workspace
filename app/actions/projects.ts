'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function createProject(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const title = formData.get('title') as string;
  let slug = formData.get('slug') as string;
  if (!slug) slug = generateSlug(title);

  const description = formData.get('description') as string;
  const status = formData.get('status') as string || 'active';
  const github_url = formData.get('github_url') as string;
  const demo_url = formData.get('demo_url') as string;
  const tagsString = formData.get('tags') as string;
  const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean) : [];

  let cover_image = '';
  const file = formData.get('cover_image') as File;
  
  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    
    const { data, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(`projects/${fileName}`, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (!uploadError && data) {
      const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(`projects/${fileName}`);
      cover_image = publicUrlData.publicUrl;
    } else {
      console.error('Upload Error:', uploadError);
    }
  }

  const { data, error } = await supabase.from('projects').insert([{
    title,
    slug,
    description,
    status,
    github_url: github_url || null,
    demo_url: demo_url || null,
    tags,
    cover_image: cover_image || null
  }]).select().single();

  if (error) {
    console.error('Error creating project:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/projects');
  revalidatePath('/projects');
  redirect('/admin/projects');
}

export async function updateProject(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string || generateSlug(title);
  const description = formData.get('description') as string;
  const status = formData.get('status') as string;
  const github_url = formData.get('github_url') as string;
  const demo_url = formData.get('demo_url') as string;
  const tagsString = formData.get('tags') as string;
  const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean) : [];

  const updateData: any = {
    title,
    slug,
    description,
    status,
    github_url: github_url || null,
    demo_url: demo_url || null,
    tags,
  };

  const file = formData.get('cover_image') as File;
  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    
    const { data, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(`projects/${fileName}`, file);
      
    if (!uploadError && data) {
      const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(`projects/${fileName}`);
      updateData.cover_image = publicUrlData.publicUrl;
    }
  }

  const { error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating project:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/projects');
  revalidatePath('/projects');
  revalidatePath(`/projects/${slug}`);
  redirect('/admin/projects');
}

export async function archiveProject(id: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from('projects')
    .update({ status: 'archived' })
    .eq('id', id);

  if (error) {
    console.error('Error archiving project:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/projects');
  revalidatePath('/projects');
}
