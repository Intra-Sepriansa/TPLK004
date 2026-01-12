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
    Clock,
    FileBarChart,
    LifeBuoy,
    LayoutGrid,
    MapPin,
    BookOpen,
    QrCode,
    Radar,
    ScanFace,
    Settings,
    ShieldCheck,
    TabletSmartphone,
    Users,
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
        href: dashboard({ query: { section: 'sessions' } }),
        icon: CalendarCheck,
    },
    {
        title: 'QR Builder',
        href: dashboard({ query: { section: 'qr' } }),
        icon: QrCode,
    },
    {
        title: 'Live Monitor',
        href: dashboard({ query: { section: 'monitor' } }),
        icon: Radar,
    },
    {
        title: 'Absen AI',
        href: dashboard({ query: { section: 'absen-ai' } }),
        icon: Camera,
    },
    {
        title: 'Verifikasi Selfie',
        href: dashboard({ query: { section: 'selfie' } }),
        icon: ScanFace,
    },
    {
        title: 'Zona',
        href: dashboard({ query: { section: 'geofence' } }),
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
        title: 'Audit Keamanan',
        href: '/admin/audit',
        icon: ShieldCheck,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Panduan Admin',
        href: dashboard({ query: { section: 'admin-guide' } }),
        icon: BookOpen,
    },
    {
        title: 'Help Center',
        href: dashboard({ query: { section: 'help-center' } }),
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
