/**
 * FAQ Accordion Component
 * Requirements: 6.1
 */

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';
import type { FAQCategory } from '@/types/documentation';

interface FAQAccordionProps {
    categories: FAQCategory[];
    searchQuery?: string;
}

export function FAQAccordion({ categories, searchQuery = '' }: FAQAccordionProps) {
    const filteredCategories = categories
        .map((category) => ({
            ...category,
            faqs: category.faqs.filter(
                (faq) =>
                    searchQuery === '' ||
                    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        }))
        .filter((category) => category.faqs.length > 0);

    if (filteredCategories.length === 0) {
        return (
            <div className="text-center py-8">
                <Icons.HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Tidak ada FAQ ditemukan</h3>
                <p className="text-muted-foreground">
                    Coba ubah kata kunci pencarian
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {filteredCategories.map((category) => {
                const IconComponent = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[
                    category.icon.charAt(0).toUpperCase() + category.icon.slice(1)
                ] || Icons.HelpCircle;

                return (
                    <Card key={category.id}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <IconComponent className="h-5 w-5" />
                                {category.name}
                                <Badge variant="secondary" className="ml-auto">
                                    {category.faqs.length} FAQ
                                </Badge>
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {category.description}
                            </p>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                {category.faqs.map((faq, index) => (
                                    <AccordionItem key={index} value={`${category.id}-${index}`}>
                                        <AccordionTrigger className="text-left">
                                            {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
