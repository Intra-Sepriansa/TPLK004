import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import qrcode from 'qrcode';

interface QRCodeAnimatedProps {
    data: string;
    size?: number;
    color?: string;
    logoUrl?: string;
    onComplete?: () => void;
}

export const QRCodeAnimated: React.FC<QRCodeAnimatedProps> = ({
    data,
    size = 300,
    color = '#6366f1',
    logoUrl,
    onComplete
}) => {
    const [isComplete, setIsComplete] = useState(false);

    const qr = useMemo(() => {
        if (!data) return null;
        try {
            return qrcode.create(data, { errorCorrectionLevel: 'H' });
        } catch (e) {
            console.error(e);
            return null;
        }
    }, [data]);

    useEffect(() => {
        setIsComplete(false);
        const timer = setTimeout(() => {
            setIsComplete(true);
            onComplete?.();
        }, 3500);
        return () => clearTimeout(timer);
    }, [data, onComplete]);

    if (!qr) return null;

    const qrSize = qr.modules.size;
    const modules: { x: number, y: number, filled: boolean }[] = [];

    // Helper to check if a coordinate is part of position detection pattern
    const isPDP = (r: number, c: number) => {
        if (r <= 7 && c <= 7) return true;
        if (r <= 7 && c >= qrSize - 8) return true;
        if (r >= qrSize - 8 && c <= 7) return true;
        if (r === 6 || c === 6) return true; // Include timing patterns as excluded for separate rendering
        return false;
    };

    // Extract modules
    const dataArr = qr.modules.data;
    for (let r = 0; r < qrSize; r++) {
        for (let c = 0; c < qrSize; c++) {
            if (!isPDP(r, c)) {
                const isDark = dataArr[r * qrSize + c] === 1;
                // Leave a space in the middle for the logo if logoUrl is provided
                // H error correction can handle 30% damage. 
                // We'll just punch a hole of 20% size in the middle
                const centerStart = Math.floor(qrSize * 0.4);
                const centerEnd = Math.ceil(qrSize * 0.6);
                const isCenter = (r >= centerStart && r <= centerEnd && c >= centerStart && c <= centerEnd);

                if (isDark && (!logoUrl || !isCenter)) {
                    modules.push({ x: c, y: r, filled: true });
                }
            }
        }
    }

    // Sort modules from outside to inside
    const center = { x: qrSize / 2, y: qrSize / 2 };
    modules.sort((a, b) => {
        const distA = Math.sqrt(Math.pow(a.x - center.x, 2) + Math.pow(a.y - center.y, 2));
        const distB = Math.sqrt(Math.pow(b.x - center.x, 2) + Math.pow(b.y - center.y, 2));
        return distB - distA;
    });

    const padding = 2;
    const viewBoxSize = qrSize + padding * 2;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 },
        },
    };

    return (
        <div className="relative inline-block" style={{ width: size, height: size }}>
            <motion.svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="drop-shadow-2xl"
                style={{ background: 'white', borderRadius: size * 0.05 }}
            >
                <defs>
                    <filter id="qr-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                <g transform={`translate(${padding}, ${padding})`}>
                    {/* Corner Markers */}
                    <CornerMarker x={0} y={0} delay={0} color={color} />
                    <CornerMarker x={qrSize - 7} y={0} delay={0.2} color={color} />
                    <CornerMarker x={0} y={qrSize - 7} delay={0.4} color={color} />

                    {/* Timing Patterns */}
                    <TimingPattern direction="horizontal" qrSize={qrSize} delay={1} color={color} />
                    <TimingPattern direction="vertical" qrSize={qrSize} delay={1.2} color={color} />

                    {/* Data Modules */}
                    {modules.map((m, i) => (
                        <motion.rect
                            key={`${m.x}-${m.y}`}
                            x={m.x}
                            y={m.y}
                            width={1.05}
                            height={1.05}
                            fill={color}
                            rx="0.2"
                            initial={{ scale: 0, opacity: 0, filter: "blur(2px)" }}
                            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                            transition={{
                                duration: 0.2,
                                delay: 1.5 + (i * 0.003), // Fast stagger
                                ease: "backOut"
                            }}
                            style={{ transformOrigin: `${m.x + 0.5}px ${m.y + 0.5}px` }}
                        />
                    ))}

                    {/* Scan Line */}
                    <motion.line
                        x1={0} y1={0} x2={qrSize} y2={0}
                        stroke={color}
                        strokeWidth="0.5"
                        initial={{ y: 0, opacity: 0 }}
                        animate={{
                            y: [0, qrSize, 0],
                            opacity: [0, 0.8, 0.8, 0]
                        }}
                        transition={{ duration: 2, delay: 1.5, ease: "easeInOut" }}
                        style={{ filter: "url(#qr-glow)" }}
                    />
                </g>
            </motion.svg>

            {/* Logo Overlay */}
            {logoUrl && (
                <motion.div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 2.5, type: "spring", stiffness: 300, damping: 20 }}
                >
                    <div className="bg-white p-1 rounded-xl shadow-lg border-2 border-indigo-100 flex items-center justify-center" style={{ width: '22%', height: '22%' }}>
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain drop-shadow-md" />
                    </div>
                </motion.div>
            )}
        </div>
    );
};

const CornerMarker = ({ x, y, delay, color }: { x: number, y: number, delay: number, color: string }) => {
    return (
        <g transform={`translate(${x}, ${y})`}>
            {/* Outer Square */}
            <motion.path
                d="M 0.5 0.5 h 6 v 6 h -6 Z"
                fill="none"
                stroke={color}
                strokeWidth={1}
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay, ease: "easeInOut" }}
            />
            {/* Inner Square */}
            <motion.rect
                x={2} y={2} width={3} height={3}
                fill={color}
                rx="0.5"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: delay + 0.4, ease: "backOut" }}
                style={{ transformOrigin: '3.5px 3.5px' }}
            />
            {/* Glow burst */}
            <motion.path
                d="M 0.5 0.5 h 6 v 6 h -6 Z"
                fill="none"
                stroke={color}
                strokeWidth={2}
                initial={{ scale: 1, opacity: 0 }}
                animate={{ scale: [1, 1.2, 1.4], opacity: [0, 0.5, 0] }}
                transition={{ duration: 0.8, delay: delay + 0.6, ease: "easeOut" }}
                style={{ transformOrigin: '3.5px 3.5px' }}
            />
        </g>
    );
};

const TimingPattern = ({ direction, qrSize, delay, color }: { direction: string, qrSize: number, delay: number, color: string }) => {
    const isHoriz = direction === 'horizontal';
    const start = 8;
    const end = qrSize - 8;
    const length = end - start;

    return (
        <g>
            <motion.line
                x1={isHoriz ? start : 6.5}
                y1={isHoriz ? 6.5 : start}
                x2={isHoriz ? end : 6.5}
                y2={isHoriz ? 6.5 : end}
                stroke={color}
                strokeWidth={0.2}
                opacity={0.3}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay, ease: "easeInOut" }}
            />
            {Array.from({ length }).map((_, i) => (
                <motion.rect
                    key={i}
                    x={isHoriz ? start + i : 6}
                    y={isHoriz ? 6 : start + i}
                    width={1}
                    height={1}
                    fill={i % 2 === 0 ? color : "transparent"}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2, delay: delay + (i * 0.05), ease: "backOut" }}
                    style={{ transformOrigin: `${(isHoriz ? start + i : 6) + 0.5}px ${(isHoriz ? 6 : start + i) + 0.5}px` }}
                />
            ))}
        </g>
    );
};
