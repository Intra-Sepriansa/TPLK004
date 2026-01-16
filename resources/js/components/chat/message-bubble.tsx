import { useState, useRef, useEffect } from 'react';
import { Reply, Forward, Pencil, Trash2, Download, FileText, Check, CheckCheck, Star, Pin, Copy, Info, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/chat';
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
function MessageStatus({ status, showReceipts }: { status?: 'sent' | 'delivered' | 'read'; showReceipts: boolean }) {
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
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
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
        
        const speedClass = settings.animationSpeed === 'slow' ? 'duration-500' : settings.animationSpeed === 'fast' ? 'duration-150' : 'duration-300';
        
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
        return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    // Get bubble style based on settings
    const getBubbleRadius = () => {
        switch (settings.bubbleStyle) {
            case 'classic': return 'rounded-md';
            case 'minimal': return 'rounded-lg';
            default: return message.is_own ? 'rounded-lg rounded-tr-none' : 'rounded-lg rounded-tl-none';
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
            if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
                setContextMenu(null);
            }
        };
        if (contextMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [contextMenu]);

    // Copy message to clipboard
    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setContextMenu(null);
        onCopy?.(message);
    };

    // Check if message has images
    const hasImages = message.attachments.some(att => att.is_image);
    const hasFiles = message.attachments.some(att => !att.is_image);

    if (message.type === 'system') {
        return (
            <div className="flex justify-center my-2 animate-in fade-in duration-300">
                <span className="text-xs text-[#8696a0] bg-[#182229] px-3 py-1 rounded-lg shadow-sm">
                    {message.content}
                </span>
            </div>
        );
    }

    return (
        <>
            <div 
                className={cn(
                    'group flex gap-1 mb-1 transition-all',
                    message.is_own ? 'flex-row-reverse' : 'flex-row',
                    getAnimationClass(),
                    !isVisible && isNew && 'opacity-0 translate-y-2'
                )}
                onContextMenu={handleContextMenu}
                style={{
                    transition: isNew ? `opacity ${settings.animationSpeed === 'slow' ? '0.5s' : settings.animationSpeed === 'fast' ? '0.15s' : '0.3s'} ease, transform ${settings.animationSpeed === 'slow' ? '0.5s' : settings.animationSpeed === 'fast' ? '0.15s' : '0.3s'} ease` : undefined
                }}
            >
                {/* Message Bubble - WhatsApp Style */}
                <div className={cn('max-w-[65%] flex flex-col', message.is_own ? 'items-end' : 'items-start')}>
                    {/* Sender Name for Group */}
                    {showSender && !message.is_own && (
                        <span className="text-xs font-medium text-[#00a884] ml-1 mb-0.5">{message.sender_name}</span>
                    )}

                    {/* Reply Preview */}
                    {message.reply_to && (
                        <div 
                            className={cn(
                                'text-xs px-2 py-1.5 rounded-t-lg border-l-4 mb-0.5 max-w-full',
                                message.is_own ? 'border-[#06cf9c]' : 'border-[#00a884]'
                            )}
                            style={{
                                backgroundColor: message.is_own 
                                    ? `${settings.bubbleColor}88`
                                    : '#1d282f'
                            }}
                        >
                            <span className="font-medium text-[#00a884] block">{message.reply_to.sender_name}</span>
                            <p className="text-[#8696a0] truncate">{message.reply_to.content}</p>
                        </div>
                    )}

                    {/* Bubble */}
                    <div
                        className={cn(
                            'relative shadow-sm overflow-hidden',
                            getBubbleRadius(),
                            message.is_deleted && 'opacity-60 italic',
                            hasImages && !message.content ? 'p-1' : 'px-2 py-1.5'
                        )}
                        style={{
                            backgroundColor: message.is_own ? settings.bubbleColor : '#202c33',
                        }}
                        onMouseEnter={() => setShowReactions(true)}
                        onMouseLeave={() => setShowReactions(false)}
                    >
                        {/* WhatsApp Tail - only show for modern style */}
                        {showTail && !hasImages && (
                            <div 
                                className={cn('absolute top-0 w-3 h-3', message.is_own ? '-right-2' : '-left-2')}
                                style={{ 
                                    borderStyle: 'solid',
                                    borderTopWidth: '12px',
                                    borderTopColor: 'transparent',
                                    ...(message.is_own 
                                        ? { borderLeftWidth: '12px', borderLeftColor: settings.bubbleColor }
                                        : { borderRightWidth: '12px', borderRightColor: '#202c33' }
                                    )
                                }} 
                            />
                        )}

                        {/* Star indicator */}
                        {message.is_starred && (
                            <Star className="absolute top-1 right-1 h-3 w-3 text-yellow-400 fill-yellow-400" />
                        )}

                        {/* Image Attachments - WhatsApp Style */}
                        {hasImages && (
                            <div className="space-y-1">
                                {message.attachments.filter(att => att.is_image).map((att) => (
                                    <div key={att.id} className="relative">
                                        <a href={att.url} target="_blank" rel="noopener noreferrer" className="block">
                                            <img 
                                                src={att.url} 
                                                alt={att.file_name} 
                                                className="max-w-full rounded-lg max-h-72 object-cover" 
                                            />
                                        </a>
                                        {/* Time overlay on image - bottom right */}
                                        {!message.content && (
                                            <div className="absolute bottom-1 right-1 flex items-center gap-0.5 bg-black/50 rounded px-1.5 py-0.5">
                                                <span className="text-[11px] text-white">
                                                    {formatTime(message.created_at)}
                                                </span>
                                                {message.is_own && (
                                                    <MessageStatus status={message.status} showReceipts={settings.readReceipts} />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Text Content with Time */}
                        {message.content && (
                            <div className={cn("flex items-end gap-2", hasImages && "mt-1 px-1")}>
                                <p 
                                    className="text-[#e9edef] whitespace-pre-wrap break-words"
                                    style={{ fontSize: `${settings.fontSize}px` }}
                                >
                                    {message.content}
                                </p>
                                
                                {/* Time & Status */}
                                <div className="flex items-center gap-0.5 flex-shrink-0 -mb-0.5">
                                    <span className="text-[11px] text-[#ffffff99]">
                                        {formatTime(message.created_at)}
                                    </span>
                                    {message.is_own && (
                                        <MessageStatus status={message.status} showReceipts={settings.readReceipts} />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* File Attachments */}
                        {hasFiles && (
                            <div className={cn("space-y-1.5", (message.content || hasImages) && "mt-1.5")}>
                                {message.attachments.filter(att => !att.is_image).map((att) => (
                                    <a 
                                        key={att.id}
                                        href={att.url} 
                                        download={att.file_name}
                                        className="flex items-center gap-2 p-2 rounded-lg bg-[#0000001a] hover:bg-[#0000002a] transition-colors"
                                    >
                                        <div className="p-2 rounded-full bg-[#00a884]">
                                            <FileText className="h-4 w-4 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-[#e9edef] truncate">{att.file_name}</p>
                                            <p className="text-xs text-[#8696a0]">{att.file_size}</p>
                                        </div>
                                        <Download className="h-4 w-4 text-[#8696a0]" />
                                    </a>
                                ))}
                            </div>
                        )}

                        {/* Quick Reactions */}
                        {showReactions && !message.is_deleted && (
                            <div className={cn(
                                'absolute -top-8 flex items-center gap-0.5 bg-[#233138] rounded-full shadow-lg px-1.5 py-1 z-10',
                                message.is_own ? 'right-0' : 'left-0'
                            )}>
                                {QUICK_REACTIONS.map((emoji) => (
                                    <button
                                        key={emoji}
                                        onClick={() => onReact(message, emoji)}
                                        className="hover:scale-125 transition-transform text-base p-1 hover:bg-[#374045] rounded-full"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Reactions Display */}
                    {message.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                            {message.reactions.map((reaction) => (
                                <button
                                    key={reaction.emoji}
                                    onClick={() => onReact(message, reaction.emoji)}
                                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#233138] text-xs hover:bg-[#374045] transition-colors"
                                    title={reaction.users.join(', ')}
                                >
                                    <span>{reaction.emoji}</span>
                                    <span className="text-[#8696a0]">{reaction.count}</span>
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
                    className="fixed z-50 bg-[#233138] rounded-lg shadow-xl border border-[#374045] py-1 min-w-[180px]"
                    style={{ 
                        left: Math.min(contextMenu.x, window.innerWidth - 200),
                        top: Math.min(contextMenu.y, window.innerHeight - 400)
                    }}
                >
                    <button
                        onClick={() => { onReply(message); setContextMenu(null); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#e9edef] hover:bg-[#374045] transition-colors"
                    >
                        <Reply className="h-4 w-4" /> Balas
                    </button>
                    <button
                        onClick={() => { 
                            const emoji = prompt('Pilih emoji:', '👍');
                            if (emoji) onReact(message, emoji);
                            setContextMenu(null);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#e9edef] hover:bg-[#374045] transition-colors"
                    >
                        <span className="text-base">😀</span> Beri Reaksi
                    </button>
                    <button
                        onClick={() => { onStar?.(message); setContextMenu(null); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#e9edef] hover:bg-[#374045] transition-colors"
                    >
                        <Star className={cn("h-4 w-4", message.is_starred && "fill-yellow-400 text-yellow-400")} /> 
                        {message.is_starred ? 'Hapus Bintang' : 'Beri Bintang'}
                    </button>
                    <button
                        onClick={() => { onPin?.(message); setContextMenu(null); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#e9edef] hover:bg-[#374045] transition-colors"
                    >
                        <Pin className={cn("h-4 w-4", message.is_pinned && "fill-[#00a884] text-[#00a884]")} /> 
                        {message.is_pinned ? 'Lepas Sematan' : 'Sematkan'}
                    </button>
                    <button
                        onClick={() => { onForward(message); setContextMenu(null); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#e9edef] hover:bg-[#374045] transition-colors"
                    >
                        <Forward className="h-4 w-4" /> Teruskan
                    </button>
                    <button
                        onClick={handleCopy}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#e9edef] hover:bg-[#374045] transition-colors"
                    >
                        <Copy className="h-4 w-4" /> Salin
                    </button>
                    <button
                        onClick={() => { onInfo?.(message); setContextMenu(null); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#e9edef] hover:bg-[#374045] transition-colors"
                    >
                        <Info className="h-4 w-4" /> Info
                    </button>
                    {message.can_edit && (
                        <button
                            onClick={() => { onEdit(message); setContextMenu(null); }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#e9edef] hover:bg-[#374045] transition-colors"
                        >
                            <Pencil className="h-4 w-4" /> Edit
                        </button>
                    )}
                    {message.is_own && (
                        <button
                            onClick={() => { onDelete(message); setContextMenu(null); }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-[#374045] transition-colors"
                        >
                            <Trash2 className="h-4 w-4" /> Hapus
                        </button>
                    )}
                    <div className="border-t border-[#374045] my-1" />
                    <button
                        onClick={() => { onSelect?.(message); setContextMenu(null); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#e9edef] hover:bg-[#374045] transition-colors"
                    >
                        <CheckSquare className="h-4 w-4" /> Pilih Pesan
                    </button>
                </div>
            )}
        </>
    );
}
