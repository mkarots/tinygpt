
'use client';

import React, { useState } from 'react';
import { DashboardTab, KnowledgeItem, AgentConfig, CompanyInfo } from './types';
import Sidebar from './components/Sidebar';
import KnowledgeTab from './components/KnowledgeTab';
import AppearanceTab from './components/AppearanceTab';
import DeployTab from './components/DeployTab';
import LivePreview from './components/LivePreview';
import Onboarding from './components/Onboarding';

  // Default Configuration
const DEFAULT_CONFIG: AgentConfig = {
  name: 'Support Bot',
  description: 'A helpful assistant for our customers.',
  primaryColor: '#7c3aed', // brand-600
  greeting: 'Hi there! How can I help you today?',
  tone: 'friendly',
  quickQuestions: [
    { text: 'Do you offer a free trial/version?', emoji: '🚀' },
    { text: 'How secure is your platform?', emoji: '🔒' },
    { text: 'How do I use your product?', emoji: '💻' }
  ]
};

const App: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>('knowledge');
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

  const handleRemoveKnowledgeItem = (id: string) => {
    setKnowledge(prev => prev.filter(k => k.id !== id));
  };

  // --- Configuration Handlers ---

  const handleConfigChange = (key: keyof AgentConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const addQuickQuestion = () => {
    if (config.quickQuestions.length < 4) {
      setConfig(prev => ({ 
        ...prev, 
        quickQuestions: [...prev.quickQuestions, { text: 'New Question', emoji: '✨' }] as (string | { text: string; emoji: string })[]
      }));
    }
  };

  const updateQuickQuestion = (index: number, value: string) => {
    const newQuestions: (string | { text: string; emoji: string })[] = [...config.quickQuestions];
    // Handle legacy string updates if necessary, though AppearanceTab handles it mostly
    if (typeof newQuestions[index] === 'string') {
        newQuestions[index] = value; 
    } else {
        newQuestions[index] = { ...newQuestions[index] as { text: string; emoji: string }, text: value };
    }
    setConfig(prev => ({ ...prev, quickQuestions: newQuestions }));
  };

  const removeQuickQuestion = (index: number) => {
    setConfig(prev => ({
      ...prev,
      quickQuestions: prev.quickQuestions.filter((_, i) => i !== index)
    }));
  };

  // --- Render ---

  if (showOnboarding) {
    return (
      <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
         <main className="flex-1 flex overflow-hidden">
            <div className="flex-1">
              <Onboarding 
                onComplete={() => setShowOnboarding(false)}
                config={config}
                onConfigChange={handleConfigChange}
                knowledge={knowledge}
                onAddKnowledge={handleAddKnowledgeItems}
                onUpdateKnowledge={handleUpdateKnowledgeItem}
                companyInfo={companyInfo}
                onCompanyInfoChange={setCompanyInfo}
              />
            </div>
            {/* Show Live Preview during onboarding too, but distinct */}
            <div className="hidden xl:flex w-[400px] border-l border-slate-200 bg-slate-50">
               <LivePreview config={config} knowledge={knowledge} />
            </div>
         </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden animate-fade-in">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        companyName={companyInfo.name || "My Workspace"}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Center Panel: Config/Content */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          
          {activeTab === 'knowledge' && (
            <KnowledgeTab 
              knowledge={knowledge}
              onAddItems={handleAddKnowledgeItems}
              onUpdateItem={handleUpdateKnowledgeItem}
              onRemoveItem={handleRemoveKnowledgeItem}
            />
          )}

          {activeTab === 'appearance' && (
             <AppearanceTab 
               config={config}
               onConfigChange={handleConfigChange}
               onAddQuickQuestion={addQuickQuestion}
               onUpdateQuickQuestion={updateQuickQuestion}
               onRemoveQuickQuestion={removeQuickQuestion}
             />
          )}

          {activeTab === 'deploy' && (
            <DeployTab config={config} knowledge={knowledge} />
          )}
          
        </div>

        {/* Right Panel: Live Preview */}
        <LivePreview config={config} knowledge={knowledge} />

      </main>
    </div>
  );
};

export default App;
