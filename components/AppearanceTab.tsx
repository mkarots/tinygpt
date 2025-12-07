
import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { AgentConfig } from '../types';

interface AppearanceTabProps {
  config: AgentConfig;
  onConfigChange: (key: keyof AgentConfig, value: any) => void;
  onAddQuickQuestion: () => void;
  onUpdateQuickQuestion: (index: number, value: string) => void;
  onRemoveQuickQuestion: (index: number) => void;
}

const AppearanceTab: React.FC<AppearanceTabProps> = ({ 
  config, 
  onConfigChange, 
  onAddQuickQuestion, 
  onUpdateQuickQuestion, 
  onRemoveQuickQuestion 
}) => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appearance & Personality</h1>
          <p className="text-slate-500 mt-1">Customize how your agent looks and sounds.</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
           {/* Name & Greeting */}
           <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Assistant Name</label>
                <input 
                  type="text" 
                  value={config.name}
                  onChange={(e) => onConfigChange('name', e.target.value)}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Welcome Message</label>
                <textarea 
                  value={config.greeting}
                  onChange={(e) => onConfigChange('greeting', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
                />
              </div>
           </div>

           {/* Tone & Color */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">Personality Tone</label>
                 <div className="grid grid-cols-2 gap-2">
                    {(['professional', 'friendly', 'concise', 'humorous'] as const).map((tone) => (
                      <button
                        key={tone}
                        onClick={() => onConfigChange('tone', tone)}
                        className={`px-3 py-2 text-sm rounded-lg border transition-all
                          ${config.tone === tone 
                            ? 'border-brand-600 bg-brand-50 text-brand-700 font-medium' 
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }
                        `}
                      >
                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                      </button>
                    ))}
                 </div>
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">Brand Color</label>
                 <div className="flex gap-3">
                    {['#7c3aed', '#2563eb', '#059669', '#dc2626', '#09090b'].map((color) => (
                       <button
                         key={color}
                         onClick={() => onConfigChange('primaryColor', color)}
                         className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${config.primaryColor === color ? 'border-slate-900 ring-2 ring-offset-2 ring-slate-200' : 'border-transparent'}`}
                         style={{ backgroundColor: color }}
                       />
                    ))}
                    <input 
                      type="color" 
                      value={config.primaryColor}
                      onChange={(e) => onConfigChange('primaryColor', e.target.value)}
                      className="w-8 h-8 p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                    />
                 </div>
              </div>
           </div>

           {/* Quick Questions */}
           <div className="pt-4 border-t border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-3">Quick Questions</label>
              <div className="space-y-3">
                 {config.quickQuestions.map((q, idx) => (
                   <div key={idx} className="flex gap-2">
                      <input 
                        type="text"
                        value={q}
                        onChange={(e) => onUpdateQuickQuestion(idx, e.target.value)}
                        className="flex-1 px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      />
                      <button onClick={() => onRemoveQuickQuestion(idx)} className="text-slate-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                 ))}
                 {config.quickQuestions.length < 4 && (
                   <button 
                     onClick={onAddQuickQuestion}
                     className="text-sm text-brand-600 font-medium hover:text-brand-700 flex items-center gap-1"
                   >
                     <Plus className="w-3 h-3" /> Add Question
                   </button>
                 )}
              </div>
           </div>
        </div>
     </div>
  );
};

export default AppearanceTab;
