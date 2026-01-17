/**
 * Data Management Settings Component
 * Requirements: 1.7
 */

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Database, HardDrive, Download, Upload, Trash2, RefreshCw } from 'lucide-react';
import type { DataManagementSettings as DataManagementSettingsType, StorageUsage } from '@/types/settings';

interface DataManagementSettingsProps {
    settings: DataManagementSettingsType;
    onUpdate: (settings: Partial<DataManagementSettingsType>) => void;
    storageUsage?: StorageUsage;
    onClearCache?: () => Promise<void>;
    onExportSettings?: () => void;
    onImportSettings?: (file: File) => Promise<void>;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function DataManagementSettings({
    settings,
    onUpdate,
    storageUsage,
    onClearCache,
    onExportSettings,
    onImportSettings,
}: DataManagementSettingsProps) {
    const [isClearing, setIsClearing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const handleClearCache = async () => {
        if (!onClearCache) return;
        setIsClearing(true);
        try {
            await onClearCache();
        } finally {
            setIsClearing(false);
        }
    };

    const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !onImportSettings) return;
        
        setIsImporting(true);
        try {
            await onImportSettings(file);
        } finally {
            setIsImporting(false);
            e.target.value = '';
        }
    };

    const usagePercentage = storageUsage
        ? Math.round((storageUsage.used / storageUsage.total) * 100)
        : 0;

    return (
        <div className="space-y-6">
            {/* Storage Usage */}
            {storageUsage && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <HardDrive className="h-5 w-5" />
                            <CardTitle>Penggunaan Penyimpanan</CardTitle>
                        </div>
                        <CardDescription>
                            Lihat berapa banyak ruang yang digunakan
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Terpakai</span>
                                <span>
                                    {formatBytes(storageUsage.used)} / {formatBytes(storageUsage.total)}
                                </span>
                            </div>
                            <Progress value={usagePercentage} />
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-2">
                            <div className="text-center p-3 rounded-lg bg-muted">
                                <div className="text-lg font-semibold">
                                    {formatBytes(storageUsage.breakdown.documents)}
                                </div>
                                <div className="text-xs text-muted-foreground">Dokumen</div>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-muted">
                                <div className="text-lg font-semibold">
                                    {formatBytes(storageUsage.breakdown.cache)}
                                </div>
                                <div className="text-xs text-muted-foreground">Cache</div>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-muted">
                                <div className="text-lg font-semibold">
                                    {formatBytes(storageUsage.breakdown.other)}
                                </div>
                                <div className="text-xs text-muted-foreground">Lainnya</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Backup Settings */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        <CardTitle>Pengaturan Backup</CardTitle>
                    </div>
                    <CardDescription>
                        Atur backup otomatis untuk data Anda
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="auto-backup">Backup Otomatis</Label>
                            <p className="text-sm text-muted-foreground">
                                Backup pengaturan secara otomatis
                            </p>
                        </div>
                        <Switch
                            id="auto-backup"
                            checked={settings.autoBackup}
                            onCheckedChange={(checked) => onUpdate({ autoBackup: checked })}
                        />
                    </div>

                    {settings.autoBackup && (
                        <div className="space-y-2">
                            <Label htmlFor="backup-frequency">Frekuensi Backup</Label>
                            <Select
                                value={settings.backupFrequency}
                                onValueChange={(value) =>
                                    onUpdate({ backupFrequency: value as DataManagementSettingsType['backupFrequency'] })
                                }
                            >
                                <SelectTrigger id="backup-frequency">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Harian</SelectItem>
                                    <SelectItem value="weekly">Mingguan</SelectItem>
                                    <SelectItem value="monthly">Bulanan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Cache & Offline */}
            <Card>
                <CardHeader>
                    <CardTitle>Cache & Mode Offline</CardTitle>
                    <CardDescription>
                        Kelola cache dan akses offline
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="cache-enabled">Aktifkan Cache</Label>
                            <p className="text-sm text-muted-foreground">
                                Simpan data sementara untuk akses lebih cepat
                            </p>
                        </div>
                        <Switch
                            id="cache-enabled"
                            checked={settings.cacheEnabled}
                            onCheckedChange={(checked) => onUpdate({ cacheEnabled: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="offline-mode">Mode Offline</Label>
                            <p className="text-sm text-muted-foreground">
                                Akses fitur dasar tanpa koneksi internet
                            </p>
                        </div>
                        <Switch
                            id="offline-mode"
                            checked={settings.offlineMode}
                            onCheckedChange={(checked) => onUpdate({ offlineMode: checked })}
                        />
                    </div>

                    {onClearCache && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" className="w-full" disabled={isClearing}>
                                    {isClearing ? (
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4 mr-2" />
                                    )}
                                    Bersihkan Cache
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Bersihkan Cache?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Ini akan menghapus semua data cache. Anda mungkin perlu
                                        memuat ulang beberapa data.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleClearCache}>
                                        Bersihkan
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </CardContent>
            </Card>

            {/* Export/Import */}
            <Card>
                <CardHeader>
                    <CardTitle>Ekspor & Impor Pengaturan</CardTitle>
                    <CardDescription>
                        Backup atau restore pengaturan Anda
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {onExportSettings && (
                        <Button variant="outline" className="w-full" onClick={onExportSettings}>
                            <Download className="h-4 w-4 mr-2" />
                            Ekspor Pengaturan
                        </Button>
                    )}

                    {onImportSettings && (
                        <div>
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleFileImport}
                                className="hidden"
                                id="import-settings"
                                disabled={isImporting}
                            />
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => document.getElementById('import-settings')?.click()}
                                disabled={isImporting}
                            >
                                {isImporting ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Upload className="h-4 w-4 mr-2" />
                                )}
                                Impor Pengaturan
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
