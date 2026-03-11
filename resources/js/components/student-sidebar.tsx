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

import { useInitials } from '@/hooks/use-initials';
import { type SharedData, type NavItem } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';
import { StudentNavUser } from './student-nav-user';
import {
    Award,
    BookOpen,
    CalendarCheck,
    ClipboardList,
    FileText,
    GraduationCap,
    History,
    Home,
    LogOut,
    MessageCircle,
    NotebookPen,
    QrCode,
    UserCircle,
    Wallet,
    FileCheck,
    BarChart3,
    Bell,
    Settings,
    HelpCircle,
    CalendarDays,
    Shield,
} from 'lucide-react';

const studentNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/user',
        icon: Home,
    },
    {
        title: 'Absen',
        href: '/user/absen',
        icon: QrCode,
    },
    {
        title: 'Jadwal Kuliah',
        href: '/user/akademik/jadwal',
        icon: CalendarDays,
    },
    {
        title: 'Rekapan & Evaluasi',
        href: '/user/rekapan',
        icon: FileText,
    },
    {
        title: 'Riwayat',
        href: '/user/history',
        icon: History,
    },
    {
        title: 'Chat',
        href: '/chat',
        icon: MessageCircle,
    },
    {
        title: 'Izin/Sakit',
        href: '/user/permit',
        icon: FileCheck,
    },
    {
        title: 'Akademik',
        href: '/user/akademik',
        icon: GraduationCap,
    },
    {
        title: 'Monitoring Kehadiran',
        href: '/user/akademik/kehadiran',
        icon: CalendarCheck,
    },
    {
        title: 'Personal Analytics',
        href: '/user/personal-analytics',
        icon: BarChart3,
    },
    {
        title: 'Pencapaian & Leaderboard',
        href: '/user/achievements',
        icon: Award,
    },
    {
        title: 'Notifikasi',
        href: '/user/notifications',
        icon: Bell,
    },
    {
        title: 'Verifikasi Selfie',
        href: '/user/selfie-verification',
        icon: Shield,
    },
    {
        title: 'Uang Kas',
        href: '/user/kas',
        icon: Wallet,
    },
    {
        title: 'Dokumentasi',
        href: '/user/docs',
        icon: BookOpen,
    },

];

type MahasiswaInfo = {
    id: number;
    nama: string;
    nim: string;
    warningCount?: number;
};

export function StudentSidebar() {
    const { props } = usePage<SharedData & { mahasiswa?: MahasiswaInfo }>();
    const mahasiswa = props.mahasiswa;

    const studentNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/user',
            icon: Home,
        },
        {
            title: 'Absen',
            href: '/user/absen',
            icon: QrCode,
        },
        {
            title: 'Jadwal Kuliah',
            href: '/user/akademik/jadwal',
            icon: CalendarDays,
        },
        {
            title: 'Rekapan & Evaluasi',
            href: '/user/rekapan',
            icon: FileText,
            badge: mahasiswa?.warningCount,
        },
        {
            title: 'Riwayat',
            href: '/user/history',
            icon: History,
        },
        {
            title: 'Chat',
            href: '/chat',
            icon: MessageCircle,
        },
        {
            title: 'Informasi Tugas',
            href: '/user/tugas',
            icon: ClipboardList,
        },
        {
            title: 'Izin/Sakit',
            href: '/user/permit',
            icon: FileCheck,
        },
        {
            title: 'Akademik',
            href: '/user/akademik',
            icon: GraduationCap,
        },
        {
            title: 'Monitoring Kehadiran',
            href: '/user/akademik/kehadiran',
            icon: CalendarCheck,
        },
        {
            title: 'Personal Analytics',
            href: '/user/personal-analytics',
            icon: BarChart3,
        },
        {
            title: 'Pencapaian & Leaderboard',
            href: '/user/achievements',
            icon: Award,
        },
        {
            title: 'Notifikasi',
            href: '/user/notifications',
            icon: Bell,
        },
        {
            title: 'Verifikasi Selfie',
            href: '/user/selfie-verification',
            icon: Shield,
        },
        {
            title: 'Uang Kas',
            href: '/user/kas',
            icon: Wallet,
        },
        {
            title: 'Dokumentasi',
            href: '/user/docs',
            icon: BookOpen,
        },

    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/user/absen" prefetch>
                                <div className="flex aspect-square size-8 items-center justify-center rounded-md">
                                    <AppLogoIcon className="size-8" />
                                </div>
                                <div className="ml-1 grid flex-1 text-left text-sm">
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/60">
                                        Mahasiswa
                                    </span>
                                    <span className="truncate font-semibold leading-tight">
                                        Absensi
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain label="Menu" items={studentNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <StudentNavUser mahasiswa={mahasiswa} />
            </SidebarFooter>
        </Sidebar>
    );
}
