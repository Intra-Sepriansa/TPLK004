import { useState, useEffect, useCallback } from 'react';

interface VoiceAttendanceOptions {
    language?: string;
    continuous?: boolean;
    interimResults?: boolean;
}

interface VoiceCommand {
    command: string;
    action: () => void;
    keywords: string[];
}

export function useVoiceAttendance(options: VoiceAttendanceOptions = {}) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        // Check if browser supports Speech Recognition
        const SpeechRecognition = 
            (window as any).SpeechRecognition || 
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setIsSupported(false);
            setError('Browser tidak mendukung voice recognition');
            return;
        }

        setIsSupported(true);

        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.lang = options.language || 'id-ID'; // Indonesian
        recognitionInstance.continuous = options.continuous ?? false;
        recognitionInstance.interimResults = options.interimResults ?? true;

        recognitionInstance.onresult = (event: any) => {
            const current = event.resultIndex;
            const transcriptResult = event.results[current][0].transcript;
            setTranscript(transcriptResult);
        };

        recognitionInstance.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setError(`Error: ${event.error}`);
            setIsListening(false);
        };

        recognitionInstance.onend = () => {
            setIsListening(false);
        };

        setRecognition(recognitionInstance);

        return () => {
            if (recognitionInstance) {
                recognitionInstance.stop();
            }
        };
    }, [options.language, options.continuous, options.interimResults]);

    const startListening = useCallback(() => {
        if (!recognition) {
            setError('Recognition not initialized');
            return;
        }

        try {
            recognition.start();
            setIsListening(true);
            setError(null);
            setTranscript('');
        } catch (err) {
            console.error('Error starting recognition:', err);
            setError('Gagal memulai voice recognition');
        }
    }, [recognition]);

    const stopListening = useCallback(() => {
        if (recognition) {
            recognition.stop();
            setIsListening(false);
        }
    }, [recognition]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return {
        isListening,
        transcript,
        isSupported,
        error,
        startListening,
        stopListening,
        resetTranscript,
    };
}

/**
 * Voice Commands Hook for Attendance
 */
export function useVoiceCommands(commands: VoiceCommand[]) {
    const { transcript, isListening, startListening, stopListening, isSupported } = 
        useVoiceAttendance({ language: 'id-ID', continuous: true });

    useEffect(() => {
        if (!transcript) return;

        const lowerTranscript = transcript.toLowerCase();

        // Check each command
        for (const command of commands) {
            const matched = command.keywords.some(keyword => 
                lowerTranscript.includes(keyword.toLowerCase())
            );

            if (matched) {
                console.log(`Voice command matched: ${command.command}`);
                command.action();
                break;
            }
        }
    }, [transcript, commands]);

    return {
        transcript,
        isListening,
        startListening,
        stopListening,
        isSupported,
    };
}

/**
 * Predefined voice commands for attendance
 */
export const attendanceVoiceCommands = (actions: {
    onScanQR: () => void;
    onOpenCamera: () => void;
    onSubmit: () => void;
    onCancel: () => void;
}): VoiceCommand[] => [
    {
        command: 'scan',
        action: actions.onScanQR,
        keywords: ['scan', 'pindai', 'buka qr', 'scan qr'],
    },
    {
        command: 'camera',
        action: actions.onOpenCamera,
        keywords: ['buka kamera', 'kamera', 'selfie', 'foto'],
    },
    {
        command: 'submit',
        action: actions.onSubmit,
        keywords: ['kirim', 'submit', 'simpan', 'selesai'],
    },
    {
        command: 'cancel',
        action: actions.onCancel,
        keywords: ['batal', 'cancel', 'tutup', 'keluar'],
    },
];

/**
 * Text-to-Speech for voice feedback
 */
export function useTextToSpeech() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        setIsSupported('speechSynthesis' in window);
    }, []);

    const speak = useCallback((text: string, options: { lang?: string; rate?: number; pitch?: number } = {}) => {
        if (!isSupported) {
            console.warn('Text-to-speech not supported');
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = options.lang || 'id-ID';
        utterance.rate = options.rate || 1;
        utterance.pitch = options.pitch || 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [isSupported]);

    const stop = useCallback(() => {
        if (isSupported) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, [isSupported]);

    return {
        speak,
        stop,
        isSpeaking,
        isSupported,
    };
}
