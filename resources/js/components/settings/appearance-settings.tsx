/**
 * Appearance Settings Component
 * Requirements: 1.4
 */

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Monitor, Moon, Sun, Type } from 'lucide-react';
import type { AppearanceSettings as AppearanceSettingsType } from '@/types/settings';

interface AppearanceSettingsProps {
    settings: AppearanceSettingsType;
    onUpdate: (settings: Partial<AppearanceSettingsType>) => void;
}

const themes = [
    { value: 'light', label: 'Terang', icon: Sun },
    { value: 'dark', label: 'Gelap', icon: Moon },
    { value: 'system', label: 'Sistem', icon: Monitor },
] as const;

const fontSizes = [
    { value: 'small', label: 'Kecil', size: 'text-sm' },
    { value: 'medium', label: 'Sedang', size: 'text-base' },
    { value: 'large', label: 'Besar', size: 'text-lg' },
] as const;

export function AppearanceSettings({ settings, onUpdate }: AppearanceSettingsProps) {
    return (
        <div className="space-y-6">
            {/* Theme Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Tema</CardTitle>
                    <CardDescription>
                        Pilih tema tampilan yang Anda sukai
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                        {themes.map((theme) => (
                            <button
                                key={theme.value}
                                onClick={() => onUpdate({ theme: theme.value })}
                                className={cn(
                                    'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
                                    settings.theme === theme.value
                                        ? 'border-primary bg-primary/5'
                                        : 'border-muted hover:border-muted-foreground/50'
                                )}
                            >
                                <theme.icon className="h-6 w-6" />
                                <span className="text-sm font-medium">{theme.label}</span>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Font Size */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Type className="h-5 w-5" />
                        <CardTitle>Ukuran Font</CardTitle>
                    </div>
                    <CardDescription>
                        Sesuaikan ukuran teks untuk kenyamanan membaca
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                        {fontSizes.map((fontSize) => (
                            <button
                                key={fontSize.value}
                                onClick={() => onUpdate({ fontSize: fontSize.value })}
                                className={cn(
                                    'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
                                    settings.fontSize === fontSize.value
                                        ? 'border-primary bg-primary/5'
                                        : 'border-muted hover:border-muted-foreground/50'
                                )}
                            >
                                <span className={cn('font-medium', fontSize.size)}>Aa</span>
                                <span className="text-sm">{fontSize.label}</span>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Display Options */}
            <Card>
                <CardHeader>
                    <CardTitle>Opsi Tampilan</CardTitle>
                    <CardDescription>
                        Sesuaikan tampilan aplikasi sesuai preferensi Anda
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="compact-mode">Mode Kompak</Label>
                            <p className="text-sm text-muted-foreground">
                                Tampilkan lebih banyak konten dengan spacing yang lebih kecil
                            </p>
                        </div>
                        <Switch
                            id="compact-mode"
                            checked={settings.compactMode}
                            onCheckedChange={(checked) => onUpdate({ compactMode: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="animations">Animasi</Label>
                            <p className="text-sm text-muted-foreground">
                                Aktifkan animasi dan transisi halus
                            </p>
                        </div>
                        <Switch
                            id="animations"
                            checked={settings.animations}
                            onCheckedChange={(checked) => onUpdate({ animations: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="sidebar-collapsed">Sidebar Tertutup</Label>
                            <p className="text-sm text-muted-foreground">
                                Mulai dengan sidebar dalam keadaan tertutup
                            </p>
                        </div>
                        <Switch
                            id="sidebar-collapsed"
                            checked={settings.sidebarCollapsed}
                            onCheckedChange={(checked) => onUpdate({ sidebarCollapsed: checked })}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
