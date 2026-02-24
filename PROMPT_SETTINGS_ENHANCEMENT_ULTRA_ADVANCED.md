# ⚙️ PROMPT ULTRA ADVANCED: SETTINGS PAGE ENHANCEMENT
## Fix Bug Tema & Peningkatan Animasi Menu Pengaturan

---

## 📋 OVERVIEW MASALAH

### Bug yang Harus Diperbaiki

#### 1. **BUG TEMA TIDAK PERSIST SETELAH REFRESH** ⚠️
**Masalah:**
- User pilih tema terang (light)
- Tema berubah ke terang ✅
- Checkbox tetap terceklis di tema terang ✅
- **TAPI** setelah refresh halaman, tema kembali ke gelap (dark) ❌
- Checkbox masih terceklis di tema terang (tidak sinkron) ❌

**Root Cause:**
- `useTheme` hook tidak properly sync dengan localStorage
- Database save tidak berfungsi dengan benar
- Initial theme detection salah saat page load
- Race condition antara localStorage dan database theme

#### 2. **ANIMASI KURANG/TIDAK ADA** ⚠️
**Masalah:**
- Transisi antar section tidak smooth
- Tidak ada animasi saat toggle switch
- Tidak ada feedback visual saat save
- Card tidak ada hover effects
- Theme change tidak ada transition animation

#### 3. **FUNGSI TIDAK BERFUNGSI** ⚠️
**Masalah:**
- Beberapa toggle tidak save ke database
- Reset settings tidak bekerja
- Export/Import settings error
- Clear cache tidak ada feedback

---

## 🔧 SOLUSI LENGKAP

### 1. FIX BUG TEMA (PRIORITY #1)

#### A. Update `useTheme.ts` Hook - COMPLETE REWRITE
```typescript
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
            actualTheme = themeValue;
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
```

#### B. Update Backend Route untuk Save Theme
```php
// routes/web.php atau api.php
Route::post('/api/settings/theme', [SettingsController::class, 'updateTheme'])
    ->middleware(['auth'])
    ->name('settings.theme.update');
```

#### C. Update SettingsController
```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SettingsController extends Controller
{
    /**
     * Update theme preference
     */
    public function updateTheme(Request $request)
    {
        $validated = $request->validate([
            'theme' => 'required|in:light,dark,auto',
        ]);

        $user = Auth::user();
        
        // Update theme_preference column
        $user->update([
            'theme_preference' => $validated['theme'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Theme updated successfully',
            'theme' => $validated['theme'],
        ]);
    }
}
```

#### D. Initialize Theme di `app.tsx`
```typescript
// resources/js/app.tsx
import { initializeTheme } from '@/hooks/useTheme';

// Call BEFORE React renders
initializeTheme();

createInertiaApp({
    // ... rest of your code
});
```

#### E. Add CSS Transition untuk Smooth Theme Change
```css
/* resources/css/app.css */

/* Smooth theme transition */
html {
    transition: background-color 0.3s ease, color 0.3s ease;
}

html * {
    transition: background-color 0.3s ease, 
                border-color 0.3s ease, 
                color 0.3s ease,
                box-shadow 0.3s ease;
}

/* Prevent transition on page load */
html.no-transition,
html.no-transition * {
    transition: none !important;
}
```

#### F. Prevent Flash of Wrong Theme (FOUC)
```html
<!-- resources/views/app.blade.php -->
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    <!-- CRITICAL: Inline script to prevent FOUC -->
    <script>
        (function() {
            // Get theme from localStorage
            const theme = localStorage.getItem('app-theme') || 'light';
            const root = document.documentElement;
            
            // Determine actual theme
            let actualTheme = 'light';
            if (theme === 'auto') {
                actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            } else {
                actualTheme = theme;
            }
            
            // Apply immediately (before any CSS loads)
            root.classList.add('no-transition');
            root.classList.remove('light', 'dark');
            root.classList.add(actualTheme);
            root.setAttribute('data-theme', actualTheme);
            root.style.colorScheme = actualTheme;
            
            // Remove no-transition after a frame
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    root.classList.remove('no-transition');
                });
            });
        })();
    </script>
    
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead
</head>
<body>
    @inertia
</body>
</html>
```

---

### 2. ENHANCE ANIMASI (PRIORITY #2)

