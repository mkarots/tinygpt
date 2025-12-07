import React from 'react';

export type SuggestionItem = string | { text: string; emoji?: string };

interface SuggestionChipsProps {
  items: SuggestionItem[];
  onSelect: (text: string) => void;
  primaryColor?: string;
  className?: string;
}

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({
  items,
  onSelect,
  primaryColor,
  className = '',
}) => {
  if (!items.length) return null;

  return (
    <div className={`flex flex-wrap gap-2 justify-end animate-fade-in ${className}`}>
      {items.map((q, i) => {
        const isObject = typeof q === 'object';
        const text = isObject ? q.text : q;
        const emoji = isObject ? q.emoji : null;
        
        return (
          <button
            key={i}
            onClick={() => onSelect(text)}
            className="text-xs bg-white border border-brand-100 text-brand-600 px-3 py-1.5 rounded-full hover:bg-brand-50 transition-colors shadow-sm flex items-center gap-1.5"
            style={primaryColor ? { color: primaryColor, borderColor: `${primaryColor}20` } : {}}
          >
            {emoji && <span>{emoji}</span>}
            <span>{text}</span>
          </button>
        );
      })}
    </div>
  );
};

