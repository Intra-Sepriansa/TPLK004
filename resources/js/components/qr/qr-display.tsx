import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { useCountdown } from '@/hooks/use-countdown';
import { Button } from '@/components/ui/button';
import { Download, RefreshCcw, Clock, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QRDisplayProps {
    value: string;
    expiresAt?: Date;
    size?: number;
    title?: string;
    onRefresh?: () => void;
    showDownload?: boolean;
    showCopy?: boolean;
}

export function QRDisplay({
    value,
    expiresAt,
    size = 256,
    title,
    onRefresh,
    showDownload = true,
    showCopy = true,
}: QRDisplayProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [copied, setCopied] = useState(false);
    const [isExpired, setIsExpired] = useState(false);

    const { formatted, isComplete } = useCountdown({
        targetDate: expiresAt,
        autoStart: !!expiresAt,
        onComplete: () => setIsExpired(true),
    });

    useEffect(() => {
        if (canvasRef.current && value) {
            QRCode.toCanvas(canvasRef.current, value, {
                width: size,
                margin: 2,
                color: {
                    dark: '#1f2937',
                    light: '#ffffff',
                },
                errorCorrectionLevel: 'H',
            });
        }
    }, [value, size]);

    const handleDownload = () => {
        if (!canvasRef.current) return;

        const link = document.createElement('a');
        link.download = `qr-${title || 'code'}-${Date.now()}.png`;
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="flex flex-col items-center">
            {title && (
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                    {title}
                </h3>
            )}

            <div className={cn(
                'relative rounded-2xl border-4 p-4 transition-colors',
                isExpired
                    ? 'border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30'
                    : 'border-emerald-300 bg-white dark:border-emerald-800 dark:bg-slate-900'
            )}>
                <canvas
                    ref={canvasRef}
                    className={cn(
                        'rounded-lg transition-opacity',
                        isExpired && 'opacity-30'
                    )}
                />

                {isExpired && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-lg font-bold text-rose-600">QR Expired</p>
                        {onRefresh && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="mt-2"
                                onClick={onRefresh}
                            >
                                <RefreshCcw className="h-4 w-4 mr-2" />
                                Generate Baru
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {expiresAt && !isExpired && (
                <div className="flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                        Berlaku:
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {formatted}
                    </span>
                </div>
            )}

            <div className="flex gap-2 mt-4">
                {showDownload && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        disabled={isExpired}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                    </Button>
                )}
                {showCopy && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        disabled={isExpired}
                    >
                        {copied ? (
                            <>
                                <Check className="h-4 w-4 mr-2 text-emerald-600" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Link
                            </>
                        )}
                    </Button>
                )}
                {onRefresh && !isExpired && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefresh}
                    >
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                )}
            </div>
        </div>
    );
}
