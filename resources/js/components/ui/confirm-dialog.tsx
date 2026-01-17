import { useState, createContext, useContext, useCallback, type ReactNode } from 'react';
import { AlertTriangle, Trash2, CheckCircle, Info, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

// Types
type ConfirmVariant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmOptions {
    title: string;
    message: string;
    variant?: ConfirmVariant;
    confirmText?: string;
    cancelText?: string;
    icon?: ReactNode;
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

// Context
const ConfirmContext = createContext<ConfirmContextType | null>(null);

// Hook
export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context;
}

// Variant configs
const variantConfig = {
    danger: {
        icon: Trash2,
        iconBg: 'bg-red-100 dark:bg-red-500/20',
        iconColor: 'text-red-600 dark:text-red-400',
        buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
        ringColor: 'ring-red-500/20',
    },
    warning: {
        icon: AlertTriangle,
        iconBg: 'bg-amber-100 dark:bg-amber-500/20',
        iconColor: 'text-amber-600 dark:text-amber-400',
        buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
        ringColor: 'ring-amber-500/20',
    },
    info: {
        icon: Info,
        iconBg: 'bg-blue-100 dark:bg-blue-500/20',
        iconColor: 'text-blue-600 dark:text-blue-400',
        buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
        ringColor: 'ring-blue-500/20',
    },
    success: {
        icon: CheckCircle,
        iconBg: 'bg-emerald-100 dark:bg-emerald-500/20',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        ringColor: 'ring-emerald-500/20',
    },
};

// Provider Component
export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

    const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setOptions(opts);
            setResolveRef(() => resolve);
            setIsOpen(true);
        });
    }, []);

    const handleConfirm = () => {
        setIsOpen(false);
        resolveRef?.(true);
        setResolveRef(null);
    };

    const handleCancel = () => {
        setIsOpen(false);
        resolveRef?.(false);
        setResolveRef(null);
    };

    const variant = options?.variant || 'danger';
    const config = variantConfig[variant];
    const IconComponent = config.icon;

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            
            {/* Modal Overlay */}
            {isOpen && options && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={handleCancel}
                    />
                    
                    {/* Dialog */}
                    <div className={cn(
                        "relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-2xl",
                        "animate-in zoom-in-95 fade-in duration-200",
                        "ring-1",
                        config.ringColor
                    )}>
                        {/* Close button */}
                        <button
                            onClick={handleCancel}
                            className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Content */}
                        <div className="p-6">
                            {/* Icon */}
                            <div className="flex justify-center mb-4">
                                <div className={cn(
                                    "flex h-16 w-16 items-center justify-center rounded-full",
                                    config.iconBg
                                )}>
                                    {options.icon || <IconComponent className={cn("h-8 w-8", config.iconColor)} />}
                                </div>
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-semibold text-center text-slate-900 dark:text-white mb-2">
                                {options.title}
                            </h3>

                            {/* Message */}
                            <p className="text-center text-slate-600 dark:text-slate-400 mb-6">
                                {options.message}
                            </p>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-11"
                                    onClick={handleCancel}
                                >
                                    {options.cancelText || 'Batal'}
                                </Button>
                                <Button
                                    className={cn("flex-1 h-11", config.buttonClass)}
                                    onClick={handleConfirm}
                                >
                                    {options.confirmText || 'Ya, Lanjutkan'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}

// Standalone Dialog Component (for cases where provider isn't available)
interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title: string;
    message: string;
    variant?: ConfirmVariant;
    confirmText?: string;
    cancelText?: string;
    icon?: ReactNode;
    loading?: boolean;
}

export function ConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    title,
    message,
    variant = 'danger',
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    icon,
    loading = false,
}: ConfirmDialogProps) {
    const config = variantConfig[variant];
    const IconComponent = config.icon;

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={() => !loading && onOpenChange(false)}
            />
            
            {/* Dialog */}
            <div className={cn(
                "relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-2xl",
                "animate-in zoom-in-95 fade-in duration-200",
                "ring-1",
                config.ringColor
            )}>
                {/* Close button */}
                <button
                    onClick={() => onOpenChange(false)}
                    disabled={loading}
                    className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Content */}
                <div className="p-6">
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                        <div className={cn(
                            "flex h-16 w-16 items-center justify-center rounded-full",
                            config.iconBg
                        )}>
                            {icon || <IconComponent className={cn("h-8 w-8", config.iconColor)} />}
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-center text-slate-900 dark:text-white mb-2">
                        {title}
                    </h3>

                    {/* Message */}
                    <p className="text-center text-slate-600 dark:text-slate-400 mb-6">
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 h-11"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            {cancelText}
                        </Button>
                        <Button
                            className={cn("flex-1 h-11", config.buttonClass)}
                            onClick={onConfirm}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Memproses...
                                </span>
                            ) : confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
