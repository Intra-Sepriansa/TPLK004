import { useState } from 'react';
import { cn } from '@/lib/utils';

interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
    onClose: () => void;
}

const EMOJI_CATEGORIES = {
    'Sering Digunakan': ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '💯'],
    'Wajah': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐'],
    'Gestur': ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪'],
    'Hati': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
    'Objek': ['🎉', '🎊', '🎁', '🎈', '🏆', '🥇', '🥈', '🥉', '⚽', '🏀', '🎮', '🎯', '📱', '💻', '📷', '🎵', '🎶', '📚', '✏️', '📝'],
};

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
    const [activeCategory, setActiveCategory] = useState('Sering Digunakan');

    return (
        <div className="w-72 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Category Tabs */}
            <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-700 p-1 gap-1">
                {Object.keys(EMOJI_CATEGORIES).map((category) => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={cn(
                            'px-2 py-1 text-xs rounded whitespace-nowrap transition-colors',
                            activeCategory === category
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        )}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Emoji Grid */}
            <div className="p-2 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-8 gap-1">
                    {EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES].map((emoji, index) => (
                        <button
                            key={`${emoji}-${index}`}
                            onClick={() => {
                                onSelect(emoji);
                                onClose();
                            }}
                            className="h-8 w-8 flex items-center justify-center text-lg hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
