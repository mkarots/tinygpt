import React from 'react';
import Link from 'next/link';
import { OnboardingStep } from '../../../types';
import { PRODUCT_BUILDER_PATH } from '../../lib/routes';
import { HeaderTitle } from './HeaderTitle';
import { ProgressBar } from './ProgressBar';

interface OnboardingHeaderProps {
  step: OnboardingStep;
  steps: { id: number; title: string }[];
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({ step, steps }) => {
  return (
    <div className="px-8 py-6 border-b border-rule">
      <Link href={PRODUCT_BUILDER_PATH} className="text-sm font-medium text-terracotta">
        Your agents
      </Link>
      <HeaderTitle step={step} totalSteps={steps.length} />
      <ProgressBar step={step} steps={steps} />
    </div>
  );
};

