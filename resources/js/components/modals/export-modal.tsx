import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, FileSpreadsheet, FileText, X } from 'lucide-react';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (format: 'pdf' | 'excel') => void;
    isExporting: boolean;
}

export function ExportModal({
    isOpen,
    onClose,
    onExport,
    isExporting,
}: ExportModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-900">
                            {/* Header */}
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    Export Data
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                >
                                    <X className="h-5 w-5 dark:text-neutral-400" />
                                </button>
                            </div>

                            {/* Content */}
                            <p className="mb-6 text-neutral-600 dark:text-neutral-400">
                                Pilih format export untuk data verifikasi selfie
                            </p>

                            {/* Export Options */}
                            <div className="space-y-3">
                                {/* PDF Option */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        onExport('pdf');
                                        onClose();
                                    }}
                                    disabled={isExporting}
                                    className={cn(
                                        'w-full rounded-xl border-2 p-4 transition-all',
                                        'bg-white dark:bg-neutral-800',
                                        'border-neutral-200 dark:border-neutral-700',
                                        'hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20',
                                        'disabled:cursor-not-allowed disabled:opacity-50',
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                                            <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <h3 className="font-semibold text-neutral-900 dark:text-white">
                                                Export to PDF
                                            </h3>
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                Laporan dalam format PDF siap
                                                cetak
                                            </p>
                                        </div>
                                        <Download className="h-5 w-5 text-neutral-400" />
                                    </div>
                                </motion.button>

                                {/* Excel Option */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        onExport('excel');
                                        onClose();
                                    }}
                                    disabled={isExporting}
                                    className={cn(
                                        'w-full rounded-xl border-2 p-4 transition-all',
                                        'bg-white dark:bg-neutral-800',
                                        'border-neutral-200 dark:border-neutral-700',
                                        'hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20',
                                        'disabled:cursor-not-allowed disabled:opacity-50',
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                                            <FileSpreadsheet className="h-6 w-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <h3 className="font-semibold text-neutral-900 dark:text-white">
                                                Export to Excel
                                            </h3>
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                Data dalam format Excel untuk
                                                analisis
                                            </p>
                                        </div>
                                        <Download className="h-5 w-5 text-neutral-400" />
                                    </div>
                                </motion.button>
                            </div>

                            {/* Cancel Button */}
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="mt-4 w-full"
                            >
                                Batal
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
