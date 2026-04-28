'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toggleTeamVisibility, reorderTeamMembers, deleteTeamMember } from '@/app/actions/team';
import Link from 'next/link';
import { GripVertical, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';

export default function TeamList({ initialMembers }: { initialMembers: any[] }) {
  const [members, setMembers] = useState(initialMembers);
  const [isSaving, setIsSaving] = useState(false);

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(members);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setMembers(items);
    setIsSaving(true);
    
    const ids = items.map(m => m.id);
    await reorderTeamMembers(ids);
    setIsSaving(false);
  };

  const handleToggleVisibility = async (id: string, currentStatus: boolean) => {
    setMembers(members.map(m => m.id === id ? { ...m, is_visible: !currentStatus } : m));
    await toggleTeamVisibility(id, !currentStatus);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      setMembers(members.filter(m => m.id !== id));
      await deleteTeamMember(id);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative">
      {isSaving && (
        <div className="absolute top-2 right-4 z-10 text-xs text-blue-400 font-medium animate-pulse">
          Saving order...
        </div>
      )}
      
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="team-list">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="divide-y divide-slate-800">
              {members.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No team members added yet.</div>
              ) : (
                members.map((member, index) => {
                  const user = member.users;
                  return (
                    <Draggable key={member.id} draggableId={member.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`p-4 flex items-center gap-4 group transition-colors ${
                            snapshot.isDragging ? 'bg-slate-800 shadow-xl' : 'hover:bg-slate-800/50'
                          } ${!member.is_visible ? 'opacity-60' : ''}`}
                        >
                          <div {...provided.dragHandleProps} className="text-slate-500 cursor-grab hover:text-white">
                            <GripVertical className="w-5 h-5" />
                          </div>
                          
                          <div 
                            className="w-10 h-10 rounded-full bg-slate-700 bg-cover bg-center shrink-0 border border-slate-600"
                            style={user.avatar_url ? { backgroundImage: `url(${user.avatar_url})` } : {}}
                          >
                            {!user.avatar_url && (
                              <span className="flex items-center justify-center w-full h-full font-bold text-slate-400 text-sm">
                                {user.name?.charAt(0)}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-200 truncate">{user.name}</p>
                              {!member.is_visible && (
                                <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Hidden</span>
                              )}
                            </div>
                            <p className="text-xs text-blue-400 truncate">{member.role_title}</p>
                          </div>
                          
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleToggleVisibility(member.id, member.is_visible)}
                              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
                              title={member.is_visible ? "Hide on website" : "Show on website"}
                            >
                              {member.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            
                            <Link
                              href={`/admin/team/${member.id}`}
                              className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-md transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                            
                            <button
                              onClick={() => handleDelete(member.id)}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
