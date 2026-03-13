/**
 * Tutorial Tooltip Component
 * Requirements: 5.2, 5.3
 */

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { InteractiveTutorialStep } from '@/types/documentation';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface TutorialTooltipProps {
    step: InteractiveTutorialStep;
    currentStep: number;
    totalSteps: number;
    position: { top: number; left: number };
    placement: 'top' | 'bottom' | 'left' | 'right';
    onNext: () => void;
    onPrev: () => void;
    onSkip: () => void;
    onComplete: () => void;
}

export function TutorialTooltip({
    step,
    currentStep,
    totalSteps,
    position,
    placement,
    onNext,
    onPrev,
    onSkip,
    onComplete,
}: TutorialTooltipProps) {
    const isLastStep = currentStep === totalSteps;
    const isFirstStep = currentStep === 1;
    const progress = (currentStep / totalSteps) * 100;

    const placementStyles = {
        top: 'bottom-full mb-3',
        bottom: 'top-full mt-3',
        left: 'right-full mr-3',
        right: 'left-full ml-3',
    };

    const arrowStyles = {
        top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-t-card border-x-transparent border-b-transparent',
        bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-full border-b-card border-x-transparent border-t-transparent',
        left: 'right-0 top-1/2 -translate-y-1/2 translate-x-full border-l-card border-y-transparent border-r-transparent',
        right: 'left-0 top-1/2 -translate-y-1/2 -translate-x-full border-r-card border-y-transparent border-l-transparent',
    };

    return (
        <div
            className="fixed z-[100]"
            style={{ top: position.top, left: position.left }}
        >
            <Card
                className={cn(
                    'relative w-80 shadow-lg',
                    placementStyles[placement],
                )}
            >
                {/* Arrow */}
                <div
                    className={cn(
                        'absolute h-0 w-0 border-8',
                        arrowStyles[placement],
                    )}
                />

                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                            {step.title}
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={onSkip}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                                Langkah {currentStep} dari {totalSteps}
                            </span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-1" />
                    </div>
                </CardHeader>

                <CardContent className="pb-3">
                    <p className="text-sm text-muted-foreground">
                        {step.content}
                    </p>
                    {step.action && (
                        <p className="mt-2 text-xs text-primary">
                            💡{' '}
                            {step.action === 'click' &&
                                'Klik elemen yang ditandai'}
                            {step.action === 'input' &&
                                'Isi input yang ditandai'}
                            {step.action === 'hover' &&
                                'Arahkan kursor ke elemen'}
                        </p>
                    )}
                </CardContent>

                <CardFooter className="gap-2 pt-0">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onPrev}
                        disabled={isFirstStep}
                        className="flex-1"
                    >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Kembali
                    </Button>
                    {isLastStep ? (
                        <Button
                            size="sm"
                            onClick={onComplete}
                            className="flex-1"
                        >
                            Selesai
                        </Button>
                    ) : (
                        <Button size="sm" onClick={onNext} className="flex-1">
                            Lanjut
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
