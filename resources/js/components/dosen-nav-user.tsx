import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { useInitials } from '@/hooks/use-initials';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatShortName } from '@/lib/utils';
import { Link, router } from '@inertiajs/react';
import {
    ChevronsUpDown,
    LogOut,
    Settings,
    User as UserIcon,
} from 'lucide-react';

type DosenInfo = {
    id: number;
    nama: string;
    nidn: string;
    initials?: string;
    avatar_url?: string;
};

interface DosenNavUserProps {
    dosen: DosenInfo;
}

export function DosenNavUser({ dosen }: DosenNavUserProps) {
    const { state } = useSidebar();
    const isMobile = useIsMobile();
    const initials = useInitials();

    const handleLogout = () => {
        router.post('/dosen/logout');
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="group border border-sidebar-border/60 bg-sidebar-accent/40 text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                {dosen.avatar_url && (
                                    <AvatarImage
                                        src={dosen.avatar_url}
                                        alt={dosen.nama}
                                        className="object-cover"
                                    />
                                )}
                                <AvatarFallback className="rounded-lg bg-indigo-100 text-xs text-indigo-700 dark:bg-indigo-400/20 dark:text-indigo-200">
                                    {dosen.initials || initials(dosen.nama)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    {formatShortName(dosen.nama)}
                                </span>
                                <span className="truncate text-xs text-sidebar-foreground/60">
                                    NIDN {dosen.nidn}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4 opacity-50" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="end"
                        side={
                            isMobile
                                ? 'bottom'
                                : state === 'collapsed'
                                  ? 'left'
                                  : 'bottom'
                        }
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    {dosen.avatar_url && (
                                        <AvatarImage
                                            src={dosen.avatar_url}
                                            alt={dosen.nama}
                                        />
                                    )}
                                    <AvatarFallback className="rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-400/20 dark:text-indigo-200">
                                        {dosen.initials || initials(dosen.nama)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        {dosen.nama}
                                    </span>
                                    <span className="truncate text-xs text-sidebar-foreground/60">
                                        {dosen.nidn}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link
                                    className="block w-full cursor-pointer"
                                    href="/dosen/profile"
                                    prefetch
                                >
                                    <UserIcon className="mr-2 h-4 w-4" />
                                    <span>Profil</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link
                                    className="block w-full cursor-pointer"
                                    href="/dosen/settings"
                                    prefetch
                                >
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Pengaturan</span>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="cursor-pointer text-red-600 focus:text-red-600"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
