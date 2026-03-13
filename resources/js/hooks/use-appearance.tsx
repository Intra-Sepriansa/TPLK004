import { useCallback } from 'react';
import {
    initializeTheme as initializeRuntimeTheme,
    type Theme,
    useTheme,
} from './useTheme';

export type Appearance = Theme;

const APPEARANCE_COOKIE = 'appearance';

function setCookie(name: string, value: string, days = 365) {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
}

/**
 * Backward-compatible initializer used by legacy components.
 */
export function initializeTheme() {
    initializeRuntimeTheme();
}

/**
 * Backward-compatible appearance hook that proxies to the canonical theme hook.
 */
export function useAppearance() {
    const { theme, setTheme, resolvedTheme } = useTheme();

    const updateAppearance = useCallback(
        (mode: Appearance) => {
            setTheme(mode);
            setCookie(APPEARANCE_COOKIE, mode);
        },
        [setTheme],
    );

    return {
        appearance: theme,
        actualTheme: resolvedTheme,
        updateAppearance,
    } as const;
}
