'use server';

import { createClient } from '@/lib/supabase/server';

export async function submitContactForm(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const message = formData.get('message') as string;

  if (!name || !email || !message) {
    return { error: 'All fields are required.' };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('contact_inquiries')
    .insert([{ name, email, message, status: 'new' }]);

  if (error) {
    console.error('Error submitting contact form:', error);
    return { error: 'Failed to submit form. Please try again later.' };
  }

  return { success: true };
}
