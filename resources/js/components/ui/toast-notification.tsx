import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, Star, Pin, Archive, BellOff, Forward, Copy, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info' | 'warning';
type ToastIcon = 'star' | 'pin' | 'archive' | 'mute' | 'forward' | 'copy' | 'delete' | 'default';

interface Toast {
    id: string;
    title: string;
    description?: string;
    type: ToastType;
    icon?: ToastIcon;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
    showSuccess: (title: string, description?: string, icon?: ToastIcon) => void;
    showError: (title: string, description?: string) => void;
    showInfo: (title: string, description?: string, icon?: ToastIcon) => void;
    showWarning: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

const getIcon = (type: ToastType, customIcon?: ToastIcon) => {
    if (customIcon && customIcon !== 'default') {
        switch (customIcon) {
            case 'star': return <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />;
            case 'pin': return <Pin className="h-5 w-5 text-[#00a884]" />;
            case 'archive': return <Archive className="h-5 w-5 text-[#00a884]" />;
            case 'mute': return <BellOff className="h-5 w-5 text-[#00a884]" />;
            case 'forward': return <Forward className="h-5 w-5 text-[#00a884]" />;
            case 'copy': return <Copy className="h-5 w-5 text-[#00a884]" />;
            case 'delete': return <Trash2 className="h-5 w-5 text-red-400" />;
        }
    }
    
    switch (type) {
        case 'success': return <CheckCircle className="h-5 w-5 text-[#00a884]" />;
        case 'error': return <AlertCircle className="h-5 w-5 text-red-400" />;
        case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-400" />;
        default: return <Info className="h-5 w-5 text-[#53bdeb]" />;
    }
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const duration = toast.duration || 3000;
        const exitTimer = setTimeout(() => setIsExiting(true), duration - 300);
        const removeTimer = setTimeout(onRemove, duration);
        
        return () => {
            clearTimeout(exitTimer);
            clearTimeout(removeTimer);
        };
    }, [toast.duration, onRemove]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onRemove, 300);
    };

    return (
        <div
            className={cn(
                'flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-sm',
                'bg-[#233138]/95 border-[#374045]',
                'transform transition-all duration-300 ease-out',
                'min-w-[320px] max-w-[420px]',
                isExiting 
                    ? 'opacity-0 scale-95 translate-y-2' 
                    : 'opacity-100 scale-100 translate-y-0'
            )}
        >
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
                {getIcon(toast.type, toast.icon)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#e9edef]">{toast.title}</p>
                {toast.description && (
                    <p className="text-xs text-[#8696a0] mt-1 leading-relaxed">{toast.description}</p>
                )}
            </div>

            {/* Close Button */}
            <button
                onClick={handleClose}
                className="flex-shrink-0 p-1 rounded-full hover:bg-[#374045] transition-colors"
            >
                <X className="h-4 w-4 text-[#8696a0]" />
            </button>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#374045] rounded-b-xl overflow-hidden">
                <div 
                    className={cn(
                        'h-full rounded-b-xl',
                        toast.type === 'success' && 'bg-[#00a884]',
                        toast.type === 'error' && 'bg-red-400',
                        toast.type === 'warning' && 'bg-yellow-400',
                        toast.type === 'info' && 'bg-[#53bdeb]'
                    )}
                    style={{
                        animation: `shrink ${toast.duration || 3000}ms linear forwards`
                    }}
                />
            </div>
        </div>
    );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { ...toast, id }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showSuccess = useCallback((title: string, description?: string, icon?: ToastIcon) => {
        addToast({ title, description, type: 'success', icon, duration: 3000 });
    }, [addToast]);

    const showError = useCallback((title: string, description?: string) => {
        addToast({ title, description, type: 'error', duration: 4000 });
    }, [addToast]);

    const showInfo = useCallback((title: string, description?: string, icon?: ToastIcon) => {
        addToast({ title, description, type: 'info', icon, duration: 3000 });
    }, [addToast]);

    const showWarning = useCallback((title: string, description?: string) => {
        addToast({ title, description, type: 'warning', duration: 3500 });
    }, [addToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, showSuccess, showError, showInfo, showWarning }}>
            {children}
            
            {/* Toast Container - Center */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] flex flex-col gap-3 pointer-events-none">
                {toasts.map(toast => (
                    <div key={toast.id} className="pointer-events-auto">
                        <ToastItem toast={toast} onRemove={() => removeToast(toast.id)} />
                    </div>
                ))}
            </div>

            {/* Animation Keyframes */}
            <style>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </ToastContext.Provider>
    );
}
