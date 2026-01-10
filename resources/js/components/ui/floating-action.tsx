import { useState } from 'react';
import { Plus, X, QrCode, Camera, MapPin, Users, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingAction {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
    color?: string;
}

interface FloatingActionButtonProps {
    actions: FloatingAction[];
}

export function FloatingActionButton({ actions }: FloatingActionButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col-reverse items-end gap-3">
            {isOpen && (
                <div className="flex flex-col-reverse gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
                    {actions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={index}
                                onClick={() => {
                                    action.onClick();
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    'flex items-center gap-3 rounded-full pl-4 pr-5 py-3 shadow-lg transition-all hover:scale-105',
                                    action.color || 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                )}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-sm font-medium whitespace-nowrap">
                                    {action.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-300',
                    isOpen
                        ? 'bg-slate-600 rotate-45'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                )}
            >
                {isOpen ? (
                    <X className="h-6 w-6 text-white" />
                ) : (
                    <Plus className="h-6 w-6 text-white" />
                )}
            </button>
        </div>
    );
}

// Pre-configured FAB for admin dashboard
export function AdminFloatingActions() {
    const actions: FloatingAction[] = [
        {
            icon: QrCode,
            label: 'Generate QR',
            onClick: () => window.location.href = '/dashboard?section=qr',
            color: 'bg-violet-600 text-white',
        },
        {
            icon: Camera,
            label: 'Absen AI',
            onClick: () => window.location.href = '/dashboard?section=absen-ai',
            color: 'bg-sky-600 text-white',
        },
        {
            icon: MapPin,
            label: 'Set Geofence',
            onClick: () => window.location.href = '/dashboard?section=geofence',
            color: 'bg-amber-600 text-white',
        },
        {
            icon: Users,
            label: 'Tambah Mahasiswa',
            onClick: () => window.location.href = '/dashboard?section=students',
            color: 'bg-emerald-600 text-white',
        },
        {
            icon: FileText,
            label: 'Lihat Laporan',
            onClick: () => window.location.href = '/dashboard?section=reports',
            color: 'bg-rose-600 text-white',
        },
    ];

    return <FloatingActionButton actions={actions} />;
}
