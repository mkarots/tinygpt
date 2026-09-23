import React from 'react';
import { OnboardingStep } from '../../../types';
import { HeaderTitle } from './HeaderTitle';
import { ProgressBar } from './ProgressBar';

interface OnboardingHeaderProps {
  step: OnboardingStep;
  steps: { id: number; title: string }[];
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({ step, steps }) => {
  return (
    <div className="px-8 py-6 border-b border-slate-100">
      <HeaderTitle step={step} totalSteps={steps.length} />
      <ProgressBar step={step} steps={steps} />
    </div>
  );
};

