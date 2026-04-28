import { validatePortalToken } from '@/lib/portal';
import { createServiceClient } from '@/lib/supabase/server';
import { CheckSquare, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default async function PortalApprove({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params;
  const token = resolvedParams.token;
  
  const { projects } = await validatePortalToken(token);

  // Filter projects that have an active phase pending approval
  const pendingApprovals = projects.filter((p: any) => 
    p.currentPhaseDetails && 
    p.currentPhaseDetails.status === 'active' && 
    !p.currentPhaseDetails.approved_at
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <CheckSquare className="w-8 h-8 text-emerald-400" />
          Phase Approvals
        </h2>
        <p className="text-slate-400">Review and officially sign-off on completed project phases.</p>
      </div>

      {pendingApprovals.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <ShieldCheck className="w-16 h-16 text-emerald-500/50 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-slate-200 mb-2">All Caught Up!</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            There are no phases currently pending your approval. We will notify you when the next milestone is ready for review.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {pendingApprovals.map((project: any) => (
            <div key={project.id} className="bg-slate-900 border border-emerald-500/30 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.05)]">
              <div className="p-8 border-b border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Action Required</span>
                  <span className="text-slate-600">&bull;</span>
                  <span className="text-sm font-medium text-slate-400">{project.title}</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Phase {project.currentPhaseDetails.order_index + 1}: {project.currentPhaseDetails.name}
                </h3>
                <p className="text-slate-400 mb-6">
                  {project.currentPhaseDetails.description}
                </p>
                
                <div className="bg-slate-800/50 rounded-xl p-6">
                  <h4 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Phase Deliverables Review
                  </h4>
                  <ul className="space-y-3">
                    {project.currentPhaseDetails.tasks?.map((task: any) => (
                      <li key={task.id} className="flex items-start gap-3 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <span className="text-slate-300">{task.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-8 bg-slate-900/50 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-3 max-w-md">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-400">
                    By approving this phase, you acknowledge that all deliverables meet the requirements and authorize the team to proceed to the next phase.
                  </p>
                </div>
                <button 
                  type="button"
                  className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-md transition-colors shadow-lg shadow-emerald-900/20 whitespace-nowrap"
                >
                  Approve Phase
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Needed because we reference CheckCircle2 inside the file but it wasn't imported.
import { CheckCircle2 } from 'lucide-react';
