/**
 * Tutorial Provider Context
 * Requirements: 5.1, 5.4
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { TutorialOverlay } from './tutorial-overlay';
import type { InteractiveTutorial, TutorialStatus } from '@/types/documentation';
import {
    getTutorial,
    startTutorial as apiStartTutorial,
    completeTutorial as apiCompleteTutorial,
    skipTutorial as apiSkipTutorial,
    shouldShowFirstTimeTutorial,
    dismissFirstTimeTutorial,
} from '@/lib/tutorial-api';

interface TutorialContextValue {
    activeTutorial: InteractiveTutorial | null;
    isActive: boolean;
    startTutorial: (tutorialId: string) => Promise<void>;
    completeTutorial: () => Promise<void>;
    skipTutorial: () => Promise<void>;
    checkFirstTimeTutorial: (page: string) => Promise<void>;
}

const TutorialContext = createContext<TutorialContextValue | null>(null);

export function useTutorial() {
    const context = useContext(TutorialContext);
    if (!context) {
        throw new Error('useTutorial must be used within TutorialProvider');
    }
    return context;
}

interface TutorialProviderProps {
    children: ReactNode;
}

export function TutorialProvider({ children }: TutorialProviderProps) {
    const [activeTutorial, setActiveTutorial] = useState<InteractiveTutorial | null>(null);
    const [currentTutorialId, setCurrentTutorialId] = useState<string | null>(null);

    const startTutorial = useCallback(async (tutorialId: string) => {
        try {
            const tutorial = await getTutorial(tutorialId);
            await apiStartTutorial(tutorialId);
            setCurrentTutorialId(tutorialId);
            setActiveTutorial(tutorial);
        } catch (error) {
            console.error('Failed to start tutorial:', error);
        }
    }, []);

    const completeTutorial = useCallback(async () => {
        if (!currentTutorialId) return;

        try {
            await apiCompleteTutorial(currentTutorialId);
        } catch (error) {
            console.error('Failed to complete tutorial:', error);
        } finally {
            setActiveTutorial(null);
            setCurrentTutorialId(null);
        }
    }, [currentTutorialId]);

    const skipTutorial = useCallback(async () => {
        if (!currentTutorialId) return;

        try {
            await apiSkipTutorial(currentTutorialId);
        } catch (error) {
            console.error('Failed to skip tutorial:', error);
        } finally {
            setActiveTutorial(null);
            setCurrentTutorialId(null);
        }
    }, [currentTutorialId]);

    const checkFirstTimeTutorial = useCallback(async (page: string) => {
        try {
            const shouldShow = await shouldShowFirstTimeTutorial(page);
            if (shouldShow) {
                // Map page to tutorial ID
                const tutorialId = `${page}-intro`;
                await startTutorial(tutorialId);
            }
        } catch (error) {
            // Silently fail - first time tutorials are optional
            console.error('Failed to check first time tutorial:', error);
        }
    }, [startTutorial]);

    // Handle escape key to skip tutorial
    useEffect(() => {
        if (!activeTutorial) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                skipTutorial();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeTutorial, skipTutorial]);

    return (
        <TutorialContext.Provider
            value={{
                activeTutorial,
                isActive: !!activeTutorial,
                startTutorial,
                completeTutorial,
                skipTutorial,
                checkFirstTimeTutorial,
            }}
        >
            {children}
            {activeTutorial && (
                <TutorialOverlay
                    tutorial={activeTutorial}
                    onComplete={completeTutorial}
                    onSkip={skipTutorial}
                />
            )}
        </TutorialContext.Provider>
    );
}
