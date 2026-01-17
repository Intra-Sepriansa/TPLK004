/**
 * General Settings Component
 * Requirements: 1.1
 */

import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { GeneralSettings as GeneralSettingsType } from '@/types/settings';

interface GeneralSettingsProps {
    settings: GeneralSettingsType;
    onUpdate: (settings: Partial<GeneralSettingsType>) => void;
}

const timezones = [
    { value: 'Asia/Jakarta', label: 'WIB (Jakarta)' },
    { value: 'Asia/Makassar', label: 'WITA (Makassar)' },
    { value: 'Asia/Jayapura', label: 'WIT (Jayapura)' },
];

const dateFormats = [
    { value: 'DD/MM/YYYY', label: '31/12/2024' },
    { value: 'MM/DD/YYYY', label: '12/31/2024' },
    { value: 'YYYY-MM-DD', label: '2024-12-31' },
];

export function GeneralSettings({ settings, onUpdate }: GeneralSettingsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Pengaturan Umum</CardTitle>
                <CardDescription>
                    Atur preferensi bahasa, zona waktu, dan format tampilan
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="language">Bahasa</Label>
                    <Select
                        value={settings.language}
                        onValueChange={(value) => onUpdate({ language: value as 'id' | 'en' })}
                    >
                        <SelectTrigger id="language">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="id">Bahasa Indonesia</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="timezone">Zona Waktu</Label>
                    <Select
                        value={settings.timezone}
                        onValueChange={(value) => onUpdate({ timezone: value })}
                    >
                        <SelectTrigger id="timezone">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {timezones.map((tz) => (
                                <SelectItem key={tz.value} value={tz.value}>
                                    {tz.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dateFormat">Format Tanggal</Label>
                    <Select
                        value={settings.dateFormat}
                        onValueChange={(value) =>
                            onUpdate({ dateFormat: value as GeneralSettingsType['dateFormat'] })
                        }
                    >
                        <SelectTrigger id="dateFormat">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {dateFormats.map((fmt) => (
                                <SelectItem key={fmt.value} value={fmt.value}>
                                    {fmt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="timeFormat">Format Waktu</Label>
                    <Select
                        value={settings.timeFormat}
                        onValueChange={(value) =>
                            onUpdate({ timeFormat: value as '12h' | '24h' })
                        }
                    >
                        <SelectTrigger id="timeFormat">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="24h">24 Jam (14:30)</SelectItem>
                            <SelectItem value="12h">12 Jam (2:30 PM)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="startOfWeek">Awal Minggu</Label>
                    <Select
                        value={settings.startOfWeek}
                        onValueChange={(value) =>
                            onUpdate({ startOfWeek: value as 'sunday' | 'monday' })
                        }
                    >
                        <SelectTrigger id="startOfWeek">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="monday">Senin</SelectItem>
                            <SelectItem value="sunday">Minggu</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
}
