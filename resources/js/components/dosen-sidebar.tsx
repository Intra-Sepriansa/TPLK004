import { NavMain } from '@/components/nav-main';
import { DosenNavUser } from './dosen-nav-user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useInitials } from '@/hooks/use-initials';
import { formatShortName } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Bell,
    BookOpen,
    Calendar,
    CheckCircle,
    ClipboardList,
    FileCheck,
    FileText,
    GraduationCap,
    HelpCircle,
    Home,
    LogOut,
    MessageCircle,
    Settings,
    UserCircle,
    Users2,
} from 'lucide-react';
import AppLogoIcon from './app-logo-icon';

const dosenNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dosen',
        icon: Home,
    },
    {
        title: 'Sesi Absen',
        href: '/dosen/sesi-absen',
        icon: Calendar,
    },
    {
        title: 'Mata Kuliah',
        href: '/dosen/courses',
        icon: BookOpen,
    },
    {
        title: 'Chat',
        href: '/chat',
        icon: MessageCircle,
    },
    {
        title: 'Informasi Tugas',
        href: '/dosen/tugas',
        icon: ClipboardList,
    },
    {
        title: 'Tugas Kelompok',
        href: '/dosen/tugas-kelompok',
        icon: Users2,
    },
    {
        title: 'Persetujuan Izin',
        href: '/dosen/permits',
        icon: FileCheck,
    },
    {
        title: 'Verifikasi',
        href: '/dosen/verify',
        icon: CheckCircle,
    },
    {
        title: 'Rekapan',
        href: '/dosen/rekapan',
        icon: ClipboardList,
    },
    {
        title: 'Penilaian',
        href: '/dosen/grading',
        icon: GraduationCap,
    },
    {
        title: 'Class Insights',
        href: '/dosen/class-insights',
        icon: BarChart3,
    },
    {
        title: 'Session Templates',
        href: '/dosen/session-templates',
        icon: FileText,
    },
    {
        title: 'Bantuan',
        href: '/dosen/help',
        icon: HelpCircle,
    },
];

type DosenInfo = {
    id: number;
    nama: string;
    nidn: string;
    initials?: string;
    avatar_url?: string;
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
                                    <span className="text-[10px] tracking-[0.2em] text-sidebar-foreground/60 uppercase">
                                        Dosen
                                    </span>
                                    <span className="truncate leading-tight font-semibold">
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
                {dosen && <DosenNavUser dosen={dosen} />}
            </SidebarFooter>
        </Sidebar>
    );
}
