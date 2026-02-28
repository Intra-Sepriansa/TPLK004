import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, FileSpreadsheet, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (format: 'pdf' | 'excel') => void;
    isExporting: boolean;
}

export function ExportModal({ isOpen, onClose, onExport, isExporting }: ExportModalProps) {
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
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    Export Data
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-5 h-5 dark:text-neutral-400" />
                                </button>
                            </div>

                            {/* Content */}
                            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
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
                                        "w-full p-4 rounded-xl border-2 transition-all",
                                        "bg-white dark:bg-neutral-800",
                                        "border-neutral-200 dark:border-neutral-700",
                                        "hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20",
                                        "disabled:opacity-50 disabled:cursor-not-allowed"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <h3 className="font-semibold text-neutral-900 dark:text-white">
                                                Export to PDF
                                            </h3>
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                Laporan dalam format PDF siap cetak
                                            </p>
                                        </div>
                                        <Download className="w-5 h-5 text-neutral-400" />
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
                                        "w-full p-4 rounded-xl border-2 transition-all",
                                        "bg-white dark:bg-neutral-800",
                                        "border-neutral-200 dark:border-neutral-700",
                                        "hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20",
                                        "disabled:opacity-50 disabled:cursor-not-allowed"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                            <FileSpreadsheet className="w-6 h-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <h3 className="font-semibold text-neutral-900 dark:text-white">
                                                Export to Excel
                                            </h3>
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                Data dalam format Excel untuk analisis
                                            </p>
                                        </div>
                                        <Download className="w-5 h-5 text-neutral-400" />
                                    </div>
                                </motion.button>
                            </div>

                            {/* Cancel Button */}
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="w-full mt-4"
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
