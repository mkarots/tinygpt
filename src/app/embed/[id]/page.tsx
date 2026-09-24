'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import WidgetChat from '../../../components/WidgetChat';
import { AgentConfig, KnowledgeItem } from '../../../../types';
import { singleRouteParam } from '../../../lib/routeParam';
import { Loader2, AlertCircle } from 'lucide-react';

export default function EmbedPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agentData, setAgentData] = useState<{
    config: AgentConfig;
    knowledge: KnowledgeItem[];
  } | null>(null);

  const agentId = singleRouteParam(params.id);

  useEffect(() => {
    if (!agentId) {
      setError('Agent not found');
      setLoading(false);
      return;
    }
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
  }, [agentId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (error || !agentData) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-4 text-center">
         <div className="space-y-2">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-xs text-slate-500">Agent Unavailable</p>
         </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-white">
       <WidgetChat 
         config={agentData.config} 
         knowledge={agentData.knowledge}
         agentId={agentId}
         showQuickQuestions={true} 
       />
    </div>
  );
}

