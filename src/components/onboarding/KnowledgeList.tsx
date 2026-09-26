import React from 'react';
import { AlignLeft, Globe, FileText } from 'lucide-react';
import { KnowledgeItem } from '../../../types';
import { knowledgeStatusLabel } from '../../lib/knowledgeStatusLabel';

interface KnowledgeListProps {
  items: KnowledgeItem[];
}

export const KnowledgeList: React.FC<KnowledgeListProps> = ({ items }) => {
  if (items.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mt-4">
      <div className="bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500 border-b border-slate-200">
        Imported ({items.length})
      </div>
      <ul className="divide-y divide-slate-100">
        {items.map(k => (
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
             <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
               k.status === 'error'
                 ? 'bg-red-100 text-red-700'
                 : k.status === 'pending'
                   ? 'bg-slate-100 text-slate-600'
                   : 'bg-green-100 text-green-700'
             }`}>
               {knowledgeStatusLabel(k.status)}
             </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
