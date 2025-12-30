import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import PageTransition from '@/components/page-transition';
import { StudentSidebar } from '@/components/student-sidebar';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function StudentSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <AppShell variant="sidebar">
            <StudentSidebar />
            <AppContent
                variant="sidebar"
                className="overflow-x-hidden"
            >
                <PageTransition>
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                    {children}
                </PageTransition>
            </AppContent>
        </AppShell>
    );
}
