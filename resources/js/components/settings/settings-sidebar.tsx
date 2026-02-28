/**
 * Settings Sidebar Navigation Component
 * Requirements: 1.1
 */

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { SettingsCategory } from '@/types/settings';
import { motion } from 'framer-motion';
import {
    Bell,
    Database,
    Lock,
    Palette,
    Search,
    Settings,
    Shield,
} from 'lucide-react';

interface SettingsSidebarProps {
    activeCategory: SettingsCategory;
    onCategoryChange: (category: SettingsCategory) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

const categories: {
    key: SettingsCategory;
    label: string;
    icon: React.ElementType;
    description: string;
    color: string;
}[] = [
    {
        key: 'general',
        label: 'Umum',
        icon: Settings,
        description: 'Bahasa, zona waktu, format',
        color: 'text-sky-500',
    },
    {
        key: 'notifications',
        label: 'Notifikasi',
        icon: Bell,
        description: 'Email, push, in-app',
        color: 'text-emerald-500',
    },
    {
        key: 'appearance',
        label: 'Tampilan',
        icon: Palette,
        description: 'Tema, font, animasi',
        color: 'text-fuchsia-500',
    },
    {
        key: 'privacy',
        label: 'Privasi',
        icon: Shield,
        description: 'Visibilitas, aktivitas',
        color: 'text-amber-500',
    },
    {
        key: 'security',
        label: 'Keamanan',
        icon: Lock,
        description: '2FA, sesi, riwayat login',
        color: 'text-rose-500',
    },
    {
        key: 'dataManagement',
        label: 'Data',
        icon: Database,
        description: 'Backup, cache, ekspor',
        color: 'text-indigo-500',
    },
];

export function SettingsSidebar({
    activeCategory,
    onCategoryChange,
    searchQuery,
    onSearchChange,
}: SettingsSidebarProps) {
    const filteredCategories = categories.filter(
        (cat) =>
            cat.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cat.description.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <aside className="w-full space-y-4">
            <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                    placeholder="Cari pengaturan..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="h-11 rounded-xl border-white/20 bg-white/40 pl-9 text-sm backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/60"
                />
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
                {filteredCategories.map((category) => {
                    const Icon = category.icon;
                    const isActive = activeCategory === category.key;

                    return (
                        <motion.button
                            key={category.key}
                            onClick={() => onCategoryChange(category.key)}
                            className={cn(
                                'min-w-[170px] rounded-2xl border px-3.5 py-3 text-left transition-all duration-200 lg:w-full lg:min-w-0',
                                'border-white/20 backdrop-blur-xl dark:border-white/10',
                                isActive
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                                    : 'bg-white/40 text-neutral-700 hover:bg-white/60 dark:bg-neutral-900/40 dark:text-neutral-300 dark:hover:bg-neutral-900/70',
                            )}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 20,
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <Icon
                                    className={cn(
                                        'mt-0.5 h-5 w-5 shrink-0',
                                        isActive
                                            ? 'text-white'
                                            : category.color,
                                    )}
                                />
                                <div className="min-w-0 flex-1">
                                    <div
                                        className={cn(
                                            'text-sm font-medium',
                                            isActive
                                                ? 'text-white'
                                                : 'text-neutral-900 dark:text-white',
                                        )}
                                    >
                                        {category.label}
                                    </div>
                                    <div
                                        className={cn(
                                            'mt-0.5 line-clamp-1 text-xs',
                                            isActive
                                                ? 'text-white/80'
                                                : 'text-neutral-500 dark:text-neutral-400',
                                        )}
                                    >
                                        {category.description}
                                    </div>
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </nav>
        </aside>
    );
}
