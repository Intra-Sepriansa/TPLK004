/**
 * useTheme Hook - FIXED VERSION
 * Properly manages theme with localStorage + database persistence
 * NO MORE BUGS!
 */

import { useEffect, useState, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

export type Theme = 'light' | 'dark' | 'auto';

const THEME_STORAGE_KEY = 'app-theme';
const THEME_ATTRIBUTE = 'data-theme';

export function useTheme() {
    const { themePreference } = usePage().props as { themePreference?: Theme };

    // Initialize theme from localStorage FIRST (highest priority)
    const [theme, setThemeState] = useState<Theme>(() => {
        // 1. Check localStorage first
        const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
        if (stored && ['light', 'dark', 'auto'].includes(stored)) {
            return stored;
        }

        // 2. Fallback to server theme
        if (themePreference && ['light', 'dark', 'auto'].includes(themePreference)) {
            return themePreference;
        }

        // 3. Default to light
        return 'light';
    });

    // Resolved theme (actual theme applied to DOM)
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

    // Apply theme to DOM immediately on mount
    useEffect(() => {
        applyThemeToDOM(theme);
    }, []);

    // Apply theme whenever it changes
    useEffect(() => {
        applyThemeToDOM(theme);

        // Save to localStorage immediately
        localStorage.setItem(THEME_STORAGE_KEY, theme);

        // Save to database (async, non-blocking)
        saveThemeToDatabase(theme);
    }, [theme]);

    // Listen for system theme changes (only when theme is 'auto')
    useEffect(() => {
        if (theme !== 'auto') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e: MediaQueryListEvent) => {
            const newResolvedTheme = e.matches ? 'dark' : 'light';
            setResolvedTheme(newResolvedTheme);
            applyThemeToDOMDirect(newResolvedTheme);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    // Function to apply theme to DOM
    const applyThemeToDOM = useCallback((themeValue: Theme) => {
        let actualTheme: 'light' | 'dark' = 'light';

        if (themeValue === 'auto') {
            // Use system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            actualTheme = prefersDark ? 'dark' : 'light';
        } else {
            actualTheme = actualTheme = themeValue as 'light' | 'dark';
        }

        setResolvedTheme(actualTheme);
        applyThemeToDOMDirect(actualTheme);
    }, []);

    // Direct DOM manipulation
    const applyThemeToDOMDirect = (actualTheme: 'light' | 'dark') => {
        const root = document.documentElement;

        // Remove both classes first
        root.classList.remove('light', 'dark');

        // Add the correct class
        root.classList.add(actualTheme);

        // Set data attribute for CSS
        root.setAttribute(THEME_ATTRIBUTE, actualTheme);

        // Set color-scheme for native browser elements
        root.style.colorScheme = actualTheme;
    };

    // Public API to change theme
    const setTheme = useCallback((newTheme: Theme) => {
        if (!['light', 'dark', 'auto'].includes(newTheme)) {
            console.error('Invalid theme:', newTheme);
            return;
        }
        setThemeState(newTheme);
    }, []);

    return {
        theme,
        setTheme,
        resolvedTheme,
        isLight: resolvedTheme === 'light',
        isDark: resolvedTheme === 'dark',
    };
}

/**
 * Save theme to database (async, non-blocking)
 */
async function saveThemeToDatabase(theme: Theme) {
    try {
        // Get CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        if (!csrfToken) {
            console.warn('CSRF token not found, skipping database save');
            return;
        }

        // Save to database
        await axios.post('/api/settings/theme',
            { theme },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
            }
        );

        console.log('✅ Theme saved to database:', theme);
    } catch (error) {
        console.error('❌ Failed to save theme to database:', error);
        // Don't throw error - localStorage is already saved
    }
}

/**
 * Get current theme from localStorage
 */
export function getStoredTheme(): Theme {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (stored && ['light', 'dark', 'auto'].includes(stored)) {
        return stored;
    }
    return 'light';
}

/**
 * Initialize theme on app load (call this in app.tsx)
 */
export function initializeTheme() {
    const theme = getStoredTheme();
    const root = document.documentElement;

    let actualTheme: 'light' | 'dark' = 'light';

    if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        actualTheme = prefersDark ? 'dark' : 'light';
    } else {
        actualTheme = theme;
    }

    // Apply immediately (before React renders)
    root.classList.remove('light', 'dark');
    root.classList.add(actualTheme);
    root.setAttribute('data-theme', actualTheme);
    root.style.colorScheme = actualTheme;
}
