import { NetworkStatusBadge } from '@/components/network/NetworkStatusBadge';
import { OfflineIndicator } from '@/components/offline/offline-indicator';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import StudentSidebarLayout from '@/layouts/student/student-sidebar-layout';
import { syncOfflineAttendances } from '@/lib/offline-sync';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode, useEffect } from 'react';
import { Toaster } from 'sonner';

interface StudentLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function StudentLayout({
    children,
    breadcrumbs,
}: StudentLayoutProps) {
    useEffect(() => {
        // Run sync once on mount if already online
        if (typeof window !== 'undefined' && navigator.onLine) {
            syncOfflineAttendances();
        }

        // Listen for online events
        const handleOnline = () => {
            syncOfflineAttendances();
        };

        window.addEventListener('online', handleOnline);

        return () => {
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    return (
        <StudentSidebarLayout breadcrumbs={breadcrumbs}>
            <div>{children}</div>
            <OfflineIndicator />
            <InstallPrompt />
            <NetworkStatusBadge />
            <Toaster position="top-right" theme="dark" richColors closeButton />
        </StudentSidebarLayout>
    );
}
