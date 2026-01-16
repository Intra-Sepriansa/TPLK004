import { useState, useRef, useEffect } from 'react';
import { Search, Plus, Users, MessageCircle, MoreVertical, Filter, Home, Archive, Pin, BellOff, User, CheckCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChatAvatarAdvanced } from './chat-avatar';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import type { ConversationListItem, ChatUser } from '@/types/chat';

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
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; conv: ConversationListItem } | null>(null);
    const contextMenuRef = useRef<HTMLDivElement>(null);

    // Determine back URL based on user type
    const getBackUrl = () => {
        if (!currentUser) return '/dosen';
        if (currentUser.type === 'mahasiswa' || currentUser.type === 'App\\Models\\Mahasiswa') {
            return '/';
        }
        return '/dosen';
    };

    // Close context menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
                setContextMenu(null);
            }
        };
        if (contextMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [contextMenu]);

    const handleContextMenu = (e: React.MouseEvent, conv: ConversationListItem) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, conv });
    };

    const filtered = conversations.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = 
            filter === 'all' ? true :
            filter === 'unread' ? c.unread_count > 0 :
            filter === 'groups' ? c.type === 'group' : true;
        return matchesSearch && matchesFilter;
    });

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) {
            return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Kemarin';
        } else if (days < 7) {
            return date.toLocaleDateString('id-ID', { weekday: 'short' });
        }
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
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
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
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
                <div className="relative flex items-center bg-[#202c33] rounded-lg">
                    <Search className="absolute left-4 h-4 w-4 text-[#8696a0]" />
                    <Input
                        placeholder="Cari atau mulai chat baru"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-12 pr-4 py-2 h-9 bg-transparent border-0 text-[#e9edef] placeholder:text-[#8696a0] focus-visible:ring-0 focus-visible:ring-offset-0"
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
            <div className="flex gap-2 px-3 py-2 bg-[#111b21]">
                {[
                    { id: 'all', label: 'Semua' },
                    { id: 'unread', label: 'Belum dibaca' },
                    { id: 'groups', label: 'Grup' },
                ].map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id as typeof filter)}
                        className={cn(
                            'px-3 py-1 text-sm rounded-full transition-colors',
                            filter === f.id
                                ? 'bg-[#00a884] text-[#111b21]'
                                : 'bg-[#202c33] text-[#e9edef] hover:bg-[#2a3942]'
                        )}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                        <div className="w-20 h-20 rounded-full bg-[#202c33] flex items-center justify-center mb-4">
                            <MessageCircle className="h-10 w-10 text-[#8696a0]" />
                        </div>
                        <p className="text-[#e9edef] font-normal">
                            {search ? 'Tidak ada hasil' : 'Belum ada chat'}
                        </p>
                        <p className="text-sm text-[#8696a0] mt-1">
                            {search ? 'Coba kata kunci lain' : 'Mulai chat baru dengan tombol +'}
                        </p>
                    </div>
                ) : (
                    <div>
                        {filtered.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => onSelect(conv.id)}
                                onContextMenu={(e) => handleContextMenu(e, conv)}
                                className={cn(
                                    'w-full flex items-center gap-3 px-3 py-3 transition-colors',
                                    'hover:bg-[#202c33]',
                                    activeId === conv.id && 'bg-[#2a3942]'
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
                                        showOnlineIndicator={conv.type === 'personal'}
                                    />
                                    {/* Pinned indicator */}
                                    {conv.is_pinned && (
                                        <div className="absolute -top-1 -right-1">
                                            <Pin className="h-3.5 w-3.5 text-[#8696a0] fill-[#8696a0]" />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 border-b border-[#222d34] py-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-normal text-[#e9edef] truncate flex items-center gap-1">
                                            {conv.name}
                                            {conv.is_muted && <BellOff className="h-3.5 w-3.5 text-[#8696a0]" />}
                                        </span>
                                        {conv.last_message && (
                                            <span className={cn(
                                                'text-xs flex-shrink-0',
                                                conv.unread_count > 0 
                                                    ? 'text-[#00a884]' 
                                                    : 'text-[#8696a0]'
                                            )}>
                                                {formatTime(conv.last_message.created_at)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between gap-2 mt-0.5">
                                        {conv.last_message ? (
                                            <p className="text-sm text-[#8696a0] truncate flex items-center gap-1">
                                                {/* Show checkmark only for own messages */}
                                                {conv.last_message.is_own && (
                                                    <CheckCheck className="h-4 w-4 text-[#53bdeb] flex-shrink-0" />
                                                )}
                                                {conv.type === 'group' && !conv.last_message.is_own && (
                                                    <span>{conv.last_message.sender_name}: </span>
                                                )}
                                                {conv.last_message.content}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-[#8696a0]">Belum ada pesan</p>
                                        )}
                                        {conv.unread_count > 0 && (
                                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#00a884] px-1.5 text-xs font-medium text-[#111b21]">
                                                {conv.unread_count > 99 ? '99+' : conv.unread_count}
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
            <div className="bg-[#202c33] border-t border-[#222d34] p-3">
                <Button
                    onClick={() => router.visit(getBackUrl())}
                    className="w-full flex items-center justify-center gap-2 bg-[#00a884] hover:bg-[#06cf9c] text-white rounded-lg py-2.5"
                >
                    <Home className="h-5 w-5" />
                    <span>Kembali ke Menu</span>
                </Button>
            </div>

            {/* Context Menu for Conversations */}
            {contextMenu && (
                <div
                    ref={contextMenuRef}
                    className="fixed z-50 bg-[#233138] rounded-lg shadow-xl border border-[#374045] py-1 min-w-[180px]"
                    style={{ 
                        left: Math.min(contextMenu.x, window.innerWidth - 200),
                        top: Math.min(contextMenu.y, window.innerHeight - 250)
                    }}
                >
                    <button
                        onClick={() => { onArchive?.(contextMenu.conv); setContextMenu(null); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#e9edef] hover:bg-[#374045] transition-colors"
                    >
                        <Archive className="h-4 w-4" /> 
                        {contextMenu.conv.is_archived ? 'Batalkan Arsip' : 'Arsipkan'}
                    </button>
                    <button
                        onClick={() => { onPin?.(contextMenu.conv); setContextMenu(null); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#e9edef] hover:bg-[#374045] transition-colors"
                    >
                        <Pin className={cn("h-4 w-4", contextMenu.conv.is_pinned && "fill-[#00a884] text-[#00a884]")} /> 
                        {contextMenu.conv.is_pinned ? 'Lepas Sematan' : 'Sematkan'}
                    </button>
                    <button
                        onClick={() => { onMute?.(contextMenu.conv); setContextMenu(null); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#e9edef] hover:bg-[#374045] transition-colors"
                    >
                        <BellOff className={cn("h-4 w-4", contextMenu.conv.is_muted && "text-[#00a884]")} /> 
                        {contextMenu.conv.is_muted ? 'Bunyikan' : 'Bisukan'}
                    </button>
                    <div className="border-t border-[#374045] my-1" />
                    <button
                        onClick={() => { onContactInfo?.(contextMenu.conv); setContextMenu(null); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#e9edef] hover:bg-[#374045] transition-colors"
                    >
                        <User className="h-4 w-4" /> Info Kontak
                    </button>
                </div>
            )}
        </div>
    );
}
