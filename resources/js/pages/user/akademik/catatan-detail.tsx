import AkademikIcon from '@/assets/mahasiswa/akademik/akademik.png';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import StudentLayout from '@/layouts/student-layout';
import { cn } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    BookOpen,
    Building2,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Clock3,
    Download,
    Edit3,
    ExternalLink,
    FileText,
    Hash,
    Link2,
    Monitor,
    Share2,
    Sparkles,
    Tag,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface RelatedNote {
    id: number;
    title: string;
    meeting_number: number;
    updated_at: string;
}

interface NoteDetail {
    id: number;
    title: string;
    content: string;
    meeting_number: number;
    course_id: number;
    course_name: string;
    course_mode: 'online' | 'offline';
    total_meetings: number;
    sks: number | null;
    tags: string[];
    links: string[];
    created_at: string;
    updated_at: string;
    word_count: number;
    reading_time: number;
    ai_summary: string | null;
    ai_keywords: string[];
}

interface TocItem {
    id: string;
    level: number;
    text: string;
}

interface Props {
    note: NoteDetail;
    relatedNotes: RelatedNote[];
}

const headingClassMap: Record<number, string> = {
    1: 'pl-0 text-neutral-700 dark:text-neutral-200',
    2: 'pl-3 text-neutral-600 dark:text-neutral-300',
    3: 'pl-6 text-neutral-500 dark:text-neutral-400',
};

