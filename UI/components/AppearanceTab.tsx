
import React from 'react';
import { QuickQuestionsEditor } from '../../src/components/QuickQuestionsEditor';
import { AgentConfig } from '../../types';
import { Heading } from '../../src/components/core/typography/Heading';
import { Text } from '../../src/components/core/typography/Text';
import { Input } from '../../src/components/core/input/Input';
import { TextArea } from '../../src/components/core/input/TextArea';
import { Button } from '../../src/components/core/button/Button';

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
          <Heading level={1}>Appearance & Personality</Heading>
          <Text variant="muted" className="mt-1">Customize how your agent looks and sounds.</Text>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
           {/* Name & Greeting */}
           <div className="grid grid-cols-1 gap-6">
              <Input 
                label="Assistant Name"
                value={config.name}
                onChange={(e) => onConfigChange('name', e.target.value)}
              />
              <TextArea 
                label="Welcome Message"
                value={config.greeting}
                onChange={(e) => onConfigChange('greeting', e.target.value)}
                rows={2}
                className="resize-none"
              />
           </div>

           {/* Tone & Color */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">Personality Tone</label>
                 <div className="grid grid-cols-2 gap-2">
                    {(['professional', 'friendly', 'concise', 'humorous'] as const).map((tone) => (
                      <Button
                        key={tone}
                        variant={config.tone === tone ? 'primary' : 'secondary'}
                        onClick={() => onConfigChange('tone', tone)}
                        className={`text-sm ${config.tone === tone ? 'bg-brand-50 text-brand-700 border-brand-600' : ''}`}
                      >
                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                      </Button>
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
           <QuickQuestionsEditor 
             questions={config.quickQuestions} 
             onChange={(newQuestions) => onConfigChange('quickQuestions', newQuestions)} 
           />
        </div>
     </div>
  );
};

export default AppearanceTab;
