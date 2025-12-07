import React from 'react';
import { OnboardingStep } from '../../../types';

interface HeaderTitleProps {
  step: OnboardingStep;
  totalSteps: number;
}

export const HeaderTitle: React.FC<HeaderTitleProps> = ({ step, totalSteps }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
        <div className="w-8 h-8 bg-brand-600 rounded-lg text-white flex items-center justify-center">
          <span className="font-mono font-bold">T</span>
        </div>
        TinyGPT Setup
      </h1>
      <span className="text-sm text-slate-400 font-medium">Step {step} of {totalSteps}</span>
    </div>
  );
};

