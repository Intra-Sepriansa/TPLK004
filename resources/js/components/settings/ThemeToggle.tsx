import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import type { Theme } from '@/hooks/useTheme';

interface ThemeToggleProps {
    value: Theme;
    resolvedTheme: 'light' | 'dark';
    onChange: (theme: Theme) => void;
}

export function ThemeToggle({ value, resolvedTheme, onChange }: ThemeToggleProps) {

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
            value: 'system',
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
                    const isActive = value === themeOption.value;

                    return (
                        <motion.button
                            type="button"
                            key={themeOption.value}
                            onClick={() => onChange(themeOption.value)}
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
