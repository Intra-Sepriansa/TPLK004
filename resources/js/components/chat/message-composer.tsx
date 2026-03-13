import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/chat';
import {
    Camera,
    FileText,
    Image as ImageIcon,
    Mic,
    Paperclip,
    Send,
    Smile,
    X,
} from 'lucide-react';
import { useRef, useState } from 'react';

interface MessageComposerProps {
    onSend: (content: string, attachments: File[]) => void;
    onTyping: (isTyping: boolean) => void;
    replyTo: Message | null;
    onCancelReply: () => void;
    disabled?: boolean;
    enterToSend?: boolean;
}

const EMOJI_CATEGORIES = {
    Sering: [
        '😀',
        '😂',
        '😍',
        '🥰',
        '😎',
        '🤔',
        '👍',
        '👎',
        '❤️',
        '🔥',
        '🎉',
        '💯',
        '🙏',
        '👏',
        '💪',
        '✨',
    ],
    Wajah: [
        '😊',
        '😁',
        '😅',
        '🤣',
        '😇',
        '🥳',
        '😋',
        '😜',
        '🤗',
        '🤩',
        '😴',
        '🤒',
        '😱',
        '😤',
        '🥺',
        '😭',
    ],
    Gestur: [
        '👋',
        '✌️',
        '🤞',
        '🤟',
        '🤘',
        '👌',
        '🤙',
        '💪',
        '🙌',
        '👐',
        '🤝',
        '🙏',
        '✍️',
        '💅',
        '🤳',
        '💃',
    ],
    Objek: [
        '💝',
        '💖',
        '💗',
        '💓',
        '💕',
        '🌹',
        '🌸',
        '🎁',
        '🎈',
        '🎊',
        '🏆',
        '⭐',
        '🌟',
        '💫',
        '✨',
        '🎯',
    ],
};

