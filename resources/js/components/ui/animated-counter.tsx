import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    className?: string;
    prefix?: string;
    suffix?: string;
    decimals?: number;
}

export function AnimatedCounter({
    value,
    duration = 1000,
    className,
    prefix = '',
    suffix = '',
    decimals = 0,
}: AnimatedCounterProps) {
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

    const formattedValue = decimals > 0 
        ? displayValue.toFixed(decimals) 
        : Math.round(displayValue).toLocaleString();

    return (
        <span className={cn('tabular-nums', className)}>
            {prefix}{formattedValue}{suffix}
        </span>
    );
}
