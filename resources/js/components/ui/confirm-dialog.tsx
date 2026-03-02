import { useState, createContext, useContext, useCallback, type ReactNode } from 'react';
import { AlertTriangle, Trash2, CheckCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

// Types
type ConfirmVariant = 'danger' | 'warning' | 'info' | 'success';
type ConfirmTheme = 'default' | 'admin-dashboard';

interface ConfirmOptions {
    title: string;
    message: string;
    variant?: ConfirmVariant;
    theme?: ConfirmTheme;
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

const adminVariantConfig = {
    danger: {
        iconBg: 'border border-red-400/30 bg-red-500/20',
        iconColor: 'text-red-200',
        buttonClass:
            'h-12 rounded-xl border-0 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white shadow-[0_14px_30px_rgba(225,29,72,0.35)] transition-all hover:from-rose-500 hover:via-red-500 hover:to-rose-600',
        warningClass: 'border-red-400/30 bg-red-500/12 text-red-100',
        warningKickerClass: 'text-red-200',
        warningMessageClass: 'text-red-100/90',
    },
    warning: {
        iconBg: 'border border-amber-300/30 bg-amber-500/20',
        iconColor: 'text-amber-100',
        buttonClass:
            'h-12 rounded-xl border-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-[0_14px_30px_rgba(217,119,6,0.35)] transition-all hover:from-amber-400 hover:via-orange-400 hover:to-amber-500',
        warningClass: 'border-amber-300/30 bg-amber-500/12 text-amber-100',
        warningKickerClass: 'text-amber-200',
        warningMessageClass: 'text-amber-100/90',
    },
    info: {
        iconBg: 'border border-sky-300/30 bg-sky-500/20',
        iconColor: 'text-sky-100',
        buttonClass:
            'h-12 rounded-xl border-0 bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-600 text-white shadow-[0_14px_30px_rgba(56,189,248,0.35)] transition-all hover:from-sky-400 hover:via-indigo-400 hover:to-sky-500',
        warningClass: 'border-sky-300/30 bg-sky-500/12 text-sky-100',
        warningKickerClass: 'text-sky-200',
        warningMessageClass: 'text-sky-100/90',
    },
    success: {
        iconBg: 'border border-emerald-300/30 bg-emerald-500/20',
        iconColor: 'text-emerald-100',
        buttonClass:
            'h-12 rounded-xl border-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-[0_14px_30px_rgba(16,185,129,0.35)] transition-all hover:from-emerald-400 hover:via-teal-400 hover:to-emerald-500',
        warningClass: 'border-emerald-300/30 bg-emerald-500/12 text-emerald-100',
        warningKickerClass: 'text-emerald-200',
        warningMessageClass: 'text-emerald-100/90',
    },
} as const;

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
    const theme = options?.theme || 'default';
    const config = variantConfig[variant];
    const adminConfig = adminVariantConfig[variant];
    const IconComponent = config.icon;
    const isAdminTheme = theme === 'admin-dashboard';

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}

            {/* Modal Overlay */}
            {isOpen && options && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className={cn(
                            'absolute inset-0 animate-in fade-in duration-200',
                            isAdminTheme
                                ? 'bg-slate-950/80 backdrop-blur-md'
                                : 'bg-black/60 backdrop-blur-sm',
                        )}
                        onClick={handleCancel}
                    />

                    {/* Dialog */}
                    <div
                        className={cn(
                            'relative w-full animate-in zoom-in-95 fade-in duration-200',
                            isAdminTheme
                                ? 'max-w-lg overflow-hidden rounded-3xl border border-slate-200/70 bg-slate-950 text-white shadow-2xl'
                                : 'max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-inset dark:bg-slate-900',
                            !isAdminTheme && config.ringColor,
                        )}
                    >
                        {isAdminTheme && (
                            <>
                                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_600px_at_90%_10%,rgba(16,185,129,0.25),transparent_60%)]" />
                                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.08),transparent)] bg-[length:200%_200%] opacity-60 animate-sweep" />
                            </>
                        )}

                        {/* Close button */}
                        <button
                            onClick={handleCancel}
                            className={cn(
                                'absolute right-4 top-4 z-20 p-1 transition-colors',
                                isAdminTheme
                                    ? 'rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                                    : 'rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300',
                            )}
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Content */}
                        <div className={cn('relative p-6 sm:p-7', isAdminTheme && 'z-10')}>
                            {/* Icon */}
                            <div className="mb-5 flex justify-center">
                                <div
                                    className={cn(
                                        'flex items-center justify-center',
                                        isAdminTheme
                                            ? 'h-20 w-20 rounded-[22px]'
                                            : 'h-16 w-16 rounded-full',
                                        isAdminTheme ? adminConfig.iconBg : config.iconBg,
                                    )}
                                >
                                    {options.icon || (
                                        <IconComponent
                                            className={cn(
                                                isAdminTheme ? 'h-9 w-9' : 'h-8 w-8',
                                                isAdminTheme
                                                    ? adminConfig.iconColor
                                                    : config.iconColor,
                                            )}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Title */}
                            <h3
                                className={cn(
                                    'text-center font-semibold mb-2',
                                    isAdminTheme
                                        ? 'text-2xl tracking-tight text-white'
                                        : 'text-xl text-slate-900 dark:text-white',
                                )}
                            >
                                {options.title}
                            </h3>

                            {/* Message */}
                            <p
                                className={cn(
                                    'text-center mb-6',
                                    isAdminTheme
                                        ? 'text-base leading-relaxed text-slate-300'
                                        : 'text-slate-600 dark:text-slate-400',
                                )}
                            >
                                {options.message}
                            </p>

                            {isAdminTheme && (
                                <div
                                    className={cn(
                                        'mb-6 rounded-2xl border px-4 py-3 text-left',
                                        adminConfig.warningClass,
                                    )}
                                >
                                    <p
                                        className={cn(
                                            'text-[10px] font-semibold uppercase tracking-[0.22em]',
                                            adminConfig.warningKickerClass,
                                        )}
                                    >
                                        Konfirmasi Aksi
                                    </p>
                                    <p
                                        className={cn(
                                            'mt-1 text-sm leading-relaxed',
                                            adminConfig.warningMessageClass,
                                        )}
                                    >
                                        {variant === 'danger'
                                            ? 'Aksi ini permanen. Data yang dihapus tidak dapat dipulihkan.'
                                            : 'Pastikan pilihan Anda sudah benar sebelum melanjutkan proses.'}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'flex-1 h-11',
                                        isAdminTheme &&
                                            'h-12 rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white',
                                    )}
                                    onClick={handleCancel}
                                >
                                    {options.cancelText || 'Batal'}
                                </Button>
                                <Button
                                    className={cn(
                                        'flex-1 h-11',
                                        isAdminTheme
                                            ? adminConfig.buttonClass
                                            : config.buttonClass,
                                    )}
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
    theme?: ConfirmTheme;
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
    theme = 'default',
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    icon,
    loading = false,
}: ConfirmDialogProps) {
    const config = variantConfig[variant];
    const adminConfig = adminVariantConfig[variant];
    const IconComponent = config.icon;
    const isAdminTheme = theme === 'admin-dashboard';

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className={cn(
                    'absolute inset-0 animate-in fade-in duration-200',
                    isAdminTheme
                        ? 'bg-slate-950/80 backdrop-blur-md'
                        : 'bg-black/60 backdrop-blur-sm',
                )}
                onClick={() => !loading && onOpenChange(false)}
            />

            {/* Dialog */}
            <div
                className={cn(
                    'relative w-full animate-in zoom-in-95 fade-in duration-200',
                    isAdminTheme
                        ? 'max-w-lg overflow-hidden rounded-3xl border border-slate-200/70 bg-slate-950 text-white shadow-2xl'
                        : 'max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-inset dark:bg-slate-900',
                    !isAdminTheme && config.ringColor,
                )}
            >
                {isAdminTheme && (
                    <>
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_600px_at_90%_10%,rgba(16,185,129,0.25),transparent_60%)]" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.08),transparent)] bg-[length:200%_200%] opacity-60 animate-sweep" />
                    </>
                )}

                {/* Close button */}
                <button
                    onClick={() => onOpenChange(false)}
                    disabled={loading}
                    className={cn(
                        'absolute right-4 top-4 z-20 p-1 transition-colors disabled:opacity-50',
                        isAdminTheme
                            ? 'rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                            : 'rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300',
                    )}
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Content */}
                <div className={cn('relative p-6 sm:p-7', isAdminTheme && 'z-10')}>
                    {/* Icon */}
                    <div className="mb-5 flex justify-center">
                        <div
                            className={cn(
                                'flex items-center justify-center',
                                isAdminTheme
                                    ? 'h-20 w-20 rounded-[22px]'
                                    : 'h-16 w-16 rounded-full',
                                isAdminTheme ? adminConfig.iconBg : config.iconBg,
                            )}
                        >
                            {icon || (
                                <IconComponent
                                    className={cn(
                                        isAdminTheme ? 'h-9 w-9' : 'h-8 w-8',
                                        isAdminTheme
                                            ? adminConfig.iconColor
                                            : config.iconColor,
                                    )}
                                />
                            )}
                        </div>
                    </div>

                    {/* Title */}
                    <h3
                        className={cn(
                            'text-center font-semibold mb-2',
                            isAdminTheme
                                ? 'text-2xl tracking-tight text-white'
                                : 'text-xl text-slate-900 dark:text-white',
                        )}
                    >
                        {title}
                    </h3>

                    {/* Message */}
                    <p
                        className={cn(
                            'text-center mb-6',
                            isAdminTheme
                                ? 'text-base leading-relaxed text-slate-300'
                                : 'text-slate-600 dark:text-slate-400',
                        )}
                    >
                        {message}
                    </p>

                    {isAdminTheme && (
                        <div
                            className={cn(
                                'mb-6 rounded-2xl border px-4 py-3 text-left',
                                adminConfig.warningClass,
                            )}
                        >
                            <p
                                className={cn(
                                    'text-[10px] font-semibold uppercase tracking-[0.22em]',
                                    adminConfig.warningKickerClass,
                                )}
                            >
                                Konfirmasi Aksi
                            </p>
                            <p
                                className={cn(
                                    'mt-1 text-sm leading-relaxed',
                                    adminConfig.warningMessageClass,
                                )}
                            >
                                {variant === 'danger'
                                    ? 'Aksi ini permanen. Data yang dihapus tidak dapat dipulihkan.'
                                    : 'Pastikan pilihan Anda sudah benar sebelum melanjutkan proses.'}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className={cn(
                                'flex-1 h-11',
                                isAdminTheme &&
                                    'h-12 rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white',
                            )}
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            {cancelText}
                        </Button>
                        <Button
                            className={cn(
                                'flex-1 h-11',
                                isAdminTheme
                                    ? adminConfig.buttonClass
                                    : config.buttonClass,
                            )}
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
