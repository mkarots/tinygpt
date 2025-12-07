
import React, { useState } from 'react';
import { ExternalLink, Smartphone, Monitor, MessageCircle, X } from 'lucide-react';
import WidgetChat from './WidgetChat';
import { AgentConfig, KnowledgeItem } from '../types';

interface LivePreviewProps {
  config: AgentConfig;
  knowledge: KnowledgeItem[];
}

type ViewMode = 'mobile' | 'desktop';

const LivePreview: React.FC<LivePreviewProps> = ({ config, knowledge }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [isWidgetOpen, setIsWidgetOpen] = useState(true);

  return (
    <aside className="w-[450px] bg-slate-100 border-l border-slate-200 hidden xl:flex flex-col">
      {/* Header with Toggles */}
      <div className="p-4 border-b border-slate-200 bg-white/50 backdrop-blur-sm flex justify-between items-center">
         <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'desktop' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              title="Desktop Widget View"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'mobile' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
            </button>
         </div>
         <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
           {viewMode === 'desktop' ? 'Website Preview' : 'Mobile Preview'}
         </span>
         <a href="#" className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
           <ExternalLink className="w-3 h-3" />
         </a>
      </div>

      <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-[#f0f2f5]">
         {viewMode === 'desktop' ? (
           /* DESKTOP INTERCOM-STYLE VIEW */
           <div className="w-full h-full relative overflow-hidden bg-white shadow-inner flex flex-col">
              {/* Fake Browser Toolbar */}
              <div className="h-8 bg-slate-100 border-b border-slate-200 flex items-center px-3 gap-2">
                 <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                 </div>
                 <div className="flex-1 bg-white h-5 rounded border border-slate-200 mx-4"></div>
              </div>
              
              {/* Fake Website Content */}
              <div className="p-8 space-y-6 opacity-30 pointer-events-none select-none">
                 <div className="h-8 bg-slate-200 rounded w-1/3"></div>
                 <div className="space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="h-32 bg-slate-100 rounded"></div>
                    <div className="h-32 bg-slate-100 rounded"></div>
                 </div>
                 <div className="space-y-3 pt-4">
                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                 </div>
              </div>

              {/* INTERCOM WIDGET UI */}
              <div className="absolute bottom-6 right-6 flex flex-col items-end gap-4 z-20">
                 {/* Chat Popover */}
                 <div 
                   className={`origin-bottom-right transition-all duration-300 ease-out 
                     ${isWidgetOpen 
                       ? 'opacity-100 translate-y-0 scale-100' 
                       : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
                     }
                   `}
                 >
                   <div className="w-[360px] h-[550px] shadow-2xl rounded-2xl overflow-hidden ring-1 ring-black/5">
                      <WidgetChat config={config} knowledge={knowledge} onClose={() => setIsWidgetOpen(false)} />
                   </div>
                 </div>

                 {/* Launcher Button */}
                 <button 
                   onClick={() => setIsWidgetOpen(!isWidgetOpen)}
                   className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                   style={{ backgroundColor: config.primaryColor }}
                 >
                   {isWidgetOpen ? (
                     <X className="w-6 h-6 text-white" />
                   ) : (
                     <MessageCircle className="w-7 h-7 text-white" />
                   )}
                 </button>
              </div>
           </div>
         ) : (
           /* MOBILE PHONE VIEW */
           <div className="w-[340px] h-[640px] bg-slate-900 rounded-[3rem] shadow-2xl relative overflow-hidden ring-8 ring-slate-900">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 z-30 rounded-b-xl"></div>
              
              {/* Screen */}
              <div className="w-full h-full bg-white flex flex-col pt-6">
                 <WidgetChat config={config} knowledge={knowledge} />
              </div>
           </div>
         )}
      </div>
    </aside>
  );
};

export default LivePreview;
