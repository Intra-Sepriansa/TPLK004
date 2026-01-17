/**
 * Interactive Tutorial Overlay Component
 * Requirements: 5.2
 */

import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { TutorialTooltip } from './tutorial-tooltip';
import type { InteractiveTutorial, InteractiveTutorialStep } from '@/types/documentation';

interface TutorialOverlayProps {
    tutorial: InteractiveTutorial;
    onComplete: () => void;
    onSkip: () => void;
}

interface HighlightPosition {
    top: number;
    left: number;
    width: number;
    height: number;
}

export function TutorialOverlay({ tutorial, onComplete, onSkip }: TutorialOverlayProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [highlightPosition, setHighlightPosition] = useState<HighlightPosition | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

    const currentStep = tutorial.steps[currentStepIndex];
    const totalSteps = tutorial.steps.length;

    const calculatePositions = useCallback((step: InteractiveTutorialStep) => {
        const element = document.querySelector(step.targetSelector);
        if (!element) {
            // If element not found, center the tooltip
            setHighlightPosition(null);
            setTooltipPosition({
                top: window.innerHeight / 2 - 100,
                left: window.innerWidth / 2 - 160,
            });
            return;
        }

        const rect = element.getBoundingClientRect();
        const padding = 8;

        // Set highlight position
        setHighlightPosition({
            top: rect.top - padding + window.scrollY,
            left: rect.left - padding + window.scrollX,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2,
        });

        // Calculate tooltip position based on placement
        const tooltipWidth = 320;
        const tooltipHeight = 200;
        const gap = 16;

        let top = 0;
        let left = 0;

        switch (step.position) {
            case 'top':
                top = rect.top - tooltipHeight - gap + window.scrollY;
                left = rect.left + rect.width / 2 - tooltipWidth / 2 + window.scrollX;
                break;
            case 'bottom':
                top = rect.bottom + gap + window.scrollY;
                left = rect.left + rect.width / 2 - tooltipWidth / 2 + window.scrollX;
                break;
            case 'left':
                top = rect.top + rect.height / 2 - tooltipHeight / 2 + window.scrollY;
                left = rect.left - tooltipWidth - gap + window.scrollX;
                break;
            case 'right':
                top = rect.top + rect.height / 2 - tooltipHeight / 2 + window.scrollY;
                left = rect.right + gap + window.scrollX;
                break;
        }

        // Keep tooltip within viewport
        top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));
        left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));

        setTooltipPosition({ top, left });

        // Scroll element into view if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, []);

    useEffect(() => {
        calculatePositions(currentStep);

        // Recalculate on resize
        const handleResize = () => calculatePositions(currentStep);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [currentStep, calculatePositions]);

    // Handle action-based progression
    useEffect(() => {
        if (!currentStep.nextOnAction || !currentStep.action) return;

        const element = document.querySelector(currentStep.targetSelector);
        if (!element) return;

        const handleAction = () => {
            if (currentStepIndex < totalSteps - 1) {
                setCurrentStepIndex((prev) => prev + 1);
            } else {
                onComplete();
            }
        };

        const eventType = currentStep.action === 'click' ? 'click' : 
                         currentStep.action === 'input' ? 'input' : 'mouseenter';

        element.addEventListener(eventType, handleAction);
        return () => element.removeEventListener(eventType, handleAction);
    }, [currentStep, currentStepIndex, totalSteps, onComplete]);

    const handleNext = () => {
        if (currentStepIndex < totalSteps - 1) {
            setCurrentStepIndex((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex((prev) => prev - 1);
        }
    };

    return createPortal(
        <>
            {/* Overlay backdrop */}
            <div className="fixed inset-0 z-[90] bg-black/50" onClick={onSkip} />

            {/* Highlight cutout */}
            {highlightPosition && (
                <div
                    className="fixed z-[95] rounded-lg ring-4 ring-primary ring-offset-2 pointer-events-none"
                    style={{
                        top: highlightPosition.top,
                        left: highlightPosition.left,
                        width: highlightPosition.width,
                        height: highlightPosition.height,
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                    }}
                />
            )}

            {/* Tooltip */}
            <TutorialTooltip
                step={currentStep}
                currentStep={currentStepIndex + 1}
                totalSteps={totalSteps}
                position={tooltipPosition}
                placement={currentStep.position}
                onNext={handleNext}
                onPrev={handlePrev}
                onSkip={onSkip}
                onComplete={onComplete}
            />
        </>,
        document.body
    );
}
