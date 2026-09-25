'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { AgentConfig, KnowledgeItem, CompanyInfo, OnboardingStep } from '../../types';
import { Button } from './core/button/Button';
import { CompanyStep } from './onboarding/CompanyStep';
import { KnowledgeStep } from './onboarding/KnowledgeStep';
import { CustomizeStep } from './onboarding/CustomizeStep';
import { SuccessStep } from './onboarding/SuccessStep';
import { OnboardingHeader } from './onboarding/OnboardingHeader';
import { QuickQuestionsEditor } from './QuickQuestionsEditor';
import { Heading } from './core/typography/Heading';
import { Text } from './core/typography/Text';
import { configWithCompany } from '../lib/agentCompany';
import { saveAgent } from '../lib/saveAgent';
import { blocksKnowledgeStep } from '../lib/importRecovery';
import { adminSharePath } from '../lib/routes';
import { useWebsiteCrawl } from './onboarding/useWebsiteCrawl';

interface OnboardingProps {
  config: AgentConfig;
  onConfigChange: (key: keyof AgentConfig, value: any) => void;
  knowledge: KnowledgeItem[];
  onAddKnowledge: (items: KnowledgeItem[]) => void;
  onUpdateKnowledge: (id: string, updates: Partial<KnowledgeItem>) => void;
  companyInfo: CompanyInfo;
  onCompanyInfoChange: (info: CompanyInfo) => void;
}

const STEPS = [
  { id: 1, title: 'Company Info' },
  { id: 2, title: 'Add Knowledge' },
  { id: 3, title: 'Customize' },
  { id: 4, title: 'Quick Questions' },
  { id: 5, title: 'Save' },
];

const Onboarding: React.FC<OnboardingProps> = ({ 
  config, 
  onConfigChange,
  knowledge,
  onAddKnowledge,
  onUpdateKnowledge,
  companyInfo,
  onCompanyInfoChange
}) => {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>(1);
  const { isCrawling, crawlProgress, performCrawl } = useWebsiteCrawl(onAddKnowledge, onUpdateKnowledge);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const triggerConfetti = (final = false) => {
    if ((window as any).confetti) {
      if (final) {
        const duration = 3000;
        const end = Date.now() + duration;
        (function frame() {
          (window as any).confetti({
            particleCount: 7,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: [config.primaryColor, '#ffffff']
          });
          (window as any).confetti({
            particleCount: 7,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: [config.primaryColor, '#ffffff']
          });
          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        }());
      } else {
        (window as any).confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.8 },
          colors: [config.primaryColor, '#000000']
        });
      }
    }
  };

  const handleNext = async () => {
    if (step === 1 && companyInfo.website) {
       performCrawl(companyInfo.website);
    }

    if (step < 5) {
      triggerConfetti();
      setStep((prev) => (prev + 1) as OnboardingStep);
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      const { agentId } = await saveAgent(configWithCompany(config, companyInfo), knowledge);
      triggerConfetti(true);
      router.push(adminSharePath(agentId));
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save agent');
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as OnboardingStep);
    }
  };

  return (
    <div className="flex flex-col h-full bg-cream">
      <OnboardingHeader step={step} steps={STEPS} />

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto py-10 px-6">
          
          {step === 1 && (
            <CompanyStep 
              companyInfo={companyInfo}
              onCompanyInfoChange={onCompanyInfoChange}
              config={config}
              onConfigChange={onConfigChange as any}
            />
          )}

          {step === 2 && (
            <KnowledgeStep 
              knowledge={knowledge}
              onAddKnowledge={onAddKnowledge}
              onUpdateKnowledge={onUpdateKnowledge}
              companyInfo={companyInfo}
              isCrawling={isCrawling}
              crawlProgress={crawlProgress}
              onPerformCrawl={performCrawl}
            />
          )}

          {step === 3 && (
            <CustomizeStep 
              config={config}
              onConfigChange={onConfigChange as any}
            />
          )}

          {step === 4 && (
             <div className="space-y-8 animate-fade-in">
               <div className="text-center mb-8">
                 <Heading level={2}>Add Quick Questions</Heading>
                 <Text variant="muted" className="mt-2">Help users start the conversation with one click.</Text>
               </div>
               <QuickQuestionsEditor 
                 questions={config.quickQuestions}
                 onChange={(questions) => onConfigChange('quickQuestions', questions)}
               />
             </div>
          )}

          {step === 5 && (
            <SuccessStep error={saveError} />
          )}

        </div>
      </div>

      {/* Footer / Actions */}
      <div className="p-6 border-t border-rule flex justify-between items-center bg-cream">
        <Button 
          variant="ghost"
          onClick={handleBack}
          disabled={step === 1}
          leftIcon={<ChevronLeft className="w-5 h-5" />}
          className={step === 1 ? 'text-stone/40' : 'text-stone'}
        >
          Back
        </Button>
        
        <Button 
          variant="primary"
          onClick={handleNext}
          disabled={isSaving || (step === 2 && blocksKnowledgeStep(knowledge))}
          isLoading={isSaving}
          rightIcon={isSaving ? undefined : <ChevronRight className="w-5 h-5" />}
          className="px-8 py-3 rounded-[10px]"
        >
          {step === 5 ? 'Save & Open Chat' : 'Next Step'}
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
