'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createTeamMember(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const user_id = formData.get('user_id') as string;
  const role_title = formData.get('role_title') as string;
  const is_visible = formData.get('is_visible') === 'true';
  const name = formData.get('name') as string;
  const bio = formData.get('bio') as string;
  const github_username = formData.get('github_username') as string;

  if (!user_id) {
    return { error: 'User selection is required' };
  }

  // Handle avatar upload
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

  // Update user profile
  const userUpdateData: any = { name, bio, github_username: github_username || null };
  if (avatar_url) userUpdateData.avatar_url = avatar_url;

  const { error: userError } = await supabase
    .from('users')
    .update(userUpdateData)
    .eq('id', user_id);

  if (userError) {
    return { error: 'Failed to update user profile: ' + userError.message };
  }

  // Get max display_order
  const { data: maxOrderData } = await supabase
    .from('team_members')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1);
    
  const display_order = maxOrderData && maxOrderData.length > 0 ? (maxOrderData[0].display_order || 0) + 1 : 1;

  // Insert team member
  const { error: teamError } = await supabase
    .from('team_members')
    .insert([{ user_id, role_title, is_visible, display_order }]);

  if (teamError) {
    return { error: 'Failed to add team member: ' + teamError.message };
  }

  revalidatePath('/admin/team');
  revalidatePath('/team');
  redirect('/admin/team');
}

export async function updateTeamMember(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const user_id = formData.get('user_id') as string;
  const role_title = formData.get('role_title') as string;
  const is_visible = formData.get('is_visible') === 'true';
  const name = formData.get('name') as string;
  const bio = formData.get('bio') as string;
  const github_username = formData.get('github_username') as string;

  // Handle avatar upload
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

  // Update user profile
  const userUpdateData: any = { name, bio, github_username: github_username || null };
  if (avatar_url) userUpdateData.avatar_url = avatar_url;

  const { error: userError } = await supabase
    .from('users')
    .update(userUpdateData)
    .eq('id', user_id);

  if (userError) {
    return { error: 'Failed to update user profile: ' + userError.message };
  }

  // Update team member
  const { error: teamError } = await supabase
    .from('team_members')
    .update({ role_title, is_visible })
    .eq('id', id);

  if (teamError) {
    return { error: 'Failed to update team member: ' + teamError.message };
  }

  revalidatePath('/admin/team');
  revalidatePath('/team');
  redirect('/admin/team');
}

export async function toggleTeamVisibility(id: string, is_visible: boolean) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from('team_members')
    .update({ is_visible })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/team');
  revalidatePath('/team');
}

export async function reorderTeamMembers(memberIds: string[]) {
  await requireAdmin();
  const supabase = await createClient();

  for (let i = 0; i < memberIds.length; i++) {
    await supabase
      .from('team_members')
      .update({ display_order: i })
      .eq('id', memberIds[i]);
  }

  revalidatePath('/admin/team');
  revalidatePath('/team');
}

export async function deleteTeamMember(id: string) {
  await requireAdmin();
  const supabase = await createClient();

  await supabase
    .from('team_members')
    .delete()
    .eq('id', id);

  revalidatePath('/admin/team');
  revalidatePath('/team');
}
