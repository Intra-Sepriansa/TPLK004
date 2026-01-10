import { useRef, useState, useCallback, type ReactNode } from 'react';
import { RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
    children: ReactNode;
    onRefresh: () => Promise<void>;
    threshold?: number;
    className?: string;
}

export function PullToRefresh({
    children,
    onRefresh,
    threshold = 80,
    className,
}: PullToRefreshProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);

    const onTouchStart = useCallback((e: React.TouchEvent) => {
        if (containerRef.current?.scrollTop === 0) {
            setTouchStart(e.touches[0].clientY);
        }
    }, []);

    const onTouchMove = useCallback((e: React.TouchEvent) => {
        if (touchStart === null || isRefreshing) return;

        const currentY = e.touches[0].clientY;
        const distance = Math.max(0, currentY - touchStart);

        // Apply resistance
        const resistedDistance = Math.min(distance * 0.5, threshold * 1.5);
        setPullDistance(resistedDistance);
    }, [touchStart, isRefreshing, threshold]);

    const onTouchEnd = useCallback(async () => {
        if (pullDistance >= threshold && !isRefreshing) {
            setIsRefreshing(true);
            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
            }
        }
        setPullDistance(0);
        setTouchStart(null);
    }, [pullDistance, threshold, isRefreshing, onRefresh]);

    const progress = Math.min(pullDistance / threshold, 1);
    const rotation = progress * 360;

    return (
        <div
            ref={containerRef}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className={cn('relative overflow-auto', className)}
        >
            {/* Pull indicator */}
            <div
                className={cn(
                    'absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-opacity',
                    pullDistance > 0 || isRefreshing ? 'opacity-100' : 'opacity-0'
                )}
                style={{
                    top: Math.max(pullDistance - 40, 10),
                }}
            >
                <div
                    className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg dark:bg-slate-800',
                        isRefreshing && 'animate-spin'
                    )}
                    style={{
                        transform: isRefreshing ? undefined : `rotate(${rotation}deg)`,
                    }}
                >
                    <RefreshCcw className={cn(
                        'h-5 w-5',
                        progress >= 1 ? 'text-emerald-600' : 'text-slate-400'
                    )} />
                </div>
            </div>

            {/* Content */}
            <div
                style={{
                    transform: `translateY(${pullDistance}px)`,
                    transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none',
                }}
            >
                {children}
            </div>
        </div>
    );
}
