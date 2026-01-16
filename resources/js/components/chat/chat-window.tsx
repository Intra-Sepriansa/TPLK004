import { useRef, useEffect, useState } from 'react';
import { ArrowLeft, Search, MoreVertical, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageBubble } from './message-bubble';
import { MessageComposer } from './message-composer';
import { ChatSettingsPanel, ChatSettings, DEFAULT_SETTINGS } from './chat-settings';
import { cn } from '@/lib/utils';
import type { ConversationDetail, Message, TypingUser } from '@/types/chat';

interface ChatWindowProps {
    conversation: ConversationDetail;
    typingUsers: TypingUser[];
    onSendMessage: (content: string, attachments: File[]) => void;
    onTyping: (isTyping: boolean) => void;
    onReply: (message: Message) => void;
    onEdit: (message: Message, newContent: string) => void;
    onDelete: (message: Message) => void;
    onForward: (message: Message) => void;
    onReact: (message: Message, emoji: string) => void;
    onStar?: (message: Message) => void;
    onPin?: (message: Message) => void;
    onInfo?: (message: Message) => void;
    onLoadMore: () => void;
    onBack: () => void;
    replyTo: Message | null;
    onCancelReply: () => void;
    hasMore?: boolean;
    loading?: boolean;
}

export function ChatWindow({
    conversation,
    typingUsers,
    onSendMessage,
    onTyping,
    onReply,
    onEdit,
    onDelete,
    onForward,
    onReact,
    onStar,
    onPin,
    onInfo,
    onLoadMore,
    onBack,
    replyTo,
    onCancelReply,
    hasMore,
    loading,
}: ChatWindowProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState<ChatSettings>(() => {
        const saved = localStorage.getItem('chat-settings');
        return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    });

    // Format last seen time
    const formatLastSeen = (lastSeen: string | null | undefined) => {
        if (!lastSeen) return '';
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

    // Save settings to localStorage
    useEffect(() => {
        localStorage.setItem('chat-settings', JSON.stringify(settings));
    }, [settings]);

    // Scroll ke paling bawah
    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        setTimeout(() => scrollToBottom(), 100);
    }, [conversation.id]);

    useEffect(() => {
        setTimeout(() => scrollToBottom(), 50);
    }, [conversation.messages.length]);

    // Group messages by date
    const groupedMessages = conversation.messages.reduce((groups, message) => {
        const date = new Date(message.created_at).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
        if (!groups[date]) groups[date] = [];
        groups[date].push(message);
        return groups;
    }, {} as Record<string, Message[]>);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop } = e.currentTarget;
        if (scrollTop === 0 && hasMore && !loading) onLoadMore();
    };

    // Get background style based on settings
    const getBackgroundStyle = () => {
        if (settings.wallpaperType === 'custom' && settings.wallpaper) {
            return {
                backgroundImage: `url(${settings.wallpaper})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            };
        }
        if (settings.wallpaperType === 'solid') {
            return { backgroundColor: settings.solidColor };
        }
        // Default WhatsApp pattern
        return {
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23182229' fill-opacity='0.4'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundColor: '#0b141a',
        };
    };

    return (
        <div className="flex h-full flex-col bg-[#0b141a]">
            {/* WhatsApp Header */}
            <div className="flex items-center justify-between bg-[#202c33] px-4 py-2 z-10">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden h-10 w-10 text-[#aebac1] hover:bg-[#374045]">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    
                    {/* Avatar */}
                    {conversation.avatar ? (
                        <img src={conversation.avatar} alt={conversation.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6b7c85] overflow-hidden">
                            {conversation.type === 'group' ? (
                                <Users className="h-5 w-5 text-[#cfd8dc]" />
                            ) : (
                                <svg viewBox="0 0 212 212" className="h-10 w-10">
                                    <path fill="#6b7c85" d="M106.251,0.5C164.653,0.5,212,47.846,212,106.25S164.653,212,106.251,212C47.846,212,0.5,164.654,0.5,106.25S47.846,0.5,106.251,0.5z"/>
                                    <path fill="#cfd8dc" d="M173.561,171.615c-0.601-0.915-1.287-1.907-2.065-2.955c-0.777-1.049-1.645-2.155-2.608-3.299c-0.964-1.144-2.024-2.326-3.184-3.527c-1.741-1.802-3.71-3.646-5.924-5.47c-2.952-2.431-6.339-4.824-10.204-7.026c-1.877-1.07-3.873-2.092-5.98-3.055c-0.062-0.028-0.118-0.059-0.18-0.087c-9.792-4.44-22.106-7.529-37.416-7.529s-27.624,3.089-37.416,7.529c-0.338,0.153-0.653,0.318-0.985,0.474c-1.431,0.674-2.806,1.376-4.128,2.101c-0.716,0.393-1.417,0.792-2.101,1.197c-3.421,2.027-6.475,4.191-9.15,6.395c-2.213,1.823-4.182,3.668-5.924,5.47c-1.161,1.201-2.22,2.384-3.184,3.527c-0.964,1.144-1.832,2.25-2.609,3.299c-0.778,1.049-1.464,2.04-2.065,2.955c-0.557,0.848-1.033,1.622-1.447,2.324c24.167,21.319,55.913,34.261,90.561,34.261c34.648,0,66.394-12.942,90.561-34.261C174.594,173.238,174.117,172.463,173.561,171.615z"/>
                                    <path fill="#cfd8dc" d="M106.002,125.5c2.645,0,5.212-0.253,7.68-0.737c1.234-0.242,2.443-0.542,3.624-0.896c1.772-0.532,3.482-1.188,5.12-1.958c2.184-1.027,4.242-2.258,6.15-3.67c2.863-2.119,5.39-4.646,7.509-7.509c0.706-0.954,1.367-1.945,1.98-2.971c0.919-1.539,1.729-3.155,2.422-4.84c0.462-1.123,0.872-2.277,1.226-3.458c0.177-0.591,0.341-1.188,0.49-1.792c0.299-1.208,0.542-2.443,0.725-3.701c0.275-1.887,0.417-3.827,0.417-5.811c0-21.533-17.467-39-39-39c-21.533,0-39,17.467-39,39c0,1.983,0.142,3.923,0.417,5.811c0.184,1.258,0.426,2.493,0.725,3.701c0.15,0.604,0.313,1.202,0.49,1.792c0.354,1.181,0.764,2.335,1.226,3.458c0.693,1.685,1.504,3.301,2.422,4.84c0.613,1.026,1.274,2.017,1.98,2.971c2.119,2.863,4.646,5.39,7.509,7.509c1.909,1.412,3.966,2.643,6.15,3.67c1.638,0.77,3.348,1.426,5.12,1.958c1.181,0.354,2.39,0.654,3.624,0.896C100.79,125.247,103.357,125.5,106.002,125.5z"/>
                                </svg>
                            )}
                        </div>
                    )}

                    <div>
                        <h3 className="font-normal text-[#e9edef]">{conversation.name}</h3>
                        {typingUsers.length > 0 ? (
                            <p className="text-xs text-[#00a884]">sedang mengetik...</p>
                        ) : conversation.type === 'group' ? (
                            <p className="text-xs text-[#8696a0]">{conversation.participants.length} peserta</p>
                        ) : conversation.is_online ? (
                            <p className="text-xs text-[#00a884]">online</p>
                        ) : conversation.last_seen && settings.lastSeen ? (
                            <p className="text-xs text-[#8696a0]">
                                terakhir dilihat {formatLastSeen(conversation.last_seen)}
                            </p>
                        ) : null}
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-[#aebac1] hover:bg-[#374045]">
                        <Search className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)} className="h-10 w-10 text-[#aebac1] hover:bg-[#374045]">
                        <Settings className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-[#aebac1] hover:bg-[#374045]">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 py-2"
                style={getBackgroundStyle()}
            >
                {loading && (
                    <div className="flex justify-center py-4">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#00a884] border-t-transparent" />
                    </div>
                )}

                <div className="flex flex-col min-h-full justify-end">
                    {Object.entries(groupedMessages).map(([date, messages]) => (
                        <div key={date}>
                            {/* Date Separator */}
                            <div className="flex items-center justify-center my-3">
                                <span className="text-xs text-[#8696a0] bg-[#182229] px-3 py-1 rounded-lg shadow">
                                    {date}
                                </span>
                            </div>

                            {messages.map((message, index) => {
                                const prevMessage = messages[index - 1];
                                const showSender = conversation.type === 'group' && 
                                    (!prevMessage || prevMessage.sender_id !== message.sender_id || prevMessage.sender_type !== message.sender_type);

                                return (
                                    <MessageBubble
                                        key={message.id}
                                        message={message}
                                        showSender={showSender}
                                        settings={settings}
                                        onReply={onReply}
                                        onEdit={(msg) => {
                                            const newContent = prompt('Edit pesan:', msg.content);
                                            if (newContent && newContent !== msg.content) onEdit(msg, newContent);
                                        }}
                                        onDelete={onDelete}
                                        onForward={onForward}
                                        onReact={onReact}
                                        onStar={onStar}
                                        onPin={onPin}
                                        onCopy={() => {}}
                                        onInfo={onInfo}
                                        onSelect={() => {}}
                                    />
                                );
                            })}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
                <div className="px-4 py-2 bg-[#0b141a]">
                    <div className="inline-flex items-center gap-2 bg-[#202c33] rounded-lg px-3 py-2">
                        <div className="flex gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#8696a0] animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 rounded-full bg-[#8696a0] animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 rounded-full bg-[#8696a0] animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                </div>
            )}

            {/* Composer */}
            <MessageComposer
                onSend={onSendMessage}
                onTyping={onTyping}
                replyTo={replyTo}
                onCancelReply={onCancelReply}
                enterToSend={settings.enterToSend}
            />

            {/* Settings Modal */}
            {showSettings && (
                <ChatSettingsPanel
                    settings={settings}
                    onSettingsChange={setSettings}
                    onClose={() => setShowSettings(false)}
                />
            )}
        </div>
    );
}
