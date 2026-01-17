/**
 * InteractiveSearch Component
 * Search bar dengan real-time suggestions, highlights, dan keyboard navigation
 */

import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

export interface SearchSuggestion {
    id: string;
    title: string;
    category: string;
    highlight?: string;
    description?: string;
}

export interface InteractiveSearchProps {
    placeholder?: string;
    onSearch: (query: string) => void;
    suggestions?: SearchSuggestion[];
    loading?: boolean;
    className?: string;
    debounceMs?: number;
    onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
    showHistory?: boolean;
}

const InteractiveSearch: React.FC<InteractiveSearchProps> = ({
    placeholder = 'Search documentation...',
    onSearch,
    suggestions = [],
    loading = false,
    className,
    debounceMs = 300,
    onSuggestionSelect,
    showHistory = true,
}) => {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout>();

    // Load search history from localStorage
    useEffect(() => {
        if (showHistory) {
            const history = localStorage.getItem('search-history');
            if (history) {
                setSearchHistory(JSON.parse(history));
            }
        }
    }, [showHistory]);

    // Debounced search
    const debouncedSearch = useCallback(
        (value: string) => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }

            debounceRef.current = setTimeout(() => {
                onSearch(value);
            }, debounceMs);
        },
        [onSearch, debounceMs]
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        setSelectedIndex(-1);
        
        if (value.trim()) {
            debouncedSearch(value);
        }
    };

    const handleClear = () => {
        setQuery('');
        setSelectedIndex(-1);
        onSearch('');
        inputRef.current?.focus();
    };

    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
        setQuery(suggestion.title);
        setIsFocused(false);
        
        // Add to history
        if (showHistory) {
            const newHistory = [
                suggestion.title,
                ...searchHistory.filter(h => h !== suggestion.title),
            ].slice(0, 5);
            setSearchHistory(newHistory);
            localStorage.setItem('search-history', JSON.stringify(newHistory));
        }

        onSuggestionSelect?.(suggestion);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!suggestions.length) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                    handleSuggestionClick(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                setIsFocused(false);
                inputRef.current?.blur();
                break;
        }
    };

    const highlightMatch = (text: string, query: string) => {
        if (!query.trim()) return text;

        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, index) =>
            part.toLowerCase() === query.toLowerCase() ? (
                <mark
                    key={index}
                    className="bg-purple-500/30 text-purple-200 rounded px-0.5"
                >
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    const showSuggestions = isFocused && (suggestions.length > 0 || (showHistory && searchHistory.length > 0 && !query));

    return (
        <div className={cn('relative w-full', className)}>
            {/* Search Input */}
            <motion.div
                className={cn(
                    'relative flex items-center',
                    'glass rounded-xl',
                    'border transition-all duration-300',
                    isFocused
                        ? 'border-purple-500/50 glow-purple'
                        : 'border-white/10'
                )}
                animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
            >
                {/* Search Icon */}
                <div className="absolute left-4 text-white/40">
                    <Search className="w-5 h-5" />
                </div>

                {/* Input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className={cn(
                        'w-full px-12 py-4',
                        'bg-transparent text-white placeholder:text-white/40',
                        'outline-none',
                        'text-base'
                    )}
                />

                {/* Loading Spinner */}
                {loading && (
                    <div className="absolute right-12">
                        <motion.div
                            className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                        />
                    </div>
                )}

                {/* Clear Button */}
                {query && !loading && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        onClick={handleClear}
                        className="absolute right-4 text-white/40 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </motion.button>
                )}
            </motion.div>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
                {showSuggestions && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-2 z-50"
                    >
                        <div className="glass-strong rounded-xl border border-white/10 overflow-hidden max-h-96 overflow-y-auto">
                            {/* Search History */}
                            {!query && showHistory && searchHistory.length > 0 && (
                                <div className="p-2">
                                    <div className="px-3 py-2 text-xs text-white/40 font-medium">
                                        Recent Searches
                                    </div>
                                    {searchHistory.map((item, index) => (
                                        <motion.button
                                            key={index}
                                            onClick={() => {
                                                setQuery(item);
                                                onSearch(item);
                                            }}
                                            className="w-full px-3 py-2 text-left text-white/70 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2"
                                            whileHover={{ x: 4 }}
                                        >
                                            <Search className="w-4 h-4 text-white/40" />
                                            <span>{item}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            )}

                            {/* Suggestions */}
                            {suggestions.length > 0 && (
                                <div className="p-2">
                                    {query && (
                                        <div className="px-3 py-2 text-xs text-white/40 font-medium">
                                            Suggestions
                                        </div>
                                    )}
                                    {suggestions.map((suggestion, index) => (
                                        <motion.button
                                            key={suggestion.id}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className={cn(
                                                'w-full px-3 py-3 text-left rounded-lg transition-all',
                                                'flex items-start gap-3',
                                                selectedIndex === index
                                                    ? 'bg-purple-500/20 border border-purple-500/30'
                                                    : 'hover:bg-white/5'
                                            )}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ x: 4 }}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="text-white font-medium mb-1">
                                                    {highlightMatch(suggestion.title, query)}
                                                </div>
                                                {suggestion.description && (
                                                    <div className="text-white/60 text-sm line-clamp-1">
                                                        {suggestion.description}
                                                    </div>
                                                )}
                                                <div className="mt-1 inline-block px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-xs">
                                                    {suggestion.category}
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            )}

                            {/* No Results */}
                            {query && suggestions.length === 0 && !loading && (
                                <div className="p-8 text-center">
                                    <div className="text-white/40 mb-2">No results found</div>
                                    <div className="text-white/60 text-sm">
                                        Try different keywords
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Keyboard Shortcuts Hint */}
            {isFocused && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-full left-0 right-0 mt-1 px-4 py-2 text-xs text-white/40 flex items-center gap-4"
                >
                    <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 rounded bg-white/10">↑</kbd>
                        <kbd className="px-1.5 py-0.5 rounded bg-white/10">↓</kbd>
                        Navigate
                    </span>
                    <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 rounded bg-white/10">Enter</kbd>
                        Select
                    </span>
                    <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 rounded bg-white/10">Esc</kbd>
                        Close
                    </span>
                </motion.div>
            )}
        </div>
    );
};

export default InteractiveSearch;
