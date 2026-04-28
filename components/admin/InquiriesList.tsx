'use client';

import { useState } from 'react';
import { updateInquiryStatus, deleteInquiry } from '@/app/actions/inquiries';
import { format } from 'date-fns';
import { Mail, Trash2, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function InquiriesList({ initialInquiries }: { initialInquiries: any[] }) {
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: string) => {
    // Optimistic update
    setInquiries(inquiries.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
    try {
      await updateInquiryStatus(id, newStatus);
    } catch (error) {
      console.error('Failed to update status', error);
      // Revert on error (could fetch fresh data)
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this inquiry permanently?')) {
      setInquiries(inquiries.filter(inq => inq.id !== id));
      await deleteInquiry(id);
    }
  };

  const toggleExpand = (id: string, currentStatus: string) => {
    setExpandedId(expandedId === id ? null : id);
    if (expandedId !== id && currentStatus === 'new') {
      handleStatusChange(id, 'read');
    }
  };

  return (
    <div className="space-y-4">
      {inquiries.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
          No inquiries found.
        </div>
      ) : (
        inquiries.map((inquiry) => {
          const isExpanded = expandedId === inquiry.id;
          
          return (
            <div 
              key={inquiry.id} 
              className={`bg-slate-900 border transition-colors rounded-xl overflow-hidden ${
                inquiry.status === 'new' ? 'border-blue-500/50' : 'border-slate-800'
              }`}
            >
              <div 
                className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors"
                onClick={() => toggleExpand(inquiry.id, inquiry.status)}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className={`p-3 rounded-full shrink-0 ${
                    inquiry.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                    inquiry.status === 'replied' ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {inquiry.status === 'replied' ? <CheckCircle className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-bold truncate ${inquiry.status === 'new' ? 'text-white' : 'text-slate-300'}`}>
                        {inquiry.name}
                      </h3>
                      {inquiry.status === 'new' && (
                        <span className="bg-blue-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">New</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 truncate">{inquiry.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between w-full sm:w-auto gap-4 shrink-0">
                  <span className="text-xs text-slate-500">
                    {format(new Date(inquiry.created_at), 'MMM d, h:mm a')}
                  </span>
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <select
                      value={inquiry.status}
                      onChange={(e) => handleStatusChange(inquiry.id, e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                    </select>
                    
                    <button 
                      onClick={() => handleDelete(inquiry.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <button className="p-1.5 text-slate-500 hover:text-white pointer-events-none">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="p-6 pt-2 border-t border-slate-800/50 bg-slate-900/50">
                  <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                    <p className="whitespace-pre-wrap">{inquiry.message}</p>
                  </div>
                  <div className="mt-6">
                    <a 
                      href={`mailto:${inquiry.email}?subject=Re: Inquiry to BuildByAI`}
                      className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (inquiry.status !== 'replied') handleStatusChange(inquiry.id, 'replied');
                      }}
                    >
                      Reply via Email
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