export function MessageComposer({
    onSend,
    onTyping,
    replyTo,
    onCancelReply,
    disabled,
    enterToSend = true,
}: MessageComposerProps) {
    const [content, setContent] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [showEmoji, setShowEmoji] = useState(false);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [activeEmojiCategory, setActiveEmojiCategory] =
        useState<keyof typeof EMOJI_CATEGORIES>('Sering');
    const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        const target = e.target;
        target.style.height = 'auto';
        target.style.height = Math.min(target.scrollHeight, 100) + 'px';

        onTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => onTyping(false), 2000);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        const newAttachments = [...attachments, ...files].slice(0, 5);
        setAttachments(newAttachments);
        const newPreviews = files.map((file) => ({
            file,
            url: file.type.startsWith('image/')
                ? URL.createObjectURL(file)
                : '',
        }));
        setPreviews((prev) => [...prev, ...newPreviews].slice(0, 5));
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (imageInputRef.current) imageInputRef.current.value = '';
        setShowAttachMenu(false);
    };

    const removeAttachment = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => {
            const removed = prev[index];
            if (removed?.url) URL.revokeObjectURL(removed.url);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSend = () => {
        if (!content.trim() && attachments.length === 0) return;
        onSend(content.trim(), attachments);
        setContent('');
        setAttachments([]);
        previews.forEach((p) => p.url && URL.revokeObjectURL(p.url));
        setPreviews([]);
        onTyping(false);
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && enterToSend) {
            e.preventDefault();
            handleSend();
        }
    };

    const insertEmoji = (emoji: string) => {
        setContent((prev) => prev + emoji);
        textareaRef.current?.focus();
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="bg-[#202c33] px-4 py-2">
            {/* Reply Preview */}
            {replyTo && (
                <div className="mb-2 flex items-center gap-2 rounded-lg border-l-4 border-[#00a884] bg-[#1d282f] p-2">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-[#00a884]">
                            Membalas {replyTo.sender_name}
                        </p>
                        <p className="truncate text-sm text-[#8696a0]">
                            {replyTo.content}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onCancelReply}
                        className="h-6 w-6 text-[#8696a0] hover:bg-[#374045]"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Attachments Preview */}
            {attachments.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                    {previews.map((preview, index) => (
                        <div key={index} className="group relative">
                            {preview.url ? (
                                <img
                                    src={preview.url}
                                    alt=""
                                    className="h-16 w-16 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="flex h-16 w-16 flex-col items-center justify-center rounded-lg bg-[#374045]">
                                    <FileText className="h-5 w-5 text-[#8696a0]" />
                                    <span className="max-w-full truncate px-1 text-[9px] text-[#8696a0]">
                                        {preview.file.name.slice(0, 8)}...
                                    </span>
                                </div>
                            )}
                            <button
                                onClick={() => removeAttachment(index)}
                                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ea4335] text-white opacity-0 transition-opacity group-hover:opacity-100"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Input Area - WhatsApp Style */}
            <div className="flex items-end gap-2">
                {/* Emoji Button */}
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setShowEmoji(!showEmoji);
                            setShowAttachMenu(false);
                        }}
                        disabled={disabled}
                        className="h-10 w-10 rounded-full text-[#8696a0] hover:bg-[#374045] hover:text-[#e9edef]"
                    >
                        <Smile className="h-6 w-6" />
                    </Button>

                    {/* Emoji Picker */}
                    {showEmoji && (
                        <div className="absolute bottom-12 left-0 z-20 w-72 rounded-lg border border-[#374045] bg-[#233138] shadow-xl">
                            <div className="flex gap-1 border-b border-[#374045] p-1">
                                {Object.keys(EMOJI_CATEGORIES).map(
                                    (category) => (
                                        <button
                                            key={category}
                                            onClick={() =>
                                                setActiveEmojiCategory(
                                                    category as keyof typeof EMOJI_CATEGORIES,
                                                )
                                            }
                                            className={cn(
                                                'flex-1 rounded px-2 py-1.5 text-xs font-medium transition-colors',
                                                activeEmojiCategory === category
                                                    ? 'bg-[#00a884] text-[#111b21]'
                                                    : 'text-[#8696a0] hover:bg-[#374045]',
                                            )}
                                        >
                                            {category}
                                        </button>
                                    ),
                                )}
                            </div>
                            <div className="grid max-h-48 grid-cols-8 gap-1 overflow-y-auto p-2">
                                {EMOJI_CATEGORIES[activeEmojiCategory].map(
                                    (emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => insertEmoji(emoji)}
                                            className="flex h-8 w-8 items-center justify-center rounded text-lg transition-transform hover:scale-110 hover:bg-[#374045]"
                                        >
                                            {emoji}
                                        </button>
                                    ),
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Attachment Button */}
                <div className="relative">
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <input
                        ref={imageInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setShowAttachMenu(!showAttachMenu);
                            setShowEmoji(false);
                        }}
                        disabled={disabled || attachments.length >= 5}
                        className="h-10 w-10 rounded-full text-[#8696a0] hover:bg-[#374045] hover:text-[#e9edef]"
                    >
                        <Paperclip className="h-6 w-6" />
                    </Button>

                    {/* Attachment Menu - WhatsApp Style */}
                    {showAttachMenu && (
                        <div className="absolute bottom-12 left-0 z-20 rounded-lg border border-[#374045] bg-[#233138] p-2 shadow-xl">
                            <button
                                onClick={() => imageInputRef.current?.click()}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-[#374045]"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#bf59cf]">
                                    <ImageIcon className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-[#e9edef]">
                                    Foto & Video
                                </span>
                            </button>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-[#374045]"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5157ae]">
                                    <FileText className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-[#e9edef]">Dokumen</span>
                            </button>
                            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-[#374045]">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d3396d]">
                                    <Camera className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-[#e9edef]">Kamera</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Text Input - WhatsApp Style */}
                <div className="flex-1">
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={handleContentChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Ketik pesan"
                        disabled={disabled}
                        rows={1}
                        className="w-full resize-none rounded-lg bg-[#2a3942] px-3 py-2.5 text-sm text-[#e9edef] placeholder:text-[#8696a0] focus:outline-none"
                        style={{ minHeight: '42px', maxHeight: '100px' }}
                    />
                </div>

                {/* Send/Mic Button - WhatsApp Style */}
                {content.trim() || attachments.length > 0 ? (
                    <Button
                        onClick={handleSend}
                        disabled={disabled}
                        className="h-10 w-10 rounded-full bg-[#00a884] text-white hover:bg-[#06cf9c]"
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={disabled}
                        className="h-10 w-10 rounded-full text-[#8696a0] hover:bg-[#374045] hover:text-[#e9edef]"
                    >
                        <Mic className="h-6 w-6" />
                    </Button>
                )}
            </div>
        </div>
    );
}
