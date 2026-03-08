import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Download, Eye, EyeOff, Globe, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import NotificationIcon from '@/assets/admin/notification-center/icon-notifikasi.png';
import SessionIcon from '@/assets/admin/sesi-absen/sesi-icon.png';
import PublishedIcon from '@/assets/admin/informasi-tugas/publised.png';
import DraftIcon from '@/assets/admin/informasi-tugas/draft.png';
import TaskInfoIcon from '@/assets/admin/informasi-tugas/informasi-tugas.png';
import RekapIcon from '@/assets/admin/rekap-kehadiran/rekapan.png';
import SettingsIcon from '@/assets/admin/pengaturan/pengaturan.png';
import StatSessionsIcon from '@/assets/dosen/dashboard/stat-total-sessions.png';

interface DigestDetail {
  id: number;
  mata_kuliah_id: number;
  course_name: string | null;
  course_code: string | null;
  dosen_name: string | null;
  class_label: string;
  week_number: number;
  semester: string;
  week_range: string;
  meeting_number: number;
  title: string | null;
  display_title: string;
  has_structured_task: boolean;
  forum_posts_required: number;
  mentari_course_url: string | null;
  mentari_course_id: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  creator: string | null;
}

interface Props {
  digest: DigestDetail;
  constants: {
    class_label: string;
    platform_name: string;
    forum_posts_required: number;
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 220, damping: 18 },
  },
} as const;

const statCards = [
  {
    key: 'meeting',
    title: 'Pertemuan',
    value: (digest: DigestDetail) => `P${digest.meeting_number}`,
    imageSrc: () => SessionIcon,
    gradientBg: 'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10',
    glow: 'bg-sky-500',
  },
  {
    key: 'status',
    title: 'Status',
    value: (digest: DigestDetail) => (digest.is_published ? 'Published' : 'Draft'),
    imageSrc: (digest: DigestDetail) => (digest.is_published ? PublishedIcon : DraftIcon),
    gradientBg: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
    glow: 'bg-emerald-500',
  },
  {
    key: 'task',
    title: 'Tugas',
    value: (digest: DigestDetail) => (digest.has_structured_task ? 'Terstruktur' : 'Tidak Ada'),
    imageSrc: () => TaskInfoIcon,
    gradientBg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10',
    glow: 'bg-amber-500',
  },
  {
    key: 'forum',
    title: 'Forum Kehadiran',
    value: (digest: DigestDetail) => `${digest.forum_posts_required}x`,
    imageSrc: () => RekapIcon,
    gradientBg: 'from-violet-500/5 to-pink-500/5 dark:from-violet-500/10 dark:to-pink-500/10',
    glow: 'bg-violet-500',
  },
] as const;

