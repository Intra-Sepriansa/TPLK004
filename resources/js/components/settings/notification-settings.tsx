/**
 * Notification Settings Component
 * Requirements: 1.3
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
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import type { NotificationSettings as NotificationSettingsType } from '@/types/settings';
import { Bell, Mail, Smartphone } from 'lucide-react';

interface NotificationSettingsProps {
    settings: NotificationSettingsType;
    onUpdate: (settings: Partial<NotificationSettingsType>) => void;
}

export function NotificationSettings({
    settings,
    onUpdate,
}: NotificationSettingsProps) {
    const updateEmail = (
        updates: Partial<NotificationSettingsType['email']>,
    ) => {
        onUpdate({ email: { ...settings.email, ...updates } });
    };

    const updatePush = (updates: Partial<NotificationSettingsType['push']>) => {
        onUpdate({ push: { ...settings.push, ...updates } });
    };

    const updateInApp = (
        updates: Partial<NotificationSettingsType['inApp']>,
    ) => {
        onUpdate({ inApp: { ...settings.inApp, ...updates } });
    };

    return (
        <div className="space-y-6">
            {/* Email Notifications */}
            <Card className="rounded-3xl border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/40">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 text-white shadow-lg shadow-indigo-500/30">
                            <Mail className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-neutral-900 dark:text-white">
                            Notifikasi Email
                        </CardTitle>
                    </div>
                    <CardDescription className="text-neutral-500 dark:text-neutral-400">
                        Atur notifikasi yang dikirim ke email Anda
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="email-enabled">
                            Aktifkan Notifikasi Email
                        </Label>
                        <Switch
                            id="email-enabled"
                            checked={settings.email.enabled}
                            onCheckedChange={(checked) =>
                                updateEmail({ enabled: checked })
                            }
                        />
                    </div>

                    {settings.email.enabled && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <Label htmlFor="email-digest">
                                    Frekuensi Ringkasan
                                </Label>
                                <Select
                                    value={settings.email.digest}
                                    onValueChange={(value) =>
                                        updateEmail({
                                            digest: value as NotificationSettingsType['email']['digest'],
                                        })
                                    }
                                >
                                    <SelectTrigger
                                        id="email-digest"
                                        className="border-white/20 bg-white/60 dark:border-white/10 dark:bg-neutral-900/60"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="instant">
                                            Langsung
                                        </SelectItem>
                                        <SelectItem value="daily">
                                            Harian
                                        </SelectItem>
                                        <SelectItem value="weekly">
                                            Mingguan
                                        </SelectItem>
                                        <SelectItem value="never">
                                            Tidak Pernah
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="email-attendance">
                                        Absensi
                                    </Label>
                                    <Switch
                                        id="email-attendance"
                                        checked={settings.email.attendance}
                                        onCheckedChange={(checked) =>
                                            updateEmail({ attendance: checked })
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="email-assignments">
                                        Tugas
                                    </Label>
                                    <Switch
                                        id="email-assignments"
                                        checked={settings.email.assignments}
                                        onCheckedChange={(checked) =>
                                            updateEmail({
                                                assignments: checked,
                                            })
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="email-announcements">
                                        Pengumuman
                                    </Label>
                                    <Switch
                                        id="email-announcements"
                                        checked={settings.email.announcements}
                                        onCheckedChange={(checked) =>
                                            updateEmail({
                                                announcements: checked,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Push Notifications */}
            <Card className="rounded-3xl border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/40">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                            <Smartphone className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-neutral-900 dark:text-white">
                            Notifikasi Push
                        </CardTitle>
                    </div>
                    <CardDescription className="text-neutral-500 dark:text-neutral-400">
                        Atur notifikasi push ke perangkat Anda
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="push-enabled">
                            Aktifkan Notifikasi Push
                        </Label>
                        <Switch
                            id="push-enabled"
                            checked={settings.push.enabled}
                            onCheckedChange={(checked) =>
                                updatePush({ enabled: checked })
                            }
                        />
                    </div>

                    {settings.push.enabled && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="push-attendance">
                                        Absensi
                                    </Label>
                                    <Switch
                                        id="push-attendance"
                                        checked={settings.push.attendance}
                                        onCheckedChange={(checked) =>
                                            updatePush({ attendance: checked })
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="push-assignments">
                                        Tugas
                                    </Label>
                                    <Switch
                                        id="push-assignments"
                                        checked={settings.push.assignments}
                                        onCheckedChange={(checked) =>
                                            updatePush({ assignments: checked })
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="push-reminders">
                                        Pengingat
                                    </Label>
                                    <Switch
                                        id="push-reminders"
                                        checked={settings.push.reminders}
                                        onCheckedChange={(checked) =>
                                            updatePush({ reminders: checked })
                                        }
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* In-App Notifications */}
            <Card className="rounded-3xl border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/40">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-400 to-pink-600 text-white shadow-lg shadow-fuchsia-500/30">
                            <Bell className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-neutral-900 dark:text-white">
                            Notifikasi Dalam Aplikasi
                        </CardTitle>
                    </div>
                    <CardDescription className="text-neutral-500 dark:text-neutral-400">
                        Atur notifikasi yang muncul di dalam aplikasi
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="inapp-enabled">
                            Aktifkan Notifikasi In-App
                        </Label>
                        <Switch
                            id="inapp-enabled"
                            checked={settings.inApp.enabled}
                            onCheckedChange={(checked) =>
                                updateInApp({ enabled: checked })
                            }
                        />
                    </div>

                    {settings.inApp.enabled && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="inapp-sound">
                                        Suara Notifikasi
                                    </Label>
                                    <Switch
                                        id="inapp-sound"
                                        checked={settings.inApp.sound}
                                        onCheckedChange={(checked) =>
                                            updateInApp({ sound: checked })
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="inapp-desktop">
                                        Notifikasi Desktop
                                    </Label>
                                    <Switch
                                        id="inapp-desktop"
                                        checked={settings.inApp.desktop}
                                        onCheckedChange={(checked) =>
                                            updateInApp({ desktop: checked })
                                        }
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
