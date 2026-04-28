import { validatePortalToken } from '@/lib/portal';
import { createServiceClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import { CheckCircle2, Circle, Clock, Activity, AlertCircle } from 'lucide-react';

export default async function PortalDashboard({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params;
  const token = resolvedParams.token;
  
  const { projects } = await validatePortalToken(token);

  if (projects.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
        <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-300 mb-2">No active projects</h2>
        <p className="text-slate-500">You currently have no projects linked to this workspace.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {projects.map((project: any) => (
        <div key={project.id} className="space-y-8">
          
          {/* Project Header Overview */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-8">
              <div>
                <h2 className="text-3xl font-extrabold text-white mb-2">{project.title}</h2>
                <p className="text-slate-400 max-w-3xl">{project.description}</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 min-w-[200px]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-400">Total Progress</span>
                  <span className="text-lg font-bold text-blue-400">{project.progress}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Current Phase Highlight */}
            {project.currentPhaseDetails && (
              <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg shrink-0">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-1">Current Phase</h3>
                    <p className="text-xl font-bold text-white mb-2">{project.currentPhaseDetails.name}</p>
                    <p className="text-slate-400 text-sm mb-4">{project.currentPhaseDetails.description}</p>
                    
                    {/* Tasks within current phase */}
                    {project.currentPhaseDetails.tasks && project.currentPhaseDetails.tasks.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {project.currentPhaseDetails.tasks.map((task: any) => (
                          <div key={task.id} className="flex items-center gap-3 text-sm">
                            {task.status === 'done' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : task.status === 'in_progress' || task.status === 'review' ? (
                              <Clock className="w-4 h-4 text-blue-400" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-600" />
                            )}
                            <span className={task.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-300'}>
                              {task.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Phase Timeline */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" />
                Project Timeline
              </h3>
              
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
                {project.phases && project.phases.length > 0 ? (
                  project.phases.map((phase: any, index: number) => {
                    const isCompleted = phase.status === 'completed';
                    const isActive = phase.id === project.current_phase;
                    const isLocked = phase.status === 'locked';

                    return (
                      <div key={phase.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-950 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${
                          isCompleted ? 'bg-emerald-500 text-slate-950' : 
                          isActive ? 'bg-blue-500 text-slate-950 ring-4 ring-blue-500/20' : 
                          'bg-slate-800 text-slate-500'
                        }`}>
                          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span>{index + 1}</span>}
                        </div>
                        
                        <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border ${
                          isCompleted ? 'bg-slate-800/30 border-slate-800' :
                          isActive ? 'bg-blue-900/10 border-blue-800/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' :
                          'bg-slate-900/50 border-slate-800/50 opacity-50'
                        }`}>
                          <div className="flex justify-between items-center mb-1">
                            <h4 className={`font-bold ${isActive ? 'text-blue-400' : isCompleted ? 'text-emerald-400' : 'text-slate-400'}`}>
                              {phase.name}
                            </h4>
                            {phase.approved_at && (
                              <span className="text-[10px] text-slate-500">
                                {format(new Date(phase.approved_at), 'MMM d')}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-400">{phase.description}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-500 italic">No phases established yet.</p>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-slate-400" />
                Recent Activity
              </h3>
              
              <div className="space-y-6">
                {/* Simulated Recent Activity for MVP */}
                <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                  <div>
                    <p className="text-sm text-slate-300">Project initialized and portal created.</p>
                    <p className="text-xs text-slate-500 mt-1">{format(new Date(project.created_at), 'MMM d, h:mm a')}</p>
                  </div>
                </div>
                
                {project.currentPhaseDetails && (
                  <div className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                    <div>
                      <p className="text-sm text-slate-300">Phase <span className="font-bold text-white">{project.currentPhaseDetails.name}</span> is now active.</p>
                      <p className="text-xs text-slate-500 mt-1">Recent update</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
