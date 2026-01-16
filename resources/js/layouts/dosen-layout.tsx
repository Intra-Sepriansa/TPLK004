import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DosenSidebar } from '@/components/dosen-sidebar';
import { NotificationDropdownAdvanced, type Notification } from '@/components/ui/notification-dropdown-advanced';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { usePage } from '@inertiajs/react';

interface HeaderNotifications {
    items: Notification[];
    unreadCount: number;
}

interface DosenLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    dosen?: { id: number; nama: string };
}

export default function DosenLayout({ children, breadcrumbs, dosen }: DosenLayoutProps) {
    const { props } = usePage<{ 
        headerNotifications?: HeaderNotifications;
        notificationConfig?: { baseUrl: string; allUrl: string };
    }>();
    
    const notifications = props.headerNotifications;
    const config = props.notificationConfig;

    return (
        <SidebarProvider>
            <DosenSidebar />
            <SidebarInset>
                <div className="flex min-h-screen flex-col bg-slate-50/50 dark:bg-slate-950">
                    {/* Mobile Header with Sidebar Trigger */}
                    <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b border-slate-200/60 bg-white/80 px-4 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-950/80 md:hidden">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger className="-ml-1" />
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Panel Dosen</span>
                        </div>
                        {notifications && config && (
                            <NotificationDropdownAdvanced
                                notifications={notifications.items}
                                unreadCount={notifications.unreadCount}
                                baseUrl={config.baseUrl}
                                allNotificationsUrl={config.allUrl}
                            />
                        )}
                    </header>
                    {/* Desktop Header */}
                    <header className="sticky top-0 z-40 hidden h-14 items-center justify-between gap-4 border-b border-slate-200/60 bg-white/80 px-6 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-950/80 md:flex">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger className="-ml-1" />
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Panel Dosen</span>
                        </div>
                        {notifications && config && (
                            <NotificationDropdownAdvanced
                                notifications={notifications.items}
                                unreadCount={notifications.unreadCount}
                                baseUrl={config.baseUrl}
                                allNotificationsUrl={config.allUrl}
                            />
                        )}
                    </header>
                    <main className="flex-1">{children}</main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
