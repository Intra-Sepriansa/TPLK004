import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type NavItem } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';
import {
    BookOpen,
    CheckCircle,
    Home,
    LogOut,
    UserCircle,
} from 'lucide-react';

const dosenNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dosen',
        icon: Home,
    },
    {
        title: 'Mata Kuliah',
        href: '/dosen/courses',
        icon: BookOpen,
    },
    {
        title: 'Verifikasi',
        href: '/dosen/verify',
        icon: CheckCircle,
    },
    {
        title: 'Profil',
        href: '/dosen/profile',
        icon: UserCircle,
    },
];

type DosenInfo = {
    id: number;
    nama: string;
    nidn: string;
    initials?: string;
};

export function DosenSidebar() {
    const { props } = usePage<{ dosen?: DosenInfo }>();
    const dosen = props.dosen;
    const initials = useInitials();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dosen" prefetch>
                                <div className="flex aspect-square size-8 items-center justify-center rounded-md">
                                    <AppLogoIcon className="size-8" />
                                </div>
                                <div className="ml-1 grid flex-1 text-left text-sm">
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/60">
                                        Dosen
                                    </span>
                                    <span className="truncate font-semibold leading-tight">
                                        Monitoring
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain label="Menu" items={dosenNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <div className="rounded-xl border border-sidebar-border/60 bg-sidebar-accent/40 p-3">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-400/20 dark:text-indigo-200">
                                {dosen?.initials || initials(dosen?.nama ?? 'Dosen')}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-sm">
                            <p className="truncate font-semibold text-sidebar-foreground">
                                {dosen?.nama ?? 'Dosen'}
                            </p>
                            <p className="text-xs text-sidebar-foreground/60">
                                NIDN {dosen?.nidn ?? '-'}
                            </p>
                        </div>
                    </div>
                </div>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            type="button"
                            onClick={() => router.post('/dosen/logout')}
                        >
                            <LogOut />
                            <span>Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
