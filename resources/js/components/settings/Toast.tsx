import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export interface ToastType {
    id?: string;
    type: 'success' | 'error';
    message: string;
}

interface ToastProps {
    type: 'success' | 'error';
    message: string;
    onClose: () => void;
}

export function Toast({ type, message, onClose }: ToastProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`
                fixed top-6 right-6 z-50
                flex items-center gap-3
                px-6 py-4 rounded-2xl
                shadow-2xl backdrop-blur-xl
                border-2
                ${type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300'
                }
            `}
        >
            {/* Icon with animation */}
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
                {type === 'success' ? (
                    <CheckCircle className="w-6 h-6" />
                ) : (
                    <AlertCircle className="w-6 h-6" />
                )}
            </motion.div>

            {/* Message */}
            <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="font-semibold"
            >
                {message}
            </motion.p>

            {/* Close button */}
            <motion.button
                onClick={onClose}
                className="ml-4 p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <X className="w-4 h-4" />
            </motion.button>

            {/* Progress bar */}
            <motion.div
                className={`
                    absolute bottom-0 left-0 h-1 rounded-b-2xl
                    ${type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}
                `}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 3, ease: 'linear' }}
            />
        </motion.div>
    );
}

// Usage in Settings Page
export function ToastContainer({ toast, onClose }: { toast: ToastType | null; onClose: () => void }) {
    return (
        <AnimatePresence>
            {toast && (
                <Toast
                    key={toast.id || 'toast'}
                    type={toast.type}
                    message={toast.message}
                    onClose={onClose}
                />
            )}
        </AnimatePresence>
    );
}
