import { validatePortalToken } from '@/lib/portal';
import { MessageCircle, CheckCircle2 } from 'lucide-react';

export default async function PortalFeedback({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params;
  const token = resolvedParams.token;
  
  const { client, projects } = await validatePortalToken(token);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 md:p-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Provide Feedback</h2>
          <p className="text-slate-400">
            Share your thoughts, report issues, or request changes for your projects. Your feedback goes directly to the team.
          </p>
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Related Project</label>
            <select 
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue=""
            >
              <option value="" disabled>Select a project...</option>
              {projects.map((p: any) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Type of Feedback</label>
            <select 
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="general">General Comment</option>
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
              <option value="revision">Design Revision</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Detailed Message</label>
            <textarea 
              rows={6}
              placeholder="Describe your feedback in detail..."
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            ></textarea>
          </div>

          <button 
            type="button"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-md transition-colors"
          >
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
}
