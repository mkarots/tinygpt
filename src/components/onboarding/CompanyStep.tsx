import React from 'react';
import { Heading } from '../core/typography/Heading';
import { Text } from '../core/typography/Text';
import { Input } from '../core/input/Input';
import { CompanyInfo, AgentConfig } from '../../types';

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
        <Text variant="muted" className="mt-2">We'll use this to configure your assistant's base knowledge.</Text>
      </div>
      <div className="space-y-4">
        <Input 
          label="Company Name"
          placeholder="Acme Corp"
          value={companyInfo.name}
          onChange={(e) => {
               onCompanyInfoChange({...companyInfo, name: e.target.value});
               if (!config.name || config.name === 'Support Bot') {
                 onConfigChange('name', `${e.target.value} Assistant`);
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
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
          <select 
             value={companyInfo.industry}
             onChange={(e) => onCompanyInfoChange({...companyInfo, industry: e.target.value})}
             className="w-full px-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
          >
            <option value="">Select an industry</option>
            <option value="saas">SaaS / Technology</option>
            <option value="ecommerce">E-commerce</option>
            <option value="education">Education</option>
            <option value="agency">Agency / Services</option>
            <option value="other">Other</option>
          </select>
        </div>
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

