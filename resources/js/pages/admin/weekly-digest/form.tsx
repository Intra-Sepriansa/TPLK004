import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, CheckCircle2, Save, Type } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import DashboardIcon from '@/assets/dosen/dashboard/dashboard-icon.png';
import CourseIcon from '@/assets/dosen/dashboard/course-icon.png';
import SettingsIcon from '@/assets/admin/pengaturan/pengaturan.png';
import TaskInfoIcon from '@/assets/admin/informasi-tugas/informasi-tugas.png';
import SessionStatIcon from '@/assets/dosen/dashboard/stat-total-sessions.png';

interface CourseOption {
  id: number;
  nama: string;
  kode: string | null;
  kelas: string | null;
}

interface DigestPayload {
  id?: number;
  mata_kuliah_id: number;
  title: string | null;
  week_number: number;
  semester: string;
  meeting_number: number;
  has_structured_task: boolean;
  forum_posts_required: number;
  mentari_course_url: string | null;
  mentari_course_id: string | null;
  is_published: boolean;
}

interface Props {
  mode: 'create' | 'edit';
  digest: DigestPayload | null;
  courses: CourseOption[];
  constants: {
    class_label: string;
    platform_name: string;
    platform_url: string;
    forum_posts_required: number;
  };
}

interface FormShape {
  mata_kuliah_id: string;
  title: string;
  meeting_number: number;
  has_structured_task: boolean;
  is_published: boolean;
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

export default function WeeklyDigestForm({ mode, digest, courses, constants }: Props) {
  const isEdit = mode === 'edit';

  const form = useForm<FormShape>({
    mata_kuliah_id: digest?.mata_kuliah_id ? String(digest.mata_kuliah_id) : '',
    title: digest?.title ?? '',
    meeting_number: digest?.meeting_number ?? 1,
    has_structured_task: digest?.has_structured_task ?? false,
    is_published: digest?.is_published ?? false,
  });

  const selectedCourse = courses.find((course) => String(course.id) === form.data.mata_kuliah_id);
  const displayTitle = form.data.title.trim() || `Materi Pertemuan ${form.data.meeting_number}`;

  const submitForm = (publish: boolean) => {
    const request = form.transform((data) => ({ ...data, is_published: publish }));

    if (isEdit && digest?.id) {
      request.patch(`/admin/weekly-digest/${digest.id}`);
      return;
    }

    request.post('/admin/weekly-digest');
  };

  return (
    <AppLayout>
      <Head title={isEdit ? 'Edit Info Pekanan Mentari' : 'Buat Info Pekanan Mentari'} />

      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 p-6">
        <motion.div variants={itemVariants} className="flex items-center">
          <motion.button
            type="button"
            onClick={() => router.get(isEdit && digest?.id ? `/admin/weekly-digest/${digest.id}` : '/admin/weekly-digest')}
            whileHover={{ x: -4 }}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/60 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur-xl transition-all hover:bg-white dark:border-white/10 dark:bg-neutral-900/60 dark:text-neutral-100"
          >
            <ArrowLeft className="h-4 w-4" />
            {isEdit ? 'Kembali ke Detail' : 'Kembali ke Daftar'}
          </motion.button>
        </motion.div>

        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
            animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            style={{ backgroundSize: '200% 200%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          {[0, 1, 2].map((ring) => (
            <motion.div
              key={ring}
              className="absolute right-14 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full border border-white/10"
              animate={{ scale: [1, 2.2], opacity: [0.4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeOut', delay: ring }}
            />
          ))}

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
              <motion.div
                whileHover={{ scale: 1.04, rotate: 5 }}
                className="relative flex h-20 w-20 shrink-0 sm:h-24 sm:w-24"
                initial={{ opacity: 0, scale: 0.65, rotate: -8 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, delay: 0.15 }}
              >
                <img src={DashboardIcon} alt="Form Info Pekanan" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.55)]" />
              </motion.div>

              <div>
                <p className="text-sm font-medium tracking-wide text-indigo-100">Editor Entry Mentari</p>
                <h1 className="font-display text-3xl leading-tight md:text-5xl">
                  {isEdit ? 'Edit Info Pekanan Mentari.' : 'Buat Info Pekanan Mentari.'}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-indigo-100/90 sm:text-base">
                  Bahasa visualnya disamakan dengan dashboard dosen, tetapi alurnya tetap ringan: pilih mata kuliah,
                  tentukan pertemuan, isi judul bila perlu, lalu putuskan apakah ada tugas terstruktur.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 lg:items-end">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/20 px-5 py-3 shadow-lg backdrop-blur-xl">
                <div className="relative flex h-10 w-10 items-center justify-center">
                  <img src={SettingsIcon} alt="Format Tetap" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.35)]" />
                </div>
                <div>
                  <p className="text-xs text-indigo-100">Format Tetap</p>
                  <p className="text-xl font-bold text-white">{constants.platform_name}</p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2 lg:justify-end">
                <Badge className="border-white/20 bg-white/20 px-3 py-1.5 text-white backdrop-blur-md">Kelas {constants.class_label}</Badge>
                <Badge className="border-white/20 bg-white/20 px-3 py-1.5 text-white backdrop-blur-md">Forum {constants.forum_posts_required}x</Badge>
                <Badge className="border-white/20 bg-white/20 px-3 py-1.5 text-white backdrop-blur-md">Portal Tetap</Badge>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.form
          variants={itemVariants}
          onSubmit={(event) => {
            event.preventDefault();
            submitForm(form.data.is_published);
          }}
          className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
        >
          <div className="grid gap-6 p-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-white/20 bg-white/70 p-6 shadow-lg dark:border-white/10 dark:bg-neutral-900/60">
                <div className="mb-5 flex items-center gap-3">
                  <div className="relative flex h-12 w-12 items-center justify-center">
                    <img src={CourseIcon} alt="Input Utama" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.35)]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Input Utama</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Bagian ini saja yang perlu admin isi manual.</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <BookOpen className="h-4 w-4 text-indigo-500" />
                      Mata Kuliah
                    </label>
                    <Select value={form.data.mata_kuliah_id} onValueChange={(value) => form.setData('mata_kuliah_id', value)}>
                      <SelectTrigger className="h-12 rounded-2xl border-white/20 bg-white/80 dark:border-white/10 dark:bg-neutral-800/80"><SelectValue placeholder="Pilih mata kuliah" /></SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={String(course.id)}>{course.nama} {course.kelas ? `• ${course.kelas}` : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.errors.mata_kuliah_id && <p className="text-xs text-rose-600">{form.errors.mata_kuliah_id}</p>}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Pertemuan
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={32}
                        value={form.data.meeting_number}
                        onChange={(event) => form.setData('meeting_number', Number(event.target.value || 1))}
                        className="h-12 rounded-2xl border-white/20 bg-white/80 dark:border-white/10 dark:bg-neutral-800/80"
                      />
                      {form.errors.meeting_number && <p className="text-xs text-rose-600">{form.errors.meeting_number}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        <Type className="h-4 w-4 text-violet-500" />
                        Judul (Opsional)
                      </label>
                      <Input
                        value={form.data.title}
                        onChange={(event) => form.setData('title', event.target.value)}
                        placeholder="Contoh: Materi Neural Network"
                        className="h-12 rounded-2xl border-white/20 bg-white/80 dark:border-white/10 dark:bg-neutral-800/80"
                      />
                      {form.errors.title && <p className="text-xs text-rose-600">{form.errors.title}</p>}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/20 bg-white/80 p-4 dark:border-white/10 dark:bg-neutral-950/30">
                    <div className="flex items-center gap-3">
                      <Checkbox checked={form.data.has_structured_task} onCheckedChange={(checked) => form.setData('has_structured_task', checked === true)} />
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Ada tugas terstruktur</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Centang jika materi ini juga diikuti tugas terstruktur di Mentari.</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/20 bg-white/80 p-4 dark:border-white/10 dark:bg-neutral-950/30">
                    <div className="flex items-center gap-3">
                      <Checkbox checked={form.data.is_published} onCheckedChange={(checked) => form.setData('is_published', checked === true)} />
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Publish sekarang</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Jika aktif, entry ini langsung muncul pada rekap mingguan mahasiswa.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-white/20 bg-white/70 p-5 shadow-lg dark:border-white/10 dark:bg-neutral-900/60">
                <div className="mb-4 flex items-center gap-3">
                  <div className="relative flex h-12 w-12 items-center justify-center">
                    <img src={SettingsIcon} alt="Sistem Otomatis" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.35)]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sistem Otomatis</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Admin tidak perlu mengisi field teknis tambahan.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <InfoCard label="Label Kelas" value={constants.class_label} helper="Tetap dan tidak bisa diubah." />
                  <InfoCard label="Platform" value={constants.platform_name} helper="Semua entry selalu diarahkan ke Mentari." />
                  <InfoCard label="Portal" value={constants.platform_url} helper="URL platform diset permanen oleh sistem." />
                </div>
              </div>

              <div className="rounded-3xl border border-cyan-100 bg-cyan-50/80 p-5 shadow-lg dark:border-cyan-900/30 dark:bg-cyan-950/20">
                <div className="mb-4 flex items-center gap-3">
                  <div className="relative flex h-12 w-12 items-center justify-center">
                    <img src={TaskInfoIcon} alt="Aturan Kehadiran" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.35)]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Aturan Kehadiran</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Ini poin yang nanti dibaca mahasiswa.</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/60 bg-white/80 p-4 dark:border-white/10 dark:bg-neutral-900/40">
                  <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">Submit forum diskusi {constants.forum_posts_required}x</Badge>
                  <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
                    Kehadiran diperoleh jika mahasiswa submit forum diskusi sebanyak {constants.forum_posts_required} kali pada materi yang sudah masuk ke Mentari.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-white/20 bg-white/70 p-5 shadow-lg dark:border-white/10 dark:bg-neutral-900/60">
                <div className="mb-4 flex items-center gap-3">
                  <div className="relative flex h-12 w-12 items-center justify-center">
                    <img src={SessionStatIcon} alt="Preview Ringkas" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.35)]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Preview Ringkas</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Seperti bahasa tampilan di dashboard dosen: singkat, jelas, dan langsung terbaca.</p>
                  </div>
                </div>

                <div className="space-y-4 rounded-3xl border border-white/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-5 text-white shadow-2xl">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200/80">Entry Pekanan</p>
                    <p className="mt-2 text-xl font-bold">{selectedCourse?.nama || 'Pilih mata kuliah'}</p>
                    <p className="mt-1 text-sm text-slate-300">{displayTitle}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className="border-white/10 bg-white/10 text-white">Pertemuan {form.data.meeting_number}</Badge>
                    <Badge className="border-white/10 bg-white/10 text-white">{constants.class_label}</Badge>
                    <Badge className={cn('border-white/10 text-white', form.data.has_structured_task ? 'bg-amber-500/80' : 'bg-slate-500/60')}>
                      {form.data.has_structured_task ? 'Ada Tugas Terstruktur' : 'Tanpa Tugas Terstruktur'}
                    </Badge>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm leading-7 text-slate-200">
                      Materi sudah masuk di {constants.platform_name}. Mahasiswa wajib submit forum diskusi {constants.forum_posts_required}x untuk mendapatkan kehadiran.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/20 bg-neutral-50/70 p-5 sm:flex-row sm:justify-end dark:border-white/10 dark:bg-neutral-950/30">
            <Button type="button" variant="outline" className="rounded-2xl border-white/20 bg-white/80 dark:border-white/10 dark:bg-neutral-900/60" onClick={() => submitForm(false)} disabled={form.processing}>
              <Save className="mr-2 h-4 w-4" />
              Simpan Draft
            </Button>
            <Button type="submit" className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg" disabled={form.processing}>
              <Save className="mr-2 h-4 w-4" />
              {form.data.is_published ? 'Simpan dan Publish' : 'Simpan Entry'}
            </Button>
          </div>
        </motion.form>
      </motion.div>
    </AppLayout>
  );
}

function InfoCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/80 p-4 dark:border-white/10 dark:bg-neutral-950/30">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helper}</p>
    </div>
  );
}
