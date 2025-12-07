import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { AgentConfig } from '../../types';

interface QuickQuestionsEditorProps {
  questions: AgentConfig['quickQuestions'];
  onChange: (questions: AgentConfig['quickQuestions']) => void;
}

export const QuickQuestionsEditor: React.FC<QuickQuestionsEditorProps> = ({ questions, onChange }) => {
  return (
    <div className="pt-4 border-t border-slate-100">
      <label className="block text-sm font-medium text-slate-700 mb-3">Quick Questions</label>
      <div className="space-y-3">
        {questions.map((q, idx) => {
          const isObject = typeof q === 'object';
          const text = isObject ? q.text : q;
          const emoji = isObject ? q.emoji : '💡';

          return (
            <div key={idx} className="flex gap-2">
              <input 
                type="text"
                value={emoji}
                onChange={(e) => {
                  const newQuestions = [...questions];
                  if (typeof newQuestions[idx] === 'string') {
                    newQuestions[idx] = { text: newQuestions[idx] as string, emoji: e.target.value };
                  } else {
                    newQuestions[idx] = { ...(newQuestions[idx] as any), emoji: e.target.value };
                  }
                  onChange(newQuestions);
                }}
                className="w-12 text-center px-2 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                placeholder="Emoji"
              />
              <input 
                type="text"
                value={text}
                onChange={(e) => {
                  const newQuestions = [...questions];
                  if (typeof newQuestions[idx] === 'string') {
                    newQuestions[idx] = { text: e.target.value, emoji: '💡' };
                  } else {
                    newQuestions[idx] = { ...(newQuestions[idx] as any), text: e.target.value };
                  }
                  onChange(newQuestions);
                }}
                className="flex-1 px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                placeholder="Question text..."
              />
              <button 
                type="button"
                onClick={() => {
                  const newQuestions = questions.filter((_, i) => i !== idx);
                  onChange(newQuestions);
                }} 
                className="text-slate-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
        {questions.length < 5 && (
          <button 
            type="button"
            onClick={() => {
              const newQ = { text: 'New Question', emoji: '✨' };
              onChange([...questions, newQ]);
            }}
            className="text-sm text-brand-600 font-medium hover:text-brand-700 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add Question
          </button>
        )}
      </div>
    </div>
  );
};

