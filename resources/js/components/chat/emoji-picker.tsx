import { cn } from '@/lib/utils';
import { useState } from 'react';

interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
    onClose: () => void;
}

const EMOJI_CATEGORIES = {
    'Sering Digunakan': ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '💯'],
    Wajah: [
        '😀',
        '😃',
        '😄',
        '😁',
        '😆',
        '😅',
        '🤣',
        '😂',
        '🙂',
        '😊',
        '😇',
        '🥰',
        '😍',
        '🤩',
        '😘',
        '😗',
        '😚',
        '😙',
        '🥲',
        '😋',
        '😛',
        '😜',
        '🤪',
        '😝',
        '🤑',
        '🤗',
        '🤭',
        '🤫',
        '🤔',
        '🤐',
        '🤨',
        '😐',
        '😑',
        '😶',
        '😏',
        '😒',
        '🙄',
        '😬',
        '🤥',
        '😌',
        '😔',
        '😪',
        '🤤',
        '😴',
        '😷',
        '🤒',
        '🤕',
        '🤢',
        '🤮',
        '🤧',
        '🥵',
        '🥶',
        '🥴',
        '😵',
        '🤯',
        '🤠',
        '🥳',
        '🥸',
        '😎',
        '🤓',
        '🧐',
    ],
    Gestur: [
        '👋',
        '🤚',
        '🖐️',
        '✋',
        '🖖',
        '👌',
        '🤌',
        '🤏',
        '✌️',
        '🤞',
        '🤟',
        '🤘',
        '🤙',
        '👈',
        '👉',
        '👆',
        '🖕',
        '👇',
        '☝️',
        '👍',
        '👎',
        '✊',
        '👊',
        '🤛',
        '🤜',
        '👏',
        '🙌',
        '👐',
        '🤲',
        '🤝',
        '🙏',
        '✍️',
        '💪',
    ],
    Hati: [
        '❤️',
        '🧡',
        '💛',
        '💚',
        '💙',
        '💜',
        '🖤',
        '🤍',
        '🤎',
        '💔',
        '❣️',
        '💕',
        '💞',
        '💓',
        '💗',
        '💖',
        '💘',
        '💝',
    ],
    Objek: [
        '🎉',
        '🎊',
        '🎁',
        '🎈',
        '🏆',
        '🥇',
        '🥈',
        '🥉',
        '⚽',
        '🏀',
        '🎮',
        '🎯',
        '📱',
        '💻',
        '📷',
        '🎵',
        '🎶',
        '📚',
        '✏️',
        '📝',
    ],
};

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
    const [activeCategory, setActiveCategory] = useState('Sering Digunakan');

    return (
        <div className="w-72 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
            {/* Category Tabs */}
            <div className="flex gap-1 overflow-x-auto border-b border-slate-200 p-1 dark:border-slate-700">
                {Object.keys(EMOJI_CATEGORIES).map((category) => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={cn(
                            'rounded px-2 py-1 text-xs whitespace-nowrap transition-colors',
                            activeCategory === category
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                        )}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Emoji Grid */}
            <div className="max-h-48 overflow-y-auto p-2">
                <div className="grid grid-cols-8 gap-1">
                    {EMOJI_CATEGORIES[
                        activeCategory as keyof typeof EMOJI_CATEGORIES
                    ].map((emoji, index) => (
                        <button
                            key={`${emoji}-${index}`}
                            onClick={() => {
                                onSelect(emoji);
                                onClose();
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded text-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
