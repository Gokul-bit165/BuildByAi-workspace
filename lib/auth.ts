import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: dbUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (dbUser?.role !== 'admin') {
    redirect('/workspace');
  }

  return user;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: dbUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return { ...user, ...dbUser };
}
