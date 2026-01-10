import { Link, usePage } from '@inertiajs/react';
import { Home, QrCode, FileText, User, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/user', icon: Home, label: 'Home' },
    { href: '/user/absen', icon: QrCode, label: 'Absen' },
    { href: '/user/history', icon: FileText, label: 'Riwayat' },
    { href: '/user/achievements', icon: Award, label: 'Badge' },
    { href: '/user/profile', icon: User, label: 'Profil' },
];

export function BottomNav() {
    const { url } = usePage();

    const isActive = (href: string) => {
        if (href === '/user') {
            return url === '/user' || url === '/user/dashboard';
        }
        return url.startsWith(href);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/95 lg:hidden">
            <div className="flex items-center justify-around px-2 py-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all',
                                active
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                            )}
                        >
                            <div className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-lg transition-all',
                                active && 'bg-emerald-100 dark:bg-emerald-900/30'
                            )}>
                                <Icon className={cn('h-5 w-5', active && 'scale-110')} />
                            </div>
                            <span className={cn(
                                'text-[10px] font-medium',
                                active && 'font-semibold'
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
            {/* Safe area for iOS */}
            <div className="h-safe-area-inset-bottom bg-white dark:bg-slate-950" />
        </nav>
    );
}
