import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { NotificationDropdownAdvanced, type Notification } from '@/components/ui/notification-dropdown-advanced';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { usePage } from '@inertiajs/react';

interface HeaderNotifications {
    items: Notification[];
    unreadCount: number;
}

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { props } = usePage<{ 
        headerNotifications?: HeaderNotifications;
        notificationConfig?: { baseUrl: string; allUrl: string };
    }>();
    
    const notifications = props.headerNotifications;
    const config = props.notificationConfig;

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            {notifications && config && (
                <div className="flex items-center gap-2">
                    <NotificationDropdownAdvanced
                        notifications={notifications.items}
                        unreadCount={notifications.unreadCount}
                        baseUrl={config.baseUrl}
                        allNotificationsUrl={config.allUrl}
                    />
                </div>
            )}
        </header>
    );
}
