import { useRef, useState, useCallback, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SwipeNavigationProps {
    children: ReactNode;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    threshold?: number;
    className?: string;
}

export function SwipeNavigation({
    children,
    onSwipeLeft,
    onSwipeRight,
    threshold = 100,
    className,
}: SwipeNavigationProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const [swiping, setSwiping] = useState(false);
    const [swipeDistance, setSwipeDistance] = useState(0);

    const onTouchStart = useCallback((e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
        setSwiping(true);
    }, []);

    const onTouchMove = useCallback((e: React.TouchEvent) => {
        if (!touchStart) return;
        const currentTouch = e.targetTouches[0].clientX;
        setTouchEnd(currentTouch);
        setSwipeDistance(currentTouch - touchStart);
    }, [touchStart]);

    const onTouchEnd = useCallback(() => {
        if (!touchStart || !touchEnd) {
            setSwiping(false);
            setSwipeDistance(0);
            return;
        }

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > threshold;
        const isRightSwipe = distance < -threshold;

        if (isLeftSwipe && onSwipeLeft) {
            onSwipeLeft();
        }
        if (isRightSwipe && onSwipeRight) {
            onSwipeRight();
        }

        setSwiping(false);
        setSwipeDistance(0);
        setTouchStart(null);
        setTouchEnd(null);
    }, [touchStart, touchEnd, threshold, onSwipeLeft, onSwipeRight]);

    return (
        <div
            ref={containerRef}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className={cn('touch-pan-y', className)}
            style={{
                transform: swiping ? `translateX(${swipeDistance * 0.3}px)` : undefined,
                transition: swiping ? 'none' : 'transform 0.3s ease-out',
            }}
        >
            {children}
        </div>
    );
}
