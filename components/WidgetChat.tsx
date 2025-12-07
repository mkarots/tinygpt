
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, RefreshCw, X, ChevronDown } from 'lucide-react';
import { ChatMessage, AgentConfig, KnowledgeItem } from '../types';
import { sendMessageStream, initializeChat } from '../services/geminiService';

interface WidgetChatProps {
  config: AgentConfig;
  knowledge: KnowledgeItem[];
  isOpen?: boolean; // For future real widget toggle
  onClose?: () => void;
  showQuickQuestions?: boolean; // Control visibility of in-chat pills
}

const WidgetChat: React.FC<WidgetChatProps> = ({ config, knowledge, onClose, showQuickQuestions = true }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat when config or knowledge changes
  useEffect(() => {
    initializeChat(knowledge, config);
    // Only set welcome message if chat is empty (prevents reset on re-renders if lifted state)
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          text: config.greeting || "Hello! How can I help you today?",
          timestamp: Date.now(),
        }
      ]);
    }
  }, [config, knowledge]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    const botMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: botMessageId,
      role: 'model',
      text: '',
      timestamp: Date.now(),
      isStreaming: true,
    }]);

    try {
      await sendMessageStream(text, (streamedText) => {
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId ? { ...msg, text: streamedText } : msg
        ));
      });
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId 
          ? { ...msg, text: "I'm having trouble connecting right now. Please try again." }
          : msg
      ));
    } finally {
      setIsTyping(false);
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId ? { ...msg, isStreaming: false } : msg
      ));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  // Dynamic Styles
  const primaryColor = config.primaryColor || '#7c3aed';
  
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-200 font-sans">
      {/* Widget Header */}
      <div 
        className="px-4 py-4 flex items-center justify-between text-white shadow-md z-10"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm leading-tight">{config.name}</h3>
            <p className="text-[10px] text-white/80 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
              Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => {
               setMessages([{
                 id: 'welcome',
                 role: 'model',
                 text: config.greeting,
                 timestamp: Date.now(),
               }]);
            }}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
            title="Restart Chat"
          >
            <RefreshCw className="w-4 h-4 text-white/90" />
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
              title="Close Chat"
            >
              <ChevronDown className="w-4 h-4 text-white/90" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scrollbar-hide">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm
                ${msg.role === 'user' 
                  ? 'text-white rounded-br-none' 
                  : 'bg-white text-neutral-700 border border-neutral-100 rounded-bl-none'
                }
              `}
              style={msg.role === 'user' ? { backgroundColor: primaryColor } : {}}
            >
              {msg.role === 'model' && msg.isStreaming && !msg.text ? (
                 <div className="flex gap-1 py-1 px-1">
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-150"></span>
                 </div>
              ) : (
                 <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
              )}
            </div>
          </div>
        ))}
        
        {/* Quick Questions (Show immediately or after bot messages) */}
        {showQuickQuestions && messages.length > 0 && !isTyping && config.quickQuestions.length > 0 && (
           <div className="flex flex-wrap gap-2 justify-end mt-2 px-4 animate-fade-in">
              {config.quickQuestions.map((q, i) => {
                const isObject = typeof q === 'object';
                const text = isObject ? q.text : q;
                const emoji = isObject ? q.emoji : null;
                
                return (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(text)}
                    className="text-xs bg-white border border-brand-100 text-brand-600 px-3 py-1.5 rounded-full hover:bg-brand-50 transition-colors shadow-sm flex items-center gap-1.5"
                    style={{ color: primaryColor, borderColor: `${primaryColor}20` }}
                  >
                    {emoji && <span>{emoji}</span>}
                    <span>{text}</span>
                  </button>
                );
              })}
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-neutral-100">
        <form 
          onSubmit={handleSubmit}
          className="flex items-center gap-2 bg-neutral-50 rounded-xl px-3 py-2 border border-neutral-200 focus-within:ring-2 focus-within:ring-opacity-50 transition-all"
          style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none text-sm focus:outline-none placeholder:text-neutral-400 text-slate-900"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className={`p-1.5 rounded-lg transition-all ${
              inputValue.trim() 
                ? 'opacity-100 transform scale-100' 
                : 'opacity-0 transform scale-75 pointer-events-none'
            }`}
            style={{ color: primaryColor }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="text-center mt-2">
           <span className="text-[10px] text-neutral-400 font-medium">
             Powered by TinyGPT
           </span>
        </div>
      </div>
    </div>
  );
};

export default WidgetChat;
