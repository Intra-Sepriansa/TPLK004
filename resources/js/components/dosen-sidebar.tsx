import { NavMain } from '@/components/nav-main';
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
        title: 'Notifikasi',
        href: '/dosen/notifications',
        icon: Bell,
    },
    {
        title: 'Dokumentasi',
        href: '/dosen/docs',
        icon: BookOpen,
    },
    {
        title: 'Dokumentasi UML',
        href: '/dosen/dokumentasi-uml',
        icon: FileText,
    },
    {
        title: 'Pengaturan',
        href: '/dosen/settings',
        icon: Settings,
    },
    {
        title: 'Bantuan',
        href: '/dosen/help',
        icon: HelpCircle,
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
                <div className="rounded-xl border border-sidebar-border/60 bg-sidebar-accent/40 p-3">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            {dosen?.avatar_url && (
                                <AvatarImage
                                    src={dosen.avatar_url}
                                    alt={dosen.nama}
                                    className="object-cover"
                                />
                            )}
                            <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-400/20 dark:text-indigo-200">
                                {dosen?.initials ||
                                    initials(dosen?.nama ?? 'Dosen')}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-sidebar-foreground">
                                {dosen?.nama
                                    ? formatShortName(dosen.nama)
                                    : 'Dosen'}
                            </p>
                            <p className="mt-0.5 truncate text-[10px] text-sidebar-foreground/60">
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