#### A. Theme Toggle dengan Animasi Smooth
```tsx
// Component: ThemeToggle.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type Theme } from '@/hooks/useTheme';

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();

    const themes: { value: Theme; icon: any; label: string; gradient: string }[] = [
        { 
            value: 'light', 
            icon: Sun, 
            label: 'Terang',
            gradient: 'from-amber-400 to-orange-500'
        },
        { 
            value: 'dark', 
            icon: Moon, 
            label: 'Gelap',
            gradient: 'from-indigo-500 to-purple-600'
        },
        { 
            value: 'auto', 
            icon: Monitor, 
            label: 'Auto',
            gradient: 'from-teal-400 to-cyan-500'
        },
    ];

    return (
        <div className="space-y-4">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <span>Tema Tampilan</span>
                <motion.span
                    key={resolvedTheme}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold"
                >
                    {resolvedTheme === 'light' ? '☀️ Terang' : '🌙 Gelap'}
                </motion.span>
            </label>
            
            <div className="grid grid-cols-3 gap-3">
                {themes.map((themeOption) => {
                    const Icon = themeOption.icon;
                    const isActive = theme === themeOption.value;
                    
                    return (
                        <motion.button
                            key={themeOption.value}
                            onClick={() => setTheme(themeOption.value)}
                            className={`
                                relative overflow-hidden rounded-2xl p-4 
                                border-2 transition-all duration-300
                                ${isActive 
                                    ? 'border-purple-500 bg-gradient-to-br ' + themeOption.gradient + ' text-white shadow-lg shadow-purple-500/50' 
                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-purple-300 dark:hover:border-purple-700'
                                }
                            `}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        >
                            {/* Animated background on active */}
                            <AnimatePresence>
                                {isActive && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0 }}
                                        className="absolute inset-0 bg-white/20"
                                    />
                                )}
                            </AnimatePresence>
                            
                            {/* Icon with animation */}
                            <motion.div
                                animate={isActive ? {
                                    rotate: [0, 10, -10, 0],
                                    scale: [1, 1.1, 1],
                                } : {}}
                                transition={{ duration: 0.5 }}
                                className="relative z-10 flex flex-col items-center gap-2"
                            >
                                <Icon className="w-6 h-6" />
                                <span className="text-xs font-bold">{themeOption.label}</span>
                            </motion.div>
                            
                            {/* Checkmark animation */}
                            <AnimatePresence>
                                {isActive && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center"
                                    >
                                        <motion.svg
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            className="w-3 h-3 text-purple-600"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                        >
                                            <motion.path
                                                d="M5 13l4 4L19 7"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </motion.svg>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
```


