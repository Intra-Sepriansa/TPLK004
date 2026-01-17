/**
 * Settings Sidebar Navigation Component
 * Requirements: 1.1
 */

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import {
    Settings,
    Bell,
    Palette,
    Shield,
    Lock,
    Database,
    Search,
} from 'lucide-react';
import type { SettingsCategory } from '@/types/settings';

interface SettingsSidebarProps {
    activeCategory: SettingsCategory;
    onCategoryChange: (category: SettingsCategory) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

const categories: { key: SettingsCategory; label: string; icon: React.ElementType; description: string; color: string }[] = [
    { key: 'general', label: 'Umum', icon: Settings, description: 'Bahasa, zona waktu, format', color: 'text-blue-500' },
    { key: 'notifications', label: 'Notifikasi', icon: Bell, description: 'Email, push, in-app', color: 'text-green-500' },
    { key: 'appearance', label: 'Tampilan', icon: Palette, description: 'Tema, font, animasi', color: 'text-purple-500' },
    { key: 'privacy', label: 'Privasi', icon: Shield, description: 'Visibilitas, aktivitas', color: 'text-orange-500' },
    { key: 'security', label: 'Keamanan', icon: Lock, description: '2FA, sesi, riwayat login', color: 'text-red-500' },
    { key: 'dataManagement', label: 'Data', icon: Database, description: 'Backup, cache, ekspor', color: 'text-indigo-500' },
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
            cat.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <aside className="w-full space-y-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Cari pengaturan..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9"
                />
            </div>

            <nav className="flex flex-col space-y-1">
                {filteredCategories.map((category) => {
                    const Icon = category.icon;
                    const isActive = activeCategory === category.key;
                    
                    return (
                        <motion.button
                            key={category.key}
                            onClick={() => onCategoryChange(category.key)}
                            className={cn(
                                'w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200',
                                isActive 
                                    ? 'bg-purple-500 text-white shadow-md' 
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300'
                            )}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                            <motion.div
                                whileHover={{ rotate: 10 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                                <Icon className={cn(
                                    'h-5 w-5 mt-0.5 flex-shrink-0',
                                    isActive ? 'text-white' : category.color
                                )} />
                            </motion.div>
                            <div className="flex-1 min-w-0">
                                <div className={cn(
                                    'font-medium text-sm',
                                    isActive ? 'text-white' : 'text-gray-900 dark:text-white'
                                )}>
                                    {category.label}
                                </div>
                                <div className={cn(
                                    'text-xs mt-0.5 line-clamp-1',
                                    isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                                )}>
                                    {category.description}
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </nav>
        </aside>
    );
}
