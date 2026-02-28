/**
 * Security Settings Component
 * Requirements: 1.6
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type {
    ActiveSession,
    LoginHistoryEntry,
    SecuritySettings as SecuritySettingsType,
} from '@/types/settings';
import { History, LogOut, Shield, Smartphone } from 'lucide-react';
import { useState } from 'react';

interface SecuritySettingsProps {
    settings: SecuritySettingsType;
    onUpdate: (settings: Partial<SecuritySettingsType>) => void;
    activeSessions?: ActiveSession[];
    loginHistory?: LoginHistoryEntry[];
    onTerminateSession?: (sessionId: string) => void;
    onSetup2FA?: () => void;
}

export function SecuritySettings({
    settings,
    onUpdate,
    activeSessions = [],
    loginHistory = [],
    onTerminateSession,
    onSetup2FA,
}: SecuritySettingsProps) {
    const [showAllHistory, setShowAllHistory] = useState(false);
    const displayedHistory = showAllHistory
        ? loginHistory
        : loginHistory.slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Two-Factor Authentication */}
            <Card className="rounded-3xl border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/40">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                            <Shield className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-neutral-900 dark:text-white">
                            Autentikasi Dua Faktor
                        </CardTitle>
                    </div>
                    <CardDescription className="text-neutral-500 dark:text-neutral-400">
                        Tambahkan lapisan keamanan ekstra ke akun Anda
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div>
                                <Label>Status 2FA</Label>
                                <p className="text-sm text-muted-foreground">
                                    {settings.twoFactorEnabled
                                        ? 'Akun Anda dilindungi dengan 2FA'
                                        : 'Aktifkan untuk keamanan tambahan'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge
                                variant={
                                    settings.twoFactorEnabled
                                        ? 'default'
                                        : 'secondary'
                                }
                            >
                                {settings.twoFactorEnabled
                                    ? 'Aktif'
                                    : 'Nonaktif'}
                            </Badge>
                            <Button
                                variant={
                                    settings.twoFactorEnabled
                                        ? 'outline'
                                        : 'default'
                                }
                                size="sm"
                                onClick={onSetup2FA}
                            >
                                {settings.twoFactorEnabled
                                    ? 'Kelola'
                                    : 'Aktifkan'}
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="login-notifications">
                                Notifikasi Login
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Dapatkan notifikasi saat ada login baru
                            </p>
                        </div>
                        <Switch
                            id="login-notifications"
                            checked={settings.loginNotifications}
                            onCheckedChange={(checked) =>
                                onUpdate({ loginNotifications: checked })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="session-timeout">Timeout Sesi</Label>
                        <Select
                            value={settings.sessionTimeout.toString()}
                            onValueChange={(value) =>
                                onUpdate({ sessionTimeout: parseInt(value) })
                            }
                        >
                            <SelectTrigger
                                id="session-timeout"
                                className="border-white/20 bg-white/60 dark:border-white/10 dark:bg-neutral-900/60"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="15">15 menit</SelectItem>
                                <SelectItem value="30">30 menit</SelectItem>
                                <SelectItem value="60">1 jam</SelectItem>
                                <SelectItem value="120">2 jam</SelectItem>
                                <SelectItem value="480">8 jam</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                            Anda akan logout otomatis setelah tidak aktif
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Active Sessions */}
            <Card className="rounded-3xl border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/40">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                            <Smartphone className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-neutral-900 dark:text-white">
                            Sesi Aktif
                        </CardTitle>
                    </div>
                    <CardDescription className="text-neutral-500 dark:text-neutral-400">
                        Perangkat yang sedang login ke akun Anda
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {activeSessions.length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                            Tidak ada sesi aktif lainnya
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {activeSessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/20 bg-white/50 p-3 dark:border-white/10 dark:bg-neutral-900/60"
                                >
                                    <div className="flex items-center gap-3">
                                        <Smartphone className="h-8 w-8 text-muted-foreground" />
                                        <div>
                                            <div className="flex items-center gap-2 font-medium">
                                                {session.device} -{' '}
                                                {session.browser}
                                                {session.isCurrent && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        Sesi Ini
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {session.ip}{' '}
                                                {session.location &&
                                                    `• ${session.location}`}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Aktif terakhir:{' '}
                                                {session.lastActive}
                                            </div>
                                        </div>
                                    </div>
                                    {!session.isCurrent &&
                                        onTerminateSession && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    onTerminateSession(
                                                        session.id,
                                                    )
                                                }
                                            >
                                                <LogOut className="h-4 w-4" />
                                            </Button>
                                        )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Login History */}
            <Card className="rounded-3xl border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/40">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-amber-500/30">
                            <History className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-neutral-900 dark:text-white">
                            Riwayat Login
                        </CardTitle>
                    </div>
                    <CardDescription className="text-neutral-500 dark:text-neutral-400">
                        Aktivitas login terbaru ke akun Anda
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loginHistory.length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                            Belum ada riwayat login
                        </p>
                    ) : (
                        <>
                            <div className="overflow-x-auto rounded-2xl border border-white/20 dark:border-white/10">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Perangkat</TableHead>
                                            <TableHead>IP</TableHead>
                                            <TableHead>Waktu</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {displayedHistory.map((entry) => (
                                            <TableRow key={entry.id}>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {entry.device}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {entry.browser}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>{entry.ip}</div>
                                                    {entry.location && (
                                                        <div className="text-sm text-muted-foreground">
                                                            {entry.location}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {entry.loginAt}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            entry.success
                                                                ? 'default'
                                                                : 'destructive'
                                                        }
                                                    >
                                                        {entry.success
                                                            ? 'Berhasil'
                                                            : 'Gagal'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {loginHistory.length > 5 && (
                                <Button
                                    variant="outline"
                                    className="mt-3 w-full border-white/20 bg-white/50 dark:border-white/10 dark:bg-neutral-900/50"
                                    onClick={() =>
                                        setShowAllHistory(!showAllHistory)
                                    }
                                >
                                    {showAllHistory
                                        ? 'Tampilkan Lebih Sedikit'
                                        : 'Tampilkan Semua'}
                                </Button>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