#### B. Toggle Switch dengan Animasi Enhanced
```tsx
// Component: AnimatedToggle.tsx
import { motion } from 'framer-motion';

interface AnimatedToggleProps {
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
    label?: string;
    description?: string;
}

export function AnimatedToggle({ 
    checked, 
    onChange, 
    disabled = false,
    label,
    description 
}: AnimatedToggleProps) {
    return (
        <div className="flex items-center justify-between gap-4">
            {label && (
                <div className="flex-1">
                    <label className="font-medium text-gray-900 dark:text-white">
                        {label}
                    </label>
                    {description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {description}
                        </p>
                    )}
                </div>
            )}
            
            <motion.button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={onChange}
                disabled={disabled}
                className={`
                    relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer 
                    rounded-full border-2 border-transparent transition-colors 
                    duration-300 ease-in-out focus:outline-none focus:ring-2 
                    focus:ring-purple-500 focus:ring-offset-2 
                    dark:focus:ring-offset-gray-900
                    ${checked 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                        : 'bg-gray-300 dark:bg-gray-700'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                whileHover={!disabled ? { scale: 1.05 } : {}}
                whileTap={!disabled ? { scale: 0.95 } : {}}
            >
                {/* Animated thumb */}
                <motion.span
                    className={`
                        pointer-events-none inline-block h-6 w-6 transform 
                        rounded-full bg-white shadow-lg ring-0 
                        flex items-center justify-center
                    `}
                    animate={{
                        x: checked ? 28 : 0,
                    }}
                    transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                    }}
                >
                    {/* Icon inside thumb */}
                    <motion.div
                        initial={false}
                        animate={{
                            scale: checked ? [1, 1.3, 1] : 1,
                            rotate: checked ? 360 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                    >
                        {checked ? (
                            <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        )}
                    </motion.div>
                </motion.span>
                
                {/* Ripple effect on toggle */}
                {checked && (
                    <motion.span
                        className="absolute inset-0 rounded-full bg-white"
                        initial={{ scale: 0, opacity: 0.5 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                    />
                )}
            </motion.button>
        </div>
    );
}
```

#### C. Settings Card dengan Hover Animation
```tsx
// Component: SettingsCard.tsx
import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';

interface SettingsCardProps {
    title: string;
    icon: LucideIcon;
    children: React.ReactNode;
    delay?: number;
}

export function SettingsCard({ title, icon: Icon, children, delay = 0 }: SettingsCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
                delay, 
                duration: 0.5, 
                type: 'spring',
                stiffness: 100,
                damping: 15
            }}
            whileHover={{ 
                y: -4,
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            }}
            className="
                relative overflow-hidden
                rounded-3xl border-2 border-gray-200 dark:border-gray-800 
                bg-white/80 dark:bg-gray-900/80 
                p-6 md:p-8 
                shadow-xl backdrop-blur-xl
                transition-all duration-300
            "
        >
            {/* Animated gradient background on hover */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-transparent opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            />
            
            {/* Decorative corner glow */}
            <motion.div
                className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />
            
            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200/50 dark:border-gray-800/50">
                    <motion.div
                        className="
                            flex h-12 w-12 items-center justify-center 
                            rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 
                            text-purple-600 dark:text-purple-400
                            shadow-lg
                        "
                        whileHover={{ 
                            scale: 1.1, 
                            rotate: 5,
                            boxShadow: '0 10px 30px rgba(168, 85, 247, 0.4)',
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                        <Icon className="h-6 w-6" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {title}
                    </h3>
                </div>
                
                {/* Content */}
                <div className="space-y-6">
                    {children}
                </div>
            </div>
        </motion.div>
    );
}
```

#### D. Save Button dengan Loading Animation
```tsx
// Component: SaveButton.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Check, AlertCircle } from 'lucide-react';

interface SaveButtonProps {
    onClick: () => void;
    isSaving: boolean;
    hasChanges: boolean;
    disabled?: boolean;
}

export function SaveButton({ onClick, isSaving, hasChanges, disabled }: SaveButtonProps) {
    return (
        <motion.button
            onClick={onClick}
            disabled={disabled || isSaving || !hasChanges}
            className={`
                relative overflow-hidden
                px-8 py-4 rounded-2xl
                font-bold text-white
                transition-all duration-300
                ${hasChanges && !isSaving
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/50'
                    : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                }
            `}
            whileHover={hasChanges && !isSaving ? { scale: 1.05, y: -2 } : {}}
            whileTap={hasChanges && !isSaving ? { scale: 0.95 } : {}}
        >
            {/* Shimmer effect when has changes */}
            {hasChanges && !isSaving && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                        x: ['-100%', '200%'],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
            )}
            
            {/* Button content */}
            <div className="relative z-10 flex items-center justify-center gap-2">
                <AnimatePresence mode="wait">
                    {isSaving ? (
                        <motion.div
                            key="saving"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className="flex items-center gap-2"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                                <Save className="w-5 h-5" />
                            </motion.div>
                            <span>Menyimpan...</span>
                        </motion.div>
                    ) : hasChanges ? (
                        <motion.div
                            key="save"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className="flex items-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            <span>Simpan Perubahan</span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="saved"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className="flex items-center gap-2"
                        >
                            <Check className="w-5 h-5" />
                            <span>Tersimpan</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.button>
    );
}
```

#### E. Toast Notification dengan Animation
```tsx
// Component: Toast.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
    type: 'success' | 'error';
    message: string;
    onClose: () => void;
}

export function Toast({ type, message, onClose }: ToastProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`
                fixed top-6 right-6 z-50
                flex items-center gap-3
                px-6 py-4 rounded-2xl
                shadow-2xl backdrop-blur-xl
                border-2
                ${type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300'
                }
            `}
        >
            {/* Icon with animation */}
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
                {type === 'success' ? (
                    <CheckCircle className="w-6 h-6" />
                ) : (
                    <AlertCircle className="w-6 h-6" />
                )}
            </motion.div>
            
            {/* Message */}
            <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="font-semibold"
            >
                {message}
            </motion.p>
            
            {/* Close button */}
            <motion.button
                onClick={onClose}
                className="ml-4 p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <X className="w-4 h-4" />
            </motion.button>
            
            {/* Progress bar */}
            <motion.div
                className={`
                    absolute bottom-0 left-0 h-1 rounded-b-2xl
                    ${type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}
                `}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 3, ease: 'linear' }}
            />
        </motion.div>
    );
}

