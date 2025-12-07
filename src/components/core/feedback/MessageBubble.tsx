import React from 'react';

interface MessageBubbleProps {
  text: string;
  role: 'user' | 'model';
  isStreaming?: boolean;
  primaryColor?: string;
  className?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  text,
  role,
  isStreaming,
  primaryColor,
  className = '',
}) => {
  const isUser = role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${className}`}>
      <div 
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm
          ${isUser 
            ? 'text-white rounded-br-none' 
            : 'bg-white text-neutral-700 border border-neutral-100 rounded-bl-none'
          }
        `}
        style={isUser && primaryColor ? { backgroundColor: primaryColor } : {}}
      >
        {role === 'model' && isStreaming && !text ? (
           <div className="flex gap-1 py-1 px-1">
              <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-150"></span>
           </div>
        ) : (
           <div className="whitespace-pre-wrap leading-relaxed">{text}</div>
        )}
      </div>
    </div>
  );
};

