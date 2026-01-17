/**
 * Dark Theme Configuration
 * Advanced dark theme colors, effects, and animations
 */

export interface DarkThemeConfig {
    colors: {
        background: {
            primary: string;
            secondary: string;
            tertiary: string;
        };
        text: {
            primary: string;
            secondary: string;
            muted: string;
        };
        accent: {
            purple: string;
            pink: string;
            blue: string;
            cyan: string;
            violet: string;
        };
        border: {
            default: string;
            hover: string;
        };
    };
    effects: {
        glow: {
            purple: string;
            pink: string;
            blue: string;
            multi: string;
        };
        glassmorphism: {
            background: string;
            backgroundStrong: string;
            blur: string;
            blurStrong: string;
            border: string;
            borderStrong: string;
        };
    };
    gradients: {
        purple: string;
        blue: string;
        multi: string;
        sunset: string;
        ocean: string;
        midnight: string;
    };
}

export const darkThemeConfig: DarkThemeConfig = {
    colors: {
        background: {
            primary: '#000000',
            secondary: '#0a0a0a',
            tertiary: '#1a1a1a',
        },
        text: {
            primary: '#f5f5f5',
            secondary: '#e0e0e0',
            muted: '#a0a0a0',
        },
        accent: {
            purple: '#a855f7',
            pink: '#ec4899',
            blue: '#3b82f6',
            cyan: '#06b6d4',
            violet: '#8b5cf6',
        },
        border: {
            default: 'rgba(255, 255, 255, 0.1)',
            hover: 'rgba(255, 255, 255, 0.2)',
        },
    },
    effects: {
        glow: {
            purple: '0 0 30px rgba(168, 85, 247, 0.3)',
            pink: '0 0 30px rgba(236, 72, 153, 0.3)',
            blue: '0 0 30px rgba(59, 130, 246, 0.3)',
            multi: '0 0 40px rgba(168, 85, 247, 0.2), 0 0 60px rgba(236, 72, 153, 0.2)',
        },
        glassmorphism: {
            background: 'rgba(255, 255, 255, 0.05)',
            backgroundStrong: 'rgba(255, 255, 255, 0.08)',
            blur: '12px',
            blurStrong: '16px',
            border: 'rgba(255, 255, 255, 0.1)',
            borderStrong: 'rgba(255, 255, 255, 0.15)',
        },
    },
    gradients: {
        purple: 'linear-gradient(135deg, #a855f7, #ec4899)',
        blue: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
        multi: 'linear-gradient(135deg, #a855f7, #ec4899, #3b82f6)',
        sunset: 'linear-gradient(135deg, #f59e0b, #ec4899, #8b5cf6)',
        ocean: 'linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)',
        midnight: 'linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95)',
    },
};

/**
 * Theme Presets
 */
export interface ThemePreset {
    id: string;
    name: string;
    description: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
    };
    gradient: string;
}

export const themePresets: ThemePreset[] = [
    {
        id: 'midnight',
        name: 'Midnight',
        description: 'Deep purple and blue tones for late night coding',
        colors: {
            primary: '#8b5cf6',
            secondary: '#6366f1',
            accent: '#a855f7',
            background: '#0a0a0a',
        },
        gradient: 'linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95)',
    },
    {
        id: 'ocean',
        name: 'Ocean',
        description: 'Cool cyan and blue waves',
        colors: {
            primary: '#06b6d4',
            secondary: '#3b82f6',
            accent: '#0ea5e9',
            background: '#0a0a0a',
        },
        gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)',
    },
    {
        id: 'sunset',
        name: 'Sunset',
        description: 'Warm orange, pink, and purple hues',
        colors: {
            primary: '#f59e0b',
            secondary: '#ec4899',
            accent: '#8b5cf6',
            background: '#0a0a0a',
        },
        gradient: 'linear-gradient(135deg, #f59e0b, #ec4899, #8b5cf6)',
    },
    {
        id: 'custom',
        name: 'Custom',
        description: 'Create your own color scheme',
        colors: {
            primary: '#a855f7',
            secondary: '#ec4899',
            accent: '#3b82f6',
            background: '#000000',
        },
        gradient: 'linear-gradient(135deg, #a855f7, #ec4899, #3b82f6)',
    },
];

