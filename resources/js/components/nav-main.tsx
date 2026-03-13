import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({
    items = [],
    label = 'Platform',
}: {
    items: NavItem[];
    label?: string;
}) {
    const page = usePage();
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={
                                item.isActive ??
                                page.url.startsWith(resolveUrl(item.href))
                            }
                            tooltip={{ children: item.title }}
                            size="sm"
                        >
                            <Link
                                href={item.href}
                                prefetch
                                className="overflow-hidden group-hover:bg-transparent"
                            >
                                {item.iconSrc ? (
                                    <img
                                        src={item.iconSrc}
                                        alt={item.title}
                                        className="h-4 w-4 shrink-0 object-contain"
                                    />
                                ) : (
                                    item.icon && (
                                        <item.icon className="h-4 w-4 shrink-0" />
                                    )
                                )}
                                <span className="flex-1 truncate">
                                    {item.title}
                                </span>
                                {item.badge && item.badge > 0 && (
                                    <span className="flex h-5 min-w-5 animate-pulse items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
