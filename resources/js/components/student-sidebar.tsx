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
import { type SharedData, type NavItem } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';
import {
    BadgeCheck,
    FileText,
    KeyRound,
    LogOut,
    QrCode,
    UserCircle,
} from 'lucide-react';

const studentNavItems: NavItem[] = [
    {
        title: 'Absen',
        href: '/user/absen',
        icon: QrCode,
    },
    {
        title: 'Rekapan',
        href: '/user/rekapan',
        icon: FileText,
    },
    {
        title: 'Bukti Masuk',
        href: '/user/bukti-masuk',
        icon: BadgeCheck,
    },
    {
        title: 'Profil',
        href: '/user/profile',
        icon: UserCircle,
    },
    {
        title: 'Ganti Password',
        href: '/user/password',
        icon: KeyRound,
    },
];

type MahasiswaInfo = {
    id: number;
    nama: string;
    nim: string;
};

export function StudentSidebar() {
    const { props } = usePage<SharedData & { mahasiswa?: MahasiswaInfo }>();
    const mahasiswa = props.mahasiswa;
    const initials = useInitials();

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
                <div className="rounded-xl border border-sidebar-border/60 bg-sidebar-accent/40 p-3">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200">
                                {initials(mahasiswa?.nama ?? 'Mahasiswa')}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-sm">
                            <p className="truncate font-semibold text-sidebar-foreground">
                                {mahasiswa?.nama ?? 'Mahasiswa'}
                            </p>
                            <p className="text-xs text-sidebar-foreground/60">
                                NIM {mahasiswa?.nim ?? '-'}
                            </p>
                        </div>
                    </div>
                </div>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            type="button"
                            onClick={() => router.post('/logout/mahasiswa')}
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
