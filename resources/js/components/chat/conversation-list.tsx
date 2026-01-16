import { useState, useRef, useEffect } from 'react';
import { Search, Plus, Users, MessageCircle, MoreVertical, Filter, Home, Archive, Pin, BellOff, User, CheckCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
                                {/* Avatar with Online Status */}
                                <div className="relative flex-shrink-0">
                                    {conv.avatar ? (
                                        <img 
                                            src={conv.avatar} 
                                            alt={conv.name} 
                                            className="h-12 w-12 rounded-full object-cover" 
                                        />
                                    ) : (
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6b7c85] overflow-hidden">
                                            {conv.type === 'group' ? (
                                                <Users className="h-6 w-6 text-[#cfd8dc]" />
                                            ) : (
                                                <svg viewBox="0 0 212 212" className="h-12 w-12">
                                                    <path fill="#6b7c85" d="M106.251,0.5C164.653,0.5,212,47.846,212,106.25S164.653,212,106.251,212C47.846,212,0.5,164.654,0.5,106.25S47.846,0.5,106.251,0.5z"/>
                                                    <path fill="#cfd8dc" d="M173.561,171.615c-0.601-0.915-1.287-1.907-2.065-2.955c-0.777-1.049-1.645-2.155-2.608-3.299c-0.964-1.144-2.024-2.326-3.184-3.527c-1.741-1.802-3.71-3.646-5.924-5.47c-2.952-2.431-6.339-4.824-10.204-7.026c-1.877-1.07-3.873-2.092-5.98-3.055c-0.062-0.028-0.118-0.059-0.18-0.087c-9.792-4.44-22.106-7.529-37.416-7.529s-27.624,3.089-37.416,7.529c-0.338,0.153-0.653,0.318-0.985,0.474c-1.431,0.674-2.806,1.376-4.128,2.101c-0.716,0.393-1.417,0.792-2.101,1.197c-3.421,2.027-6.475,4.191-9.15,6.395c-2.213,1.823-4.182,3.668-5.924,5.47c-1.161,1.201-2.22,2.384-3.184,3.527c-0.964,1.144-1.832,2.25-2.609,3.299c-0.778,1.049-1.464,2.04-2.065,2.955c-0.557,0.848-1.033,1.622-1.447,2.324c24.167,21.319,55.913,34.261,90.561,34.261c34.648,0,66.394-12.942,90.561-34.261C174.594,173.238,174.117,172.463,173.561,171.615z"/>
                                                    <path fill="#cfd8dc" d="M106.002,125.5c2.645,0,5.212-0.253,7.68-0.737c1.234-0.242,2.443-0.542,3.624-0.896c1.772-0.532,3.482-1.188,5.12-1.958c2.184-1.027,4.242-2.258,6.15-3.67c2.863-2.119,5.39-4.646,7.509-7.509c0.706-0.954,1.367-1.945,1.98-2.971c0.919-1.539,1.729-3.155,2.422-4.84c0.462-1.123,0.872-2.277,1.226-3.458c0.177-0.591,0.341-1.188,0.49-1.792c0.299-1.208,0.542-2.443,0.725-3.701c0.275-1.887,0.417-3.827,0.417-5.811c0-21.533-17.467-39-39-39c-21.533,0-39,17.467-39,39c0,1.983,0.142,3.923,0.417,5.811c0.184,1.258,0.426,2.493,0.725,3.701c0.15,0.604,0.313,1.202,0.49,1.792c0.354,1.181,0.764,2.335,1.226,3.458c0.693,1.685,1.504,3.301,2.422,4.84c0.613,1.026,1.274,2.017,1.98,2.971c2.119,2.863,4.646,5.39,7.509,7.509c1.909,1.412,3.966,2.643,6.15,3.67c1.638,0.77,3.348,1.426,5.12,1.958c1.181,0.354,2.39,0.654,3.624,0.896C100.79,125.247,103.357,125.5,106.002,125.5z"/>
                                                </svg>
                                            )}
                                        </div>
                                    )}
                                    {/* Online indicator */}
                                    {conv.type === 'personal' && conv.is_online && (
                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00a884] rounded-full border-2 border-[#111b21]" />
                                    )}
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
