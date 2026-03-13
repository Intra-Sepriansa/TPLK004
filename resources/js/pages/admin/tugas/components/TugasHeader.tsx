import InformasiTugasIcon from '@/assets/admin/informasi-tugas/informasi-tugas.png';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { ChevronLeft, Eye, Loader2, Save, Send } from 'lucide-react';
import React from 'react';

interface HeaderBarProps {
    currentStep: number;
    totalSteps: number;
    isDraft: boolean;
    isSaving: boolean;
    lastSaved: Date | null;
    onBack: () => void;
    onSaveDraft: () => Promise<void>;
    onPreview: () => void;
    onPublish: () => void;
}

export const TugasHeader: React.FC<HeaderBarProps> = ({
    currentStep,
    totalSteps,
    isDraft,
    isSaving,
    lastSaved,
    onBack,
    onSaveDraft,
    onPreview,
    onPublish,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
            className="relative mb-6 overflow-hidden rounded-3xl p-6 text-white shadow-2xl sm:p-8"
        >
            {/* Animated Gradient Background */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                animate={{
                    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: 'linear',
                }}
                style={{
                    backgroundSize: '200% 200%',
                }}
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
            <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onBack}
                    className="mb-4 -ml-4 text-white/80 hover:bg-white/10 hover:text-white"
                >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Kembali ke Daftar Tugas
                </Button>

                {/* Left: Back & Title */}
                <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                    <div className="flex w-full flex-col items-center gap-5 text-center sm:w-auto sm:flex-row sm:gap-6 sm:text-left">
                        <div className="flex items-center gap-4">
                            <motion.div
                                className="relative flex hidden h-14 w-14 shrink-0 items-center justify-center sm:flex sm:h-16 sm:w-16"
                                initial={{
                                    opacity: 0,
                                    scale: 0.5,
                                    rotate: -10,
                                }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 300,
                                    delay: 0.2,
                                }}
                                whileHover={{ scale: 1.1, rotate: 10 }}
                            >
                                <img
                                    src={InformasiTugasIcon}
                                    alt="Informasi Tugas"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.35)]"
                                />
                            </motion.div>
                            <div>
                                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                                    Buat Tugas Baru
                                </h1>
                                <div className="mt-1 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                    <span className="text-sm font-medium tracking-wide text-indigo-100">
                                        Langkah {currentStep} dari {totalSteps}
                                    </span>
                                    {isDraft && (
                                        <span className="rounded-full border border-amber-400/30 bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-200">
                                            Draft
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Center: Progress Bar */}
                    <div className="mx-8 mt-4 hidden max-w-md flex-1 items-center gap-2 sm:mt-0 lg:flex">
                        {Array.from({ length: totalSteps }).map((_, index) => (
                            <div key={index} className="flex-1">
                                <div
                                    className={`h-2 rounded-full transition-all duration-500 ${
                                        index + 1 < currentStep
                                            ? 'bg-white'
                                            : index + 1 === currentStep
                                              ? 'bg-white/60'
                                              : 'bg-white/20'
                                    } `}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="mt-4 flex w-full items-center justify-center gap-3 sm:mt-0 sm:w-auto sm:justify-end">
                        {isSaving && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 backdrop-blur-sm"
                            >
                                <Loader2 className="h-4 w-4 animate-spin text-white" />
                                <span className="hidden text-sm text-white sm:block">
                                    Menyimpan...
                                </span>
                            </motion.div>
                        )}

                        {lastSaved && !isSaving && (
                            <div className="hidden text-sm text-indigo-100 sm:block">
                                Tersimpan{' '}
                                {formatDistanceToNow(lastSaved, { locale: id })}
                            </div>
                        )}

                        <motion.button
                            onClick={onSaveDraft}
                            className="hidden items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 font-medium text-white transition-all hover:bg-white/20 sm:flex"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Save className="h-4 w-4" />
                            <span>Simpan Draft</span>
                        </motion.button>

                        <motion.button
                            onClick={onPreview}
                            className="hidden items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 font-medium text-white transition-all hover:bg-white/20 sm:flex"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Eye className="h-4 w-4" />
                            <span>Preview</span>
                        </motion.button>

                        <motion.button
                            onClick={onPublish}
                            className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-white px-6 py-2 font-bold text-indigo-600 shadow-lg shadow-white/20 transition-all hover:shadow-white/30"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
                            <Send className="relative z-10 h-4 w-4" />
                            <span className="relative z-10 hidden sm:block">
                                Publikasikan
                            </span>
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
