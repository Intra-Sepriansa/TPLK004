import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Image as ImageIcon, Search, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface SearchResult {
    id: number;
    conversation_id: number;
    conversation_name: string;
    content: string;
    sender_name: string;
    type: string;
    created_at: string;
}

interface MessageSearchProps {
    conversationId?: number;
    onResultClick: (result: SearchResult) => void;
    onClose: () => void;
}

export function MessageSearch({
    conversationId,
    onResultClick,
    onClose,
}: MessageSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        type: '',
        startDate: '',
        endDate: '',
        hasAttachments: false,
    });

    const search = useCallback(async () => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const params = new URLSearchParams({ q: query });
            if (conversationId)
                params.append('conversation_id', conversationId.toString());
            if (filters.type) params.append('type', filters.type);
            if (filters.startDate)
                params.append('start_date', filters.startDate);
            if (filters.endDate) params.append('end_date', filters.endDate);
            if (filters.hasAttachments)
                params.append('has_attachments', 'true');

            const response = await fetch(`/api/chat/search?${params}`, {
                headers: {
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
            });
            const data = await response.json();
            setResults(data.messages || []);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    }, [query, conversationId, filters]);

    useEffect(() => {
        const timer = setTimeout(search, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const highlightText = (text: string, highlight: string) => {
        if (!highlight.trim()) return text;
        const regex = new RegExp(`(${highlight})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) =>
            regex.test(part) ? (
                <mark
                    key={i}
                    className="rounded bg-yellow-200 px-0.5 dark:bg-yellow-800"
                >
                    {part}
                </mark>
            ) : (
                part
            ),
        );
    };

    return (
        <div className="flex h-full flex-col bg-white dark:bg-slate-950">
            {/* Header */}
            <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                        Cari Pesan
                    </h3>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Cari pesan..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-10"
                        autoFocus
                    />
                </div>

                {/* Filters */}
                <div className="mt-3 flex flex-wrap gap-2">
                    <select
                        value={filters.type}
                        onChange={(e) =>
                            setFilters((f) => ({ ...f, type: e.target.value }))
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
                    >
                        <option value="">Semua Tipe</option>
                        <option value="text">Teks</option>
                        <option value="image">Gambar</option>
                        <option value="file">File</option>
                    </select>
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) =>
                            setFilters((f) => ({
                                ...f,
                                startDate: e.target.value,
                            }))
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
                        placeholder="Dari"
                    />
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) =>
                            setFilters((f) => ({
                                ...f,
                                endDate: e.target.value,
                            }))
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
                        placeholder="Sampai"
                    />
                </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                    </div>
                ) : results.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {results.map((result) => (
                            <button
                                key={result.id}
                                onClick={() => onResultClick(result)}
                                className="w-full p-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            >
                                <div className="mb-1 flex items-center gap-2">
                                    {result.type === 'image' && (
                                        <ImageIcon className="h-4 w-4 text-slate-400" />
                                    )}
                                    {result.type === 'file' && (
                                        <FileText className="h-4 w-4 text-slate-400" />
                                    )}
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                                        {result.sender_name}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        •
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {result.conversation_name}
                                    </span>
                                </div>
                                <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                                    {highlightText(result.content, query)}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    {formatDate(result.created_at)}
                                </p>
                            </button>
                        ))}
                    </div>
                ) : query.length >= 2 ? (
                    <div className="py-8 text-center text-slate-500">
                        Tidak ada hasil ditemukan
                    </div>
                ) : (
                    <div className="py-8 text-center text-slate-500">
                        Ketik minimal 2 karakter untuk mencari
                    </div>
                )}
            </div>
        </div>
    );
}
