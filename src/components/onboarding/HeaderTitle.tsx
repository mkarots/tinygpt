import React from 'react';
import { OnboardingStep } from '../../../types';

interface HeaderTitleProps {
  step: OnboardingStep;
  totalSteps: number;
}

export const HeaderTitle: React.FC<HeaderTitleProps> = ({ step, totalSteps }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="font-serif text-2xl font-semibold text-ink tracking-tight">
        TinyGPT Setup
      </h1>
      <span className="text-sm text-stone font-medium">Step {step} of {totalSteps}</span>
    </div>
  );
};

