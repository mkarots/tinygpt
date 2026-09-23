import React from 'react';
import { Heading } from '../core/typography/Heading';
import { Text } from '../core/typography/Text';
import { Input } from '../core/input/Input';
import { AgentConfig } from '../../../types';

interface CustomizeStepProps {
  config: AgentConfig;
  onConfigChange: (key: keyof AgentConfig, value: any) => void;
}

export const CustomizeStep: React.FC<CustomizeStepProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <Heading level={2}>Give it personality</Heading>
        <Text variant="muted" className="mt-2">Make the assistant sound like your brand.</Text>
      </div>

      <Input 
        label="Assistant Name"
        value={config.name}
        onChange={(e) => onConfigChange('name', e.target.value)}
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">Tone of Voice</label>
        <div className="grid grid-cols-2 gap-3">
          {(['professional', 'friendly', 'concise', 'humorous'] as const).map(tone => (
            <button
              key={tone}
              onClick={() => onConfigChange('tone', tone)}
              className={`p-4 rounded-xl border-2 text-left transition-all
                ${config.tone === tone 
                  ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' 
                  : 'border-slate-100 hover:border-slate-200 bg-white'
                }
              `}
            >
              <span className="block font-semibold text-sm capitalize mb-1 text-slate-900">{tone}</span>
              <span className="block text-xs text-slate-500">
                {tone === 'professional' && "Polite, formal, business-like"}
                {tone === 'friendly' && "Warm, helpful, conversational"}
                {tone === 'concise' && "Direct, efficient, minimal fluff"}
                {tone === 'humorous' && "Witty, fun, light-hearted"}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">Brand Color</label>
        <div className="flex gap-4">
          {['#7c3aed', '#2563eb', '#059669', '#dc2626', '#09090b'].map(color => (
            <button
              key={color}
              onClick={() => onConfigChange('primaryColor', color)}
              className={`w-12 h-12 rounded-full transition-transform hover:scale-110 shadow-sm ${config.primaryColor === color ? 'ring-4 ring-slate-200 scale-110' : ''}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

