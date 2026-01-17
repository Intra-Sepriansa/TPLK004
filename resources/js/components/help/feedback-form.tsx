/**
 * Feedback Form Component
 * Requirements: 6.5
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Paperclip, X, RefreshCw } from 'lucide-react';
import type { HelpFeedback } from '@/types/documentation';

interface FeedbackFormProps {
    onSubmit: (feedback: HelpFeedback) => Promise<{ ticketId: string }>;
    userEmail?: string;
}

const categories = [
    { value: 'bug', label: 'Laporan Bug' },
    { value: 'feature', label: 'Permintaan Fitur' },
    { value: 'question', label: 'Pertanyaan' },
    { value: 'other', label: 'Lainnya' },
] as const;

export function FeedbackForm({ onSubmit, userEmail }: FeedbackFormProps) {
    const [category, setCategory] = useState<HelpFeedback['category']>('question');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState(userEmail || '');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [ticketId, setTicketId] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setAttachments((prev) => [...prev, ...files].slice(0, 5)); // Max 5 files
        e.target.value = '';
    };

    const removeAttachment = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !message.trim()) return;

        setIsSubmitting(true);
        try {
            const result = await onSubmit({
                category,
                subject: subject.trim(),
                message: message.trim(),
                email: email.trim() || undefined,
                attachments: attachments.length > 0 ? attachments : undefined,
            });
            setTicketId(result.ticketId);
            setSubmitted(true);
        } catch (error) {
            console.error('Failed to submit feedback:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setCategory('question');
        setSubject('');
        setMessage('');
        setAttachments([]);
        setSubmitted(false);
        setTicketId(null);
    };

    if (submitted) {
        return (
            <Card>
                <CardContent className="pt-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Send className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Terima Kasih!</h3>
                    <p className="text-muted-foreground mb-4">
                        Feedback Anda telah dikirim. Kami akan merespons secepatnya.
                    </p>
                    {ticketId && (
                        <p className="text-sm text-muted-foreground mb-4">
                            Nomor Tiket: <span className="font-mono font-medium">{ticketId}</span>
                        </p>
                    )}
                    <Button variant="outline" onClick={handleReset}>
                        Kirim Feedback Lain
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Kirim Feedback</CardTitle>
                <CardDescription>
                    Punya pertanyaan atau saran? Kami senang mendengar dari Anda
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="category">Kategori</Label>
                        <Select
                            value={category}
                            onValueChange={(value) => setCategory(value as HelpFeedback['category'])}
                        >
                            <SelectTrigger id="category">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subject">Subjek</Label>
                        <Input
                            id="subject"
                            placeholder="Ringkasan singkat..."
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Pesan</Label>
                        <Textarea
                            id="message"
                            placeholder="Jelaskan secara detail..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={5}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email (opsional)</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Untuk menerima balasan dari tim kami
                        </p>
                    </div>

                    {/* Attachments */}
                    <div className="space-y-2">
                        <Label>Lampiran (opsional)</Label>
                        <div className="flex flex-wrap gap-2">
                            {attachments.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-sm"
                                >
                                    <Paperclip className="h-3 w-3" />
                                    <span className="max-w-[150px] truncate">{file.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeAttachment(index)}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {attachments.length < 5 && (
                            <div>
                                <input
                                    type="file"
                                    id="attachments"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept="image/*,.pdf,.doc,.docx"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => document.getElementById('attachments')?.click()}
                                >
                                    <Paperclip className="h-4 w-4 mr-2" />
                                    Tambah Lampiran
                                </Button>
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Maksimal 5 file (gambar, PDF, atau dokumen)
                        </p>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Mengirim...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4 mr-2" />
                                Kirim Feedback
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
