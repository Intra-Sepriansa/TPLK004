import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, BookOpen, CheckCircle2, Download, Eye, EyeOff, Filter, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import NotificationIcon from '@/assets/admin/notification-center/icon-notifikasi.png';
import StatTotalCourse from '@/assets/dosen/dashboard/stat-total-course.png';
import PublishedIcon from '@/assets/admin/informasi-tugas/publised.png';
import DraftIcon from '@/assets/admin/informasi-tugas/draft.png';
import SessionIcon from '@/assets/admin/sesi-absen/sesi-icon.png';
import CourseIcon from '@/assets/dosen/dashboard/course-icon.png';
import TotalNotificationIcon from '@/assets/admin/notification-center/total.png';

interface DigestItem {
  id: number;
  display_title: string;
  courses: {
    id: number;
    name: string;
    code: string;
    meeting_number: number;
    title: string | null;
  }[];
  week_number: number;
  semester: string;
  week_range: string;
  class_label: string;
  has_structured_task: boolean;
  forum_posts_required: number;
  mentari_course_url: string | null;
  mentari_course_id: string | null;
  is_published: boolean;
  published_at: string | null;
  updated_at: string | null;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PageProps {
  [key: string]: any;
  digests: {
    data: DigestItem[];
    total: number;
    links: PaginationLink[];
  };
  semesters: string[];
  weeks: number[];
  stats: {
    total: number;
    published: number;
    draft: number;
    current_week: number;
  };
  filters: {
    search: string;
    semester: string;
    status: 'all' | 'published' | 'draft';
    week: number | null;
  };
  constants: {
    class_label: string;
    platform_name: string;
    forum_posts_required: number;
  };
  flash?: {
    success?: string;
    error?: string;
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 220, damping: 18 },
  },
} as const;

const headerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 22 } },
} as const;

const statCards = [
  {
    key: 'total',
    title: 'Total Entry',
    field: 'total',
    imageSrc: StatTotalCourse,
    gradientBg: 'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10',
    glow: 'bg-sky-500',
  },
  {
    key: 'published',
    title: 'Published',
    field: 'published',
    imageSrc: PublishedIcon,
    gradientBg: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
    glow: 'bg-emerald-500',
  },
  {
    key: 'draft',
    title: 'Draft',
    field: 'draft',
    imageSrc: DraftIcon,
    gradientBg: 'from-slate-200/50 to-white/50 dark:from-slate-800/50 dark:to-neutral-900/50',
    glow: 'bg-slate-300',
  },
  {
    key: 'current_week',
    title: 'Pekan Aktif',
    field: 'current_week',
    imageSrc: SessionIcon,
    gradientBg: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
    glow: 'bg-emerald-500',
  },
] as const;

