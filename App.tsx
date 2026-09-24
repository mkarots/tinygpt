
'use client';

import React, { useState } from 'react';
import { KnowledgeItem, AgentConfig, CompanyInfo } from './types';
import { DEFAULT_ASSISTANT_NAME } from './src/lib/assistantName';
import { questionsForIndustry } from './src/lib/quickQuestionDefaults';
import LivePreview from './src/components/LivePreview';
import Onboarding from './src/components/Onboarding';

  // Default Configuration
const DEFAULT_CONFIG: AgentConfig = {
  name: DEFAULT_ASSISTANT_NAME,
  description: 'A helpful assistant for our customers.',
  primaryColor: '#7c3aed', // brand-600
  greeting: 'Hi there! How can I help you today?',
  tone: 'friendly',
  quickQuestions: questionsForIndustry(''),
};

const App: React.FC = () => {
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [config, setConfig] = useState<AgentConfig>(DEFAULT_CONFIG);
  
  // Company Info State
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: '',
    website: '',
    industry: '',
    email: ''
  });

  // --- Knowledge Handlers ---

  const handleAddKnowledgeItems = (items: KnowledgeItem[]) => {
    setKnowledge(prev => [...prev, ...items]);
  };

  const handleUpdateKnowledgeItem = (id: string, updates: Partial<KnowledgeItem>) => {
    setKnowledge(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const handleConfigChange = (key: keyof AgentConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
       <main className="flex-1 flex overflow-hidden">
          <div className="flex-1">
            <Onboarding 
              config={config}
              onConfigChange={handleConfigChange}
              knowledge={knowledge}
              onAddKnowledge={handleAddKnowledgeItems}
              onUpdateKnowledge={handleUpdateKnowledgeItem}
              companyInfo={companyInfo}
              onCompanyInfoChange={setCompanyInfo}
            />
          </div>
          <div className="hidden xl:flex w-[400px] border-l border-slate-200 bg-slate-50">
             <LivePreview config={config} knowledge={knowledge} />
          </div>
       </main>
    </div>
  );
};

export default App;
