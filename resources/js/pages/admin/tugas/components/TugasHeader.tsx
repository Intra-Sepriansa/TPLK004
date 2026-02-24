import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Loader2, Save, Eye, Send, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import InformasiTugasIcon from '@/assets/admin/informasi-tugas/informasi-tugas.png';

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
    onPublish
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
            className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-2xl mb-6"
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
                    ease: "linear"
                }}
                style={{
                    backgroundSize: '200% 200%',
                }}
            />

            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30 pointer-events-none" />
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />

            <div className="relative z-10">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onBack}
                    className="mb-4 text-white/80 hover:text-white hover:bg-white/10 -ml-4"
                >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Kembali ke Daftar Tugas
                </Button>

                {/* Left: Back & Title */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left w-full sm:w-auto">
                        <div className="flex items-center gap-4">
                            <motion.div
                                className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center shrink-0 hidden sm:flex"
                                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                whileHover={{ scale: 1.1, rotate: 10 }}
                            >
                                <img
                                    src={InformasiTugasIcon}
                                    alt="Informasi Tugas"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.35)]"
                                />
                            </motion.div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-white">Buat Tugas Baru</h1>
                                <div className="flex flex-wrap items-center gap-2 mt-1 justify-center sm:justify-start">
                                    <span className="text-sm font-medium tracking-wide text-indigo-100">
                                        Langkah {currentStep} dari {totalSteps}
                                    </span>
                                    {isDraft && (
                                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-200 
                                            text-xs font-semibold rounded-full border border-amber-400/30">
                                            Draft
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Center: Progress Bar */}
                    <div className="hidden lg:flex items-center gap-2 flex-1 max-w-md mx-8 mt-4 sm:mt-0">
                        {Array.from({ length: totalSteps }).map((_, index) => (
                            <div key={index} className="flex-1">
                                <div className={`
                                    h-2 rounded-full transition-all duration-500
                                    ${index + 1 < currentStep
                                        ? 'bg-white'
                                        : index + 1 === currentStep
                                            ? 'bg-white/60'
                                            : 'bg-white/20'
                                    }
                                `} />
                            </div>
                        ))}
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0 justify-center sm:justify-end">
                        {isSaving && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 
                                rounded-lg backdrop-blur-sm"
                            >
                                <Loader2 className="w-4 h-4 text-white animate-spin" />
                                <span className="text-sm text-white hidden sm:block">Menyimpan...</span>
                            </motion.div>
                        )}

                        {lastSaved && !isSaving && (
                            <div className="hidden sm:block text-sm text-indigo-100">
                                Tersimpan {formatDistanceToNow(lastSaved, { locale: id })}
                            </div>
                        )}

                        <motion.button
                            onClick={onSaveDraft}
                            className="hidden sm:flex px-4 py-2 bg-white/10 hover:bg-white/20 
                            rounded-xl text-white font-medium transition-all border border-white/20 items-center gap-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Save className="w-4 h-4" />
                            <span>Simpan Draft</span>
                        </motion.button>

                        <motion.button
                            onClick={onPreview}
                            className="hidden sm:flex px-4 py-2 bg-white/10 hover:bg-white/20 
                            rounded-xl text-white font-medium transition-all border border-white/20 items-center gap-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Eye className="w-4 h-4" />
                            <span>Preview</span>
                        </motion.button>

                        <motion.button
                            onClick={onPublish}
                            className="group relative px-6 py-2 bg-white rounded-xl 
                            text-indigo-600 font-bold shadow-lg shadow-white/20 
                            hover:shadow-white/30 transition-all overflow-hidden flex items-center gap-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="absolute inset-0 translate-x-[-100%] 
                            group-hover:translate-x-[100%] bg-gradient-to-r 
                            from-transparent via-white/30 to-transparent 
                            transition-transform duration-1000" />
                            <Send className="w-4 h-4 relative z-10" />
                            <span className="relative z-10 hidden sm:block">Publikasikan</span>
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