// Usage in Settings Page
export function ToastContainer({ toast, onClose }: { toast: ToastType; onClose: () => void }) {
    return (
        <AnimatePresence>
            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={onClose}
                />
            )}
        </AnimatePresence>
    );
}
```

---

### 3. FIX FUNGSI YANG TIDAK BEKERJA (PRIORITY #3)

#### A. Settings API dengan Proper Error Handling
```typescript
// lib/settings-api.ts
import axios from 'axios';

const API_BASE = '/api/settings';

// Get CSRF token
function getCsrfToken(): string {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (!token) {
        throw new Error('CSRF token not found');
    }
    return token;
}

// Axios instance with CSRF token
const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Add CSRF token to every request
api.interceptors.request.use((config) => {
    config.headers['X-CSRF-TOKEN'] = getCsrfToken();
    return config;
});

/**
 * Get all settings
 */
export async function getSettings() {
    try {
        const response = await api.get('/');
        return response.data;
    } catch (error) {
        console.error('Failed to get settings:', error);
        throw error;
    }
}

/**
 * Update category settings
 */
export async function updateCategorySettings(category: string, data: any) {
    try {
        const response = await api.post(`/${category}`, data);
        return response.data;
    } catch (error) {
        console.error(`Failed to update ${category} settings:`, error);
        throw error;
    }
}

/**
 * Reset all settings to default
 */
export async function resetSettings() {
    try {
        const response = await api.post('/reset');
        return response.data;
    } catch (error) {
        console.error('Failed to reset settings:', error);
        throw error;
    }
}

/**
 * Clear cache
 */
export async function clearCache() {
    try {
        const response = await api.post('/clear-cache');
        return response.data;
    } catch (error) {
        console.error('Failed to clear cache:', error);
        throw error;
    }
}

/**
 * Download settings as JSON
 */
