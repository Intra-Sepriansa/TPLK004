import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { Link, router } from '@inertiajs/react';
import { ChevronsUpDown, LogOut, Settings, UserCircle } from 'lucide-react';

type MahasiswaInfo = {
    id: number;
    nama: string;
    nim: string;
    warningCount?: number;
};

export function StudentNavUser({ mahasiswa }: { mahasiswa?: MahasiswaInfo }) {
    const { state } = useSidebar();
    const isMobile = useIsMobile();
    const initials = useInitials();
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.post('/logout/mahasiswa');
    };

    if (!mahasiswa) return null;

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="group text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarFallback className="rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200">
                                    {initials(mahasiswa.nama)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{mahasiswa.nama}</span>
                                <span className="truncate text-xs text-muted-foreground">NIM {mahasiswa.nim}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="end"
                        side={isMobile ? 'bottom' : state === 'collapsed' ? 'left' : 'bottom'}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarFallback className="rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200">
                                        {initials(mahasiswa.nama)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{mahasiswa.nama}</span>
                                    <span className="truncate text-xs text-muted-foreground">NIM {mahasiswa.nim}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link
                                    className="flex w-full items-center"
                                    href="/user/profile"
                                    as="button"
                                    prefetch
                                    onClick={cleanup}
                                >
                                    <UserCircle className="mr-2 h-4 w-4" />
                                    Profil
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link
                                    className="flex w-full items-center"
                                    href="/user/settings"
                                    as="button"
                                    prefetch
                                    onClick={cleanup}
                                >
                                    <Settings className="mr-2 h-4 w-4" />
                                    Pengaturan
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <button
                                className="flex w-full items-center"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Log out
                            </button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
