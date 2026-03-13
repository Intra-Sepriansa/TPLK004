/**
 * Appearance Settings Component
 * Requirements: 1.4
 */

import type { Theme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import type { AppearanceSettings as AppearanceSettingsType } from '@/types/settings';
import { Layout, Type } from 'lucide-react';
import { AnimatedToggle } from './AnimatedToggle';
import { SettingsCard } from './SettingsCard';
import { ThemeToggle } from './ThemeToggle';

interface AppearanceSettingsProps {
    settings: AppearanceSettingsType;
    resolvedTheme: 'light' | 'dark';
    onThemeChange: (theme: Theme) => void;
    onUpdate: (settings: Partial<AppearanceSettingsType>) => void;
}

const fontSizes = [
    { value: 'small', label: 'Kecil', size: 'text-sm' },
    { value: 'medium', label: 'Sedang', size: 'text-base' },
    { value: 'large', label: 'Besar', size: 'text-lg' },
] as const;

export function AppearanceSettings({
    settings,
    resolvedTheme,
    onThemeChange,
    onUpdate,
}: AppearanceSettingsProps) {
    return (
        <div className="space-y-6">
            {/* Theme Selection using new ThemeToggle component */}
            <SettingsCard title="Tema Aplikasi" icon={Layout} delay={0.1}>
                <ThemeToggle
                    value={settings.theme}
                    resolvedTheme={resolvedTheme}
                    onChange={onThemeChange}
                />
            </SettingsCard>

            {/* Font Size Selection */}
            <SettingsCard title="Ukuran Font Text" icon={Type} delay={0.2}>
                <div className="grid grid-cols-3 gap-3">
                    {fontSizes.map((fontSize) => (
                        <button
                            key={fontSize.value}
                            onClick={() =>
                                onUpdate({ fontSize: fontSize.value })
                            }
                            className={cn(
                                'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-300 hover:scale-105',
                                settings.fontSize === fontSize.value
                                    ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md shadow-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:shadow-purple-900/20'
                                    : 'border-gray-200 hover:border-purple-300 dark:border-gray-800 dark:hover:border-purple-700',
                            )}
                        >
                            <span className={cn('font-medium', fontSize.size)}>
                                Aa
                            </span>
                            <span className="text-sm font-semibold">
                                {fontSize.label}
                            </span>
                        </button>
                    ))}
                </div>
            </SettingsCard>

            {/* Display Options using AnimatedToggle */}
            <SettingsCard title="Opsi Tata Letak" icon={Layout} delay={0.3}>
                <div className="space-y-6">
                    <AnimatedToggle
                        checked={settings.compactMode}
                        onChange={() =>
                            onUpdate({ compactMode: !settings.compactMode })
                        }
                        label="Kepadatan Tampilan"
                        description="Tampilkan lebih banyak data di layar dengan padding yang lebih kecil"
                    />

                    <div className="h-px bg-gray-200 dark:bg-gray-800" />

                    <AnimatedToggle
                        checked={settings.animations}
                        onChange={() =>
                            onUpdate({ animations: !settings.animations })
                        }
                        label="Animasi Interface"
                        description="Aktifkan pergerakan visual, efek bayangan, dan transisi halus."
                    />

                    <div className="h-px bg-gray-200 dark:bg-gray-800" />

                    <AnimatedToggle
                        checked={settings.sidebarCollapsed}
                        onChange={() =>
                            onUpdate({
                                sidebarCollapsed: !settings.sidebarCollapsed,
                            })
                        }
                        label="Minimize Sidebar Default"
                        description="Tutup navigasi samping saat masuk secara otomatis"
                    />
                </div>
            </SettingsCard>
        </div>
    );
}
