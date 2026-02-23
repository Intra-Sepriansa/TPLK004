import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

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
    currentStep
}) => {
    return (
        <div className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl 
            border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 mb-6 overflow-x-auto shadow-xl">

            <div className="flex items-center justify-between min-w-[600px]">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.id;
                    const isCompleted = step.id < currentStep;

                    return (
                        <React.Fragment key={step.id}>
                            <motion.div
                                className="flex flex-col items-center gap-3 flex-1"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <motion.div
                                    className={`
                                        relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300
                                        ${isActive
                                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/50'
                                            : isCompleted
                                                ? 'bg-emerald-500'
                                                : 'bg-neutral-200 dark:bg-neutral-700'
                                        }
                                    `}
                                    whileHover={{ scale: 1.1 }}
                                    animate={isActive ? {
                                        boxShadow: [
                                            '0 0 20px rgba(99, 102, 241, 0.5)',
                                            '0 0 40px rgba(99, 102, 241, 0.8)',
                                            '0 0 20px rgba(99, 102, 241, 0.5)',
                                        ]
                                    } : {}}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    {isCompleted ? (
                                        <CheckCircle className="w-8 h-8 text-white" />
                                    ) : (
                                        <Icon className="w-8 h-8 text-white" />
                                    )}

                                    {!isCompleted && !isActive && (
                                        <div className="absolute -top-1 -right-1 w-6 h-6 
                                            bg-white rounded-full flex items-center justify-center 
                                            text-xs font-bold text-neutral-900">
                                            {step.id}
                                        </div>
                                    )}
                                </motion.div>

                                <div className="text-center">
                                    <div className={`
                                        text-sm font-semibold transition-colors
                                        ${isActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-neutral-400'}
                                    `}>
                                        {step.title}
                                    </div>
                                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                        {step.description}
                                    </div>
                                </div>
                            </motion.div>

                            {index < steps.length - 1 && (
                                <div className="flex-1 h-0.5 mx-2 md:mx-4 relative">
                                    <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-700" />
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600"
                                        initial={{ scaleX: 0 }}
                                        animate={{
                                            scaleX: parseInt(step.id.toString()) < currentStep ? 1 : 0
                                        }}
                                        transition={{ duration: 0.5 }}
                                        style={{ transformOrigin: 'left' }}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};
