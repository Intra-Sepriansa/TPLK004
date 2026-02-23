import React from 'react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Eye, FileText, Calendar, Bell } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface Step5Props {
    data: any;
    setData: (field: string, value: any) => void;
    courseName?: string;
}

export const Step5Review: React.FC<Step5Props> = ({ data, setData, courseName }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
        >
            {/* Preview Card */}
            <GlassCard colorClass="hover:shadow-cyan-500/10" gradientClass="from-cyan-500/5 to-sky-500/5 dark:from-cyan-500/10 dark:to-sky-500/10" glowClass="bg-cyan-500">

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-500/10 rounded-xl">
                        <Eye className="w-6 h-6 text-indigo-400" />
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                        <div className="text-xs text-slate-400 mb-1">Mata Kuliah</div>
                        <div className="text-white font-medium truncate" title={courseName || 'Pilih Mata Kuliah'}>
                            {courseName || '-'}
                        </div>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                        <div className="text-xs text-slate-400 mb-1">Jenis Tugas</div>
                        <div className="text-white font-medium capitalize">
                            {data.type || 'assignment'}
                        </div>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                        <div className="text-xs text-slate-400 mb-1">Total Poin</div>
                        <div className="text-white font-medium">
                            {data.points || 0} poin
                        </div>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                        <div className="text-xs text-slate-400 mb-1">Bobot Nilai</div>
                        <div className="text-white font-medium">
                            {data.weight || 0}%
                        </div>
                    </div>
                </div>

                {/* Description Preview */}
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 mb-4">
                    <div className="text-xs text-slate-400 mb-2">Judul</div>
                    <div className="text-white font-bold mb-4">
                        {data.title || 'Belum ada judul'}
                    </div>

                    <div className="text-xs text-slate-400 mb-2">Deskripsi</div>
                    <div className="text-white text-sm line-clamp-3 prose prose-invert max-w-none">
                        {data.description || 'Belum ada deskripsi...'}
                    </div>
                </div>

                {/* Attachments */}
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400 mb-2">Lampiran</div>
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <span className="text-white text-sm">
                            {(data.attachments || []).length} file dilampirkan
                        </span>
                    </div>
                </div>
            </GlassCard>

            {/* Schedule Settings */}
            <GlassCard colorClass="hover:shadow-indigo-500/10" gradientClass="from-indigo-500/5 to-blue-500/5 dark:from-indigo-500/10 dark:to-blue-500/10" glowClass="bg-indigo-500">

                <Label className="flex items-center gap-2 text-white mb-4">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                    Jadwal Publikasi
                </Label>

                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <input
                            type="radio"
                            name="schedule"
                            value="now"
                            checked={data.publish_schedule === 'now' || !data.publish_schedule}
                            onChange={() => setData('publish_schedule', 'now')}
                            className="w-4 h-4 text-indigo-500 bg-slate-800 border-slate-600 focus:ring-indigo-500"
                            id="schedule-now"
                        />
                        <label htmlFor="schedule-now" className="text-slate-300 select-none cursor-pointer">
                            Publikasikan sekarang
                        </label>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="radio"
                            name="schedule"
                            value="later"
                            checked={data.publish_schedule === 'later'}
                            onChange={() => setData('publish_schedule', 'later')}
                            className="w-4 h-4 text-indigo-500 bg-slate-800 border-slate-600 focus:ring-indigo-500"
                            id="schedule-later"
                        />
                        <label htmlFor="schedule-later" className="text-slate-300 select-none cursor-pointer">
                            Jadwalkan publikasi
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7 mt-4">
                        <div>
                            <Label className="text-xs text-slate-400 mb-2">
                                Tanggal & Waktu Mulai {data.publish_schedule === 'now' && '(Otomatis)'}
                            </Label>
                            <Input
                                type="datetime-local"
                                value={data.start_at || ''}
                                onChange={(e) => setData('start_at', e.target.value)}
                                disabled={data.publish_schedule === 'now'}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-400 mb-2">
                                Deadline / Tenggat Waktu <span className="text-red-400">*</span>
                            </Label>
                            <Input
                                type="datetime-local"
                                value={data.deadline || ''}
                                onChange={(e) => setData('deadline', e.target.value)}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white"
                            />
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Notification Settings */}
            <GlassCard colorClass="hover:shadow-fuchsia-500/10" gradientClass="from-fuchsia-500/5 to-pink-500/5 dark:from-fuchsia-500/10 dark:to-pink-500/10" glowClass="bg-fuchsia-500">

                <Label className="flex items-center gap-2 text-white mb-4">
                    <Bell className="w-5 h-5 text-indigo-400" />
                    Notifikasi
                </Label>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label htmlFor="notif-students" className="text-slate-300 cursor-pointer select-none">
                            Kirim notifikasi ke mahasiswa (Aplikasi)
                        </label>
                        <input
                            type="checkbox"
                            disabled
                            checked={data.notifications?.send_notification ?? true}
                            onChange={(e) => setData('notifications', { ...data.notifications, send_notification: e.target.checked })}
                            className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-not-allowed"
                            id="notif-students"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <label htmlFor="notif-reminder" className="text-slate-300 cursor-pointer select-none">
                            Kirim reminder H-1 deadline
                        </label>
                        <input
                            type="checkbox"
                            checked={data.notifications?.send_reminder ?? true}
                            onChange={(e) => setData('notifications', { ...data.notifications, send_reminder: e.target.checked })}
                            className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
                            id="notif-reminder"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <label htmlFor="notif-email" className="text-slate-300 cursor-pointer select-none">
                            Notifikasi email
                        </label>
                        <input
                            type="checkbox"
                            checked={data.notifications?.send_email ?? false}
                            onChange={(e) => setData('notifications', { ...data.notifications, send_email: e.target.checked })}
                            className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
                            id="notif-email"
                        />
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
};
