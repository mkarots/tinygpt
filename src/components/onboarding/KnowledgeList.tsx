import React from 'react';
import { AlignLeft, Globe, FileText, Trash2 } from 'lucide-react';
import { KnowledgeItem } from '../../../types';
import { knowledgeStatusLabel } from '../../lib/knowledgeStatusLabel';
import { websiteRetryUrl } from '../../lib/settleAbandonedImports';

interface KnowledgeListProps {
  items: KnowledgeItem[];
  onRemove?: (id: string) => void;
  onRetry?: (id: string, url: string) => void;
  retryDisabled?: boolean;
}

export const KnowledgeList: React.FC<KnowledgeListProps> = ({
  items,
  onRemove,
  onRetry,
  retryDisabled = false,
}) => {
  if (items.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mt-4">
      <div className="bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500 border-b border-slate-200">
        Imported ({items.length})
      </div>
      <ul className="divide-y divide-slate-100">
        {items.map(k => {
          const retryUrl = k.status === 'error' ? websiteRetryUrl(k) : null;
          const showActions = k.status === 'error' && (onRemove || (onRetry && retryUrl));

          return (
          <li key={k.id} className="px-4 py-3 flex items-center justify-between gap-3">
             <div className="flex items-center gap-3 min-w-0">
                {k.type === 'file' && <FileText className="w-4 h-4 text-orange-500 shrink-0" />}
                {k.type === 'url' && <Globe className="w-4 h-4 text-blue-500 shrink-0" />}
                {k.type === 'text' && <AlignLeft className="w-4 h-4 text-emerald-500 shrink-0" />}
                <div className="min-w-0">
                  <span className="text-sm font-medium text-slate-700 block truncate">{k.name}</span>
                  {k.status === 'error' && k.error ? (
                    <p className="text-xs text-red-600 mt-0.5">{k.error}</p>
                  ) : null}
                </div>
             </div>
             <div className="flex items-center gap-2 shrink-0">
               <span className={`text-xs px-2 py-0.5 rounded-full ${
                 k.status === 'error'
                   ? 'bg-red-100 text-red-700'
                   : k.status === 'pending'
                     ? 'bg-slate-100 text-slate-600'
                     : 'bg-green-100 text-green-700'
               }`}>
                 {knowledgeStatusLabel(k.status)}
               </span>
               {showActions ? (
                 <div className="flex items-center gap-1">
                   {onRetry && retryUrl ? (
                     <button
                       type="button"
                       onClick={() => onRetry(k.id, retryUrl)}
                       disabled={retryDisabled}
                       className="text-xs font-medium text-blue-600 hover:text-blue-800 px-1.5 py-0.5 rounded disabled:opacity-50"
                     >
                       Try again
                     </button>
                   ) : null}
                   {onRemove ? (
                     <button
                       type="button"
                       onClick={() => onRemove(k.id)}
                       aria-label={`Remove ${k.name}`}
                       className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                     >
                       <Trash2 className="w-3.5 h-3.5" />
                     </button>
                   ) : null}
                 </div>
               ) : null}
             </div>
          </li>
          );
        })}
      </ul>
    </div>
  );
};