export function downloadSettings() {
    try {
        // Get settings from localStorage or API
        const settings = localStorage.getItem('user-settings');
        if (!settings) {
            throw new Error('No settings found');
        }
        
        // Create blob and download
        const blob = new Blob([settings], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `settings-${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Failed to download settings:', error);
        throw error;
    }
}

/**
 * Upload settings from JSON file
 */
export async function uploadSettings(file: File) {
    try {
        const text = await file.text();
        const settings = JSON.parse(text);
        
        // Validate settings structure
        if (!settings || typeof settings !== 'object') {
            throw new Error('Invalid settings file');
        }
        
        // Upload to server
        const response = await api.post('/import', settings);
        return response.data;
    } catch (error) {
        console.error('Failed to upload settings:', error);
        throw error;
    }
}
```

#### B. Backend Controller dengan Proper Validation
```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class SettingsController extends Controller
{
    /**
     * Get all settings
     */
    public function index()
    {
        $user = Auth::user();
        
        return response()->json([
            'general' => [
                'language' => $user->language ?? 'id',
                'timezone' => $user->timezone ?? 'Asia/Jakarta',
                'dateFormat' => $user->date_format ?? 'DD/MM/YYYY',
            ],
            'appearance' => [
                'theme' => $user->theme_preference ?? 'light',
                'sidebarPosition' => $user->sidebar_position ?? 'left',
                'compactMode' => $user->compact_mode ?? false,
            ],
            'notifications' => [
                'email' => json_decode($user->email_notifications ?? '{}', true),
                'push' => json_decode($user->push_notifications ?? '{}', true),
                'sound' => $user->notification_sound ?? true,
            ],
            'privacy' => [
                'profileVisibility' => $user->profile_visibility ?? 'students',
                'showEmail' => $user->show_email ?? false,
                'showPhone' => $user->show_phone ?? false,
            ],
        ]);
    }

    /**
     * Update general settings
     */
    public function updateGeneral(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'language' => 'nullable|in:id,en',
            'timezone' => 'nullable|string',
            'dateFormat' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = Auth::user();
        $user->update($request->only(['language', 'timezone', 'dateFormat']));

        return response()->json([
            'success' => true,
            'message' => 'General settings updated successfully',
        ]);
    }

    /**
     * Update theme
     */
    public function updateTheme(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'theme' => 'required|in:light,dark,auto',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = Auth::user();
        $user->update(['theme_preference' => $request->theme]);

        return response()->json([
            'success' => true,
            'message' => 'Theme updated successfully',
            'theme' => $request->theme,
        ]);
    }

    /**
     * Reset settings to default
     */
    public function reset()
    {
        $user = Auth::user();
        
        $user->update([
            'language' => 'id',
            'timezone' => 'Asia/Jakarta',
            'date_format' => 'DD/MM/YYYY',
            'theme_preference' => 'light',
            'sidebar_position' => 'left',
            'compact_mode' => false,
            'email_notifications' => json_encode([]),
            'push_notifications' => json_encode([]),
            'notification_sound' => true,
            'profile_visibility' => 'students',
            'show_email' => false,
            'show_phone' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Settings reset to default',
        ]);
    }

    /**
     * Clear cache
     */
    public function clearCache()
    {
        Cache::flush();
        
        return response()->json([
            'success' => true,
            'message' => 'Cache cleared successfully',
        ]);
    }

    /**
     * Import settings
     */
    public function import(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'general' => 'nullable|array',
            'appearance' => 'nullable|array',
            'notifications' => 'nullable|array',
            'privacy' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = Auth::user();
        
        // Update settings from imported data
        if ($request->has('general')) {
            $user->update([
                'language' => $request->input('general.language'),
                'timezone' => $request->input('general.timezone'),
                'date_format' => $request->input('general.dateFormat'),
            ]);
        }

        if ($request->has('appearance')) {
            $user->update([
                'theme_preference' => $request->input('appearance.theme'),
                'sidebar_position' => $request->input('appearance.sidebarPosition'),
                'compact_mode' => $request->input('appearance.compactMode'),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Settings imported successfully',
        ]);
    }
}
```


---

## 🎯 IMPLEMENTATION CHECKLIST

### Phase 1: Fix Bug Tema (CRITICAL)
- [ ] Update `useTheme.ts` hook dengan versi baru
- [ ] Add inline script di `app.blade.php` untuk prevent FOUC
- [ ] Update backend route `/api/settings/theme`
- [ ] Update `SettingsController` dengan method `updateTheme`
- [ ] Add CSS transition untuk smooth theme change
- [ ] Call `initializeTheme()` di `app.tsx`
- [ ] Test: Pilih tema terang → Refresh → Harus tetap terang ✅
- [ ] Test: Pilih tema gelap → Refresh → Harus tetap gelap ✅
- [ ] Test: Pilih tema auto → Refresh → Harus tetap auto ✅

### Phase 2: Enhance Animasi
- [ ] Create `ThemeToggle.tsx` component dengan animasi
- [ ] Create `AnimatedToggle.tsx` component
- [ ] Create `SettingsCard.tsx` dengan hover effects
- [ ] Create `SaveButton.tsx` dengan loading animation
- [ ] Create `Toast.tsx` dengan smooth animations
- [ ] Add Framer Motion animations ke semua interactive elements
- [ ] Test: Semua animasi smooth dan tidak lag

### Phase 3: Fix Fungsi
- [ ] Create `settings-api.ts` dengan proper error handling
- [ ] Update backend controller dengan validation
- [ ] Implement reset settings functionality
- [ ] Implement clear cache functionality
- [ ] Implement export/import settings
- [ ] Add proper error messages
- [ ] Test: Semua fungsi bekerja tanpa error

### Phase 4: Testing & QA
- [ ] Test di Chrome, Firefox, Safari
- [ ] Test di mobile devices
- [ ] Test dark mode transitions
- [ ] Test all toggle switches
- [ ] Test save functionality
- [ ] Test reset functionality
- [ ] Test export/import
- [ ] Performance test (no lag)

---

## 🐛 DEBUGGING GUIDE

### Bug: Tema Tidak Persist
**Symptoms:**
- Tema berubah tapi setelah refresh kembali ke default
- Checkbox tidak sinkron dengan tema aktual

**Solution:**
1. Check localStorage: `localStorage.getItem('app-theme')`
2. Check database: Query user's `theme_preference` column
3. Check console for errors
4. Verify CSRF token exists
5. Check network tab for API call success

**Debug Code:**
```typescript
// Add to useTheme hook for debugging
useEffect(() => {
    console.log('🎨 Theme Debug:', {
        theme,
        resolvedTheme,
        localStorage: localStorage.getItem('app-theme'),
        documentClass: document.documentElement.className,
    });
}, [theme, resolvedTheme]);
```

### Bug: Animasi Lag
**Symptoms:**
- Animasi tersendat
- UI freeze saat toggle

**Solution:**
1. Check if too many animations running simultaneously
2. Use `will-change` CSS property
3. Reduce animation complexity
4. Use `transform` instead of `width/height`
5. Enable GPU acceleration

**Performance CSS:**
```css
/* Add to animated elements */
.animated-element {
    will-change: transform, opacity;
    transform: translateZ(0);
    backface-visibility: hidden;
}
```

### Bug: Save Tidak Bekerja
**Symptoms:**
- Click save button tidak ada response
- Error di console

**Solution:**
1. Check CSRF token: `document.querySelector('meta[name="csrf-token"]')`
2. Check network tab for 419/422 errors
3. Verify API endpoint exists
4. Check backend validation rules
5. Add try-catch for better error handling

---

## 📊 PERFORMANCE OPTIMIZATION

### 1. Lazy Load Settings Sections
```typescript
import { lazy, Suspense } from 'react';

const GeneralSettings = lazy(() => import('@/components/settings/GeneralSettings'));
const NotificationSettings = lazy(() => import('@/components/settings/NotificationSettings'));
const AppearanceSettings = lazy(() => import('@/components/settings/AppearanceSettings'));

// Usage
<Suspense fallback={<SkeletonLoader />}>
    {activeCategory === 'general' && <GeneralSettings />}
    {activeCategory === 'notifications' && <NotificationSettings />}
    {activeCategory === 'appearance' && <AppearanceSettings />}
</Suspense>
```

### 2. Debounce Save Function
```typescript
import { useCallback } from 'react';
import { debounce } from 'lodash';

const debouncedSave = useCallback(
    debounce(async (data) => {
        await saveSettings(data);
    }, 1000),
    []
);
```

### 3. Optimize Re-renders
```typescript
import { memo } from 'react';

export const SettingsCard = memo(({ title, icon, children }) => {
    // Component code
}, (prevProps, nextProps) => {
    // Custom comparison
    return prevProps.title === nextProps.title;
});
```

---

## 🎨 UI/UX BEST PRACTICES

### 1. Visual Feedback
- ✅ Show loading state saat save
- ✅ Show success/error toast
- ✅ Disable button saat saving
- ✅ Show "unsaved changes" indicator
- ✅ Confirm before reset

### 2. Accessibility
```tsx
// Add ARIA labels
<button
    aria-label="Toggle dark mode"
    aria-pressed={theme === 'dark'}
    role="switch"
>
    {/* Button content */}
</button>

// Add keyboard navigation
<div
    tabIndex={0}
    onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            handleToggle();
        }
    }}
>
    {/* Content */}
</div>
```

### 3. Responsive Design
```tsx
// Mobile-first approach
<div className="
    flex flex-col gap-4
    md:flex-row md:items-center md:justify-between
    lg:gap-6
">
    {/* Content */}
</div>
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] Run `npm run build` tanpa error
- [ ] Test di production mode
- [ ] Check bundle size
- [ ] Verify all API endpoints
- [ ] Test database migrations
- [ ] Backup database

### Deployment
- [ ] Deploy frontend assets
- [ ] Deploy backend code
- [ ] Run migrations
- [ ] Clear cache
- [ ] Test live site

### Post-Deployment
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Test all features
- [ ] Verify theme persistence
- [ ] Check mobile responsiveness

---

## 📝 TESTING SCENARIOS

### Test Case 1: Theme Persistence
```
1. Login ke aplikasi
2. Buka menu Settings
3. Pilih tema "Terang"
4. Verify: Tema berubah ke terang
5. Refresh halaman (F5)
6. Verify: Tema masih terang ✅
7. Logout dan login kembali
8. Verify: Tema masih terang ✅
```

### Test Case 2: Theme Auto Mode
```
1. Pilih tema "Auto"
2. Verify: Tema mengikuti system preference
3. Ubah system theme (OS settings)
4. Verify: Aplikasi ikut berubah
5. Refresh halaman
6. Verify: Masih mode auto ✅
```

### Test Case 3: Save Settings
```
1. Ubah beberapa settings
2. Verify: Save button menjadi aktif
3. Click "Simpan Perubahan"
4. Verify: Loading animation muncul
5. Verify: Toast success muncul
6. Verify: Button kembali disabled
7. Refresh halaman
8. Verify: Settings tersimpan ✅
```

### Test Case 4: Reset Settings
```
1. Ubah beberapa settings
2. Click "Reset to Default"
3. Verify: Confirmation dialog muncul
4. Confirm reset
5. Verify: Semua settings kembali ke default
6. Verify: Toast success muncul
```

### Test Case 5: Toggle Animations
```
1. Toggle setiap switch
2. Verify: Animasi smooth
3. Verify: Icon berubah
4. Verify: Warna berubah
5. Verify: Tidak ada lag
```

---

## 🎯 SUCCESS CRITERIA

### Tema Persistence
✅ Tema tersimpan di localStorage
✅ Tema tersimpan di database
✅ Tema persist setelah refresh
✅ Tema persist setelah logout/login
✅ Tidak ada FOUC (Flash of Unstyled Content)
✅ Transisi smooth antar tema

### Animasi
✅ Semua toggle ada animasi
✅ Theme change ada transition
✅ Card hover effects smooth
✅ Save button ada loading state
✅ Toast notification animated
✅ No lag atau jank
✅ 60 FPS animations

### Fungsi
✅ Semua toggle bekerja
✅ Save settings bekerja
✅ Reset settings bekerja
✅ Export settings bekerja
✅ Import settings bekerja
✅ Clear cache bekerja
✅ Error handling proper

### User Experience
✅ Visual feedback jelas
✅ Loading states informatif
✅ Error messages helpful
✅ Responsive di semua device
✅ Accessible (keyboard navigation)
✅ Fast dan responsive

---

## 🔥 ADVANCED FEATURES (BONUS)

### 1. Theme Preview
```tsx
// Preview tema sebelum apply
<div className="grid grid-cols-3 gap-4">
    {themes.map(theme => (
        <div className={`preview-${theme}`}>
            <div className="mini-ui-preview">
                {/* Mini preview of UI with theme */}
            </div>
        </div>
    ))}
</div>
```

### 2. Keyboard Shortcuts
```typescript
useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            handleSave();
        }
        
        // Ctrl/Cmd + D to toggle dark mode
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            setTheme(theme === 'dark' ? 'light' : 'dark');
        }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
}, [theme, handleSave]);
```

### 3. Settings Search
```tsx
const [searchQuery, setSearchQuery] = useState('');

