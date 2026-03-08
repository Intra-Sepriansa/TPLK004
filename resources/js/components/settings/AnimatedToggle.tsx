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
                    className="pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-lg ring-0"
                    animate={{
                        x: checked ? 28 : 0,
                    }}
                    transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                    }}
                />
            </motion.button>
        </div>
    );
}
