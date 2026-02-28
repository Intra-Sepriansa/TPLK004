/**
 * Data Management Settings Component
 * Advanced UI with animations and better UX
 */

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
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type {
    DataManagementSettings as DataManagementSettingsType,
    StorageUsage,
} from '@/types/settings';
import { AnimatePresence, motion } from 'framer-motion';
import {
    CheckCircle,
    Database,
    Download,
    HardDrive,
    RefreshCw,
    Trash2,
    Upload,
} from 'lucide-react';
import { useState } from 'react';

interface DataManagementSettingsProps {
    settings: DataManagementSettingsType;
    onUpdate: (settings: Partial<DataManagementSettingsType>) => void;
    storageUsage?: StorageUsage;
    onClearCache?: () => Promise<void>;
    onExportSettings?: () => void;
    onImportSettings?: (file: File) => Promise<void>;
}

function formatBytes(bytes: number): string {
    // Handle invalid inputs
    if (!bytes || bytes === 0 || isNaN(bytes)) return '0 B';

    // Ensure bytes is a positive number
    const absoluteBytes = Math.abs(bytes);

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(absoluteBytes) / Math.log(k));

    // Ensure index is within bounds
    const sizeIndex = Math.min(i, sizes.length - 1);

    const value = absoluteBytes / Math.pow(k, sizeIndex);
    const formattedValue = value < 10 ? value.toFixed(2) : value.toFixed(1);

    return `${formattedValue} ${sizes[sizeIndex]}`;
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
    const [clearSuccess, setClearSuccess] = useState(false);

    // Provide default values if settings is undefined
    const safeSettings = settings || {
        autoBackup: true,
        backupFrequency: 'weekly' as const,
        cacheEnabled: true,
        offlineMode: false,
    };

    const handleClearCache = async () => {
        if (!onClearCache) return;
        setIsClearing(true);
        try {
            await onClearCache();
            setClearSuccess(true);
            setTimeout(() => setClearSuccess(false), 3000);
        } catch (error) {
            console.error('Failed to clear cache:', error);
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
        } catch (error) {
            console.error('Failed to import settings:', error);
        } finally {
            setIsImporting(false);
            e.target.value = '';
        }
    };

    const usagePercentage =
        storageUsage && storageUsage.total > 0
            ? Math.min(
                  100,
                  Math.max(
                      0,
                      Math.round(
                          (storageUsage.used / storageUsage.total) * 100,
                      ),
                  ),
              )
            : 0;

    const getUsageColor = (percentage: number) => {
        if (isNaN(percentage) || percentage < 0) return 'text-gray-500';
        if (percentage >= 90) return 'text-red-500';
        if (percentage >= 70) return 'text-orange-500';
        return 'text-green-500';
    };

    return (
        <div className="space-y-6">
            {/* Storage Usage */}
            {storageUsage && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="rounded-3xl border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/40">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <motion.div
                                    whileHover={{ rotate: 10, scale: 1.1 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 400,
                                    }}
                                >
                                    <HardDrive className="h-5 w-5 text-indigo-500" />
                                </motion.div>
                                <CardTitle>Penggunaan Penyimpanan</CardTitle>
                            </div>
                            <CardDescription>
                                Lihat berapa banyak ruang yang digunakan
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Terpakai
                                    </span>
                                    <span
                                        className={`font-semibold ${getUsageColor(usagePercentage)}`}
                                    >
                                        {formatBytes(storageUsage.used)} /{' '}
                                        {formatBytes(storageUsage.total)}
                                    </span>
                                </div>
                                <Progress
                                    value={usagePercentage}
                                    className="h-3"
                                />
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <span>0%</span>
                                    <span className="font-medium">
                                        {usagePercentage}%
                                    </span>
                                    <span>100%</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 pt-2">
                                <motion.div
                                    className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center dark:border-blue-800 dark:bg-blue-900/20"
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 400,
                                    }}
                                >
                                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                        {formatBytes(
                                            storageUsage.breakdown.documents,
                                        )}
                                    </div>
                                    <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                                        Dokumen
                                    </div>
                                </motion.div>
                                <motion.div
                                    className="rounded-xl border border-purple-200 bg-purple-50 p-4 text-center dark:border-purple-800 dark:bg-purple-900/20"
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 400,
                                    }}
                                >
                                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                        {formatBytes(
                                            storageUsage.breakdown.cache,
                                        )}
                                    </div>
                                    <div className="mt-1 text-xs text-purple-600 dark:text-purple-400">
                                        Cache
                                    </div>
                                </motion.div>
                                <motion.div
                                    className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-800 dark:bg-gray-900/20"
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 400,
                                    }}
                                >
                                    <div className="text-lg font-bold text-gray-600 dark:text-gray-400">
                                        {formatBytes(
                                            storageUsage.breakdown.other,
                                        )}
                                    </div>
                                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                        Lainnya
                                    </div>
                                </motion.div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Backup Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="rounded-3xl border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/40">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <motion.div
                                whileHover={{ rotate: 10, scale: 1.1 }}
                                transition={{ type: 'spring', stiffness: 400 }}
                            >
                                <Database className="h-5 w-5 text-green-500" />
                            </motion.div>
                            <CardTitle>Pengaturan Backup</CardTitle>
                        </div>
                        <CardDescription>
                            Atur backup otomatis untuk data Anda
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50">
                            <div>
                                <Label
                                    htmlFor="auto-backup"
                                    className="cursor-pointer"
                                >
                                    Backup Otomatis
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Backup pengaturan secara otomatis
                                </p>
                            </div>
                            <Switch
                                id="auto-backup"
                                checked={safeSettings.autoBackup}
                                onCheckedChange={(checked) =>
                                    onUpdate({ autoBackup: checked })
                                }
                            />
                        </div>

                        <AnimatePresence>
                            {safeSettings.autoBackup && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-2 border-l-2 border-green-500 pl-3"
                                >
                                    <Label htmlFor="backup-frequency">
                                        Frekuensi Backup
                                    </Label>
                                    <Select
                                        value={safeSettings.backupFrequency}
                                        onValueChange={(value) =>
                                            onUpdate({
                                                backupFrequency:
                                                    value as DataManagementSettingsType['backupFrequency'],
                                            })
                                        }
                                    >
                                        <SelectTrigger id="backup-frequency">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">
                                                Harian
                                            </SelectItem>
                                            <SelectItem value="weekly">
                                                Mingguan
                                            </SelectItem>
                                            <SelectItem value="monthly">
                                                Bulanan
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Cache & Offline */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="rounded-3xl border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/40">
                    <CardHeader>
                        <CardTitle>Cache & Mode Offline</CardTitle>
                        <CardDescription>
                            Kelola cache dan akses offline
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50">
                            <div>
                                <Label
                                    htmlFor="cache-enabled"
                                    className="cursor-pointer"
                                >
                                    Aktifkan Cache
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Simpan data sementara untuk akses lebih
                                    cepat
                                </p>
                            </div>
                            <Switch
                                id="cache-enabled"
                                checked={safeSettings.cacheEnabled}
                                onCheckedChange={(checked) =>
                                    onUpdate({ cacheEnabled: checked })
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50">
                            <div>
                                <Label
                                    htmlFor="offline-mode"
                                    className="cursor-pointer"
                                >
                                    Mode Offline
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Akses fitur dasar tanpa koneksi internet
                                </p>
                            </div>
                            <Switch
                                id="offline-mode"
                                checked={safeSettings.offlineMode}
                                onCheckedChange={(checked) =>
                                    onUpdate({ offlineMode: checked })
                                }
                            />
                        </div>

                        {onClearCache && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            variant="outline"
                                            className="w-full border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-800 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                                            disabled={
                                                isClearing || clearSuccess
                                            }
                                        >
                                            {clearSuccess ? (
                                                <>
                                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                    Cache Dibersihkan
                                                </>
                                            ) : isClearing ? (
                                                <>
                                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                    Membersihkan...
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Bersihkan Cache
                                                </>
                                            )}
                                        </Button>
                                    </motion.div>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Bersihkan Cache?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Ini akan menghapus semua data cache.
                                            Anda mungkin perlu memuat ulang
                                            beberapa data.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Batal
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleClearCache}
                                        >
                                            Bersihkan
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Export/Import */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="rounded-3xl border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/40">
                    <CardHeader>
                        <CardTitle>Ekspor & Impor Pengaturan</CardTitle>
                        <CardDescription>
                            Backup atau restore pengaturan Anda
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {onExportSettings && (
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    variant="outline"
                                    className="w-full border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-blue-800 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                                    onClick={onExportSettings}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Ekspor Pengaturan
                                </Button>
                            </motion.div>
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
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full border-green-200 hover:bg-green-50 hover:text-green-600 dark:border-green-800 dark:hover:bg-green-900/20 dark:hover:text-green-400"
                                        onClick={() =>
                                            document
                                                .getElementById(
                                                    'import-settings',
                                                )
                                                ?.click()
                                        }
                                        disabled={isImporting}
                                    >
                                        {isImporting ? (
                                            <>
                                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                Mengimpor...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="mr-2 h-4 w-4" />
                                                Impor Pengaturan
                                            </>
                                        )}
                                    </Button>
                                </motion.div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
