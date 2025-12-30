import StudentSidebarLayout from '@/layouts/student/student-sidebar-layout';
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
            {children}
        </StudentSidebarLayout>
    );
}
