import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';

interface SettingsCardProps {
    title: string;
    icon: LucideIcon;
    children: React.ReactNode;
    delay?: number;
}

export function SettingsCard({ title, icon: Icon, children, delay = 0 }: SettingsCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                delay,
                duration: 0.5,
                type: 'spring',
                stiffness: 100,
                damping: 15
            }}
            whileHover={{
                y: -4,
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            }}
            className="
                relative overflow-hidden
                rounded-3xl border-2 border-gray-200 dark:border-gray-800 
                bg-white/80 dark:bg-gray-900/80 
                p-6 md:p-8 
                shadow-xl backdrop-blur-xl
                transition-all duration-300
            "
        >
            {/* Animated gradient background on hover */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-transparent opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            />

            {/* Decorative corner glow */}
            <motion.div
                className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200/50 dark:border-gray-800/50">
                    <motion.div
                        className="
                            flex h-12 w-12 items-center justify-center 
                            rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 
                            text-purple-600 dark:text-purple-400
                            shadow-lg
                        "
                        whileHover={{
                            scale: 1.1,
                            rotate: 5,
                            boxShadow: '0 10px 30px rgba(168, 85, 247, 0.4)',
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                        <Icon className="h-6 w-6" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {title}
                    </h3>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {children}
                </div>
            </div>
        </motion.div>
    );
}