export default function WeeklyDigestShow({ digest, constants }: Props) {
  const [deleteDialog, setDeleteDialog] = useState(false);

  return (
    <AppLayout>
      <Head title={`Info Pekanan Mentari: ${digest.course_name || digest.display_title}`} />

      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 p-6">
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl p-6 text-white shadow-2xl sm:p-8">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
            animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            style={{ backgroundSize: '200% 200%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative space-y-6">
            <div className="flex justify-start">
              <motion.button
                type="button"
                onClick={() => router.get('/admin/weekly-digest')}
                whileHover={{ x: -4 }}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/15 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/25"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Daftar
              </motion.button>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
              <div className="flex flex-col gap-5 rounded-[28px] border border-white/15 bg-white/10 p-5 shadow-xl backdrop-blur-md sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center self-center rounded-3xl border border-white/15 bg-white/10 p-3 sm:h-24 sm:w-24 sm:self-start">
                    <img src={NotificationIcon} alt="Detail Info Pekanan" className="h-full w-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.45)]" />
                  </div>

                  <div className="min-w-0 text-center sm:text-left">
                    <p className="text-sm font-medium tracking-wide text-indigo-100">Detail Entry Mentari</p>
                    <h1 className="mt-2 font-display text-3xl leading-tight md:text-5xl">{digest.course_name || 'Info Pekanan Mentari'}.</h1>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-indigo-100/90 sm:text-base">
                      {digest.display_title}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Badge className="border-white/20 bg-white/15 px-3 py-1.5 text-white backdrop-blur-md">Pertemuan {digest.meeting_number}</Badge>
                  <Badge className="border-white/20 bg-white/15 px-3 py-1.5 text-white backdrop-blur-md">Pekan {digest.week_range}</Badge>
                  <Badge className="border-white/20 bg-white/15 px-3 py-1.5 text-white backdrop-blur-md">{digest.semester}</Badge>
                  <Badge className="border-white/20 bg-white/15 px-3 py-1.5 text-white backdrop-blur-md">Kelas {constants.class_label}</Badge>
                  <Badge className="border-white/20 bg-white/15 px-3 py-1.5 text-white backdrop-blur-md">{constants.platform_name}</Badge>
                  <Badge className={cn('px-3 py-1.5 text-white backdrop-blur-md', digest.is_published ? 'border-emerald-300/20 bg-emerald-500/30' : 'border-white/20 bg-white/15')}>
                    {digest.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/15 bg-white/10 p-4 shadow-xl backdrop-blur-md sm:p-5">
                <p className="text-sm font-semibold text-white/90">Aksi Cepat</p>
                <p className="mt-1 text-xs leading-6 text-indigo-100/80">Semua aksi penting dikelompokkan di sini supaya tetap rapi pada desktop maupun mobile.</p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <Button type="button" onClick={() => router.get(`/admin/weekly-digest/${digest.id}/edit`)} className="h-11 rounded-2xl bg-white/20 text-white backdrop-blur-md hover:bg-white/30">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Edit Entry
                  </Button>
                  <Button type="button" onClick={() => router.patch(`/admin/weekly-digest/${digest.id}/publish`, {}, { preserveScroll: true })} className={cn('h-11 rounded-2xl text-white shadow-lg', digest.is_published ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600')}>
                    {digest.is_published ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                    {digest.is_published ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button type="button" onClick={() => window.open(`/admin/weekly-digest/${digest.id}/export-pdf`, '_blank', 'noopener,noreferrer')} className="h-11 rounded-2xl bg-white/20 text-white backdrop-blur-md hover:bg-white/30">
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                  </Button>
                  <Button type="button" onClick={() => setDeleteDialog(true)} className="h-11 rounded-2xl bg-rose-500 text-white shadow-lg hover:bg-rose-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus Entry
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {statCards.map((card) => {
            const imageSrc = card.imageSrc(digest);

            return (
              <motion.div
                key={card.key}
                whileHover={{ y: -6, scale: 1.02, transition: { type: 'spring', stiffness: 320, damping: 22 } }}
                className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl transition-all dark:border-white/5 dark:bg-neutral-900/40 sm:rounded-3xl sm:p-6"
              >
                <div className={cn('absolute inset-0 bg-gradient-to-br opacity-70', card.gradientBg)} />
                <div className={cn('absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-15 blur-3xl transition-all group-hover:opacity-30', card.glow)} />
                <div className="relative z-10 flex items-center gap-4">
                  <motion.div whileHover={{ scale: 1.08, rotate: 8 }} className="relative flex h-12 w-12 shrink-0 items-center justify-center sm:h-14 sm:w-14">
                    <img src={imageSrc} alt={card.title} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.35)]" />
                  </motion.div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 sm:text-sm">{card.title}</p>
                    <p className="mt-1 text-lg font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-2xl">{card.value(digest)}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/50">
              <div className="mb-5 flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center">
                  <img src={SettingsIcon} alt="Informasi Entry" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.35)]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Informasi Entry</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Rincian sistematis dengan container yang sama seperti panel dashboard.</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <InfoRow label="Mata Kuliah" value={digest.course_name || '-'} />
                <InfoRow label="Dosen" value={digest.dosen_name || '-'} />
                <InfoRow label="Label Kelas" value={constants.class_label} />
                <InfoRow label="Platform" value={constants.platform_name} />
                <InfoRow label="Portal" value="mentari.unpam.ac.id" />
                <InfoRow label="Pertemuan" value={`Pertemuan ${digest.meeting_number}`} />
                <InfoRow label="Pekan Aktif" value={`${digest.week_range} • ${digest.semester}`} />
                <InfoRow label="Status" value={digest.is_published ? 'Published' : 'Draft'} />
                <InfoRow label="Updated At" value={digest.updated_at || '-'} />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-6">
            <div className="rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/50">
              <div className="mb-5 flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center">
                  <img src={StatSessionsIcon} alt="Preview Mahasiswa" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.35)]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Preview Mahasiswa</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Gaya penyajian dibuat lebih padat, tegas, dan satu bahasa dengan dashboard dosen.</p>
                </div>
              </div>

              <div className="space-y-4 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-5 text-white shadow-2xl">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200/80">Info Pekanan</p>
                  <p className="mt-2 text-2xl font-bold">{digest.course_name || 'Mata Kuliah'}</p>
                  <p className="mt-1 text-sm text-slate-300">{digest.display_title}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className="border-white/10 bg-white/10 text-white">Pertemuan {digest.meeting_number}</Badge>
                  <Badge className="border-white/10 bg-white/10 text-white">{constants.class_label}</Badge>
                  <Badge className={cn('border-white/10 text-white', digest.has_structured_task ? 'bg-amber-500/80' : 'bg-slate-500/60')}>
                    {digest.has_structured_task ? 'Ada Tugas Terstruktur' : 'Tanpa Tugas Terstruktur'}
                  </Badge>
                </div>

                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                  <p className="text-sm font-semibold text-cyan-100">Materi sudah masuk di {constants.platform_name}</p>
                  <p className="mt-2 text-sm leading-7 text-cyan-50/90">
                    Mahasiswa wajib submit forum diskusi {digest.forum_posts_required}x untuk mendapatkan kehadiran.
                  </p>
                </div>

                {digest.mentari_course_url && (
                  <a href={digest.mentari_course_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-colors hover:bg-white/25">
                    <Globe className="h-4 w-4" />
                    Buka Portal Mentari
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <ConfirmDialog
          open={deleteDialog}
          onOpenChange={setDeleteDialog}
          onConfirm={() => router.delete(`/admin/weekly-digest/${digest.id}`)}
          title="Hapus Entry Pekanan"
          message={`Yakin ingin menghapus entry ${digest.course_name || digest.display_title}?`}
          variant="danger"
          confirmText="Ya, Hapus"
          cancelText="Batal"
        />
      </motion.div>
    </AppLayout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/80 p-4 dark:border-white/10 dark:bg-neutral-950/30">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 break-words font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
