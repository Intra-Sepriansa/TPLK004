import { motion, useMotionValue, animate } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnimatedCurrencyProps {
    value: number;
    duration?: number;
    className?: string;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    gradient?: string;
}

export function AnimatedCurrency({
    value,
    duration = 2,
    className = '',
    prefix = 'Rp ',
    suffix = '',
    decimals = 0,
    gradient = 'from-emerald-600 via-teal-500 to-cyan-600',
}: AnimatedCurrencyProps) {
    const [displayValue, setDisplayValue] = useState('0');

    useEffect(() => {
        const count = { current: 0 };
        
        const controls = animate(0, value, {
            duration,
            ease: [0.25, 0.1, 0.25, 1],
            onUpdate: (latest) => {
                count.current = latest;
                setDisplayValue(
                    Math.round(latest).toLocaleString('id-ID', {
                        minimumFractionDigits: decimals,
                        maximumFractionDigits: decimals,
                    })
                );
            },
        });

        return () => controls.stop();
    }, [value, duration, decimals]);

    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
            }}
            className={`inline-block ${className}`}
        >
            <motion.span
                className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent font-bold`}
                animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                }}
                style={{
                    backgroundSize: '200% 200%',
                }}
            >
                {prefix}{displayValue}{suffix}
            </motion.span>
        </motion.span>
    );
}

// Variant with pulsing glow effect
export function AnimatedCurrencyGlow({
    value,
    duration = 2,
    className = '',
    prefix = 'Rp ',
    suffix = '',
    decimals = 0,
    gradient = 'from-emerald-600 via-teal-500 to-cyan-600',
    glowColor = 'emerald',
}: AnimatedCurrencyProps & { glowColor?: string }) {
    const [displayValue, setDisplayValue] = useState('0');

    useEffect(() => {
        const count = { current: 0 };
        
        const controls = animate(0, value, {
            duration,
            ease: [0.25, 0.1, 0.25, 1],
            onUpdate: (latest) => {
                count.current = latest;
                setDisplayValue(
                    Math.round(latest).toLocaleString('id-ID', {
                        minimumFractionDigits: decimals,
                        maximumFractionDigits: decimals,
                    })
                );
            },
        });

        return () => controls.stop();
    }, [value, duration, decimals]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
            }}
            className={`inline-block relative ${className}`}
        >
            {/* Glow effect */}
            <motion.div
                className={`absolute inset-0 blur-xl bg-${glowColor}-500/30`}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />
            
            {/* Text */}
            <motion.span
                className={`relative bg-gradient-to-r ${gradient} bg-clip-text text-transparent font-bold`}
                animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                }}
                style={{
                    backgroundSize: '200% 200%',
                }}
            >
                {prefix}{displayValue}{suffix}
            </motion.span>
        </motion.div>
    );
}

// Variant with shimmer effect
export function AnimatedCurrencyShimmer({
    value,
    duration = 2,
    className = '',
    prefix = 'Rp ',
    suffix = '',
    decimals = 0,
    gradient = 'from-emerald-600 via-teal-500 to-cyan-600',
}: AnimatedCurrencyProps) {
    const [displayValue, setDisplayValue] = useState('0');

    useEffect(() => {
        const count = { current: 0 };
        
        const controls = animate(0, value, {
            duration,
            ease: [0.25, 0.1, 0.25, 1],
            onUpdate: (latest) => {
                count.current = latest;
                setDisplayValue(
                    Math.round(latest).toLocaleString('id-ID', {
                        minimumFractionDigits: decimals,
                        maximumFractionDigits: decimals,
                    })
                );
            },
        });

        return () => controls.stop();
    }, [value, duration, decimals]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
            }}
            className={`inline-block relative ${className}`}
        >
            {/* Shimmer overlay */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                    x: ['-200%', '200%'],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                    repeatDelay: 1,
                }}
            />
            
            {/* Text with gradient */}
            <motion.span
                className={`relative bg-gradient-to-r ${gradient} bg-clip-text text-transparent font-bold drop-shadow-lg`}
                animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'linear',
                }}
                style={{
                    backgroundSize: '200% 200%',
                }}
            >
                {prefix}{displayValue}{suffix}
            </motion.span>
        </motion.div>
    );
}

