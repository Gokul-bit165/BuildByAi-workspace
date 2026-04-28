'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function updateInquiryStatus(id: string, status: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from('contact_inquiries')
    .update({ status })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/inquiries');
}

export async function deleteInquiry(id: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from('contact_inquiries')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/inquiries');
}
