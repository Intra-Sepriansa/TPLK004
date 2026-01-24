import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

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
    duration = 2000,
    className = '',
    prefix = 'Rp ',
    suffix = '',
    decimals = 0,
    gradient = 'from-emerald-600 via-teal-500 to-cyan-600',
}: AnimatedCurrencyProps) {
    const [displayValue, setDisplayValue] = useState(0);
    const startTime = useRef<number | null>(null);
    const startValue = useRef(0);

    useEffect(() => {
        startValue.current = displayValue;
        startTime.current = null;

        const animate = (timestamp: number) => {
            if (!startTime.current) startTime.current = timestamp;
            const progress = Math.min((timestamp - startTime.current) / duration, 1);
            
            // Easing function (ease-out-cubic) - smooth deceleration
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = startValue.current + (value - startValue.current) * easeOut;
            
            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [value, duration]);

    const formattedValue = Math.round(displayValue).toLocaleString('id-ID', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

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
                className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent font-bold tabular-nums`}
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
                {prefix}{formattedValue}{suffix}
            </motion.span>
        </motion.span>
    );
}

// Variant with pulsing glow effect
export function AnimatedCurrencyGlow({
    value,
    duration = 2000,
    className = '',
    prefix = 'Rp ',
    suffix = '',
    decimals = 0,
    gradient = 'from-emerald-600 via-teal-500 to-cyan-600',
    glowColor = 'emerald',
}: AnimatedCurrencyProps & { glowColor?: string }) {
    const [displayValue, setDisplayValue] = useState(0);
    const startTime = useRef<number | null>(null);
    const startValue = useRef(0);

    useEffect(() => {
        startValue.current = displayValue;
        startTime.current = null;

        const animate = (timestamp: number) => {
            if (!startTime.current) startTime.current = timestamp;
            const progress = Math.min((timestamp - startTime.current) / duration, 1);
            
            // Easing function (ease-out-cubic)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = startValue.current + (value - startValue.current) * easeOut;
            
            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [value, duration]);

    const formattedValue = Math.round(displayValue).toLocaleString('id-ID', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

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
                className={`relative bg-gradient-to-r ${gradient} bg-clip-text text-transparent font-bold tabular-nums`}
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
                {prefix}{formattedValue}{suffix}
            </motion.span>
        </motion.div>
    );
}

// Variant with shimmer effect
export function AnimatedCurrencyShimmer({
    value,
    duration = 2000,
    className = '',
    prefix = 'Rp ',
    suffix = '',
    decimals = 0,
    gradient = 'from-emerald-600 via-teal-500 to-cyan-600',
}: AnimatedCurrencyProps) {
    const [displayValue, setDisplayValue] = useState(0);
    const startTime = useRef<number | null>(null);
    const startValue = useRef(0);

    useEffect(() => {
        startValue.current = displayValue;
        startTime.current = null;

        const animate = (timestamp: number) => {
            if (!startTime.current) startTime.current = timestamp;
            const progress = Math.min((timestamp - startTime.current) / duration, 1);
            
            // Easing function (ease-out-cubic)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = startValue.current + (value - startValue.current) * easeOut;
            
            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [value, duration]);

    const formattedValue = Math.round(displayValue).toLocaleString('id-ID', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

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
                className={`relative bg-gradient-to-r ${gradient} bg-clip-text text-transparent font-bold drop-shadow-lg tabular-nums`}
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
                {prefix}{formattedValue}{suffix}
            </motion.span>
        </motion.div>
    );
}


