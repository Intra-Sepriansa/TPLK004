/**
 * Privacy Settings Component
 * Requirements: 1.5
 */

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Activity, BarChart3 } from 'lucide-react';
import type { PrivacySettings as PrivacySettingsType } from '@/types/settings';

interface PrivacySettingsProps {
    settings: PrivacySettingsType;
    onUpdate: (settings: Partial<PrivacySettingsType>) => void;
}

export function PrivacySettings({ settings, onUpdate }: PrivacySettingsProps) {
    return (
        <div className="space-y-6">
            {/* Profile Visibility */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        <CardTitle>Visibilitas Profil</CardTitle>
                    </div>
                    <CardDescription>
                        Kontrol siapa yang dapat melihat profil Anda
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="profile-visibility">Siapa yang dapat melihat profil</Label>
                        <Select
                            value={settings.profileVisibility}
                            onValueChange={(value) =>
                                onUpdate({ profileVisibility: value as PrivacySettingsType['profileVisibility'] })
                            }
                        >
                            <SelectTrigger id="profile-visibility">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="public">Semua Orang</SelectItem>
                                <SelectItem value="contacts">Hanya Kontak</SelectItem>
                                <SelectItem value="private">Hanya Saya</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                            {settings.profileVisibility === 'public' && 'Semua pengguna dapat melihat profil Anda'}
                            {settings.profileVisibility === 'contacts' && 'Hanya dosen/mahasiswa di kelas yang sama'}
                            {settings.profileVisibility === 'private' && 'Profil Anda tersembunyi dari pengguna lain'}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Activity Status */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        <CardTitle>Status Aktivitas</CardTitle>
                    </div>
                    <CardDescription>
                        Kontrol informasi aktivitas yang ditampilkan
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="online-status">Tampilkan Status Online</Label>
                            <p className="text-sm text-muted-foreground">
                                Orang lain dapat melihat kapan Anda sedang online
                            </p>
                        </div>
                        <Switch
                            id="online-status"
                            checked={settings.showOnlineStatus}
                            onCheckedChange={(checked) => onUpdate({ showOnlineStatus: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="activity-status">Tampilkan Status Aktivitas</Label>
                            <p className="text-sm text-muted-foreground">
                                Orang lain dapat melihat aktivitas terakhir Anda
                            </p>
                        </div>
                        <Switch
                            id="activity-status"
                            checked={settings.showActivityStatus}
                            onCheckedChange={(checked) => onUpdate({ showActivityStatus: checked })}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Data Collection */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        <CardTitle>Pengumpulan Data</CardTitle>
                    </div>
                    <CardDescription>
                        Kontrol data yang dikumpulkan untuk meningkatkan layanan
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="data-collection">Izinkan Pengumpulan Data Anonim</Label>
                            <p className="text-sm text-muted-foreground">
                                Bantu kami meningkatkan aplikasi dengan data penggunaan anonim
                            </p>
                        </div>
                        <Switch
                            id="data-collection"
                            checked={settings.allowDataCollection}
                            onCheckedChange={(checked) => onUpdate({ allowDataCollection: checked })}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
