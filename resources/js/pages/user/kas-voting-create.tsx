import VotingKasIcon from '@/assets/admin/voting-kas/voting.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import StudentLayout from '@/layouts/student-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    ArrowLeft,
    ClipboardList,
    Clock,
    Heart,
    Package,
    PartyPopper,
    Plus,
    Sparkles,
    UtensilsCrossed,
    type LucideIcon,
} from 'lucide-react';
import type { FormEvent } from 'react';

interface Props {
    mahasiswa: { id: number; nama: string; nim: string };
    stats: {
        open: number;
        approved: number;
        rejected: number;
    };
    defaults: {
        min_votes: number;
        approval_threshold: number;
        voting_duration_days: number;
    };
}

const categories: Array<{
    value: 'kegiatan' | 'perlengkapan' | 'konsumsi' | 'donasi' | 'lainnya';
    label: string;
    icon: LucideIcon;
    color: string;
}> = [
    {
        value: 'kegiatan',
        label: 'Kegiatan Kelas',
        icon: PartyPopper,
        color: 'bg-purple-100 text-purple-700',
    },
    {
        value: 'perlengkapan',
        label: 'Perlengkapan',
        icon: Package,
        color: 'bg-blue-100 text-blue-700',
    },
    {
        value: 'konsumsi',
        label: 'Konsumsi',
        icon: UtensilsCrossed,
        color: 'bg-orange-100 text-orange-700',
    },
    {
        value: 'donasi',
        label: 'Donasi/Sosial',
        icon: Heart,
        color: 'bg-pink-100 text-pink-700',
    },
    {
        value: 'lainnya',
        label: 'Lainnya',
        icon: ClipboardList,
        color: 'bg-neutral-100 text-neutral-700',
    },
];

const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);

