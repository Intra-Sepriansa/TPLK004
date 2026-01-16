import { useState, useCallback, useEffect } from 'react';
import { Search, X, Calendar, FileText, Image as ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

export function MessageSearch({ conversationId, onResultClick, onClose }: MessageSearchProps) {
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
            if (conversationId) params.append('conversation_id', conversationId.toString());
            if (filters.type) params.append('type', filters.type);
            if (filters.startDate) params.append('start_date', filters.startDate);
            if (filters.endDate) params.append('end_date', filters.endDate);
            if (filters.hasAttachments) params.append('has_attachments', 'true');

            const response = await fetch(`/api/chat/search?${params}`, {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
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
                <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-950">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Cari Pesan</h3>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Cari pesan..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-10"
                        autoFocus
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mt-3">
                    <select
                        value={filters.type}
                        onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
                        className="text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5"
                    >
                        <option value="">Semua Tipe</option>
                        <option value="text">Teks</option>
                        <option value="image">Gambar</option>
                        <option value="file">File</option>
                    </select>
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))}
                        className="text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5"
                        placeholder="Dari"
                    />
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))}
                        className="text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5"
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
                                className="w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    {result.type === 'image' && <ImageIcon className="h-4 w-4 text-slate-400" />}
                                    {result.type === 'file' && <FileText className="h-4 w-4 text-slate-400" />}
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                                        {result.sender_name}
                                    </span>
                                    <span className="text-xs text-slate-400">•</span>
                                    <span className="text-xs text-slate-500">{result.conversation_name}</span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                    {highlightText(result.content, query)}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">{formatDate(result.created_at)}</p>
                            </button>
                        ))}
                    </div>
                ) : query.length >= 2 ? (
                    <div className="text-center py-8 text-slate-500">
                        Tidak ada hasil ditemukan
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-500">
                        Ketik minimal 2 karakter untuk mencari
                    </div>
                )}
            </div>
        </div>
    );
}
