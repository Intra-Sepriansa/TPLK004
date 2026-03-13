import { Button } from '@/components/ui/button';
import {
    attendanceVoiceCommands,
    useTextToSpeech,
    useVoiceCommands,
} from '@/hooks/useVoiceAttendance';
import { AnimatePresence, motion } from 'framer-motion';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useState } from 'react';

interface VoiceAttendanceButtonProps {
    onScanQR: () => void;
    onOpenCamera: () => void;
    onSubmit: () => void;
    onCancel: () => void;
}

export function VoiceAttendanceButton({
    onScanQR,
    onOpenCamera,
    onSubmit,
    onCancel,
}: VoiceAttendanceButtonProps) {
    const [showTranscript, setShowTranscript] = useState(false);

    const commands = attendanceVoiceCommands({
        onScanQR: () => {
            speak('Membuka scanner QR code');
            onScanQR();
        },
        onOpenCamera: () => {
            speak('Membuka kamera untuk selfie');
            onOpenCamera();
        },
        onSubmit: () => {
            speak('Mengirim absensi');
            onSubmit();
        },
        onCancel: () => {
            speak('Membatalkan');
            onCancel();
        },
    });

    const {
        transcript,
        isListening,
        startListening,
        stopListening,
        isSupported,
    } = useVoiceCommands(commands);

    const { speak, isSpeaking } = useTextToSpeech();

    const handleToggleListening = () => {
        if (isListening) {
            stopListening();
            setShowTranscript(false);
        } else {
            startListening();
            setShowTranscript(true);
            speak('Voice attendance aktif. Silakan ucapkan perintah.');
        }
    };

    if (!isSupported) {
        return null; // Don't show button if not supported
    }

    return (
        <div className="relative">
            <Button
                onClick={handleToggleListening}
                variant={isListening ? 'destructive' : 'outline'}
                size="icon"
                className="relative"
            >
                {isListening ? (
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                        <MicOff className="h-4 w-4" />
                    </motion.div>
                ) : (
                    <Mic className="h-4 w-4" />
                )}

                {isListening && (
                    <motion.div
                        className="absolute inset-0 rounded-full bg-red-500"
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 1 }}
                    />
                )}
            </Button>

            {isSpeaking && (
                <motion.div
                    className="absolute -top-2 -right-2"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                >
                    <Volume2 className="h-4 w-4 text-blue-500" />
                </motion.div>
            )}

            <AnimatePresence>
                {showTranscript && transcript && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full right-0 z-50 mt-2 min-w-[200px] rounded-lg border bg-white p-3 shadow-lg dark:bg-slate-900"
                    >
                        <div className="mb-1 text-xs text-muted-foreground">
                            Anda berkata:
                        </div>
                        <div className="text-sm font-medium">{transcript}</div>

                        <div className="mt-2 text-xs text-muted-foreground">
                            Perintah tersedia:
                            <ul className="mt-1 space-y-0.5">
                                <li>• "scan" - Buka QR scanner</li>
                                <li>• "kamera" - Buka kamera</li>
                                <li>• "kirim" - Submit absensi</li>
                                <li>• "batal" - Cancel</li>
                            </ul>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
