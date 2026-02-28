/**
 * Privacy Settings Component
 * Requirements: 1.5
 */

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { PrivacySettings as PrivacySettingsType } from '@/types/settings';
import { Activity, BarChart3, Eye } from 'lucide-react';

interface PrivacySettingsProps {
    settings: PrivacySettingsType;
    onUpdate: (settings: Partial<PrivacySettingsType>) => void;
}

export function PrivacySettings({ settings, onUpdate }: PrivacySettingsProps) {
    return (
        <div className="space-y-6">
            {/* Profile Visibility */}
            <Card className="rounded-3xl border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/40">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                            <Eye className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-neutral-900 dark:text-white">
                            Visibilitas Profil
                        </CardTitle>
                    </div>
                    <CardDescription className="text-neutral-500 dark:text-neutral-400">
                        Kontrol siapa yang dapat melihat profil Anda
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="profile-visibility">
                            Siapa yang dapat melihat profil
                        </Label>
                        <Select
                            value={settings.profileVisibility}
                            onValueChange={(value) =>
                                onUpdate({
                                    profileVisibility:
                                        value as PrivacySettingsType['profileVisibility'],
                                })
                            }
                        >
                            <SelectTrigger
                                id="profile-visibility"
                                className="border-white/20 bg-white/60 dark:border-white/10 dark:bg-neutral-900/60"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="public">
                                    Semua Orang
                                </SelectItem>
                                <SelectItem value="contacts">
                                    Hanya Kontak
                                </SelectItem>
                                <SelectItem value="private">
                                    Hanya Saya
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                            {settings.profileVisibility === 'public' &&
                                'Semua pengguna dapat melihat profil Anda'}
                            {settings.profileVisibility === 'contacts' &&
                                'Hanya dosen/mahasiswa di kelas yang sama'}
                            {settings.profileVisibility === 'private' &&
                                'Profil Anda tersembunyi dari pengguna lain'}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Activity Status */}
            <Card className="rounded-3xl border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/40">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                            <Activity className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-neutral-900 dark:text-white">
                            Status Aktivitas
                        </CardTitle>
                    </div>
                    <CardDescription className="text-neutral-500 dark:text-neutral-400">
                        Kontrol informasi aktivitas yang ditampilkan
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="online-status">
                                Tampilkan Status Online
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Orang lain dapat melihat kapan Anda sedang
                                online
                            </p>
                        </div>
                        <Switch
                            id="online-status"
                            checked={settings.showOnlineStatus}
                            onCheckedChange={(checked) =>
                                onUpdate({ showOnlineStatus: checked })
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="activity-status">
                                Tampilkan Status Aktivitas
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Orang lain dapat melihat aktivitas terakhir Anda
                            </p>
                        </div>
                        <Switch
                            id="activity-status"
                            checked={settings.showActivityStatus}
                            onCheckedChange={(checked) =>
                                onUpdate({ showActivityStatus: checked })
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Data Collection */}
            <Card className="rounded-3xl border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/40">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-amber-500/30">
                            <BarChart3 className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-neutral-900 dark:text-white">
                            Pengumpulan Data
                        </CardTitle>
                    </div>
                    <CardDescription className="text-neutral-500 dark:text-neutral-400">
                        Kontrol data yang dikumpulkan untuk meningkatkan layanan
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="data-collection">
                                Izinkan Pengumpulan Data Anonim
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Bantu kami meningkatkan aplikasi dengan data
                                penggunaan anonim
                            </p>
                        </div>
                        <Switch
                            id="data-collection"
                            checked={settings.allowDataCollection}
                            onCheckedChange={(checked) =>
                                onUpdate({ allowDataCollection: checked })
                            }
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
