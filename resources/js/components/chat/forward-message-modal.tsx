import { useState } from 'react';
import { X, Search, Check, Forward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Message, ConversationListItem } from '@/types/chat';

interface ForwardMessageModalProps {
    message: Message;
    conversations: ConversationListItem[];
    onForward: (conversationIds: number[]) => void;
    onClose: () => void;
}

export function ForwardMessageModal({ message, conversations, onForward, onClose }: ForwardMessageModalProps) {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<number[]>([]);
    const [forwarding, setForwarding] = useState(false);

    const filtered = conversations.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    const toggleSelect = (id: number) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleForward = async () => {
        if (selected.length === 0) return;
        setForwarding(true);
        await onForward(selected);
        setForwarding(false);
        onClose();
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Forward className="h-5 w-5" />
                        Teruskan Pesan
                    </DialogTitle>
                </DialogHeader>

                {/* Message Preview */}
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg mb-4">
                    <p className="text-xs text-slate-500 mb-1">Dari: {message.sender_name}</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">
                        {message.content}
                    </p>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Cari percakapan..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Conversation List */}
                <div className="max-h-64 overflow-y-auto space-y-1">
                    {filtered.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => toggleSelect(conv.id)}
                            className={cn(
                                'w-full flex items-center gap-3 p-3 rounded-lg transition-colors',
                                selected.includes(conv.id)
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                            )}
                        >
                            {/* Avatar */}
                            {conv.avatar ? (
                                <img src={conv.avatar} alt={conv.name} className="h-10 w-10 rounded-full object-cover" />
                            ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
                                    <span className="text-lg font-semibold text-slate-600 dark:text-slate-300">
                                        {conv.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}

                            {/* Name */}
                            <div className="flex-1 text-left">
                                <p className="font-medium text-slate-900 dark:text-white">{conv.name}</p>
                                <p className="text-xs text-slate-500">{conv.type === 'group' ? 'Grup' : 'Personal'}</p>
                            </div>

                            {/* Checkbox */}
                            <div className={cn(
                                'h-5 w-5 rounded-full border-2 flex items-center justify-center',
                                selected.includes(conv.id)
                                    ? 'bg-emerald-500 border-emerald-500'
                                    : 'border-slate-300 dark:border-slate-600'
                            )}>
                                {selected.includes(conv.id) && <Check className="h-3 w-3 text-white" />}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={onClose}>
                        Batal
                    </Button>
                    <Button
                        onClick={handleForward}
                        disabled={selected.length === 0 || forwarding}
                        className="bg-emerald-500 hover:bg-emerald-600"
                    >
                        {forwarding ? 'Meneruskan...' : `Teruskan (${selected.length})`}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
