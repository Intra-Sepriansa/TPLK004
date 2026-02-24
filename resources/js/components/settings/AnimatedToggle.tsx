import { motion } from 'framer-motion';

interface AnimatedToggleProps {
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
    label?: string;
    description?: string;
}

export function AnimatedToggle({
    checked,
    onChange,
    disabled = false,
    label,
    description
}: AnimatedToggleProps) {
    return (
        <div className="flex items-center justify-between gap-4">
            {label && (
                <div className="flex-1">
                    <label className="font-medium text-gray-900 dark:text-white">
                        {label}
                    </label>
                    {description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {description}
                        </p>
                    )}
                </div>
            )}

            <motion.button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={onChange}
                disabled={disabled}
                className={`
                    relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer 
                    rounded-full border-2 border-transparent transition-colors 
                    duration-300 ease-in-out focus:outline-none focus:ring-2 
                    focus:ring-purple-500 focus:ring-offset-2 
                    dark:focus:ring-offset-gray-900
                    ${checked
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'bg-gray-300 dark:bg-gray-700'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                whileHover={!disabled ? { scale: 1.05 } : {}}
                whileTap={!disabled ? { scale: 0.95 } : {}}
            >
                {/* Animated thumb */}
                <motion.span
                    className={`
                        pointer-events-none inline-block h-6 w-6 transform 
                        rounded-full bg-white shadow-lg ring-0 
                        flex items-center justify-center
                    `}
                    animate={{
                        x: checked ? 28 : 0,
                    }}
                    transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                    }}
                >
                    {/* Icon inside thumb */}
                    <motion.div
                        initial={false}
                        animate={{
                            scale: checked ? [1, 1.3, 1] : 1,
                            rotate: checked ? 360 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                    >
                        {checked ? (
                            <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        )}
                    </motion.div>
                </motion.span>

                {/* Ripple effect on toggle */}
                {checked && (
                    <motion.span
                        className="absolute inset-0 rounded-full bg-white"
                        initial={{ scale: 0, opacity: 0.5 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                    />
                )}
            </motion.button>
        </div>
    );
}
