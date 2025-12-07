
import React, { useState, useRef, useEffect } from 'react';
import { Bot, RefreshCw, ChevronDown } from 'lucide-react';
import { ChatMessage, AgentConfig, KnowledgeItem } from '../../types';
import { sendMessageStream, initializeChat } from '../../services/geminiService';
import { MessageBubble } from './core/feedback/MessageBubble';
import { ChatInput } from './core/input/ChatInput';
import { SuggestionChips } from './core/input/SuggestionChips';

interface WidgetChatProps {
  config: AgentConfig;
  knowledge: KnowledgeItem[];
  agentId?: string;
  isOpen?: boolean; // For future real widget toggle
  onClose?: () => void;
  showQuickQuestions?: boolean; // Control visibility of in-chat pills
}

const WidgetChat: React.FC<WidgetChatProps> = ({ config, knowledge, agentId, onClose, showQuickQuestions = true }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat when config or knowledge changes
  useEffect(() => {
    initializeChat(knowledge, config, agentId);
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
                 text: config.greeting || "Hello! How can I help you today?",
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
          <MessageBubble
            key={msg.id}
            text={msg.text}
            role={msg.role}
            isStreaming={msg.isStreaming}
            primaryColor={primaryColor}
          />
        ))}
        
        {/* Quick Questions (Show immediately or after bot messages) */}
        {showQuickQuestions && messages.length > 0 && !isTyping && (
           <SuggestionChips
             items={config.quickQuestions}
             onSelect={handleSendMessage}
             primaryColor={primaryColor}
             className="mt-2 px-4"
           />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-neutral-100">
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={() => handleSendMessage(inputValue)}
          isTyping={isTyping}
          primaryColor={primaryColor}
        />
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
