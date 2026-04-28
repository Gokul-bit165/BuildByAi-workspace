import { createServiceClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';

export async function validatePortalToken(token: string) {
  if (!token) {
    notFound();
  }

  const supabase = await createServiceClient();

  // Fetch client by token
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('portal_token', token)
    .single();

  if (error || !client) {
    // If no client matches the token, return 404
    notFound();
  }

  // Ensure token is not expired
  if (client.token_expires_at && new Date(client.token_expires_at) < new Date()) {
    // Return a special error component or redirect to an expired page. For now, 404 or throw.
    throw new Error('This portal link has expired. Please contact BuildByAI for a new link.');
  }

  // Fetch assigned workspace projects (client_projects)
  const { data: clientProjects } = await supabase
    .from('client_projects')
    .select(`
      id,
      title,
      description,
      status,
      current_phase,
      created_at,
      phases (
        id,
        name,
        description,
        order_index,
        status,
        approved_at
      )
    `)
    .eq('client_id', client.id)
    .order('created_at', { ascending: false });

  // Add tasks info to phases and compute progress
  let enhancedProjects = [];
  if (clientProjects) {
    for (const project of clientProjects) {
      // Sort phases by order_index
      const sortedPhases = (project.phases || []).sort((a: any, b: any) => a.order_index - b.order_index);
      
      // Fetch tasks for this project
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('client_project_id', project.id);
        
      let totalTasks = 0;
      let completedTasks = 0;
      
      const phasesWithTasks = sortedPhases.map((phase: any) => {
        const phaseTasks = (tasks || []).filter(t => t.phase_id === phase.id);
        totalTasks += phaseTasks.length;
        completedTasks += phaseTasks.filter(t => t.status === 'done').length;
        
        return {
          ...phase,
          tasks: phaseTasks
        };
      });

      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      const currentPhaseObj = phasesWithTasks.find((p: any) => p.id === project.current_phase) || phasesWithTasks[0];

      enhancedProjects.push({
        ...project,
        phases: phasesWithTasks,
        progress,
        currentPhaseDetails: currentPhaseObj
      });
    }
  }

  return {
    client,
    projects: enhancedProjects
  };
}
