import React from 'react';
import { CompanyInfo, AgentConfig } from '../../../types';
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

const INDUSTRY_OPTIONS = [
  { label: 'Select an industry', value: '' },
  { label: 'SaaS / Technology', value: 'saas' },
  { label: 'E-commerce', value: 'ecommerce' },
  { label: 'Education', value: 'education' },
  { label: 'Agency / Services', value: 'agency' },
  { label: 'Other', value: 'other' },
];

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
        <Text variant="muted" className="mt-2">We'll use this to configure your assistant's base knowledge.</Text>
      </div>
      <div className="space-y-4">
        <Input 
          label="Company Name"
          placeholder="Acme Corp"
          value={companyInfo.name}
          onChange={(e) => {
               onCompanyInfoChange({...companyInfo, name: e.target.value});
               if (!config.name || config.name === 'Tiny Support Assistant') {
                 onConfigChange('name', `Tiny ${e.target.value} Support Assistant`);
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
          onChange={(e) => onCompanyInfoChange({...companyInfo, industry: e.target.value})}
          options={INDUSTRY_OPTIONS}
        />

        <Input 
          label="Your Email (for crawl reports)"
          placeholder="you@company.com"
          type="email"
          value={companyInfo.email}
          onChange={(e) => onCompanyInfoChange({...companyInfo, email: e.target.value})}
        />
      </div>
    </div>
  );
};
