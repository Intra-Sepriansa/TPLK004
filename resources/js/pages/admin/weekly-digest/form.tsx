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
import NotificationIcon from '@/assets/admin/notification-center/icon-notifikasi.png';
import CourseIcon from '@/assets/dosen/dashboard/course-icon.png';
import SettingsIcon from '@/assets/admin/pengaturan/pengaturan.png';
import TaskInfoIcon from '@/assets/admin/informasi-tugas/informasi-tugas.png';
import SessionStatIcon from '@/assets/dosen/dashboard/stat-total-sessions.png';
import TotalNotificationIcon from '@/assets/admin/notification-center/total.png';

interface CourseOption {
  id: number;
  nama: string;
  kode: string | null;
  kelas: string | null;
}

interface DigestPayload {
  id?: number;
  courses?: {
    id: number;
    name: string;
    code: string;
    meeting_number: number;
    title: string | null;
  }[];
  mata_kuliah_ids?: number[];
  meetings?: Record<string, number>;
  titles?: Record<string, string>;
  week_number: number;
  semester: string;
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
  mata_kuliah_ids: string[];
  meetings: Record<string, number>;
  titles: Record<string, string>;
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
    mata_kuliah_ids: digest?.mata_kuliah_ids?.map(String) || [],
    meetings: digest?.meetings || {},
    titles: digest?.titles || {},
    has_structured_task: digest?.has_structured_task ?? false,
    is_published: digest?.is_published ?? false,
  });

  const selectedCourses = courses.filter((course) => form.data.mata_kuliah_ids.includes(String(course.id)));

  let previewTitleSnippet = 'Materi Informasi Pekanan';
  if (selectedCourses.length === 1) {
    const cid = String(selectedCourses[0].id);
    previewTitleSnippet = form.data.titles[cid]?.trim() || `Materi Pertemuan ${form.data.meetings[cid] || 1}`;
  } else if (selectedCourses.length > 1) {
    previewTitleSnippet = 'Multi Judul dan Pertemuan';
  }

  const submitForm = (publish: boolean) => {
    form.transform((data) => ({ ...data, is_published: publish }));

    if (isEdit && digest?.id) {
      form.patch(`/admin/weekly-digest/${digest.id}`);
      return;
    }

    form.post('/admin/weekly-digest');
  };

  return (
    <AppLayout>
      <Head title={isEdit ? 'Edit Info Pekanan Mentari' : 'Buat Info Pekanan Mentari'} />

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
                onClick={() => router.get(isEdit && digest?.id ? `/admin/weekly-digest/${digest.id}` : '/admin/weekly-digest')}
                whileHover={{ x: -4 }}
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {isEdit ? 'Kembali ke Detail' : 'Kembali ke Daftar'}
              </motion.button>
            </div>

            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center sm:h-24 sm:w-24">
                  <img src={NotificationIcon} alt="Form Info Pekanan" className="h-full w-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.45)]" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium tracking-wide text-indigo-100">Editor Entry Mentari</p>
                  <h1 className="mt-1 font-bold text-2xl sm:text-3xl leading-tight">
                    {isEdit ? 'Edit Info Pekanan Mentari' : 'Buat Info Pekanan Mentari'}
                  </h1>
                  <p className="mt-2 text-sm text-indigo-100/90 max-w-2xl">
                    Lengkapi informasi untuk rekap pekanan mahasiswa.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4 sm:mt-0 lg:flex-col lg:items-end w-full lg:w-auto">
                <Badge className="border-white/20 bg-white/15 px-3 py-1.5 text-white backdrop-blur-md">Kelas {constants.class_label}</Badge>
                <Badge className="border-white/20 bg-white/15 px-3 py-1.5 text-white backdrop-blur-md">{constants.platform_name}</Badge>
                <Badge className="border-white/20 bg-white/15 px-3 py-1.5 text-white backdrop-blur-md">Forum {constants.forum_posts_required}x</Badge>
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
          className="w-full"
        >
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
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
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <BookOpen className="h-4 w-4 text-indigo-500" />
                      Mata Kuliah {isEdit ? '(Satu)' : '(Bisa Lebih Dari Satu)'}
                    </label>

                    <div className="h-[28rem] overflow-y-auto rounded-3xl border border-white/20 bg-white/80 p-3 shadow-inner dark:border-white/10 dark:bg-neutral-800/80 custom-scrollbar">
                      <div className="flex flex-col gap-2">
                        {courses.map((course) => {
                          const isChecked = form.data.mata_kuliah_ids.includes(String(course.id));

                          return (
                            <label
                              key={course.id}
                              className={cn(
                                "flex flex-col cursor-pointer gap-3 rounded-2xl border p-3.5 transition-all duration-200",
                                isChecked
                                  ? "border-indigo-500/50 bg-indigo-50/80 shadow-sm dark:border-indigo-500/30 dark:bg-indigo-900/20"
                                  : "border-transparent bg-white hover:bg-slate-50 dark:bg-neutral-900/50 dark:hover:bg-neutral-800/80"
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    if (isEdit) {
                                      form.setData(data => ({
                                        ...data,
                                        mata_kuliah_ids: checked ? [String(course.id)] : [],
                                        meetings: checked ? { [String(course.id)]: 1 } : {}
                                      }));
                                      return;
                                    }
                                    if (checked) {
                                      form.setData(data => ({
                                        ...data,
                                        mata_kuliah_ids: [...data.mata_kuliah_ids, String(course.id)],
                                        meetings: { ...data.meetings, [String(course.id)]: 1 }
                                      }));
                                    } else {
                                      const newMeetings = { ...form.data.meetings };
                                      delete newMeetings[String(course.id)];
                                      form.setData(data => ({
                                        ...data,
                                        mata_kuliah_ids: data.mata_kuliah_ids.filter(id => id !== String(course.id)),
                                        meetings: newMeetings
                                      }));
                                    }
                                  }}
                                  className="mt-0.5"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{course.nama}</p>
                                  {course.kelas && (
                                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                      <span className="flex h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                                      Kelas {course.kelas}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {isChecked && (
                                <div className="ml-7 flex items-center gap-3">
                                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Pertemuan ke-</label>
                                  <Input
                                    type="number"
                                    min={1}
                                    max={32}
                                    value={form.data.meetings[String(course.id)] || 1}
                                    onChange={(e) => {
                                      const val = Number(e.target.value || 1);
                                      form.setData('meetings', { ...form.data.meetings, [String(course.id)]: val });
                                    }}
                                    className="h-8 w-20 rounded-xl border-white/40 bg-white/50 px-2 py-1 text-sm dark:border-white/10 dark:bg-black/20"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <div className="flex flex-col gap-1.5 w-full max-w-[140px] sm:max-w-[200px]">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Judul (Opsional)</label>
                                    <Input
                                      type="text"
                                      placeholder={`Contoh: Materi ${form.data.meetings[String(course.id)] || 1}`}
                                      value={form.data.titles[String(course.id)] || ''}
                                      onChange={(e) => {
                                        form.setData('titles', { ...form.data.titles, [String(course.id)]: e.target.value });
                                      }}
                                      className="h-8 rounded-xl border-white/40 bg-white/50 px-2 py-1 text-sm dark:border-white/10 dark:bg-black/20"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                </div>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    {form.errors.mata_kuliah_ids && <p className="text-sm font-medium text-rose-600">{form.errors.mata_kuliah_ids}</p>}
                  </div>

                  <div className="space-y-4">

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

              {/* Ringkasan Pilihan Card */}
              <div className="rounded-3xl border border-white/20 bg-white/70 p-6 shadow-lg dark:border-white/10 dark:bg-neutral-900/60">
                <div className="mb-5 flex items-center gap-3">
                  <div className="relative flex h-12 w-12 items-center justify-center">
                    <img src={TotalNotificationIcon} alt="Ringkasan" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.35)]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ringkasan Pilihan</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Overview entry yang akan dibuat.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-2xl border border-white/20 bg-white/80 p-4 dark:border-white/10 dark:bg-neutral-950/30">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mata Kuliah Terpilih</p>
                      <span className={cn(
                        'text-lg font-extrabold',
                        selectedCourses.length > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                      )}>
                        {selectedCourses.length}
                      </span>
                    </div>
                    {selectedCourses.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {selectedCourses.map(c => (
                          <p key={c.id} className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                            <span className="truncate">{c.nama}</span>
                            <span className="text-slate-400">
                              — Pertemuan {form.data.meetings[String(c.id)] || 1}
                            </span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/20 bg-white/80 p-3 dark:border-white/10 dark:bg-neutral-950/30 text-center">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Tugas Terstruktur</p>
                      <Badge className={cn(
                        form.data.has_structured_task
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      )}>
                        {form.data.has_structured_task ? 'Ya' : 'Tidak'}
                      </Badge>
                    </div>
                    <div className="rounded-2xl border border-white/20 bg-white/80 p-3 dark:border-white/10 dark:bg-neutral-950/30 text-center">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Status</p>
                      <Badge className={cn(
                        form.data.is_published
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      )}>
                        {form.data.is_published ? 'Publish' : 'Draft'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips & Panduan Card */}
              <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-6 shadow-lg dark:border-emerald-900/30 dark:bg-emerald-950/20">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                    <Type className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Tips & Panduan</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Petunjuk membuat info pekanan.</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {[
                    { text: 'Pilih satu atau lebih mata kuliah yang materinya sudah masuk ke Mentari.', color: 'bg-emerald-500' },
                    { text: 'Isi nomor pertemuan sesuai urutan materi di Mentari.', color: 'bg-teal-500' },
                    { text: 'Judul opsional bisa diisi untuk keterangan tambahan.', color: 'bg-cyan-500' },
                    { text: 'Centang "Tugas Terstruktur" jika materi ada tugas di Mentari.', color: 'bg-blue-500' },
                    { text: 'Draft bisa diedit kapan saja sebelum di-publish.', color: 'bg-indigo-500' },
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className={cn('mt-1.5 h-2 w-2 rounded-full shrink-0', tip.color)} />
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{tip.text}</p>
                    </div>
                  ))}
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
                    <p className="mt-2 text-xl font-bold">
                      {selectedCourses.length > 0
                        ? (selectedCourses.length > 1 ? `${selectedCourses.length} Mata Kuliah Terpilih` : selectedCourses[0].nama)
                        : 'Pilih mata kuliah'}
                    </p>
                    <p className="mt-1 text-sm text-slate-300">{previewTitleSnippet}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className="border-white/10 bg-white/10 text-white">Multi Pertemuan</Badge>
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

          <div className="flex flex-col gap-3 px-6 pb-6 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" className="h-12 px-6 rounded-2xl border-white/20 bg-white/80 font-bold dark:border-white/10 dark:bg-neutral-900/60" onClick={() => submitForm(false)} disabled={form.processing}>
              <Save className="mr-2 h-4 w-4" />
              Simpan Draft
            </Button>
            <Button type="submit" className="h-12 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40" disabled={form.processing}>
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
