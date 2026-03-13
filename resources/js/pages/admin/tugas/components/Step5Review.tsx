import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Bell, Calendar, Eye, FileText } from 'lucide-react';
import React from 'react';
import { GlassCard } from './GlassCard';

interface Step5Props {
    data: any;
    setData: (field: string, value: any) => void;
    courseName?: string;
}

export const Step5Review: React.FC<Step5Props> = ({
    data,
    setData,
    courseName,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
        >
            {/* Preview Card */}
            <GlassCard
                colorClass="hover:shadow-cyan-500/10"
                gradientClass="from-cyan-500/5 to-sky-500/5 dark:from-cyan-500/10 dark:to-sky-500/10"
                glowClass="bg-cyan-500"
            >
                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl bg-indigo-500/10 p-3">
                        <Eye className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">
                            Preview Tugas
                        </h3>
                        <p className="text-sm text-slate-400">
                            Periksa kembali sebelum publikasi
                        </p>
                    </div>
                </div>

                {/* Summary Grid */}
                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                        <div className="mb-1 text-xs text-slate-400">
                            Mata Kuliah
                        </div>
                        <div
                            className="truncate font-medium text-white"
                            title={courseName || 'Pilih Mata Kuliah'}
                        >
                            {courseName || '-'}
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                        <div className="mb-1 text-xs text-slate-400">
                            Jenis Tugas
                        </div>
                        <div className="font-medium text-white capitalize">
                            {data.type || 'assignment'}
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                        <div className="mb-1 text-xs text-slate-400">
                            Total Poin
                        </div>
                        <div className="font-medium text-white">
                            {data.points || 0} poin
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                        <div className="mb-1 text-xs text-slate-400">
                            Bobot Nilai
                        </div>
                        <div className="font-medium text-white">
                            {data.weight || 0}%
                        </div>
                    </div>
                </div>

                {/* Description Preview */}
                <div className="mb-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                    <div className="mb-2 text-xs text-slate-400">Judul</div>
                    <div className="mb-4 font-bold text-white">
                        {data.title || 'Belum ada judul'}
                    </div>

                    <div className="mb-2 text-xs text-slate-400">Deskripsi</div>
                    <div className="prose prose-invert line-clamp-3 max-w-none text-sm text-white">
                        {data.description || 'Belum ada deskripsi...'}
                    </div>
                </div>

                {/* Attachments */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                    <div className="mb-2 text-xs text-slate-400">Lampiran</div>
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-indigo-400" />
                        <span className="text-sm text-white">
                            {(data.attachments || []).length} file dilampirkan
                        </span>
                    </div>
                </div>
            </GlassCard>

            {/* Schedule Settings */}
            <GlassCard
                colorClass="hover:shadow-indigo-500/10"
                gradientClass="from-indigo-500/5 to-blue-500/5 dark:from-indigo-500/10 dark:to-blue-500/10"
                glowClass="bg-indigo-500"
            >
                <Label className="mb-4 flex items-center gap-2 text-white">
                    <Calendar className="h-5 w-5 text-indigo-400" />
                    Jadwal Publikasi
                </Label>

                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <input
                            type="radio"
                            name="schedule"
                            value="now"
                            checked={
                                data.publish_schedule === 'now' ||
                                !data.publish_schedule
                            }
                            onChange={() => setData('publish_schedule', 'now')}
                            className="h-4 w-4 border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
                            id="schedule-now"
                        />
                        <label
                            htmlFor="schedule-now"
                            className="cursor-pointer text-slate-300 select-none"
                        >
                            Publikasikan sekarang
                        </label>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="radio"
                            name="schedule"
                            value="later"
                            checked={data.publish_schedule === 'later'}
                            onChange={() =>
                                setData('publish_schedule', 'later')
                            }
                            className="h-4 w-4 border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
                            id="schedule-later"
                        />
                        <label
                            htmlFor="schedule-later"
                            className="cursor-pointer text-slate-300 select-none"
                        >
                            Jadwalkan publikasi
                        </label>
                    </div>

                    <div className="mt-4 ml-7 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <Label className="mb-2 text-xs text-slate-400">
                                Tanggal & Waktu Mulai{' '}
                                {data.publish_schedule === 'now' &&
                                    '(Otomatis)'}
                            </Label>
                            <Input
                                type="datetime-local"
                                value={data.start_at || ''}
                                onChange={(e) =>
                                    setData('start_at', e.target.value)
                                }
                                disabled={data.publish_schedule === 'now'}
                                className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2 text-white disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <Label className="mb-2 text-xs text-slate-400">
                                Deadline / Tenggat Waktu{' '}
                                <span className="text-red-400">*</span>
                            </Label>
                            <Input
                                type="datetime-local"
                                value={data.deadline || ''}
                                onChange={(e) =>
                                    setData('deadline', e.target.value)
                                }
                                className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2 text-white"
                            />
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Notification Settings */}
            <GlassCard
                colorClass="hover:shadow-fuchsia-500/10"
                gradientClass="from-fuchsia-500/5 to-pink-500/5 dark:from-fuchsia-500/10 dark:to-pink-500/10"
                glowClass="bg-fuchsia-500"
            >
                <Label className="mb-4 flex items-center gap-2 text-white">
                    <Bell className="h-5 w-5 text-indigo-400" />
                    Notifikasi
                </Label>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label
                            htmlFor="notif-students"
                            className="cursor-pointer text-slate-300 select-none"
                        >
                            Kirim notifikasi ke mahasiswa (Aplikasi)
                        </label>
                        <input
                            type="checkbox"
                            disabled
                            checked={
                                data.notifications?.send_notification ?? true
                            }
                            onChange={(e) =>
                                setData('notifications', {
                                    ...data.notifications,
                                    send_notification: e.target.checked,
                                })
                            }
                            className="h-5 w-5 cursor-not-allowed rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
                            id="notif-students"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <label
                            htmlFor="notif-reminder"
                            className="cursor-pointer text-slate-300 select-none"
                        >
                            Kirim reminder H-1 deadline
                        </label>
                        <input
                            type="checkbox"
                            checked={data.notifications?.send_reminder ?? true}
                            onChange={(e) =>
                                setData('notifications', {
                                    ...data.notifications,
                                    send_reminder: e.target.checked,
                                })
                            }
                            className="h-5 w-5 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
                            id="notif-reminder"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <label
                            htmlFor="notif-email"
                            className="cursor-pointer text-slate-300 select-none"
                        >
                            Notifikasi email
                        </label>
                        <input
                            type="checkbox"
                            checked={data.notifications?.send_email ?? false}
                            onChange={(e) =>
                                setData('notifications', {
                                    ...data.notifications,
                                    send_email: e.target.checked,
                                })
                            }
                            className="h-5 w-5 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
                            id="notif-email"
                        />
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
};
