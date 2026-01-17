/**
 * Settings Sidebar Navigation Component
 * Requirements: 1.1
 */

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const categories: { key: SettingsCategory; label: string; icon: React.ElementType; description: string }[] = [
    { key: 'general', label: 'Umum', icon: Settings, description: 'Bahasa, zona waktu, format' },
    { key: 'notifications', label: 'Notifikasi', icon: Bell, description: 'Email, push, in-app' },
    { key: 'appearance', label: 'Tampilan', icon: Palette, description: 'Tema, font, animasi' },
    { key: 'privacy', label: 'Privasi', icon: Shield, description: 'Visibilitas, aktivitas' },
    { key: 'security', label: 'Keamanan', icon: Lock, description: '2FA, sesi, riwayat login' },
    { key: 'dataManagement', label: 'Data', icon: Database, description: 'Backup, cache, ekspor' },
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
        <aside className="w-full lg:w-64 space-y-4">
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
                {filteredCategories.map((category) => (
                    <Button
                        key={category.key}
                        variant="ghost"
                        className={cn(
                            'w-full justify-start h-auto py-3 px-3',
                            activeCategory === category.key && 'bg-muted'
                        )}
                        onClick={() => onCategoryChange(category.key)}
                    >
                        <category.icon className="h-5 w-5 mr-3 shrink-0" />
                        <div className="text-left">
                            <div className="font-medium">{category.label}</div>
                            <div className="text-xs text-muted-foreground">
                                {category.description}
                            </div>
                        </div>
                    </Button>
                ))}
            </nav>
        </aside>
    );
}
