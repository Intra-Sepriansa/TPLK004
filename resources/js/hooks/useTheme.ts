import { usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

type LegacyTheme = Theme | 'auto';

const THEME_STORAGE_KEY = 'app-theme';
const THEME_ATTRIBUTE = 'data-theme';
const THEME_COOKIE = 'appearance';

function normalizeThemeValue(theme: unknown): Theme {
    if (theme === 'auto') {
        return 'system';
    }

    if (theme === 'light' || theme === 'dark' || theme === 'system') {
        return theme;
    }

    return 'light';
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
    if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    }

    return theme;
}

function applyThemeToDOMDirect(actualTheme: 'light' | 'dark') {
    const root = document.documentElement;

    root.classList.remove('light', 'dark');
    root.classList.add(actualTheme);
    root.setAttribute(THEME_ATTRIBUTE, actualTheme);
    root.style.colorScheme = actualTheme;
}

function applyTheme(theme: Theme) {
    applyThemeToDOMDirect(resolveTheme(theme));
}

function setThemeCookie(theme: Theme) {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = 365 * 24 * 60 * 60;
    document.cookie = `${THEME_COOKIE}=${theme};path=/;max-age=${maxAge};SameSite=Lax`;
}

export function useTheme() {
    const { themePreference } = usePage().props as {
        themePreference?: LegacyTheme;
    };

    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window === 'undefined') {
            return normalizeThemeValue(themePreference);
        }

        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored) {
            return normalizeThemeValue(stored);
        }

        return normalizeThemeValue(themePreference);
    });

    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window === 'undefined') {
            return 'light';
        }

        return resolveTheme(theme);
    });

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const nextResolved = resolveTheme(theme);
        setResolvedTheme(nextResolved);
        applyThemeToDOMDirect(nextResolved);
        localStorage.setItem(THEME_STORAGE_KEY, theme);
        setThemeCookie(theme);
    }, [theme]);

    useEffect(() => {
        if (theme !== 'system' || typeof window === 'undefined') {
            return;
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e: MediaQueryListEvent) => {
            const nextResolved = e.matches ? 'dark' : 'light';
            setResolvedTheme(nextResolved);
            applyThemeToDOMDirect(nextResolved);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const setTheme = useCallback((nextTheme: Theme) => {
        setThemeState(normalizeThemeValue(nextTheme));
    }, []);

    return {
        theme,
        setTheme,
        resolvedTheme,
        isLight: resolvedTheme === 'light',
        isDark: resolvedTheme === 'dark',
    };
}

export function getStoredTheme(): Theme {
    if (typeof window === 'undefined') {
        return 'light';
    }

    return normalizeThemeValue(localStorage.getItem(THEME_STORAGE_KEY));
}

export function initializeTheme() {
    if (typeof window === 'undefined') {
        return;
    }

    const storedTheme = getStoredTheme();
    applyTheme(storedTheme);
}
