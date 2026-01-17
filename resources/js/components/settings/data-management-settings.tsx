/**
 * Data Management Settings Component
 * Advanced UI with animations and better UX
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Database, HardDrive, Download, Upload, Trash2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
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

    const usagePercentage = storageUsage
        ? Math.round((storageUsage.used / storageUsage.total) * 100)
        : 0;

    const getUsageColor = (percentage: number) => {
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
                    transition={{ duration: 0.3 }}
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <motion.div
                                    whileHover={{ rotate: 10, scale: 1.1 }}
                                    transition={{ type: "spring", stiffness: 400 }}
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
                                    <span className="text-gray-600 dark:text-gray-400">Terpakai</span>
                                    <span className={`font-semibold ${getUsageColor(usagePercentage)}`}>
                                        {formatBytes(storageUsage.used)} / {formatBytes(storageUsage.total)}
                                    </span>
                                </div>
                                <Progress value={usagePercentage} className="h-3" />
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <span>0%</span>
                                    <span className="font-medium">{usagePercentage}%</span>
                                    <span>100%</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 pt-2">
                                <motion.div 
                                    className="text-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                >
                                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                        {formatBytes(storageUsage.breakdown.documents)}
                                    </div>
                                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Dokumen</div>
                                </motion.div>
                                <motion.div 
                                    className="text-center p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800"
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                >
                                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                        {formatBytes(storageUsage.breakdown.cache)}
                                    </div>
                                    <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">Cache</div>
                                </motion.div>
                                <motion.div 
                                    className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800"
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                >
                                    <div className="text-lg font-bold text-gray-600 dark:text-gray-400">
                                        {formatBytes(storageUsage.breakdown.other)}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Lainnya</div>
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
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <motion.div
                                whileHover={{ rotate: 10, scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 400 }}
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
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                            <div>
                                <Label htmlFor="auto-backup" className="cursor-pointer">Backup Otomatis</Label>
                                <p className="text-sm text-muted-foreground">
                                    Backup pengaturan secara otomatis
                                </p>
                            </div>
                            <Switch
                                id="auto-backup"
                                checked={safeSettings.autoBackup}
                                onCheckedChange={(checked) => onUpdate({ autoBackup: checked })}
                            />
                        </div>

                        <AnimatePresence>
                            {safeSettings.autoBackup && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-2 pl-3 border-l-2 border-green-500"
                                >
                                    <Label htmlFor="backup-frequency">Frekuensi Backup</Label>
                                    <Select
                                        value={safeSettings.backupFrequency}
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
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Cache & Mode Offline</CardTitle>
                        <CardDescription>
                            Kelola cache dan akses offline
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                            <div>
                                <Label htmlFor="cache-enabled" className="cursor-pointer">Aktifkan Cache</Label>
                                <p className="text-sm text-muted-foreground">
                                    Simpan data sementara untuk akses lebih cepat
                                </p>
                            </div>
                            <Switch
                                id="cache-enabled"
                                checked={safeSettings.cacheEnabled}
                                onCheckedChange={(checked) => onUpdate({ cacheEnabled: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                            <div>
                                <Label htmlFor="offline-mode" className="cursor-pointer">Mode Offline</Label>
                                <p className="text-sm text-muted-foreground">
                                    Akses fitur dasar tanpa koneksi internet
                                </p>
                            </div>
                            <Switch
                                id="offline-mode"
                                checked={safeSettings.offlineMode}
                                onCheckedChange={(checked) => onUpdate({ offlineMode: checked })}
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
                                            className="w-full border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400" 
                                            disabled={isClearing || clearSuccess}
                                        >
                                            {clearSuccess ? (
                                                <>
                                                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                                    Cache Dibersihkan
                                                </>
                                            ) : isClearing ? (
                                                <>
                                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                    Membersihkan...
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Bersihkan Cache
                                                </>
                                            )}
                                        </Button>
                                    </motion.div>
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
            </motion.div>

            {/* Export/Import */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
            >
                <Card>
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
                                    className="w-full border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400" 
                                    onClick={onExportSettings}
                                >
                                    <Download className="h-4 w-4 mr-2" />
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
                                        className="w-full border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400"
                                        onClick={() => document.getElementById('import-settings')?.click()}
                                        disabled={isImporting}
                                    >
                                        {isImporting ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                Mengimpor...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-4 w-4 mr-2" />
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
