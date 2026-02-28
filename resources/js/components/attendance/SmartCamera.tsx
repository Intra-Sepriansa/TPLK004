import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Sparkles, Sun, Droplet, RotateCw, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

interface SmartCameraProps {
    onCapture: (imageDataUrl: string) => void
    disabled?: boolean
}

export function SmartCamera({ onCapture, disabled }: SmartCameraProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [beautyLevel, setBeautyLevel] = useState(0)
    const [brightness, setBrightness] = useState(0)
    const [backgroundBlur, setBackgroundBlur] = useState(0)
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
    const [faceDetected, setFaceDetected] = useState(false)
    const [photoQuality, setPhotoQuality] = useState(0)
    const [isActive, setIsActive] = useState(false)

    const startCamera = useCallback(async () => {
        try {
            if (stream) stream.getTracks().forEach(t => t.stop())
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode },
            })
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream
                setStream(mediaStream)
                setIsActive(true)
            }
        } catch (error) {
            console.error('Camera error:', error)
        }
    }, [facingMode])

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(t => t.stop())
            setStream(null)
            setIsActive(false)
        }
    }, [stream])

    // Apply CSS filters
    useEffect(() => {
        if (!videoRef.current) return
        const filters: string[] = []
        if (beautyLevel > 0) filters.push(`blur(${beautyLevel / 150}px)`)
        if (brightness !== 0) filters.push(`brightness(${1 + brightness / 100})`)
        videoRef.current.style.filter = filters.join(' ')
    }, [beautyLevel, brightness])

    // Mock face detection
    useEffect(() => {
        if (!isActive) return
        const interval = setInterval(() => {
            setFaceDetected(Math.random() > 0.15)
            setPhotoQuality(Math.floor(65 + Math.random() * 35))
        }, 1500)
        return () => clearInterval(interval)
    }, [isActive])

    const switchCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
    }

    useEffect(() => {
        if (isActive) startCamera()
    }, [facingMode])

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return
        const video = videoRef.current
        const canvas = canvasRef.current
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.filter = video.style.filter || 'none'
        ctx.drawImage(video, 0, 0)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
        onCapture(dataUrl)
    }

    useEffect(() => {
        return () => { if (stream) stream.getTracks().forEach(t => t.stop()) }
    }, [])

    return (
        <div className="space-y-4">
            {/* Camera Preview */}
            <div className="relative bg-neutral-900 rounded-xl overflow-hidden">
                {isActive ? (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-[4/3] md:aspect-video object-cover" />
                ) : (
                    <div className="w-full aspect-[4/3] md:aspect-video flex items-center justify-center bg-neutral-800">
                        <div className="text-center text-neutral-400">
                            <Camera className="w-14 h-14 mx-auto mb-3" />
                            <p className="text-sm font-medium">Kamera belum aktif</p>
                        </div>
                    </div>
                )}

                {/* Face Detection Overlay */}
                <AnimatePresence>
                    {isActive && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 pointer-events-none">
                            {/* Face Oval Guide */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                    animate={{ borderColor: faceDetected ? 'rgb(16,185,129)' : 'rgb(251,191,36)' }}
                                    className="w-48 h-60 md:w-56 md:h-72 border-4 rounded-full transition-colors duration-300"
                                />
                            </div>

                            {/* Quality Badge */}
                            <div className="absolute bottom-4 left-4">
                                <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 text-white text-sm">
                                    {photoQuality >= 70 ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                                    <span>Kualitas: {photoQuality}%</span>
                                </div>
                            </div>

                            {/* Active Badge */}
                            <div className="absolute top-4 left-4">
                                <div className="bg-emerald-500/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2 text-white text-xs font-semibold">
                                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                    Kamera Aktif
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Switch Camera */}
                {isActive && (
                    <div className="absolute bottom-4 right-4">
                        <Button size="sm" variant="secondary" onClick={switchCamera} className="bg-white/20 backdrop-blur-sm text-white border-white/20">
                            <RotateCw className="w-4 h-4" />
                        </Button>
                    </div>
                )}

                <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Camera Controls */}
            <div className="flex gap-2">
                <Button onClick={isActive ? stopCamera : startCamera} disabled={disabled} variant={isActive ? 'destructive' : 'default'} className="flex-1">
                    <Camera className="w-4 h-4 mr-2" />
                    {isActive ? 'Matikan Kamera' : 'Aktifkan Kamera'}
                </Button>
                {isActive && (
                    <Button onClick={capturePhoto} disabled={!faceDetected || photoQuality < 50} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                        <Camera className="w-4 h-4 mr-2" />
                        {faceDetected ? photoQuality >= 50 ? 'Ambil Foto' : 'Kualitas Kurang' : 'Wajah Tidak Terdeteksi'}
                    </Button>
                )}
            </div>

            {/* Filter Controls */}
            {isActive && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-white/5 shadow-xl space-y-5"
                >
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-pink-500" />
                                <span className="text-sm font-medium text-neutral-900 dark:text-white">Beauty Filter</span>
                            </div>
                            <span className="text-xs text-neutral-600 dark:text-neutral-400">{beautyLevel}%</span>
                        </div>
                        <Slider value={[beautyLevel]} onValueChange={([v]) => setBeautyLevel(v)} max={100} step={1} />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Sun className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm font-medium text-neutral-900 dark:text-white">Brightness</span>
                            </div>
                            <span className="text-xs text-neutral-600 dark:text-neutral-400">{brightness > 0 ? '+' : ''}{brightness}</span>
                        </div>
                        <Slider value={[brightness]} onValueChange={([v]) => setBrightness(v)} min={-50} max={50} step={1} />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Droplet className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-medium text-neutral-900 dark:text-white">Background Blur</span>
                            </div>
                            <span className="text-xs text-neutral-600 dark:text-neutral-400">{backgroundBlur}px</span>
                        </div>
                        <Slider value={[backgroundBlur]} onValueChange={([v]) => setBackgroundBlur(v)} max={20} step={1} />
                    </div>
                </motion.div>
            )}

            {/* Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-900 dark:text-blue-100">
                    💡 <strong>Tips:</strong> Beauty filter membuat foto lebih halus. Sesuaikan brightness jika pencahayaan kurang. Background blur membantu fokus ke wajah.
                </p>
            </div>
        </div>
    )
}
