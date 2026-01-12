import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
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
                    {/* Mobile Header with Sidebar Trigger */}
                    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-slate-200/60 bg-white/80 px-4 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-950/80 md:hidden">
                        <SidebarTrigger className="-ml-1" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Panel Dosen</span>
                    </header>
                    <main className="flex-1">{children}</main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
