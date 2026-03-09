import { motion, AnimatePresence } from 'framer-motion';
import { Save, Check, AlertCircle } from 'lucide-react';

interface SaveButtonProps {
    onClick: () => void;
    isSaving: boolean;
    hasChanges: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

export function SaveButton({ onClick, isSaving, hasChanges, disabled, type = 'submit' }: SaveButtonProps) {
    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled || isSaving || !hasChanges}
            className={`
                relative overflow-hidden
                px-8 py-4 rounded-2xl
                font-bold text-white
                transition-all duration-300
                ${hasChanges && !isSaving
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/50'
                    : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                }
            `}
            whileHover={hasChanges && !isSaving ? { scale: 1.05, y: -2 } : {}}
            whileTap={hasChanges && !isSaving ? { scale: 0.95 } : {}}
        >
            {/* Shimmer effect when has changes */}
            {hasChanges && !isSaving && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                        x: ['-100%', '200%'],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
            )}

            {/* Button content */}
            <div className="relative z-10 flex items-center justify-center gap-2">
                <AnimatePresence mode="wait">
                    {isSaving ? (
                        <motion.div
                            key="saving"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className="flex items-center gap-2"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                                <Save className="w-5 h-5" />
                            </motion.div>
                            <span>Menyimpan...</span>
                        </motion.div>
                    ) : hasChanges ? (
                        <motion.div
                            key="save"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className="flex items-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            <span>Simpan Perubahan</span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="saved"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className="flex items-center gap-2"
                        >
                            <Check className="w-5 h-5" />
                            <span>Tersimpan</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.button>
    );
}
