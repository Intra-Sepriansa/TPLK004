/**
 * useTheme Hook
 * Manages dark/light theme with database persistence
 */

import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

export type Theme = 'light' | 'dark' | 'auto';

export function useTheme() {
    const { themePreference } = usePage().props as { themePreference?: Theme };
    
    const [theme, setThemeState] = useState<Theme>(() => {
        // Priority: localStorage > server theme > default light
        const stored = localStorage.getItem('theme') as Theme;
        if (stored && (stored === 'light' || stored === 'dark' || stored === 'auto')) {
            return stored;
        }
        
        // Use theme from server if available
        if (themePreference) {
            localStorage.setItem('theme', themePreference);
            return themePreference;
        }
        
        // Default to light mode
        return 'light';
    });

    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
        // Initialize with correct theme immediately
        const stored = localStorage.getItem('theme') as Theme;
        const initialTheme = stored || themePreference || 'light';
        
        if (initialTheme === 'light') return 'light';
        if (initialTheme === 'dark') return 'dark';
        if (initialTheme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            return prefersDark ? 'dark' : 'light';
        }
        
        return 'light';
    });

    // Sync with server theme on mount
    useEffect(() => {
        if (themePreference && !localStorage.getItem('theme')) {
            setThemeState(themePreference);
            localStorage.setItem('theme', themePreference);
        }
    }, [themePreference]);

    useEffect(() => {
        // Determine actual theme to apply
        let actualTheme: 'light' | 'dark' = 'light';

        if (theme === 'auto') {
            // Use system preference
            actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } else {
            actualTheme = theme;
        }

        setResolvedTheme(actualTheme);

        // Apply theme to document
        const root = document.documentElement;
        if (actualTheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Save to localStorage (for immediate persistence)
        localStorage.setItem('theme', theme);

        // Save to database (for cross-device persistence)
        saveThemeToDatabase(theme);
    }, [theme]);

    // Listen for system theme changes when in auto mode
    useEffect(() => {
        if (theme !== 'auto') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            setResolvedTheme(e.matches ? 'dark' : 'light');
            const root = document.documentElement;
            if (e.matches) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    return { theme, setTheme, resolvedTheme };
}

/**
 * Save theme preference to database
 */
async function saveThemeToDatabase(theme: Theme) {
    try {
        await fetch('/settings/theme', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({ theme }),
        });
    } catch (error) {
        console.error('Failed to save theme to database:', error);
    }
}
