import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { ChatUser, ConversationListItem } from '@/types/chat';
import { router } from '@inertiajs/react';
import {
    Archive,
    BellOff,
    Check,
    CheckCheck,
    Filter,
    Home,
    MessageCircle,
    MoreVertical,
    Pin,
    Plus,
    Search,
    User,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ChatAvatarAdvanced } from './chat-avatar';

// Message status indicator component for conversation list
function MessageStatusIcon({
    status,
}: {
    status?: 'sent' | 'delivered' | 'read';
}) {
    switch (status) {
        case 'read':
            // 2 ceklis biru - sudah dibaca
            return (
                <CheckCheck className="h-4 w-4 flex-shrink-0 text-[#53bdeb]" />
            );
        case 'delivered':
            // 2 ceklis abu - terkirim ke penerima tapi belum dibaca
            return (
                <CheckCheck className="h-4 w-4 flex-shrink-0 text-[#8696a0]" />
            );
        case 'sent':
        default:
            // 1 ceklis abu - terkirim ke server
            return <Check className="h-4 w-4 flex-shrink-0 text-[#8696a0]" />;
    }
}

interface ConversationListProps {
    conversations: ConversationListItem[];
    activeId?: number;
    currentUser?: ChatUser;
    onSelect: (id: number) => void;
    onNewChat: () => void;
    onArchive?: (conv: ConversationListItem) => void;
    onPin?: (conv: ConversationListItem) => void;
    onMute?: (conv: ConversationListItem) => void;
    onContactInfo?: (conv: ConversationListItem) => void;
}