export default function WeeklyDigestIndex({ digests, semesters, weeks, stats, filters, constants }: PageProps) {
  const { flash, auth } = usePage<PageProps>().props;
  const user = auth?.user;
  const [search, setSearch] = useState(filters.search);
  const [semester, setSemester] = useState(filters.semester || 'all');
  const [status, setStatus] = useState(filters.status || 'all');
  const [week, setWeek] = useState(filters.week ? String(filters.week) : 'all');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null; title: string }>({
    open: false,
    id: null,
    title: '',
  });

  useEffect(() => {
    if (window.Echo && user) {
      const channel = window.Echo.private(`admin.exports.${user.id}`)
        .listen('BatchExportCompleted', (e: any) => {
          setIsExporting(false);
          setSelectedIds([]);
          const link = document.createElement('a');
          link.href = e.downloadUrl;
          link.download = e.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
      return () => {
        channel.stopListening('BatchExportCompleted');
      };
    }
  }, [user]);

  const toggleSelectAll = () => {
    if (selectedIds.length === digests.data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(digests.data.map((d) => d.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const handleBatchExport = () => {
    if (selectedIds.length === 0) return;
    setIsExporting(true);
    router.post('/admin/weekly-digest/batch-export', { digest_ids: selectedIds }, {
      preserveScroll: true,
      preserveState: true,
    });
  };

  const applyFilter = () => {
    router.get(
      '/admin/weekly-digest',
      {
        search,
        semester: semester === 'all' ? undefined : semester,
        status,
        week: week === 'all' ? undefined : week,
      },
      { preserveState: true, preserveScroll: true },
    );
  };

  return (
    <AppLayout>
      <Head title="Info Pekanan Mentari" />

      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 p-6">
        <motion.div variants={headerVariants} className="relative overflow-hidden rounded-3xl p-6 text-white shadow-2xl sm:p-8">
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
                onClick={() => router.get('/admin/notification-center')}
                whileHover={{ x: -4 }}
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Notification Center
              </motion.button>
            </div>

            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center sm:h-24 sm:w-24">
                  <img src={NotificationIcon} alt="Info Pekanan Mentari" className="h-full w-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.45)]" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium tracking-wide text-indigo-100">Panel Ringkas Mentari</p>
                  <h1 className="mt-1 font-bold text-2xl sm:text-3xl leading-tight">Info Pekanan Mentari</h1>
                  <p className="mt-2 text-sm text-indigo-100/90 max-w-2xl">
                    Gabungkan entry menjadi rekap pekanan mahasiswa secara otomatis.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center sm:items-start lg:items-end gap-3 mt-4 sm:mt-0 w-full lg:w-auto">
                <div className="flex flex-wrap justify-center gap-2 sm:justify-start lg:justify-end">
                  <Badge className="border-white/20 bg-white/15 px-3 py-1.5 text-white backdrop-blur-md">Kelas {constants.class_label}</Badge>
                  <Badge className="border-white/20 bg-white/15 px-3 py-1.5 text-white backdrop-blur-md">{constants.platform_name}</Badge>
                  <Badge className="border-white/20 bg-white/15 px-3 py-1.5 text-white backdrop-blur-md">Forum {constants.forum_posts_required}x</Badge>
                  <Badge className="border-white/20 bg-white/15 px-3 py-1.5 text-white backdrop-blur-md">{digests.total} Entry</Badge>
                </div>

                <motion.button
                  type="button"
                  onClick={() => router.get('/admin/weekly-digest/create')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/20 px-5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-colors hover:bg-white/30"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Entry Pekanan
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4"
        >
          {statCards.map((card) => {
            const value = stats[card.field];

            return (
              <motion.div
                key={card.key}
                whileHover={{ y: -6, scale: 1.02, transition: { type: 'spring', stiffness: 320, damping: 22 } }}
                className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl transition-all dark:border-white/5 dark:bg-neutral-900/40 sm:rounded-3xl sm:p-6"
              >
                <div className={cn('absolute inset-0 bg-gradient-to-br opacity-70', card.gradientBg)} />
                <div className={cn('absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-15 blur-3xl transition-all group-hover:opacity-30', card.glow)} />
                <div className="relative z-10 flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="relative flex shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center transition-transform duration-300"
                  >
                    <img src={card.imageSrc} alt={card.title} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]" />
                  </motion.div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 sm:text-sm">{card.title}</p>
                    <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">{value}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {(flash?.success || flash?.error) && (
          <motion.div variants={itemVariants} className={cn(
            'rounded-3xl border p-4 shadow-lg backdrop-blur-xl',
            flash?.success
              ? 'border-emerald-200 bg-emerald-50/80 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/30 dark:text-emerald-300'
              : 'border-rose-200 bg-rose-50/80 text-rose-700 dark:border-rose-900/30 dark:bg-rose-950/30 dark:text-rose-300',
          )}>
            <div className="flex items-start gap-3">
              {flash?.success ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />}
              <div>
                <p className="font-semibold">{flash?.success ? 'Perubahan berhasil disimpan' : 'Terjadi kesalahan'}</p>
                <p className="text-sm opacity-90">{flash?.success || flash?.error}</p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/50 p-5 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/50">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
              <Filter className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Filter Entry</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pilah daftar matkul yang sudah masuk ke Mentari pada pekan aktif.</p>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_0.9fr_0.9fr_auto] lg:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari matkul atau judul..."
                className="h-11 rounded-2xl border-white/20 bg-white/80 pl-10 dark:border-white/10 dark:bg-neutral-800/80"
              />
            </div>
            <Select value={semester} onValueChange={setSemester}>
              <SelectTrigger className="h-11 rounded-2xl border-white/20 bg-white/80 dark:border-white/10 dark:bg-neutral-800/80"><SelectValue placeholder="Semester" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Semester</SelectItem>
                {semesters.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(value: 'all' | 'published' | 'draft') => setStatus(value)}>
              <SelectTrigger className="h-11 rounded-2xl border-white/20 bg-white/80 dark:border-white/10 dark:bg-neutral-800/80"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={week} onValueChange={setWeek}>
              <SelectTrigger className="h-11 rounded-2xl border-white/20 bg-white/80 dark:border-white/10 dark:bg-neutral-800/80"><SelectValue placeholder="Minggu" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Minggu</SelectItem>
                {weeks.map((item) => (
                  <SelectItem key={item} value={String(item)}>Minggu {item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={applyFilter}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 text-sm font-bold text-white shadow-lg"
            >
              <Filter className="h-4 w-4" />
              Filter
            </motion.button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4">
          {digests.data.length > 0 && (
            <motion.div variants={itemVariants} className="flex items-center justify-between rounded-2xl bg-white/50 p-4 shadow-md backdrop-blur-xl dark:bg-neutral-900/50">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedIds.length > 0 && selectedIds.length === digests.data.length}
                  onCheckedChange={toggleSelectAll}
                  className="h-5 w-5 rounded border-slate-300 dark:border-neutral-600"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-neutral-300">
                  {selectedIds.length} terpilih
                </span>
              </div>

              {selectedIds.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  type="button"
                  disabled={isExporting}
                  onClick={handleBatchExport}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white shadow hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-900 dark:hover:bg-neutral-200"
                >
                  {isExporting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-slate-900 dark:border-t-transparent" /> : <Download className="h-4 w-4" />}
                  {isExporting ? 'Memproses ZIP...' : 'Export Terpilih'}
                </motion.button>
              )}
            </motion.div>
          )}

          {digests.data.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-14 text-center shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/50">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-slate-400" />
              <p className="text-lg font-semibold text-slate-900 dark:text-white">Belum ada entry pekanan</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tambahkan matkul yang materinya sudah masuk pada pekan ini.</p>
            </div>
          ) : (
            digests.data.map((digest, index) => (
              <motion.div
                key={digest.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ y: -4, transition: { type: 'spring', stiffness: 280, damping: 20 } }}
                className={cn(
                  'group relative overflow-hidden rounded-3xl border p-5 shadow-xl backdrop-blur-xl transition-colors cursor-pointer hover:border-indigo-500/30',
                  digest.is_published
                    ? 'border-emerald-200 bg-emerald-50/90 dark:border-emerald-900/30 dark:bg-emerald-900/20'
                    : 'border-white/50 bg-white/95 dark:border-white/10 dark:bg-neutral-900/90'
                )}
                onClick={() => toggleSelect(digest.id)}
              >
                <div className="absolute right-5 top-5 z-20">
                  <Checkbox
                    checked={selectedIds.includes(digest.id)}
                    onCheckedChange={() => toggleSelect(digest.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-5 w-5 rounded border-slate-300 shadow-sm dark:border-neutral-600"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-40 dark:from-white/5" />
                <div className={cn(
                  'absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl transition-all',
                  digest.is_published ? 'bg-emerald-500/20 group-hover:bg-emerald-500/30' : 'bg-slate-500/15 group-hover:bg-slate-500/25',
                )} />

                <div className="relative z-10 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.08, rotate: 6 }}
                      className="relative flex h-14 w-14 shrink-0 items-center justify-center"
                    >
                      <img src={CourseIcon} alt="Course" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.35)]" />
                    </motion.div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{digest.display_title}</h3>
                          {digest.courses?.length === 1 && (
                            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                              Pertemuan {digest.courses[0].meeting_number}
                            </Badge>
                          )}
                          <Badge className={digest.is_published ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300'}>
                            {digest.is_published ? 'Published' : 'Draft'}
                          </Badge>
                        </div>

                        {digest.courses?.length > 1 && (
                          <div className="flex flex-wrap gap-2">
                            {digest.courses.map(course => (
                              <Badge key={course.id} className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                {course.name} (P{course.meeting_number})
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Minggu {digest.week_number} • {digest.semester} • {digest.class_label}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge className={digest.has_structured_task ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300'}>
                          {digest.has_structured_task ? 'Ada Tugas Terstruktur' : 'Tanpa Tugas Terstruktur'}
                        </Badge>
                        <Badge className="bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                          Forum {digest.forum_posts_required}x untuk kehadiran
                        </Badge>
                      </div>

                      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                        Periode {digest.week_range}
                        {digest.published_at ? ` • Published ${digest.published_at}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 xl:w-auto">
                    <Button type="button" variant="outline" className="rounded-2xl border-white/20 bg-white/70 dark:border-white/10 dark:bg-neutral-900/60" onClick={() => router.get(`/admin/weekly-digest/${digest.id}`)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Detail
                    </Button>
                    <Button type="button" variant="outline" className="rounded-2xl border-white/20 bg-white/70 dark:border-white/10 dark:bg-neutral-900/60" onClick={() => router.get(`/admin/weekly-digest/${digest.id}/edit`)}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      className={cn(
                        'rounded-2xl text-white shadow-lg',
                        digest.is_published ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600',
                      )}
                      onClick={() => router.patch(`/admin/weekly-digest/${digest.id}/publish`, {}, { preserveScroll: true })}
                    >
                      {digest.is_published ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                      {digest.is_published ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button
                      type="button"
                      className="rounded-2xl bg-rose-500 text-white shadow-lg hover:bg-rose-600"
                      onClick={() => setDeleteDialog({ open: true, id: digest.id, title: digest.display_title })}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hapus
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-2">
          {digests.links.map((link) => (
            <button
              key={`${link.label}-${link.url}`}
              type="button"
              disabled={!link.url}
              onClick={() => link.url && router.visit(link.url, { preserveScroll: true, preserveState: true })}
              className={cn(
                'rounded-2xl border px-4 py-2 text-sm font-semibold transition-colors',
                link.active
                  ? 'border-indigo-500 bg-indigo-500 text-white shadow-lg'
                  : 'border-white/20 bg-white/70 text-slate-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-neutral-900/60 dark:text-neutral-200',
              )}
              dangerouslySetInnerHTML={{
                __html: link.label.includes('pagination.previous')
                  ? '&laquo; Sebelumnya'
                  : link.label.includes('pagination.next')
                    ? 'Selanjutnya &raquo;'
                    : link.label
              }}
            />
          ))}
        </motion.div>

        <ConfirmDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog((current) => ({ ...current, open }))}
          onConfirm={() => {
            if (deleteDialog.id) {
              router.delete(`/admin/weekly-digest/${deleteDialog.id}`, {
                preserveScroll: true,
                onSuccess: () => setDeleteDialog({ open: false, id: null, title: '' }),
              });
            }
          }}
          title="Hapus Entry Pekanan"
          message={`Yakin ingin menghapus entry "${deleteDialog.title}"?`}
          variant="danger"
          confirmText="Ya, Hapus"
          cancelText="Batal"
        />
      </motion.div>
    </AppLayout>
  );
}
