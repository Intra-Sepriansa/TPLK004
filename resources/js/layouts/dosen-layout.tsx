import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { DosenSidebar } from '@/components/dosen-sidebar';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface DosenLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function DosenLayout({ children, breadcrumbs }: DosenLayoutProps) {
    return (
        <SidebarProvider>
            <DosenSidebar />
            <SidebarInset>
                <div className="flex min-h-screen flex-col bg-slate-50/50 dark:bg-slate-950">
                    <main className="flex-1">{children}</main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
