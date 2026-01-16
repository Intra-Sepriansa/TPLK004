import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    Camera,
    CalendarCheck,
    ClipboardList,
    Clock,
    FileBarChart,
    LifeBuoy,
    LayoutGrid,
    MapPin,
    BookOpen,
    MessageCircle,
    QrCode,
    Radar,
    ScanFace,
    Settings,
    ShieldCheck,
    TabletSmartphone,
    Trophy,
    Users,
    Vote,
    Wallet,
    BarChart3,
    ScrollText,
    Shield,
    Bell,
    Upload,
    TrendingUp,
} from 'lucide-react';
import AppLogo from './app-logo';

const attendanceNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Sesi Absen',
        href: '/admin/sesi-absen',
        icon: CalendarCheck,
    },
    {
        title: 'QR Builder',
        href: '/admin/qr-builder',
        icon: QrCode,
    },
    {
        title: 'Live Monitor',
        href: '/admin/live-monitor',
        icon: Radar,
    },
    {
        title: 'Absen AI',
        href: dashboard({ query: { section: 'absen-ai' } }),
        icon: Camera,
    },
    {
        title: 'Verifikasi Selfie',
        href: '/admin/verifikasi-selfie',
        icon: ScanFace,
    },
    {
        title: 'Zona',
        href: '/admin/zona',
        icon: MapPin,
    },
];

const managementNavItems: NavItem[] = [
    {
        title: 'Mahasiswa',
        href: '/admin/mahasiswa',
        icon: Users,
    },
    {
        title: 'Perangkat',
        href: '/admin/perangkat',
        icon: TabletSmartphone,
    },
    {
        title: 'Jadwal',
        href: '/admin/jadwal',
        icon: Clock,
    },
    {
        title: 'Chat',
        href: '/chat',
        icon: MessageCircle,
    },
    {
        title: 'Informasi Tugas',
        href: '/admin/tugas',
        icon: ClipboardList,
    },
    {
        title: 'Uang Kas',
        href: '/admin/kas',
        icon: Wallet,
    },
    {
        title: 'Voting Kas',
        href: '/admin/kas-voting',
        icon: Vote,
    },
    {
        title: 'Leaderboard',
        href: '/admin/leaderboard',
        icon: Trophy,
    },
    {
        title: 'Pengaturan',
        href: '/admin/pengaturan',
        icon: Settings,
    },
];

const reportNavItems: NavItem[] = [
    {
        title: 'Rekap Kehadiran',
        href: '/admin/rekap-kehadiran',
        icon: FileBarChart,
    },
    {
        title: 'Analytics & Prediksi',
        href: '/admin/analytics',
        icon: BarChart3,
    },
    {
        title: 'Advanced Analytics',
        href: '/admin/advanced-analytics',
        icon: TrendingUp,
    },
    {
        title: 'Fraud Detection',
        href: '/admin/fraud-detection',
        icon: Shield,
    },
    {
        title: 'Notification Center',
        href: '/admin/notification-center',
        icon: Bell,
    },
    {
        title: 'Bulk Import',
        href: '/admin/bulk-import',
        icon: Upload,
    },
    {
        title: 'Audit Keamanan',
        href: '/admin/audit',
        icon: ShieldCheck,
    },
    {
        title: 'Log Aktivitas',
        href: '/admin/activity-log',
        icon: ScrollText,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Panduan Admin',
        href: '/admin/panduan',
        icon: BookOpen,
    },
    {
        title: 'Help Center',
        href: '/admin/help-center',
        icon: LifeBuoy,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain label="Absensi" items={attendanceNavItems} />
                <NavMain label="Manajemen" items={managementNavItems} />
                <NavMain label="Laporan" items={reportNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
