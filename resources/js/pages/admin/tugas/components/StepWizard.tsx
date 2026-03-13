import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import React from 'react';

interface Step {
    id: number;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    isCompleted: boolean;
    isActive: boolean;
}

export const StepWizard: React.FC<{ steps: Step[]; currentStep: number }> = ({
    steps,
    currentStep,
}) => {
    return (
        <div className="mb-6 rounded-[2rem] border border-white/10 bg-black/70 p-4 shadow-xl backdrop-blur-xl sm:p-5">
            <div className="overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex w-max snap-x snap-mandatory items-center gap-2.5 px-1">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        const isCompleted = step.id < currentStep;

                        return (
                            <React.Fragment key={step.id}>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    aria-current={isActive ? 'step' : undefined}
                                    className={`inline-flex h-14 w-[220px] shrink-0 snap-start items-center gap-3 rounded-full border px-5 text-left text-sm font-semibold transition-all sm:w-[230px] sm:px-6 sm:text-[1.05rem] ${
                                        isActive
                                            ? 'border-white/35 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-pink-500 text-white shadow-[0_12px_30px_rgba(192,38,211,0.35)]'
                                            : isCompleted
                                              ? 'border-white/20 bg-neutral-900/95 text-slate-200'
                                              : 'border-white/15 bg-neutral-900/90 text-slate-400'
                                    }`}
                                >
                                    {isCompleted ? (
                                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                                    ) : (
                                        <Icon className="h-4 w-4 shrink-0" />
                                    )}
                                    <span className="whitespace-nowrap">
                                        {step.title}
                                    </span>
                                </motion.div>

                                {index < steps.length - 1 && (
                                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
