import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

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
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border-2 px-6 py-4 shadow-2xl backdrop-blur-xl ${
                type === 'success'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                    : 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
            } `}
        >
            {/* Icon with animation */}
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
                {type === 'success' ? (
                    <CheckCircle className="h-6 w-6" />
                ) : (
                    <AlertCircle className="h-6 w-6" />
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
                className="ml-4 rounded-lg p-1 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <X className="h-4 w-4" />
            </motion.button>

            {/* Progress bar */}
            <motion.div
                className={`absolute bottom-0 left-0 h-1 rounded-b-2xl ${type === 'success' ? 'bg-emerald-500' : 'bg-red-500'} `}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 3, ease: 'linear' }}
            />
        </motion.div>
    );
}

// Usage in Settings Page
export function ToastContainer({
    toast,
    onClose,
}: {
    toast: ToastType | null;
    onClose: () => void;
}) {
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
