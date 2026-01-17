/**
 * Security Settings Component
 * Requirements: 1.6
 */

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Shield, Smartphone, History, LogOut } from 'lucide-react';
import type { SecuritySettings as SecuritySettingsType, ActiveSession, LoginHistoryEntry } from '@/types/settings';

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
    const displayedHistory = showAllHistory ? loginHistory : loginHistory.slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Two-Factor Authentication */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        <CardTitle>Autentikasi Dua Faktor</CardTitle>
                    </div>
                    <CardDescription>
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
                            <Badge variant={settings.twoFactorEnabled ? 'default' : 'secondary'}>
                                {settings.twoFactorEnabled ? 'Aktif' : 'Nonaktif'}
                            </Badge>
                            <Button
                                variant={settings.twoFactorEnabled ? 'outline' : 'default'}
                                size="sm"
                                onClick={onSetup2FA}
                            >
                                {settings.twoFactorEnabled ? 'Kelola' : 'Aktifkan'}
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="login-notifications">Notifikasi Login</Label>
                            <p className="text-sm text-muted-foreground">
                                Dapatkan notifikasi saat ada login baru
                            </p>
                        </div>
                        <Switch
                            id="login-notifications"
                            checked={settings.loginNotifications}
                            onCheckedChange={(checked) => onUpdate({ loginNotifications: checked })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="session-timeout">Timeout Sesi</Label>
                        <Select
                            value={settings.sessionTimeout.toString()}
                            onValueChange={(value) => onUpdate({ sessionTimeout: parseInt(value) })}
                        >
                            <SelectTrigger id="session-timeout">
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
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5" />
                        <CardTitle>Sesi Aktif</CardTitle>
                    </div>
                    <CardDescription>
                        Perangkat yang sedang login ke akun Anda
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {activeSessions.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Tidak ada sesi aktif lainnya
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {activeSessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="flex items-center justify-between p-3 rounded-lg border"
                                >
                                    <div className="flex items-center gap-3">
                                        <Smartphone className="h-8 w-8 text-muted-foreground" />
                                        <div>
                                            <div className="font-medium flex items-center gap-2">
                                                {session.device} - {session.browser}
                                                {session.isCurrent && (
                                                    <Badge variant="outline" className="text-xs">
                                                        Sesi Ini
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {session.ip} {session.location && `• ${session.location}`}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Aktif terakhir: {session.lastActive}
                                            </div>
                                        </div>
                                    </div>
                                    {!session.isCurrent && onTerminateSession && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onTerminateSession(session.id)}
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
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        <CardTitle>Riwayat Login</CardTitle>
                    </div>
                    <CardDescription>
                        Aktivitas login terbaru ke akun Anda
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loginHistory.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Belum ada riwayat login
                        </p>
                    ) : (
                        <>
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
                                                <div className="font-medium">{entry.device}</div>
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
                                                <Badge variant={entry.success ? 'default' : 'destructive'}>
                                                    {entry.success ? 'Berhasil' : 'Gagal'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {loginHistory.length > 5 && (
                                <Button
                                    variant="ghost"
                                    className="w-full mt-2"
                                    onClick={() => setShowAllHistory(!showAllHistory)}
                                >
                                    {showAllHistory ? 'Tampilkan Lebih Sedikit' : 'Tampilkan Semua'}
                                </Button>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
