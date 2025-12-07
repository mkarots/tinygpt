import React, { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../button/Button';
import { Input } from './Input';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isTyping?: boolean;
  placeholder?: string;
  primaryColor?: string;
  disabled?: boolean;
  className?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  isTyping = false,
  placeholder = "Type a message...",
  primaryColor,
  disabled = false,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isTyping && !disabled) {
      onSubmit();
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={`flex items-center gap-2 bg-neutral-50 rounded-xl px-3 py-2 border border-neutral-200 focus-within:ring-2 focus-within:ring-opacity-50 transition-all ${className}`}
      style={primaryColor ? { '--tw-ring-color': primaryColor } as React.CSSProperties : {}}
    >
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        variant="ghost"
        wrapperClassName="flex-1"
        className="text-sm placeholder:text-neutral-400 text-slate-900"
        disabled={isTyping || disabled}
      />
      <Button
        type="submit"
        disabled={!value.trim() || isTyping || disabled}
        variant="ghost"
        size="icon"
        className={`transition-all ${
          value.trim() 
            ? 'opacity-100 transform scale-100' 
            : 'opacity-0 transform scale-75 pointer-events-none'
        }`}
        style={primaryColor ? { color: primaryColor } : {}}
      >
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
};

