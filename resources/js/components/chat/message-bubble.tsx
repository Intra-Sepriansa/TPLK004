import { cn } from '@/lib/utils';
import type { Message } from '@/types/chat';
import {
    Check,
    CheckCheck,
    CheckSquare,
    Copy,
    Download,
    FileText,
    Forward,
    Info,
    Pencil,
    Pin,
    Reply,
    Star,
    Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ChatSettings } from './chat-settings';

interface MessageBubbleProps {
    message: Message;
    showSender?: boolean;
    settings: ChatSettings;
    isNew?: boolean;
    onReply: (message: Message) => void;
    onEdit: (message: Message) => void;
    onDelete: (message: Message) => void;
    onForward: (message: Message) => void;
    onReact: (message: Message, emoji: string) => void;
    onStar?: (message: Message) => void;
    onPin?: (message: Message) => void;
    onCopy?: (message: Message) => void;
    onInfo?: (message: Message) => void;
    onSelect?: (message: Message) => void;
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

// Message status indicator component
function MessageStatus({
    status,
    showReceipts,
}: {
    status?: 'sent' | 'delivered' | 'read';
    showReceipts: boolean;
}) {
    if (!showReceipts) return null;

    switch (status) {
        case 'read':
            // 2 ceklis biru - sudah dibaca
            return <CheckCheck className="h-4 w-4 text-[#53bdeb]" />;
        case 'delivered':
            // 2 ceklis abu - terkirim ke penerima tapi belum dibaca
            return <CheckCheck className="h-4 w-4 text-[#ffffff99]" />;
        case 'sent':
        default:
            // 1 ceklis abu - terkirim ke server
            return <Check className="h-4 w-4 text-[#ffffff99]" />;
    }
}

export function MessageBubble({
    message,
    showSender = false,
    settings,
    isNew = false,
    onReply,
    onEdit,
    onDelete,
    onForward,
    onReact,
    onStar,
    onPin,
    onCopy,
    onInfo,
    onSelect,
}: MessageBubbleProps) {
    const [showReactions, setShowReactions] = useState(false);
    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
    } | null>(null);
    const [isVisible, setIsVisible] = useState(!isNew);
    const contextMenuRef = useRef<HTMLDivElement>(null);

    // Trigger animation when message appears
    useEffect(() => {
        if (isNew) {
            const timer = setTimeout(() => setIsVisible(true), 50);
            return () => clearTimeout(timer);
        }
    }, [isNew]);

    // Get animation class based on settings
    const getAnimationClass = () => {
        if (settings.messageAnimation === 'none' || !isNew) return '';

        const speedClass =
            settings.animationSpeed === 'slow'
                ? 'duration-500'
                : settings.animationSpeed === 'fast'
                  ? 'duration-150'
                  : 'duration-300';

        switch (settings.messageAnimation) {
            case 'slide':
                return message.is_own
                    ? `animate-in slide-in-from-right-4 ${speedClass}`
                    : `animate-in slide-in-from-left-4 ${speedClass}`;
            case 'fade':
                return `animate-in fade-in ${speedClass}`;
            case 'scale':
                return `animate-in zoom-in-95 ${speedClass}`;
            default:
                return '';
        }
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Get bubble style based on settings
    const getBubbleRadius = () => {
        switch (settings.bubbleStyle) {
            case 'classic':
                return 'rounded-md';
            case 'minimal':
                return 'rounded-lg';
            default:
                return message.is_own
                    ? 'rounded-lg rounded-tr-none'
                    : 'rounded-lg rounded-tl-none';
        }
    };

    const showTail = settings.bubbleStyle === 'modern';

    // Handle right-click context menu
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
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

    // Copy message to clipboard
    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setContextMenu(null);
        onCopy?.(message);
    };

    // Check if message has images
    const hasImages = message.attachments.some((att) => att.is_image);
    const hasFiles = message.attachments.some((att) => !att.is_image);

    if (message.type === 'system') {
        return (
            <div className="my-2 flex animate-in justify-center duration-300 fade-in">
                <span className="rounded-lg bg-[#182229] px-3 py-1 text-xs text-[#8696a0] shadow-sm">
                    {message.content}
                </span>
            </div>
        );
    }

