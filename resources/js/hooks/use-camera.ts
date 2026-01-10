import { useState, useRef, useCallback, useEffect } from 'react';

interface UseCameraOptions {
    facingMode?: 'user' | 'environment';
    width?: number;
    height?: number;
    autoStart?: boolean;
}

interface UseCameraResult {
    videoRef: React.RefObject<HTMLVideoElement>;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    stream: MediaStream | null;
    error: string | null;
    isLoading: boolean;
    isActive: boolean;
    start: () => Promise<void>;
    stop: () => void;
    capture: () => string | null;
    switchCamera: () => Promise<void>;
    facingMode: 'user' | 'environment';
}

export function useCamera(options: UseCameraOptions = {}): UseCameraResult {
    const {
        facingMode: initialFacingMode = 'user',
        width = 640,
        height = 480,
        autoStart = false,
    } = options;

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>(initialFacingMode);

    const start = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode,
                    width: { ideal: width },
                    height: { ideal: height },
                },
                audio: false,
            });

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                await videoRef.current.play();
            }

            setStream(mediaStream);
            setIsActive(true);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to access camera';
            setError(message);
            console.error('Camera error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [facingMode, width, height]);

    const stop = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsActive(false);
    }, [stream]);

    const capture = useCallback((): string | null => {
        if (!videoRef.current || !canvasRef.current) return null;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return null;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Flip horizontally if using front camera
        if (facingMode === 'user') {
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
        }

        context.drawImage(video, 0, 0);

        return canvas.toDataURL('image/jpeg', 0.8);
    }, [facingMode]);

    const switchCamera = useCallback(async () => {
        stop();
        setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    }, [stop]);

    // Restart camera when facing mode changes
    useEffect(() => {
        if (isActive) {
            start();
        }
    }, [facingMode]);

    // Auto start if enabled
    useEffect(() => {
        if (autoStart) {
            start();
        }
        return () => {
            stop();
        };
    }, []);

    return {
        videoRef,
        canvasRef,
        stream,
        error,
        isLoading,
        isActive,
        start,
        stop,
        capture,
        switchCamera,
        facingMode,
    };
}
