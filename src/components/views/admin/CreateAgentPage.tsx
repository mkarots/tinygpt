'use client';

import React, { useState } from 'react';
import { Loader2, CheckCircle, Globe, Building2, Copy, ExternalLink } from 'lucide-react';
import { AgentConfig, KnowledgeItem } from '../../../../types';
import { QuickQuestionsEditor } from '../../QuickQuestionsEditor';

export default function CreateAgentPage() {
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [customQuestions, setCustomQuestions] = useState<AgentConfig['quickQuestions']>([
    { text: 'What services do you offer?', emoji: '💼' },
    { text: 'How can I contact support?', emoji: '📞' },
    { text: 'Tell me about your pricing.', emoji: '💰' }
  ]);
  const [status, setStatus] = useState<'idle' | 'crawling' | 'saving' | 'done'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !website) return;

    setStatus('crawling');
    setLogs(['Starting process...', `Target: ${companyName} (${website})`]);

    try {
      // 1. Crawl Website
      addLog('🕷️ Crawling website...');
      const crawlRes = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: website }),
      });
      const crawlData = await crawlRes.json();
      
      if (!crawlRes.ok || crawlData.error) {
        throw new Error(crawlData.error || 'Crawl failed');
      }
      addLog(`✅ Crawled successfully. Length: ${crawlData.content.length} chars`);

      // 2. Construct Agent Config
      const knowledge: KnowledgeItem[] = [{
        id: Math.random().toString(36).substr(2, 9),
        type: 'url',
        name: new URL(website).hostname,
        content: crawlData.content,
        status: 'active',
        dateAdded: Date.now()
      }];

      const config: AgentConfig = {
        name: `${companyName} Assistant`,
        description: `I am the AI assistant for ${companyName}. I can help you navigate our products and services.`,
        primaryColor: '#2563eb', // Default blue, could extract from site later
        greeting: `Hello! Welcome to ${companyName}. How can I help you today?`,
        tone: 'professional',
        quickQuestions: customQuestions
      };

      // 3. Save Agent
      setStatus('saving');
      addLog('💾 Saving agent configuration...');
      const saveRes = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, knowledge }),
      });
      const saveData = await saveRes.json();

      if (!saveData.url) throw new Error('Failed to save agent');

      setResultUrl(`${window.location.origin}${saveData.url}`);
      setStatus('done');
      addLog('✨ Agent created successfully!');

    } catch (error: any) {
      console.error(error);
      addLog(`❌ Error: ${error.message}`);
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-900 text-white">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">🕵️‍♂️</span> Prospector
          </h1>
          <p className="text-slate-400 text-sm mt-1">Auto-generate demo agents for sales.</p>
        </div>

        <div className="p-6 space-y-6">
          {status !== 'done' ? (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    required
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Website URL</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="url" 
                    required
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    placeholder="https://acme.com"
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              
              <QuickQuestionsEditor 
                questions={customQuestions} 
                onChange={setCustomQuestions} 
              />

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-xs text-slate-500 h-32 overflow-y-auto">
                {logs.length === 0 ? <span className="opacity-50">// Logs will appear here...</span> : logs.map((l, i) => <div key={i}>{l}</div>)}
              </div>

              <button 
                type="submit" 
                disabled={status !== 'idle'}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 disabled:opacity-70 transition-all"
              >
                {status === 'crawling' || status === 'saving' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                ) : (
                  'Generate Demo Agent'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Agent Ready!</h2>
                <p className="text-slate-500 text-sm mt-1">Send this link to the prospect.</p>
              </div>
              
              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <input 
                  readOnly 
                  value={resultUrl!} 
                  className="flex-1 bg-transparent text-sm text-slate-600 outline-none px-2"
                />
                <button 
                  onClick={() => navigator.clipboard.writeText(resultUrl!)}
                  className="p-2 hover:bg-white rounded-md text-slate-500 hover:text-blue-600 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-3 justify-center">
                <a 
                  href={resultUrl!} 
                  target="_blank" 
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg text-sm hover:bg-slate-50 flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" /> Test It
                </a>
                <button 
                  onClick={() => { setStatus('idle'); setCompanyName(''); setWebsite(''); setLogs([]); }}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg text-sm hover:bg-blue-700"
                >
                  Create Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

