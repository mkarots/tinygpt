'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import WidgetChat from '@/components/WidgetChat';
import { AgentConfig, KnowledgeItem } from '@/types';
import { Loader2, AlertCircle } from 'lucide-react';

export default function SharedChatPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agentData, setAgentData] = useState<{
    config: AgentConfig;
    knowledge: KnowledgeItem[];
  } | null>(null);

  useEffect(() => {
    if (params.agentId) {
      fetch(`/api/agent/${params.agentId}`)
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
  }, [params.agentId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  if (error || !agentData) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-4">
         <div className="text-center max-w-md">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Agent Not Found</h1>
            <p className="text-slate-500">
               This chat link appears to be invalid or has expired. Please check the URL and try again.
            </p>
         </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 items-center justify-center p-4">
       <div className="w-full max-w-[450px] h-[80vh] max-h-[700px] shadow-2xl rounded-2xl overflow-hidden bg-white ring-1 ring-black/5">
          <WidgetChat 
            config={agentData.config} 
            knowledge={agentData.knowledge} 
            // Shared view always open, no close button
          />
       </div>
    </div>
  );
}

