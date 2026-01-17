/**
 * EmptyState Component
 * Empty state dengan illustration, message, dan action button
 */

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { FileQuestion, Inbox, Search, AlertCircle } from 'lucide-react';
import React from 'react';

export interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: 'inbox' | 'search' | 'question' | 'alert' | React.ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
    variant?: 'default' | 'compact';
}

const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    icon = 'inbox',
    action,
    className,
    variant = 'default',
}) => {
    const getIcon = () => {
        if (React.isValidElement(icon)) {
            return icon;
        }

        const iconMap = {
            inbox: Inbox,
            search: Search,
            question: FileQuestion,
            alert: AlertCircle,
        };

        const IconComponent = iconMap[icon as keyof typeof iconMap] || Inbox;
        return <IconComponent className="w-full h-full" />;
    };

    if (variant === 'compact') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                    'flex flex-col items-center justify-center py-8',
                    className
                )}
            >
                <div className="w-12 h-12 text-white/20 mb-3">{getIcon()}</div>
                <h3 className="text-white/60 font-medium text-sm">{title}</h3>
                {description && (
                    <p className="text-white/40 text-xs mt-1">{description}</p>
                )}
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={cn(
                'flex flex-col items-center justify-center py-16 px-4',
                className
            )}
        >
            {/* Icon with glow effect */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="relative mb-6"
            >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center p-6 text-white/30">
                    {getIcon()}
                </div>

                {/* Animated rings */}
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-purple-500/20"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-pink-500/20"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 0.5,
                    }}
                />
            </motion.div>

            {/* Title */}
            <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-white mb-2 text-center font-display"
            >
                {title}
            </motion.h3>

            {/* Description */}
            {description && (
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-white/60 text-center max-w-md mb-6"
                >
                    {description}
                </motion.p>
            )}

            {/* Action Button */}
            {action && (
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    onClick={action.onClick}
                    className={cn(
                        'px-6 py-3 rounded-lg font-medium',
                        'bg-gradient-to-r from-purple-600 to-pink-600',
                        'text-white',
                        'hover:from-purple-500 hover:to-pink-500',
                        'transition-all duration-300',
                        'hover-lift hover-glow-purple'
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {action.label}
                </motion.button>
            )}
        </motion.div>
    );
};

export default EmptyState;

/**
 * ErrorState Component
 * Error state dengan retry functionality
 */
export interface ErrorStateProps {
    title?: string;
    description?: string;
    onRetry?: () => void;
    className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
    title = 'Something went wrong',
    description = 'We encountered an error while loading this content.',
    onRetry,
    className,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                'flex flex-col items-center justify-center py-16 px-4',
                className
            )}
        >
            {/* Error Icon */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mb-6"
            >
                <AlertCircle className="w-12 h-12 text-red-400" />
            </motion.div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-white mb-2 text-center font-display">
                {title}
            </h3>

            {/* Description */}
            <p className="text-white/60 text-center max-w-md mb-6">{description}</p>

            {/* Retry Button */}
            {onRetry && (
                <motion.button
                    onClick={onRetry}
                    className={cn(
                        'px-6 py-3 rounded-lg font-medium',
                        'glass border border-white/10',
                        'text-white',
                        'hover:border-white/20',
                        'transition-all duration-300',
                        'hover-lift'
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Try Again
                </motion.button>
            )}
        </motion.div>
    );
};

/**
 * NoResultsState Component
 * No search results state
 */
export interface NoResultsStateProps {
    query?: string;
    suggestions?: string[];
    onSuggestionClick?: (suggestion: string) => void;
    className?: string;
}

export const NoResultsState: React.FC<NoResultsStateProps> = ({
    query,
    suggestions = [],
    onSuggestionClick,
    className,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                'flex flex-col items-center justify-center py-16 px-4',
                className
            )}
        >
            {/* Search Icon */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-6"
            >
                <Search className="w-12 h-12 text-blue-400" />
            </motion.div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-white mb-2 text-center font-display">
                No results found
            </h3>

            {/* Description */}
            <p className="text-white/60 text-center max-w-md mb-6">
                {query ? (
                    <>
                        We couldn't find anything matching{' '}
                        <span className="text-white font-medium">"{query}"</span>
                    </>
                ) : (
                    'Try adjusting your search or filters'
                )}
            </p>

            {/* Suggestions */}
            {suggestions.length > 0 && (
                <div className="w-full max-w-md">
                    <p className="text-white/40 text-sm mb-3 text-center">
                        Try searching for:
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {suggestions.map((suggestion, index) => (
                            <motion.button
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => onSuggestionClick?.(suggestion)}
                                className={cn(
                                    'px-4 py-2 rounded-lg',
                                    'glass border border-white/10',
                                    'text-white/70 text-sm',
                                    'hover:text-white hover:border-white/20',
                                    'transition-all duration-300'
                                )}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {suggestion}
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
};
