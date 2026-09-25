'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import WidgetChat from '../../WidgetChat';
import { AgentConfig, KnowledgeItem } from '../../../../types';
import { Loader2, AlertCircle, BookOpen, Sparkles, FileText, Globe, MessageSquare, ArrowRight } from 'lucide-react';

export default function ChatPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agentData, setAgentData] = useState<{
    config: AgentConfig;
    knowledge: KnowledgeItem[];
  } | null>(null);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'overview' | 'chat'>('overview');

  useEffect(() => {
    // Note: Parameter renamed from agentId to id in routing
    const agentId = params.id;
    if (agentId) {
      fetch(`/api/agent/${agentId}`)
        .then(res => {
          if (!res.ok) throw new Error('Agent not found');
          return res.json();
        })
        .then(data => {
          setAgentData(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper">
        <Loader2 className="w-8 h-8 text-terracotta animate-spin" />
      </div>
    );
  }

  if (error || !agentData) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper p-4">
         <div className="text-center max-w-md">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h1 className="font-serif text-2xl font-semibold text-ink mb-2">Agent Not Found</h1>
            <p className="text-stone text-sm">
               This chat link appears to be invalid or has expired. Please check the URL and try again.
            </p>
         </div>
      </div>
    );
  }

  const { config, knowledge } = agentData;

  return (
    <div className="min-h-screen bg-paper font-sans text-ink">
      
      {/* --- HERO HEADER --- */}
      <div className="bg-cream border-b border-rule pb-12 pt-16 px-6 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-2 bg-terracotta"></div>
         <div className="max-w-4xl mx-auto relative z-10">
            <div className="flex items-start gap-6">
               <div className="w-20 h-20 rounded-2xl shadow-lg flex items-center justify-center text-3xl text-cream font-serif font-semibold shrink-0 bg-terracotta">
                  {config.name.charAt(0)}
               </div>
               <div className="flex-1">
                  <h1 className="font-serif text-3xl font-semibold text-ink tracking-tight">{config.name}</h1>
                  <p className="text-lg text-stone mt-2 leading-relaxed max-w-2xl">
                    {config.description || "I'm an AI assistant trained to help you with specific knowledge."}
                  </p>
                  
                  <div className="flex gap-3 mt-6">
                     <button 
                       onClick={() => setActiveTab('chat')}
                       className="px-5 py-2.5 rounded-[10px] bg-terracotta text-cream font-medium hover:bg-terracotta/90 transition-all flex items-center gap-2"
                       data-testid="start-chat-button"
                     >
                       <MessageSquare className="w-4 h-4" /> Start Chatting
                     </button>
                     <div className="flex -space-x-2">
                        {/* Fake avatars to show "activity" */}
                        {[1,2,3].map(i => (
                          <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-500">
                             AI
                          </div>
                        ))}
                     </div>
                     <span className="text-sm text-slate-400 flex items-center ml-2">
                        +500 interactions
                     </span>
                  </div>
               </div>
            </div>
         </div>
         
         {/* Decorative Background blob */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-terracotta/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-12">
        
        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
             
             {/* LEFT COLUMN: Knowledge & Info */}
             <div className="md:col-span-2 space-y-12">
                
                {/* Quick Actions / Topics */}
                <section>
                   <h2 className="text-sm font-medium text-stone uppercase tracking-wider mb-4 flex items-center gap-2">
                     <Sparkles className="w-4 h-4" /> Suggested Topics
                   </h2>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {config.quickQuestions.map((q, i) => {
                        const isObject = typeof q === 'object';
                        const text = isObject ? q.text : q;
                        const emoji = isObject ? q.emoji : '💡';

                        return (
                          <button 
                            key={i}
                            onClick={() => setActiveTab('chat')} // Ideally pass this question to chat
                            className="p-4 bg-cream rounded-xl border border-rule hover:border-terracotta/40 transition-all text-left group"
                          >
                             <div className="flex justify-between items-start mb-2">
                                <div className="w-10 h-10 bg-paper rounded-lg group-hover:bg-paper transition-colors flex items-center justify-center text-xl">
                                  {emoji}
                                </div>
                                <ArrowRight className="w-4 h-4 text-rule group-hover:text-terracotta opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                             </div>
                             <p className="font-medium text-ink line-clamp-2">{text}</p>
                          </button>
                        );
                      })}
                   </div>
                </section>

                {/* Knowledge Source Catalog */}
                <section>
                   <h2 className="text-sm font-medium text-stone uppercase tracking-wider mb-4 flex items-center gap-2">
                     <BookOpen className="w-4 h-4" /> Knowledge Base
                   </h2>
                   <div className="bg-cream rounded-xl border border-rule overflow-hidden">
                      {knowledge.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                           {knowledge.map((item) => (
                             <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-paper transition-colors">
                                <div className="w-10 h-10 rounded-lg bg-paper flex items-center justify-center shrink-0">
                                   {item.type === 'url' ? <Globe className="w-5 h-5 text-blue-500" /> : <FileText className="w-5 h-5 text-orange-500" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                   <h3 className="font-medium text-ink truncate">{item.name}</h3>
                                   <p className="text-xs text-stone truncate">
                                     {item.type === 'url' ? 'External Website' : 'Uploaded Document'} • Added {new Date(item.dateAdded).toLocaleDateString()}
                                   </p>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                                   Active
                                </div>
                             </div>
                           ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-stone">
                           No public knowledge sources listed.
                        </div>
                      )}
                   </div>
                </section>

             </div>

             {/* RIGHT COLUMN: Sticky Chat Teaser */}
             <div className="md:col-span-1">
                <div className="sticky top-8">
                   <div className="bg-cream rounded-2xl shadow-xl border border-rule overflow-hidden flex flex-col h-[500px]">
                      <div className="p-4 border-b border-rule bg-paper/50">
                         <h3 className="font-medium text-ink">Live Preview</h3>
                      </div>
                      <div className="flex-1 bg-paper p-4 flex items-end justify-center pb-8 relative group cursor-pointer" onClick={() => setActiveTab('chat')}>
                         <div className="absolute inset-0 bg-cream/50 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <span className="bg-terracotta text-cream px-4 py-2 rounded-[10px] font-medium shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                               Open Chat
                            </span>
                         </div>
                         {/* Fake chat bubbles */}
                         <div className="w-full space-y-3 opacity-60 blur-[1px]">
                            <div className="bg-cream p-3 rounded-2xl rounded-tl-none shadow-sm text-xs max-w-[80%]">
                               Hello! How can I help you?
                            </div>
                            <div className="bg-terracotta/15 p-3 rounded-2xl rounded-tr-none shadow-sm text-xs max-w-[80%] ml-auto">
                               I have a question about...
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

          </div>
        ) : (
          /* CHAT VIEW MODE */
          <div className="max-w-2xl mx-auto h-[700px] shadow-2xl rounded-2xl overflow-hidden border border-rule bg-cream animate-fade-in">
             <WidgetChat 
               config={config} 
               knowledge={knowledge} 
               agentId={params.id as string}
               onClose={() => setActiveTab('overview')} // Add back button behavior
               showQuickQuestions={false} // Hide pills because we have the overview grid
             />
          </div>
        )}

      </main>
    </div>
  );
}