    return (
        <>
            <div
                className={cn(
                    'group mb-1 flex gap-1 transition-all',
                    message.is_own ? 'flex-row-reverse' : 'flex-row',
                    getAnimationClass(),
                    !isVisible && isNew && 'translate-y-2 opacity-0',
                )}
                onContextMenu={handleContextMenu}
                style={{
                    transition: isNew
                        ? `opacity ${settings.animationSpeed === 'slow' ? '0.5s' : settings.animationSpeed === 'fast' ? '0.15s' : '0.3s'} ease, transform ${settings.animationSpeed === 'slow' ? '0.5s' : settings.animationSpeed === 'fast' ? '0.15s' : '0.3s'} ease`
                        : undefined,
                }}
            >
                {/* Message Bubble - WhatsApp Style */}
                <div
                    className={cn(
                        'flex max-w-[65%] flex-col',
                        message.is_own ? 'items-end' : 'items-start',
                    )}
                >
                    {/* Sender Name for Group */}
                    {showSender && !message.is_own && (
                        <span className="mb-0.5 ml-1 text-xs font-medium text-[#00a884]">
                            {message.sender_name}
                        </span>
                    )}

                    {/* Reply Preview */}
                    {message.reply_to && (
                        <div
                            className={cn(
                                'mb-0.5 max-w-full rounded-t-lg border-l-4 px-2 py-1.5 text-xs',
                                message.is_own
                                    ? 'border-[#06cf9c]'
                                    : 'border-[#00a884]',
                            )}
                            style={{
                                backgroundColor: message.is_own
                                    ? `${settings.bubbleColor}88`
                                    : '#1d282f',
                            }}
                        >
                            <span className="block font-medium text-[#00a884]">
                                {message.reply_to.sender_name}
                            </span>
                            <p className="truncate text-[#8696a0]">
                                {message.reply_to.content}
                            </p>
                        </div>
                    )}

                    {/* Bubble */}
                    <div
                        className={cn(
                            'relative overflow-hidden shadow-sm',
                            getBubbleRadius(),
                            message.is_deleted && 'italic opacity-60',
                            hasImages && !message.content
                                ? 'p-1'
                                : 'px-2 py-1.5',
                        )}
                        style={{
                            backgroundColor: message.is_own
                                ? settings.bubbleColor
                                : '#202c33',
                        }}
                        onMouseEnter={() => setShowReactions(true)}
                        onMouseLeave={() => setShowReactions(false)}
                    >
                        {/* WhatsApp Tail - only show for modern style */}
                        {showTail && !hasImages && (
                            <div
                                className={cn(
                                    'absolute top-0 h-3 w-3',
                                    message.is_own ? '-right-2' : '-left-2',
                                )}
                                style={{
                                    borderStyle: 'solid',
                                    borderTopWidth: '12px',
                                    borderTopColor: 'transparent',
                                    ...(message.is_own
                                        ? {
                                              borderLeftWidth: '12px',
                                              borderLeftColor:
                                                  settings.bubbleColor,
                                          }
                                        : {
                                              borderRightWidth: '12px',
                                              borderRightColor: '#202c33',
                                          }),
                                }}
                            />
                        )}

                        {/* Star indicator */}
                        {message.is_starred && (
                            <Star className="absolute top-1 right-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                        )}

                        {/* Image Attachments - WhatsApp Style */}
                        {hasImages && (
                            <div className="space-y-1">
                                {message.attachments
                                    .filter((att) => att.is_image)
                                    .map((att) => (
                                        <div key={att.id} className="relative">
                                            <a
                                                href={att.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block"
                                            >
                                                <img
                                                    src={att.url}
                                                    alt={att.file_name}
                                                    className="max-h-72 max-w-full rounded-lg object-cover"
                                                />
                                            </a>
                                            {/* Time overlay on image - bottom right */}
                                            {!message.content && (
                                                <div className="absolute right-1 bottom-1 flex items-center gap-0.5 rounded bg-black/50 px-1.5 py-0.5">
                                                    <span className="text-[11px] text-white">
                                                        {formatTime(
                                                            message.created_at,
                                                        )}
                                                    </span>
                                                    {message.is_own && (
                                                        <MessageStatus
                                                            status={
                                                                message.status
                                                            }
                                                            showReceipts={
                                                                settings.readReceipts
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        )}

                        {/* Text Content with Time */}
                        {message.content && (
                            <div
                                className={cn(
                                    'flex items-end gap-2',
                                    hasImages && 'mt-1 px-1',
                                )}
                            >
                                <p
                                    className="break-words whitespace-pre-wrap text-[#e9edef]"
                                    style={{
                                        fontSize: `${settings.fontSize}px`,
                                    }}
                                >
                                    {message.content}
                                </p>

                                {/* Time & Status */}
                                <div className="-mb-0.5 flex flex-shrink-0 items-center gap-0.5">
                                    <span className="text-[11px] text-[#ffffff99]">
                                        {formatTime(message.created_at)}
                                    </span>
                                    {message.is_own && (
                                        <MessageStatus
                                            status={message.status}
                                            showReceipts={settings.readReceipts}
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* File Attachments */}
                        {hasFiles && (
                            <div
                                className={cn(
                                    'space-y-1.5',
                                    (message.content || hasImages) && 'mt-1.5',
                                )}
                            >
                                {message.attachments
                                    .filter((att) => !att.is_image)
                                    .map((att) => (
                                        <a
                                            key={att.id}
                                            href={att.url}
                                            download={att.file_name}
                                            className="flex items-center gap-2 rounded-lg bg-[#0000001a] p-2 transition-colors hover:bg-[#0000002a]"
                                        >
                                            <div className="rounded-full bg-[#00a884] p-2">
                                                <FileText className="h-4 w-4 text-white" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm text-[#e9edef]">
                                                    {att.file_name}
                                                </p>
                                                <p className="text-xs text-[#8696a0]">
                                                    {att.file_size}
                                                </p>
                                            </div>
                                            <Download className="h-4 w-4 text-[#8696a0]" />
                                        </a>
                                    ))}
                            </div>
                        )}

                        {/* Quick Reactions */}
                        {showReactions && !message.is_deleted && (
                            <div
                                className={cn(
                                    'absolute -top-8 z-10 flex items-center gap-0.5 rounded-full bg-[#233138] px-1.5 py-1 shadow-lg',
                                    message.is_own ? 'right-0' : 'left-0',
                                )}
                            >
                                {QUICK_REACTIONS.map((emoji) => (
                                    <button
                                        key={emoji}
                                        onClick={() => onReact(message, emoji)}
                                        className="rounded-full p-1 text-base transition-transform hover:scale-125 hover:bg-[#374045]"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Reactions Display */}
                    {message.reactions.length > 0 && (
                        <div className="mt-0.5 flex flex-wrap gap-1">
                            {message.reactions.map((reaction) => (
                                <button
                                    key={reaction.emoji}
                                    onClick={() =>
                                        onReact(message, reaction.emoji)
                                    }
                                    className="flex items-center gap-0.5 rounded-full bg-[#233138] px-1.5 py-0.5 text-xs transition-colors hover:bg-[#374045]"
                                    title={reaction.users.join(', ')}
                                >
                                    <span>{reaction.emoji}</span>
                                    <span className="text-[#8696a0]">
                                        {reaction.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    ref={contextMenuRef}
                    className="fixed z-50 min-w-[180px] rounded-lg border border-[#374045] bg-[#233138] py-1 shadow-xl"
                    style={{
                        left: Math.min(contextMenu.x, window.innerWidth - 200),
                        top: Math.min(contextMenu.y, window.innerHeight - 400),
                    }}
                >
                    <button
                        onClick={() => {
                            onReply(message);
                            setContextMenu(null);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[#e9edef] transition-colors hover:bg-[#374045]"
                    >
                        <Reply className="h-4 w-4" /> Balas
                    </button>
                    <button
                        onClick={() => {
                            const emoji = prompt('Pilih emoji:', '👍');
                            if (emoji) onReact(message, emoji);
                            setContextMenu(null);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[#e9edef] transition-colors hover:bg-[#374045]"
                    >
                        <span className="text-base">😀</span> Beri Reaksi
                    </button>
                    <button
                        onClick={() => {
                            onStar?.(message);
                            setContextMenu(null);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[#e9edef] transition-colors hover:bg-[#374045]"
                    >
                        <Star
                            className={cn(
                                'h-4 w-4',
                                message.is_starred &&
                                    'fill-yellow-400 text-yellow-400',
                            )}
                        />
                        {message.is_starred ? 'Hapus Bintang' : 'Beri Bintang'}
                    </button>
                    <button
                        onClick={() => {
                            onPin?.(message);
                            setContextMenu(null);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[#e9edef] transition-colors hover:bg-[#374045]"
                    >
                        <Pin
                            className={cn(
                                'h-4 w-4',
                                message.is_pinned &&
                                    'fill-[#00a884] text-[#00a884]',
                            )}
                        />
                        {message.is_pinned ? 'Lepas Sematan' : 'Sematkan'}
                    </button>
                    <button
                        onClick={() => {
                            onForward(message);
                            setContextMenu(null);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[#e9edef] transition-colors hover:bg-[#374045]"
                    >
                        <Forward className="h-4 w-4" /> Teruskan
                    </button>
                    <button
                        onClick={handleCopy}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[#e9edef] transition-colors hover:bg-[#374045]"
                    >
                        <Copy className="h-4 w-4" /> Salin
                    </button>
                    <button
                        onClick={() => {
                            onInfo?.(message);
                            setContextMenu(null);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[#e9edef] transition-colors hover:bg-[#374045]"
                    >
                        <Info className="h-4 w-4" /> Info
                    </button>
                    {message.can_edit && (
                        <button
                            onClick={() => {
                                onEdit(message);
                                setContextMenu(null);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[#e9edef] transition-colors hover:bg-[#374045]"
                        >
                            <Pencil className="h-4 w-4" /> Edit
                        </button>
                    )}
                    {message.is_own && (
                        <button
                            onClick={() => {
                                onDelete(message);
                                setContextMenu(null);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-[#374045]"
                        >
                            <Trash2 className="h-4 w-4" /> Hapus
                        </button>
                    )}
                    <div className="my-1 border-t border-[#374045]" />
                    <button
                        onClick={() => {
                            onSelect?.(message);
                            setContextMenu(null);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[#e9edef] transition-colors hover:bg-[#374045]"
                    >
                        <CheckSquare className="h-4 w-4" /> Pilih Pesan
                    </button>
                </div>
            )}
        </>
    );
}