export default function CatatanDetail({ note, relatedNotes }: Props) {
    const [readingProgress, setReadingProgress] = useState(0);

    const { contentWithAnchors, tocItems } = useMemo(() => {
        if (typeof window === 'undefined') {
            return {
                contentWithAnchors: note.content,
                tocItems: [] as TocItem[],
            };
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(note.content || '', 'text/html');
        const headings = Array.from(doc.querySelectorAll('h1, h2, h3'));

        const toc: TocItem[] = headings.map((heading, index) => {
            const level = Number(heading.tagName.replace('H', ''));
            const fallbackText = `Bagian ${index + 1}`;
            const text = (heading.textContent || '').trim() || fallbackText;
            const id = `bagian-${index + 1}-${text
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')}`;

            heading.setAttribute('id', id);

            return { id, level, text };
        });

        return {
            contentWithAnchors: doc.body.innerHTML,
            tocItems: toc,
        };
    }, [note.content]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight =
                document.documentElement.scrollHeight - window.innerHeight;
            const progress =
                docHeight > 0
                    ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100))
                    : 0;
            setReadingProgress(progress);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
        } catch {
            // no-op
        }
    };

    return (
        <StudentLayout>
            <Head title={`Catatan: ${note.title}`} />

            <div className="p-4 md:p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="sticky top-0 z-40 h-1.5 w-full overflow-hidden rounded-full bg-white/40 dark:bg-neutral-900/40"
                    >
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500"
                            animate={{ width: `${readingProgress}%` }}
                            transition={{
                                type: 'spring',
                                stiffness: 140,
                                damping: 26,
                            }}
                        />
                    </motion.div>

                    <motion.section
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden rounded-3xl border border-white/20 p-6 shadow-2xl sm:p-8"
                    >
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                            animate={{
                                backgroundPosition: [
                                    '0% 0%',
                                    '100% 100%',
                                    '0% 0%',
                                ],
                            }}
                            transition={{
                                duration: 14,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                            style={{ backgroundSize: '200% 200%' }}
                        />
                        <div className="absolute -top-14 -right-14 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
                        <div className="absolute bottom-0 -left-16 h-44 w-44 rounded-full bg-fuchsia-300/20 blur-3xl" />

                        <div className="relative z-10 text-white">
                            <Link
                                href="/user/akademik/catatan"
                                className="mb-5 inline-flex items-center gap-2 text-sm text-indigo-100 transition hover:text-white"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Kembali ke Daftar Catatan
                            </Link>

                            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <motion.img
                                            src={AkademikIcon}
                                            alt="Catatan Akademik"
                                            className="h-16 w-16 object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.45)] sm:h-20 sm:w-20"
                                            whileHover={{
                                                scale: 1.05,
                                                rotate: 3,
                                            }}
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-indigo-100">
                                                Detail Catatan Akademik
                                            </p>
                                            <h1 className="text-2xl font-extrabold sm:text-4xl">
                                                {note.title}
                                            </h1>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <Badge className="border-white/30 bg-white/15 text-white">
                                            <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                                            {note.course_name}
                                        </Badge>
                                        <Badge className="border-white/30 bg-white/15 text-white">
                                            <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                                            Pertemuan {note.meeting_number}/
                                            {note.total_meetings}
                                        </Badge>
                                        <Badge className="border-white/30 bg-white/15 text-white">
                                            {note.course_mode === 'offline' ? (
                                                <Building2 className="mr-1.5 h-3.5 w-3.5" />
                                            ) : (
                                                <Monitor className="mr-1.5 h-3.5 w-3.5" />
                                            )}
                                            {note.course_mode === 'offline'
                                                ? 'Offline'
                                                : 'Online'}
                                        </Badge>
                                        {note.sks ? (
                                            <Badge className="border-white/30 bg-white/15 text-white">
                                                {note.sks} SKS
                                            </Badge>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            router.visit(
                                                `/user/akademik/catatan/${note.id}/edit`,
                                            )
                                        }
                                        className="h-11 rounded-xl border border-white/30 bg-white/15 text-white backdrop-blur-xl hover:bg-white/25"
                                    >
                                        <Edit3 className="mr-2 h-4 w-4" />
                                        Edit Catatan
                                    </Button>

                                    <a
                                        href={`/user/akademik/catatan/${note.id}/export-pdf`}
                                    >
                                        <Button
                                            type="button"
                                            className="h-11 w-full rounded-xl border border-white/30 bg-white/15 text-white backdrop-blur-xl hover:bg-white/25"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export PDF
                                        </Button>
                                    </a>

                                    <Button
                                        type="button"
                                        onClick={handleCopyLink}
                                        className="h-11 rounded-xl border border-white/30 bg-white/15 text-white backdrop-blur-xl hover:bg-white/25"
                                    >
                                        <Share2 className="mr-2 h-4 w-4" />
                                        Salin Link
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {[
                            {
                                label: 'Jumlah Kata',
                                value: note.word_count,
                                icon: FileText,
                                color: 'text-sky-500',
                            },
                            {
                                label: 'Estimasi Baca',
                                value: `${note.reading_time} menit`,
                                icon: Clock3,
                                color: 'text-violet-500',
                            },
                            {
                                label: 'Referensi Link',
                                value: note.links.length,
                                icon: Link2,
                                color: 'text-emerald-500',
                            },
                            {
                                label: 'Tag Topik',
                                value: note.tags.length,
                                icon: Tag,
                                color: 'text-amber-500',
                            },
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                                whileHover={{ scale: 1.02, y: -4 }}
                                className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                            {stat.label}
                                        </p>
                                        <p className="mt-1 text-xl font-bold text-neutral-900 dark:text-white">
                                            {stat.value}
                                        </p>
                                    </div>
                                    <stat.icon
                                        className={cn('h-5 w-5', stat.color)}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </section>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                        <motion.section
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-3xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl sm:p-7 xl:col-span-8 dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <div className="mb-5 flex items-center justify-between gap-3 border-b border-neutral-200/70 pb-4 dark:border-neutral-700/70">
                                <div>
                                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                                        Isi Catatan
                                    </h2>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        Dibuat {note.created_at} · Diperbarui{' '}
                                        {note.updated_at}
                                    </p>
                                </div>
                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                    Tersimpan
                                </Badge>
                            </div>

                            <article
                                className="prose prose-neutral dark:prose-invert prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-pre:rounded-xl max-w-none leading-relaxed"
                                dangerouslySetInnerHTML={{
                                    __html: contentWithAnchors,
                                }}
                            />
                        </motion.section>

                        <div className="space-y-6 xl:col-span-4">
                            <motion.aside
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.06 }}
                                className="rounded-3xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                            >
                                <h3 className="mb-3 text-sm font-bold tracking-wide text-neutral-600 uppercase dark:text-neutral-300">
                                    Navigasi Konten
                                </h3>
                                {tocItems.length > 0 ? (
                                    <div className="space-y-1.5">
                                        {tocItems.map((item) => (
                                            <a
                                                key={item.id}
                                                href={`#${item.id}`}
                                                className={cn(
                                                    'block rounded-lg px-2.5 py-2 text-xs font-medium transition hover:bg-neutral-100 dark:hover:bg-neutral-800',
                                                    headingClassMap[
                                                        item.level
                                                    ] ?? headingClassMap[3],
                                                )}
                                            >
                                                {item.text}
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        Belum ada heading terstruktur pada
                                        konten ini.
                                    </p>
                                )}
                            </motion.aside>

                            <motion.aside
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="rounded-3xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                            >
                                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-wide text-neutral-600 uppercase dark:text-neutral-300">
                                    <Sparkles className="h-4 w-4 text-violet-500" />
                                    Insight AI
                                </h3>
                                {note.ai_summary ? (
                                    <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                                        {note.ai_summary}
                                    </p>
                                ) : (
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        Ringkasan AI belum tersedia untuk
                                        catatan ini.
                                    </p>
                                )}

                                {note.ai_keywords?.length ? (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {note.ai_keywords.map((keyword) => (
                                            <Badge
                                                key={keyword}
                                                className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                                            >
                                                <Hash className="mr-1 h-3 w-3" />
                                                {keyword}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : null}
                            </motion.aside>

                            {note.tags?.length ? (
                                <motion.aside
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.14 }}
                                    className="rounded-3xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                                >
                                    <h3 className="mb-3 text-sm font-bold tracking-wide text-neutral-600 uppercase dark:text-neutral-300">
                                        Tag Topik
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {note.tags.map((tag) => (
                                            <Badge
                                                key={tag}
                                                className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                            >
                                                <Tag className="mr-1 h-3 w-3" />
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </motion.aside>
                            ) : null}

                            {note.links?.length ? (
                                <motion.aside
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.18 }}
                                    className="rounded-3xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                                >
                                    <h3 className="mb-3 text-sm font-bold tracking-wide text-neutral-600 uppercase dark:text-neutral-300">
                                        Referensi Link
                                    </h3>
                                    <div className="space-y-2">
                                        {note.links.map((link, index) => (
                                            <a
                                                key={`${link}-${index}`}
                                                href={link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 rounded-xl border border-neutral-200/70 px-3 py-2 text-xs font-medium text-blue-600 transition hover:bg-blue-50 dark:border-neutral-700 dark:text-blue-300 dark:hover:bg-blue-900/20"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                                                <span className="truncate">
                                                    {link}
                                                </span>
                                            </a>
                                        ))}
                                    </div>
                                </motion.aside>
                            ) : null}
                        </div>
                    </div>

                    {relatedNotes.length > 0 ? (
                        <motion.section
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-3xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                                    Catatan Terkait
                                </h3>
                                <Link
                                    href="/user/akademik/catatan"
                                    className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-300"
                                >
                                    Lihat Semua
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {relatedNotes.map((related) => (
                                    <button
                                        type="button"
                                        key={related.id}
                                        onClick={() =>
                                            router.visit(
                                                `/user/akademik/catatan/${related.id}`,
                                            )
                                        }
                                        className="group rounded-2xl border border-white/20 bg-white/40 p-4 text-left shadow-md backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-indigo-300 dark:border-white/5 dark:bg-neutral-900/40"
                                    >
                                        <p className="line-clamp-2 text-sm font-semibold text-neutral-900 dark:text-white">
                                            {related.title}
                                        </p>
                                        <div className="mt-3 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                                            <span>
                                                Pertemuan{' '}
                                                {related.meeting_number}
                                            </span>
                                            <span className="inline-flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-300">
                                                Detail
                                                <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.section>
                    ) : null}
                </div>
            </div>
        </StudentLayout>
    );
}
