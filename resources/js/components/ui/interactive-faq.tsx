/**
 * InteractiveFAQ Component
 * FAQ accordion dengan smooth animations, search, dan category grouping
 */

import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import React, { useState } from 'react';

export interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category: string;
}

export interface InteractiveFAQProps {
    faqs: FAQItem[];
    defaultOpen?: string[];
    searchable?: boolean;
    className?: string;
    groupByCategory?: boolean;
}

const InteractiveFAQ: React.FC<InteractiveFAQProps> = ({
    faqs,
    defaultOpen = [],
    searchable = true,
    className,
    groupByCategory = true,
}) => {
    const [openItems, setOpenItems] = useState<string[]>(defaultOpen);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleItem = (id: string) => {
        setOpenItems(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // Filter FAQs based on search
    const filteredFAQs = faqs.filter(
        faq =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group by category
    const groupedFAQs = groupByCategory
        ? filteredFAQs.reduce((acc, faq) => {
              if (!acc[faq.category]) {
                  acc[faq.category] = [];
              }
              acc[faq.category].push(faq);
              return acc;
          }, {} as Record<string, FAQItem[]>)
        : { All: filteredFAQs };

    return (
        <div className={cn('w-full', className)}>
            {/* Search */}
            {searchable && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search FAQs..."
                            className={cn(
                                'w-full pl-12 pr-4 py-3 rounded-xl',
                                'glass border border-white/10',
                                'bg-transparent text-white placeholder:text-white/40',
                                'focus:border-purple-500/50 focus:glow-purple',
                                'outline-none transition-all duration-300'
                            )}
                        />
                    </div>
                </motion.div>
            )}

            {/* FAQ Groups */}
            <div className="space-y-8">
                {Object.entries(groupedFAQs).map(([category, items], categoryIndex) => (
                    <motion.div
                        key={category}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: categoryIndex * 0.1 }}
                    >
                        {/* Category Title */}
                        {groupByCategory && (
                            <h3 className="text-xl font-bold text-white mb-4 font-display">
                                {category}
                            </h3>
                        )}

                        {/* FAQ Items */}
                        <div className="space-y-3">
                            {items.map((faq, index) => (
                                <FAQItemComponent
                                    key={faq.id}
                                    faq={faq}
                                    isOpen={openItems.includes(faq.id)}
                                    onToggle={() => toggleItem(faq.id)}
                                    searchQuery={searchQuery}
                                    index={index}
                                />
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* No Results */}
            {filteredFAQs.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                >
                    <div className="text-white/40 mb-2">No FAQs found</div>
                    <div className="text-white/60 text-sm">
                        Try different keywords or browse all categories
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default InteractiveFAQ;

/**
 * FAQItemComponent
 * Individual FAQ item with accordion animation
 */
interface FAQItemComponentProps {
    faq: FAQItem;
    isOpen: boolean;
    onToggle: () => void;
    searchQuery: string;
    index: number;
}

const FAQItemComponent: React.FC<FAQItemComponentProps> = ({
    faq,
    isOpen,
    onToggle,
    searchQuery,
    index,
}) => {
    const highlightText = (text: string) => {
        if (!searchQuery) return text;

        const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
        return parts.map((part, i) =>
            part.toLowerCase() === searchQuery.toLowerCase() ? (
                <mark key={i} className="bg-purple-500/30 text-purple-200 rounded px-0.5">
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
                'rounded-xl overflow-hidden',
                'glass border transition-all duration-300',
                isOpen
                    ? 'border-purple-500/50 glow-purple'
                    : 'border-white/10 hover:border-white/20'
            )}
        >
            {/* Question Button */}
            <motion.button
                onClick={onToggle}
                className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 group"
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
            >
                <span className="text-white font-medium flex-1">
                    {highlightText(faq.question)}
                </span>

                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                >
                    <ChevronDown className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                </motion.div>
            </motion.button>

            {/* Answer Content */}
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-4 pt-2 border-t border-white/10">
                            <motion.div
                                initial={{ y: -10 }}
                                animate={{ y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-white/70 leading-relaxed"
                            >
                                {highlightText(faq.answer)}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

/**
 * FAQCategory Component
 * Category selector for FAQs
 */
export interface FAQCategoryProps {
    categories: string[];
    activeCategory: string;
    onCategoryChange: (category: string) => void;
    className?: string;
}

export const FAQCategory: React.FC<FAQCategoryProps> = ({
    categories,
    activeCategory,
    onCategoryChange,
    className,
}) => {
    return (
        <div className={cn('flex flex-wrap gap-2', className)}>
            {categories.map(category => (
                <motion.button
                    key={category}
                    onClick={() => onCategoryChange(category)}
                    className={cn(
                        'px-4 py-2 rounded-lg font-medium transition-all duration-300',
                        activeCategory === category
                            ? 'bg-purple-500 text-white'
                            : 'glass border border-white/10 text-white/70 hover:text-white hover:border-white/20'
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {category}
                </motion.button>
            ))}
        </div>
    );
};
