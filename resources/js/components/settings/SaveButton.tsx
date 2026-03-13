import { AnimatePresence, motion } from 'framer-motion';
import { Check, Save } from 'lucide-react';

interface SaveButtonProps {
    onClick: () => void;
    isSaving: boolean;
    hasChanges: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

export function SaveButton({
    onClick,
    isSaving,
    hasChanges,
    disabled,
    type = 'submit',
}: SaveButtonProps) {
    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled || isSaving || !hasChanges}
            className={`relative overflow-hidden rounded-2xl px-8 py-4 font-bold text-white transition-all duration-300 ${
                hasChanges && !isSaving
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/50 hover:from-purple-700 hover:to-pink-700'
                    : 'cursor-not-allowed bg-gray-300 dark:bg-gray-700'
            } `}
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
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: 'linear',
                                }}
                            >
                                <Save className="h-5 w-5" />
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
                            <Save className="h-5 w-5" />
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
                            <Check className="h-5 w-5" />
                            <span>Tersimpan</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.button>
    );
}
