import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';

interface SettingsCardProps {
    title: string;
    icon: LucideIcon;
    children: React.ReactNode;
    delay?: number;
}

export function SettingsCard({
    title,
    icon: Icon,
    children,
    delay = 0,
}: SettingsCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, type: 'spring', stiffness: 300, damping: 20 }}
            whileHover={{ y: -4, scale: 1.01 }}
            className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 md:p-8 dark:border-white/10 dark:bg-neutral-900/40"
        >
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent"
                initial={{ opacity: 0.5 }}
                whileHover={{ opacity: 1 }}
            />

            <div className="relative z-10">
                <div className="mb-6 flex items-center gap-4 border-b border-white/20 pb-4 dark:border-white/10">
                    <motion.div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                        whileHover={{ scale: 1.08, rotate: 6 }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 20,
                        }}
                    >
                        <Icon className="h-6 w-6" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                        {title}
                    </h3>
                </div>

                <div className="space-y-6">{children}</div>
            </div>
        </motion.div>
    );
}
