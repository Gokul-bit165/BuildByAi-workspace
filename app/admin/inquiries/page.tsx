import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import InquiriesList from '@/components/admin/InquiriesList';

export default async function AdminInquiriesPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: inquiries } = await supabase
    .from('contact_inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Contact Inquiries</h1>
        <p className="text-slate-400 mt-1">Manage and respond to messages from the public site.</p>
      </div>

      <InquiriesList initialInquiries={inquiries || []} />
    </div>
  );
}