/**
 * Animation Configuration
 */
export interface AnimationConfig {
    durations: {
        fast: number;
        normal: number;
        slow: number;
    };
    easings: {
        smooth: string;
        spring: string;
    };
}

export const animationConfig: AnimationConfig = {
    durations: {
        fast: 150,
        normal: 300,
        slow: 500,
    },
    easings: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
};

/**
 * Utility Functions
 */

/**
 * Apply theme preset to CSS variables
 */
export function applyThemePreset(preset: ThemePreset): void {
    const root = document.documentElement;
    
    root.style.setProperty('--color-primary', preset.colors.primary);
    root.style.setProperty('--color-secondary', preset.colors.secondary);
    root.style.setProperty('--color-accent', preset.colors.accent);
    root.style.setProperty('--color-background', preset.colors.background);
    
    // Store in localStorage
    localStorage.setItem('theme-preset', preset.id);
}

/**
 * Get current theme preset from localStorage
 */
export function getCurrentThemePreset(): ThemePreset {
    const savedPresetId = localStorage.getItem('theme-preset');
    const preset = themePresets.find(p => p.id === savedPresetId);
    return preset || themePresets[0]; // Default to Midnight
}

/**
 * Generate gradient CSS string
 */
export function generateGradient(colors: string[], angle: number = 135): string {
    return `linear-gradient(${angle}deg, ${colors.join(', ')})`;
}

/**
 * Generate glow shadow CSS string
 */
export function generateGlowShadow(color: string, intensity: number = 0.3): string {
    const rgb = hexToRgb(color);
    if (!rgb) return '0 0 30px rgba(168, 85, 247, 0.3)';
    
    return `0 0 30px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity})`;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get animation duration based on user preference
 */
export function getAnimationDuration(duration: number): number {
    return prefersReducedMotion() ? 0 : duration;
}

/**
 * Glassmorphism CSS class generator
 */
export function getGlassmorphismClasses(strong: boolean = false): string {
    return strong ? 'glass-strong' : 'glass';
}

/**
 * Glow effect CSS class generator
 */
export function getGlowClasses(color: 'purple' | 'pink' | 'blue' | 'multi'): string {
    return `glow-${color}`;
}

/**
 * Gradient text CSS class generator
 */
export function getGradientTextClasses(variant: 'purple' | 'blue' | 'multi'): string {
    return `gradient-text-${variant}`;
}

/**
 * Gradient border CSS class generator
 */
export function getGradientBorderClasses(variant: 'purple' | 'blue'): string {
    return `gradient-border-${variant}`;
}

/**
 * Export theme configuration
 */
export function exportThemeConfig(): string {
    const config = {
        preset: getCurrentThemePreset(),
        customColors: {
            primary: getComputedStyle(document.documentElement).getPropertyValue('--color-primary'),
            secondary: getComputedStyle(document.documentElement).getPropertyValue('--color-secondary'),
            accent: getComputedStyle(document.documentElement).getPropertyValue('--color-accent'),
        },
    };
    
    return JSON.stringify(config, null, 2);
}

/**
 * Import theme configuration
 */
export function importThemeConfig(configJson: string): boolean {
    try {
        const config = JSON.parse(configJson);
        
        if (config.preset) {
            const preset = themePresets.find(p => p.id === config.preset.id);
            if (preset) {
                applyThemePreset(preset);
            }
        }
        
        if (config.customColors) {
            const root = document.documentElement;
            root.style.setProperty('--color-primary', config.customColors.primary);
            root.style.setProperty('--color-secondary', config.customColors.secondary);
            root.style.setProperty('--color-accent', config.customColors.accent);
        }
        
        return true;
    } catch (error) {
        console.error('Failed to import theme config:', error);
        return false;
    }
}

export default darkThemeConfig;
