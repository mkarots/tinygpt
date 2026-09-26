import React, { useEffect, useRef, useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { AgentConfig } from '../../types';
import { EMOJI_CHOICES, setQuestionEmoji } from './quickQuestionEmoji';

interface QuickQuestionsEditorProps {
  questions: AgentConfig['quickQuestions'];
  onChange: (questions: AgentConfig['quickQuestions']) => void;
}

export const QuickQuestionsEditor: React.FC<QuickQuestionsEditorProps> = ({ questions, onChange }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenIndex(null);
    };
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpenIndex(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
    };
  }, [openIndex]);

  return (
    <div ref={rootRef} className="pt-4 border-t border-slate-100">
      <label className="block text-sm font-medium text-slate-700 mb-3">Quick Questions</label>
      <div className="space-y-3">
        {questions.map((q, idx) => {
          const isObject = typeof q === 'object';
          const text = isObject ? q.text : q;
          const emoji = isObject ? q.emoji : '💡';

          return (
            <div key={idx} className="flex gap-2">
              <div className="relative">
                <button
                  type="button"
                  aria-label={`Choose emoji for question ${idx + 1}`}
                  aria-expanded={openIndex === idx}
                  aria-haspopup="dialog"
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="w-12 h-full text-center px-2 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-lg"
                >
                  {emoji}
                </button>
                {openIndex === idx && (
                  <div
                    role="dialog"
                    aria-label="Emoji picker"
                    className="absolute left-0 top-full z-20 mt-1 grid w-56 grid-cols-6 gap-1 rounded-lg border border-slate-200 bg-white p-2 shadow-lg"
                  >
                    {EMOJI_CHOICES.map((choice) => (
                      <button
                        key={choice}
                        type="button"
                        aria-label={choice}
                        onClick={() => {
                          onChange(setQuestionEmoji(questions, idx, choice));
                          setOpenIndex(null);
                        }}
                        className="rounded-md p-1 text-lg hover:bg-slate-100"
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
                aria-label={`Question ${idx + 1} text`}
              />
              <button 
                type="button"
                aria-label={`Remove question ${idx + 1}`}
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

