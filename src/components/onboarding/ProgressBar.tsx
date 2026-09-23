import React from 'react';
import { Check } from 'lucide-react';
import { OnboardingStep } from '../../../types';

interface ProgressBarProps {
  step: OnboardingStep;
  steps: { id: number; title: string }[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ step, steps }) => {
  const totalSteps = steps.length;
  
  // Calculate width percentage based on (current step index) / (total intervals)
  // There are (totalSteps - 1) intervals between steps.
  const progressPercentage = ((step - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="relative">
      {/* Background Line */}
      <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full"></div>
      
      {/* Active Progress Line */}
      <div 
        className="absolute top-1/2 left-0 h-1 bg-brand-600 -translate-y-1/2 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progressPercentage}%` }}
      ></div>
      
      {/* Step Indicators */}
      <div className="relative flex justify-between">
        {steps.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-2">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-all duration-300
                ${step > s.id 
                  ? 'bg-brand-600 border-brand-600 text-white' 
                  : step === s.id 
                    ? 'bg-white border-brand-600 text-brand-600 scale-110 shadow-lg' 
                    : 'bg-white border-slate-200 text-slate-300'
                }
              `}
            >
              {step > s.id ? <Check className="w-4 h-4" /> : s.id}
            </div>
            <span className={`text-[10px] font-medium uppercase tracking-wider transition-colors duration-300 ${step === s.id ? 'text-brand-600' : 'text-slate-300'}`}>
              {s.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

