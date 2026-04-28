'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import crypto from 'crypto';

function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}

export async function createClientRecord(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const company = formData.get('company') as string;

  let avatar_url = '';
  const file = formData.get('avatar') as File;
  
  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    
    const { data, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(`avatars/${fileName}`, file);
      
    if (!uploadError && data) {
      const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(`avatars/${fileName}`);
      avatar_url = publicUrlData.publicUrl;
    }
  }

  // Generate secure token and set expiration to 90 days from now
  const portal_token = generateSecureToken();
  const token_expires_at = new Date();
  token_expires_at.setDate(token_expires_at.getDate() + 90);

  const { data: clientData, error } = await supabase
    .from('clients')
    .insert([{
      name,
      email,
      company: company || null,
      avatar_url: avatar_url || null,
      portal_token,
      token_expires_at: token_expires_at.toISOString()
    }])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Handle client_projects linking
  const linkedProjects = formData.getAll('linked_projects') as string[];
  if (linkedProjects.length > 0 && clientData) {
    const linksToInsert = linkedProjects.map((projectId) => ({
      client_id: clientData.id,
      project_id: projectId,
      title: 'Project Workspace', // Default title for the workspace link
      description: 'Auto-generated workspace link for client'
    }));

    await supabase.from('client_projects').insert(linksToInsert);
    
    // Also set client_id in the public projects table
    for (const projectId of linkedProjects) {
      await supabase.from('projects').update({ client_id: clientData.id }).eq('id', projectId);
    }
  }

  revalidatePath('/admin/clients');
  redirect('/admin/clients');
}

export async function updateClientRecord(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const company = formData.get('company') as string;

  const updateData: any = { name, email, company: company || null };

  const file = formData.get('avatar') as File;
  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    
    const { data, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(`avatars/${fileName}`, file);
      
    if (!uploadError && data) {
      const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(`avatars/${fileName}`);
      updateData.avatar_url = publicUrlData.publicUrl;
    }
  }

  const { error } = await supabase
    .from('clients')
    .update(updateData)
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  // Handle client_projects linking
  const linkedProjects = formData.getAll('linked_projects') as string[];
  
  // Clear old links
  await supabase.from('client_projects').delete().eq('client_id', id);
  // Clear client_id on projects
  await supabase.from('projects').update({ client_id: null }).eq('client_id', id);

  if (linkedProjects.length > 0) {
    const linksToInsert = linkedProjects.map((projectId) => ({
      client_id: id,
      project_id: projectId,
      title: 'Project Workspace',
      description: 'Workspace link for client'
    }));
    await supabase.from('client_projects').insert(linksToInsert);
    
    for (const projectId of linkedProjects) {
      await supabase.from('projects').update({ client_id: id }).eq('id', projectId);
    }
  }

  revalidatePath('/admin/clients');
  redirect('/admin/clients');
}

export async function regenerateClientToken(id: string) {
  await requireAdmin();
  const supabase = await createClient();

  const portal_token = generateSecureToken();
  const token_expires_at = new Date();
  token_expires_at.setDate(token_expires_at.getDate() + 90);

  const { error } = await supabase
    .from('clients')
    .update({ 
      portal_token, 
      token_expires_at: token_expires_at.toISOString() 
    })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/clients');
}
