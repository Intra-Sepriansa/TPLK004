import { useRef, useEffect, useState } from 'react';
import { ArrowLeft, Search, MoreVertical, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageBubble } from './message-bubble';
import { MessageComposer } from './message-composer';
import { ChatSettingsPanel, ChatSettings, DEFAULT_SETTINGS } from './chat-settings';
import { ChatAvatarAdvanced } from './chat-avatar';
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

    // Gradient presets for wallpaper
    const GRADIENT_PRESETS: Record<string, string> = {
        'aurora': 'linear-gradient(135deg, #0b141a 0%, #1a4a3a 50%, #0b141a 100%)',
        'sunset': 'linear-gradient(135deg, #1a1a2e 0%, #4a1942 50%, #1a1a2e 100%)',
        'ocean-deep': 'linear-gradient(180deg, #0b141a 0%, #023e8a 100%)',
        'forest-mist': 'linear-gradient(180deg, #1b4332 0%, #0b141a 100%)',
        'purple-haze': 'linear-gradient(135deg, #1a1a2e 0%, #4c1d95 50%, #1a1a2e 100%)',
        'cosmic': 'linear-gradient(135deg, #0f0f23 0%, #1e3a5f 25%, #4c1d95 50%, #1e3a5f 75%, #0f0f23 100%)',
        'emerald': 'linear-gradient(135deg, #064e3b 0%, #0b141a 50%, #064e3b 100%)',
        'rose-gold': 'linear-gradient(135deg, #1a1a1a 0%, #4a1942 50%, #1a1a1a 100%)',
    };

    // Pattern presets for wallpaper
    const PATTERN_PRESETS: Record<string, string> = {
        'dots': `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='3' cy='3' r='1.5'/%3E%3C/g%3E%3C/svg%3E")`,
        'grid': `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.05'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3C/g%3E%3C/svg%3E")`,
        'waves': `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='%23ffffff' fill-opacity='0.03'/%3E%3C/svg%3E")`,
        'hexagon': `url("data:image/svg+xml,%3Csvg width='28' height='49' viewBox='0 0 28 49' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.05'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9z'/%3E%3C/g%3E%3C/svg%3E")`,
        'circuit': `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%23ffffff' fill-opacity='0.04'/%3E%3C/svg%3E")`,
        'topography': `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' fill='none' stroke='%23ffffff' stroke-opacity='0.03'/%3E%3C/svg%3E")`,
    };

    // Get background style based on settings
    const getBackgroundStyle = (): React.CSSProperties => {
        switch (settings.wallpaperType) {
            case 'custom':
                return settings.wallpaper ? {
                    backgroundImage: `url(${settings.wallpaper})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                } : { backgroundColor: '#0b141a' };
            case 'solid':
                return { backgroundColor: settings.solidColor };
            case 'gradient':
                return { 
                    background: GRADIENT_PRESETS[settings.gradientId] || GRADIENT_PRESETS['aurora'],
                    transition: 'background 0.5s ease',
                };
            case 'pattern':
                return {
                    backgroundColor: '#0b141a',
                    backgroundImage: PATTERN_PRESETS[settings.patternId] || PATTERN_PRESETS['dots'],
                };
            case 'animated':
                return {}; // Handled by AnimatedWallpaper component
            default:
                return {
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23182229' fill-opacity='0.4'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundColor: '#0b141a',
                };
        }
    };

    // Get animated wallpaper style
    const getAnimatedWallpaperStyle = (): React.CSSProperties => {
        if (settings.wallpaperType !== 'animated') return {};
        
        const animationDuration = settings.animationSpeed === 'slow' ? '15s' : settings.animationSpeed === 'fast' ? '5s' : '10s';
        
        switch (settings.animatedId) {
            case 'wave':
                return {
                    background: 'linear-gradient(135deg, #0b141a 0%, #1a4a3a 25%, #0b141a 50%, #1a4a3a 75%, #0b141a 100%)',
                    backgroundSize: '400% 400%',
                    animation: `wave-animation ${animationDuration} ease infinite`,
                };
            case 'particles':
                return {
                    background: 'radial-gradient(circle at 20% 80%, rgba(0, 168, 132, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0, 168, 132, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(0, 168, 132, 0.08) 0%, transparent 30%), #0b141a',
                    animation: `particles-animation ${animationDuration} ease infinite`,
                };
            case 'gradient-shift':
                return {
                    background: 'linear-gradient(270deg, #0b141a, #1a4a3a, #023e8a, #1a1a2e, #0b141a)',
                    backgroundSize: '1000% 1000%',
                    animation: `gradient-shift-animation calc(${animationDuration} * 2) ease infinite`,
                };
            case 'aurora-borealis':
                return {
                    background: 'linear-gradient(180deg, #0b141a 0%, #064e3b 30%, #0891b2 50%, #064e3b 70%, #0b141a 100%)',
                    backgroundSize: '100% 300%',
                    animation: `aurora-animation ${animationDuration} ease infinite`,
                };
            case 'starfield':
                return {
                    background: `radial-gradient(2px 2px at 20px 30px, white, transparent),
                        radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
                        radial-gradient(1px 1px at 90px 40px, white, transparent),
                        radial-gradient(2px 2px at 130px 80px, rgba(255,255,255,0.6), transparent),
                        radial-gradient(1px 1px at 160px 120px, white, transparent),
                        #0f0f23`,
                    animation: `starfield-animation 3s ease infinite`,
                };
            case 'pulse':
                return {
                    background: 'radial-gradient(circle at center, #1a4a3a 0%, #0b141a 70%)',
                    animation: `pulse-animation 4s ease infinite`,
                };
            default:
                return { background: '#0b141a' };
        }
    };

    return (
        <div className="flex h-full flex-col bg-[#0b141a]">
            {/* WhatsApp Header */}
            <div className="flex items-center justify-between bg-[#202c33] px-4 py-2 z-10">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden h-10 w-10 text-[#aebac1] hover:bg-[#374045]">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    
                    {/* Avatar - Using Advanced Avatar Component */}
                    <ChatAvatarAdvanced
                        name={conversation.name}
                        avatar={conversation.avatar}
                        type={conversation.type}
                        size="md"
                        isOnline={conversation.is_online}
                        showOnlineIndicator={true}
                    />

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
                className="flex-1 overflow-y-auto px-4 py-2 relative scroll-smooth"
                style={settings.wallpaperType === 'animated' ? getAnimatedWallpaperStyle() : getBackgroundStyle()}
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
