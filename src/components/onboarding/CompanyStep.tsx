import React from 'react';
import { CompanyInfo, AgentConfig } from '../../../types';
import { assistantNameForCompany } from '../../lib/assistantName';
import { industrySelectOptions, quickQuestionsForIndustry } from '../../lib/quickQuestionDefaults';
import { COMPANY_STEP_HELP } from '../../lib/builderCopy';
import { Heading } from '../core/typography/Heading';
import { Text } from '../core/typography/Text';
import { Input } from '../core/input/Input';
import { Select } from '../core/input/Select';

interface CompanyStepProps {
  companyInfo: CompanyInfo;
  onCompanyInfoChange: (info: CompanyInfo) => void;
  config: AgentConfig;
  onConfigChange: (key: keyof AgentConfig, value: any) => void;
}

export const CompanyStep: React.FC<CompanyStepProps> = ({
  companyInfo,
  onCompanyInfoChange,
  config,
  onConfigChange,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <Heading level={2}>Tell us about your company</Heading>
        <Text variant="muted" className="mt-2">{COMPANY_STEP_HELP}</Text>
      </div>
      <div className="space-y-4">
        <Input 
          label="Company Name"
          placeholder="Acme Corp"
          value={companyInfo.name}
          onChange={(e) => {
               const nextCompanyName = e.target.value;
               const nextAssistantName = assistantNameForCompany(
                 nextCompanyName,
                 config.name,
                 companyInfo.name
               );
               onCompanyInfoChange({...companyInfo, name: nextCompanyName});
               if (nextAssistantName !== config.name) {
                 onConfigChange('name', nextAssistantName);
               }
          }}
        />
        <Input 
          label="Website URL"
          placeholder="https://acme.com"
          type="url"
          value={companyInfo.website}
          onChange={(e) => onCompanyInfoChange({...companyInfo, website: e.target.value})}
        />
        
        <Select
          label="Industry"
          value={companyInfo.industry}
          onChange={(e) => {
            const nextIndustry = e.target.value;
            const nextQuestions = quickQuestionsForIndustry(
              nextIndustry,
              config.quickQuestions,
              companyInfo.industry
            );
            onCompanyInfoChange({...companyInfo, industry: nextIndustry});
            if (nextQuestions !== config.quickQuestions) {
              onConfigChange('quickQuestions', nextQuestions);
            }
          }}
          options={industrySelectOptions()}
        />
      </div>
    </div>
  );
};
