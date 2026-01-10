import StudentSidebarLayout from '@/layouts/student/student-sidebar-layout';
import { BottomNav } from '@/components/student/bottom-nav';
import { OfflineIndicator } from '@/components/offline/offline-indicator';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface StudentLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function StudentLayout({
    children,
    breadcrumbs,
}: StudentLayoutProps) {
    return (
        <StudentSidebarLayout breadcrumbs={breadcrumbs}>
            <div className="pb-20 lg:pb-0">
                {children}
            </div>
            <BottomNav />
            <OfflineIndicator />
            <InstallPrompt />
        </StudentSidebarLayout>
    );
}
