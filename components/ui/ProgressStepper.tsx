import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type ProgressStepperProps = {
  steps: string[];
  currentStep: number;
};

export function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((label, i) => {
        const isCompleted = i < currentStep;
        const isActive = i === currentStep;

        return (
          <div key={i} className="flex items-center">
            {i > 0 && (
              <div
                className={cn(
                  'w-12 h-px',
                  isCompleted ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all',
                  isCompleted && 'bg-primary text-white',
                  isActive && 'bg-primary text-white ring-[3px] ring-[#EEF0FF]',
                  !isCompleted && !isActive && 'bg-surface-panel text-txt-muted'
                )}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className="text-[13px] font-medium text-txt-secondary whitespace-nowrap">
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