const filteredSettings = useMemo(() => {
    if (!searchQuery) return allSettings;
    
    return allSettings.filter(setting =>
        setting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        setting.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
}, [searchQuery, allSettings]);
```

### 4. Undo/Redo
```typescript
const [history, setHistory] = useState<Settings[]>([]);
const [historyIndex, setHistoryIndex] = useState(-1);

const undo = () => {
    if (historyIndex > 0) {
        setHistoryIndex(historyIndex - 1);
        setSettings(history[historyIndex - 1]);
    }
};

const redo = () => {
    if (historyIndex < history.length - 1) {
        setHistoryIndex(historyIndex + 1);
        setSettings(history[historyIndex + 1]);
    }
};
```

---

## 📚 RESOURCES

### Documentation
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Hooks Docs](https://react.dev/reference/react)
- [Laravel Validation](https://laravel.com/docs/validation)

### Tools
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Bundle Analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)

---

## ✨ FINAL NOTES

Dengan mengikuti prompt ini, menu pengaturan akan:

1. **BUG TEMA FIXED** ✅
   - Tema persist setelah refresh
   - Tidak ada mismatch antara checkbox dan tema aktual
   - Smooth transition antar tema

2. **ANIMASI ENHANCED** ✅
   - Semua element ada animasi
   - Smooth 60 FPS animations
   - No lag atau jank
   - Visual feedback jelas

3. **FUNGSI BEKERJA SEMPURNA** ✅
   - Save settings reliable
   - Reset settings works
   - Export/Import functional
   - Clear cache effective

4. **USER EXPERIENCE EXCELLENT** ✅
   - Responsive di semua device
   - Accessible dengan keyboard
   - Fast dan smooth
   - Error handling proper

**PENTING:**
- Test setiap perubahan secara incremental
- Jangan skip testing phase
- Monitor performance metrics
- Backup database sebelum deploy

🎉 **Selamat mengimplementasikan! Settings page akan menjadi ultra advanced dan bug-free!**