export default function KasVotingCreate({ mahasiswa, stats, defaults }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        amount: '',
        category: 'kegiatan',
    });

    const selectedCategory =
        categories.find((c) => c.value === data.category) ?? categories[0];
    const amountNumber = Number.parseFloat(data.amount || '0');
    const totalVotings = stats.open + stats.approved + stats.rejected;

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        post('/user/kas-voting');
    };

    return (
        <StudentLayout>
            <Head title="Usulkan Pengeluaran Kas" />

            <div className="space-y-6 p-4 md:space-y-8 md:p-6 lg:p-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.6,
                        type: 'spring',
                        stiffness: 100,
                    }}
                    className="relative overflow-hidden rounded-3xl p-5 text-white shadow-2xl sm:p-6 md:p-8"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.02, x: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.visit('/user/kas-voting')}
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Daftar Voting
                        </motion.button>

                        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
                            <motion.div
                                className="relative flex h-20 w-20 shrink-0 sm:h-24 sm:w-24"
                                initial={{
                                    opacity: 0,
                                    scale: 0.5,
                                    rotate: -10,
                                }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 300,
                                    delay: 0.2,
                                }}
                                whileHover={{ scale: 1.05, rotate: 5 }}
                            >
                                <img
                                    src={VotingKasIcon}
                                    alt="Usulkan Pengeluaran"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                />
                            </motion.div>
                            <div className="mt-1 flex-1">
                                <p className="text-sm font-medium tracking-wide text-indigo-100">
                                    Keuangan Kelas
                                </p>
                                <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                                    Usulkan Pengeluaran Kas
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-indigo-100 sm:text-base">
                                    Buat usulan pengeluaran kas dengan detail
                                    yang jelas agar seluruh anggota kelas bisa
                                    menilai dan voting secara adil.
                                </p>
                                <p className="mt-2 text-xs text-indigo-100/90 sm:text-sm">
                                    {mahasiswa.nama} ({mahasiswa.nim})
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-6 xl:col-span-2 dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                                <Plus className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Form Usulan
                                </h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Lengkapi data berikut untuk membuat voting
                                    pengeluaran baru
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                    Judul Usulan
                                </Label>
                                <Input
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    placeholder="Contoh: Pembelian spidol whiteboard"
                                    className="h-12 rounded-xl border border-white/20 bg-white/60 text-base text-neutral-900 focus:border-indigo-400 dark:border-white/10 dark:bg-neutral-900/60 dark:text-white"
                                />
                                {errors.title && (
                                    <p className="flex items-center gap-1 text-xs text-red-500">
                                        <AlertCircle className="h-3.5 w-3.5" />{' '}
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                    Deskripsi
                                </Label>
                                <Textarea
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder="Jelaskan kebutuhan, alasan, dan manfaat pengeluaran ini..."
                                    rows={5}
                                    className="resize-none rounded-xl border border-white/20 bg-white/60 text-neutral-900 focus:border-indigo-400 dark:border-white/10 dark:bg-neutral-900/60 dark:text-white"
                                />
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-neutral-400">
                                        Maksimal 1000 karakter
                                    </span>
                                    <span className="text-xs text-neutral-400">
                                        {data.description.length}/1000
                                    </span>
                                </div>
                                {errors.description && (
                                    <p className="flex items-center gap-1 text-xs text-red-500">
                                        <AlertCircle className="h-3.5 w-3.5" />{' '}
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                        Nominal (Rp)
                                    </Label>
                                    <Input
                                        type="number"
                                        value={data.amount}
                                        onChange={(e) =>
                                            setData('amount', e.target.value)
                                        }
                                        placeholder="50000"
                                        className="h-12 rounded-xl border border-white/20 bg-white/60 text-base text-neutral-900 focus:border-indigo-400 dark:border-white/10 dark:bg-neutral-900/60 dark:text-white"
                                    />
                                    {errors.amount && (
                                        <p className="flex items-center gap-1 text-xs text-red-500">
                                            <AlertCircle className="h-3.5 w-3.5" />{' '}
                                            {errors.amount}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                        Kategori
                                    </Label>
                                    <Select
                                        value={data.category}
                                        onValueChange={(value) =>
                                            setData('category', value)
                                        }
                                    >
                                        <SelectTrigger className="h-12 rounded-xl border border-white/20 bg-white/60 text-neutral-900 focus:border-indigo-400 dark:border-white/10 dark:bg-neutral-900/60 dark:text-white">
                                            <SelectValue placeholder="Pilih kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => {
                                                const CategoryIcon =
                                                    category.icon;
                                                return (
                                                    <SelectItem
                                                        key={category.value}
                                                        value={category.value}
                                                    >
                                                        <span className="inline-flex items-center gap-2">
                                                            <CategoryIcon className="h-4 w-4" />
                                                            {category.label}
                                                        </span>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/20 bg-white/50 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-800/50">
                                <p className="mb-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                                    Catatan Penting
                                </p>
                                <ul className="space-y-1 text-xs text-neutral-600 dark:text-neutral-300">
                                    <li>
                                        • Voting aktif selama{' '}
                                        {defaults.voting_duration_days} hari
                                        setelah usulan dibuat.
                                    </li>
                                    <li>
                                        • Minimal {defaults.min_votes} vote
                                        untuk hasil dianggap valid.
                                    </li>
                                    <li>
                                        • Ambang persetujuan minimal{' '}
                                        {defaults.approval_threshold}%.
                                    </li>
                                </ul>
                            </div>

                            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        router.visit('/user/kas-voting')
                                    }
                                    className="h-12 w-full rounded-xl border border-white/20 bg-white/60 text-neutral-700 hover:bg-white/80 dark:border-white/10 dark:bg-neutral-800/60 dark:text-neutral-200 dark:hover:bg-neutral-800"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="h-12 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-700"
                                >
                                    {processing
                                        ? 'Menyimpan...'
                                        : 'Kirim Usulan'}
                                </Button>
                            </div>
                        </form>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Live Preview
                                </h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Ringkasan usulan Anda
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-2xl border border-white/20 bg-white/50 p-4 dark:border-white/10 dark:bg-neutral-800/50">
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Judul
                                </p>
                                <p className="mt-1 line-clamp-2 text-sm font-semibold text-neutral-900 dark:text-white">
                                    {data.title || 'Belum diisi'}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/20 bg-white/50 p-4 dark:border-white/10 dark:bg-neutral-800/50">
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Kategori
                                </p>
                                <p className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-white">
                                    <selectedCategory.icon className="h-4 w-4" />
                                    {selectedCategory.label}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/20 bg-white/50 p-4 dark:border-white/10 dark:bg-neutral-800/50">
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Nominal
                                </p>
                                <p className="mt-1 bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-xl font-bold text-transparent">
                                    {formatCurrency(
                                        Number.isNaN(amountNumber)
                                            ? 0
                                            : amountNumber,
                                    )}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/20 bg-white/50 p-4 dark:border-white/10 dark:bg-neutral-800/50">
                                <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
                                    Statistik Voting Saat Ini
                                </p>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div>
                                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                            {stats.open}
                                        </p>
                                        <p className="text-[10px] text-neutral-500">
                                            Aktif
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                            {stats.approved}
                                        </p>
                                        <p className="text-[10px] text-neutral-500">
                                            Setuju
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-red-600 dark:text-red-400">
                                            {stats.rejected}
                                        </p>
                                        <p className="text-[10px] text-neutral-500">
                                            Tolak
                                        </p>
                                    </div>
                                </div>
                                <p className="mt-2 text-[10px] text-neutral-500">
                                    Total usulan: {totalVotings}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/20 bg-white/50 p-4 dark:border-white/10 dark:bg-neutral-800/50">
                                <p className="mb-1 inline-flex items-center gap-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                    <Clock className="h-3.5 w-3.5" /> Deadline
                                    Otomatis
                                </p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Voting otomatis dibuka{' '}
                                    {defaults.voting_duration_days} hari dan
                                    ditutup oleh sistem saat waktunya habis.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </StudentLayout>
    );
}