export function ConversationList({
    conversations,
    activeId,
    currentUser,
    onSelect,
    onNewChat,
    onArchive,
    onPin,
    onMute,
    onContactInfo,
}: ConversationListProps) {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'unread' | 'groups'>('all');
    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        conv: ConversationListItem;
    } | null>(null);
    const contextMenuRef = useRef<HTMLDivElement>(null);

    // Determine back URL based on user type
    const getBackUrl = () => {
        if (!currentUser) return '/dosen';
        if (
            currentUser.type === 'mahasiswa' ||
            currentUser.type === 'App\\Models\\Mahasiswa'
        ) {
            return '/';
        }
        return '/dosen';
    };

    // Close context menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                contextMenuRef.current &&
                !contextMenuRef.current.contains(e.target as Node)
            ) {
                setContextMenu(null);
            }
        };
        if (contextMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () =>
                document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [contextMenu]);

    const handleContextMenu = (
        e: React.MouseEvent,
        conv: ConversationListItem,
    ) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, conv });
    };

    const filtered = conversations.filter((c) => {
        const matchesSearch = c.name
            .toLowerCase()
            .includes(search.toLowerCase());
        const matchesFilter =
            filter === 'all'
                ? true
                : filter === 'unread'
                  ? c.unread_count > 0
                  : filter === 'groups'
                    ? c.type === 'group'
                    : true;
        return matchesSearch && matchesFilter;
    });

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
            });
        } else if (days === 1) {
            return 'Kemarin';
        } else if (days < 7) {
            return date.toLocaleDateString('id-ID', { weekday: 'short' });
        }
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
        });
    };

    const formatLastSeen = (lastSeen: string | null | undefined) => {
        if (!lastSeen) return 'offline';
        const date = new Date(lastSeen);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return 'baru saja';
        if (minutes < 60) return `${minutes} menit lalu`;
        if (hours < 24) return `${hours} jam lalu`;
        if (days === 1) return 'kemarin';
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
        });
    };

    return (
        <div className="flex h-full flex-col bg-[#111b21]">
            {/* WhatsApp Header */}
            <div className="bg-[#202c33] px-4 py-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-normal text-[#e9edef]">Chat</h2>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onNewChat}
                            className="h-10 w-10 rounded-full text-[#aebac1] hover:bg-[#374045]"
                        >
                            <Plus className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-full text-[#aebac1] hover:bg-[#374045]"
                        >
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-[#111b21] px-3 py-2">
                <div className="relative flex items-center rounded-lg bg-[#202c33]">
                    <Search className="absolute left-4 h-4 w-4 text-[#8696a0]" />
                    <Input
                        placeholder="Cari atau mulai chat baru"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9 border-0 bg-transparent py-2 pr-4 pl-12 text-[#e9edef] placeholder:text-[#8696a0] focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-[#8696a0] hover:bg-transparent"
                    >
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 bg-[#111b21] px-3 py-2">
                {[
                    { id: 'all', label: 'Semua' },
                    { id: 'unread', label: 'Belum dibaca' },
                    { id: 'groups', label: 'Grup' },
                ].map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id as typeof filter)}
                        className={cn(
                            'rounded-full px-3 py-1 text-sm transition-colors',
                            filter === f.id
                                ? 'bg-[#00a884] text-[#111b21]'
                                : 'bg-[#202c33] text-[#e9edef] hover:bg-[#2a3942]',
                        )}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
                {filtered.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#202c33]">
                            <MessageCircle className="h-10 w-10 text-[#8696a0]" />
                        </div>
                        <p className="font-normal text-[#e9edef]">
                            {search ? 'Tidak ada hasil' : 'Belum ada chat'}
                        </p>
                        <p className="mt-1 text-sm text-[#8696a0]">
                            {search
                                ? 'Coba kata kunci lain'
                                : 'Mulai chat baru dengan tombol +'}
                        </p>
                    </div>
                ) : (
                    <div>
                        {filtered.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => onSelect(conv.id)}
                                onContextMenu={(e) =>
                                    handleContextMenu(e, conv)
                                }
                                className={cn(
                                    'flex w-full items-center gap-3 px-3 py-3 transition-colors',
                                    'hover:bg-[#202c33]',
                                    activeId === conv.id && 'bg-[#2a3942]',
                                )}
                            >
                                {/* Avatar with Online Status - Using Advanced Avatar Component */}
                                <div className="relative flex-shrink-0">
                                    <ChatAvatarAdvanced
                                        name={conv.name}
                                        avatar={conv.avatar}
                                        type={conv.type}
                                        size="lg"
                                        isOnline={conv.is_online}
                                        showOnlineIndicator={
                                            conv.type === 'personal'
                                        }
                                    />
                                    {/* Pinned indicator */}
                                    {conv.is_pinned && (
                                        <div className="absolute -top-1 -right-1">
                                            <Pin className="h-3.5 w-3.5 fill-[#8696a0] text-[#8696a0]" />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="min-w-0 flex-1 border-b border-[#222d34] py-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="flex items-center gap-1 truncate font-normal text-[#e9edef]">
                                            {conv.name}
                                            {conv.is_muted && (
                                                <BellOff className="h-3.5 w-3.5 text-[#8696a0]" />
                                            )}
                                        </span>
                                        {conv.last_message && (
                                            <span
                                                className={cn(
                                                    'flex-shrink-0 text-xs',
                                                    conv.unread_count > 0
                                                        ? 'text-[#00a884]'
                                                        : 'text-[#8696a0]',
                                                )}
                                            >
                                                {formatTime(
                                                    conv.last_message
                                                        .created_at,
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-0.5 flex items-center justify-between gap-2">
                                        {conv.last_message ? (
                                            <p className="flex items-center gap-1 truncate text-sm text-[#8696a0]">
                                                {/* Show checkmark only for own messages with proper status */}
                                                {conv.last_message.is_own && (
                                                    <MessageStatusIcon
                                                        status={
                                                            conv.last_message
                                                                .status
                                                        }
                                                    />
                                                )}
                                                {conv.type === 'group' &&
                                                    !conv.last_message
                                                        .is_own && (
                                                        <span>
                                                            {
                                                                conv
                                                                    .last_message
                                                                    .sender_name
                                                            }
                                                            :{' '}
                                                        </span>
                                                    )}
                                                {conv.last_message.content}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-[#8696a0]">
                                                Belum ada pesan
                                            </p>
                                        )}
                                        {conv.unread_count > 0 && (
                                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#00a884] px-1.5 text-xs font-medium text-[#111b21]">
                                                {conv.unread_count > 99
                                                    ? '99+'
                                                    : conv.unread_count}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Back to Dashboard Button */}
            <div className="border-t border-[#222d34] bg-[#202c33] p-3">
                <Button
                    onClick={() => router.visit(getBackUrl())}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#00a884] py-2.5 text-white hover:bg-[#06cf9c]"
                >
                    <Home className="h-5 w-5" />
                    <span>Kembali ke Menu</span>
                </Button>
            </div>

            {/* Context Menu for Conversations */}
            {contextMenu && (
                <div
                    ref={contextMenuRef}
                    className="fixed z-50 min-w-[180px] rounded-lg border border-[#374045] bg-[#233138] py-1 shadow-xl"
                    style={{
                        left: Math.min(contextMenu.x, window.innerWidth - 200),
                        top: Math.min(contextMenu.y, window.innerHeight - 250),
                    }}
                >
                    <button
                        onClick={() => {
                            onArchive?.(contextMenu.conv);
                            setContextMenu(null);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[#e9edef] transition-colors hover:bg-[#374045]"
                    >
                        <Archive className="h-4 w-4" />
                        {contextMenu.conv.is_archived
                            ? 'Batalkan Arsip'
                            : 'Arsipkan'}
                    </button>
                    <button
                        onClick={() => {
                            onPin?.(contextMenu.conv);
                            setContextMenu(null);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[#e9edef] transition-colors hover:bg-[#374045]"
                    >
                        <Pin
                            className={cn(
                                'h-4 w-4',
                                contextMenu.conv.is_pinned &&
                                    'fill-[#00a884] text-[#00a884]',
                            )}
                        />
                        {contextMenu.conv.is_pinned
                            ? 'Lepas Sematan'
                            : 'Sematkan'}
                    </button>
                    <button
                        onClick={() => {
                            onMute?.(contextMenu.conv);
                            setContextMenu(null);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[#e9edef] transition-colors hover:bg-[#374045]"
                    >
                        <BellOff
                            className={cn(
                                'h-4 w-4',
                                contextMenu.conv.is_muted && 'text-[#00a884]',
                            )}
                        />
                        {contextMenu.conv.is_muted ? 'Bunyikan' : 'Bisukan'}
                    </button>
                    <div className="my-1 border-t border-[#374045]" />
                    <button
                        onClick={() => {
                            onContactInfo?.(contextMenu.conv);
                            setContextMenu(null);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[#e9edef] transition-colors hover:bg-[#374045]"
                    >
                        <User className="h-4 w-4" /> Info Kontak
                    </button>
                </div>
            )}
        </div>
    );
}
