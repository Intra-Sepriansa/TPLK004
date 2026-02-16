import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  Bell, Send, Users, Mail, MessageSquare,
  Smartphone, Eye, MousePointer, Plus, Filter, Trash2, CheckCircle, Clock, AlertTriangle,
  Globe, GraduationCap, UserCog, Target, Info, Megaphone, Siren, Trophy, Circle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { cn } from '@/lib/utils';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: string;
  target_type: string;
  target_id: number | null;
  read_at: string | null;
  scheduled_at: string | null;
  created_at: string;
}

interface NotificationCenterProps {
  notifications: {
    data: Notification[];
    links: any[];
    current_page: number;
    last_page: number;
  };
  stats: {
    total: number;
    unread: number;
    scheduled: number;
    by_type: Record<string, number>;
  };
  filters: {
    type: string;
    status: string;
  };
  mahasiswaCount: number;
  dosenCount: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};
const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } },
  hover: { scale: 1.03, y: -8, transition: { type: 'spring' as const, stiffness: 400, damping: 10 } },
};

export default function NotificationCenter({ notifications, stats, filters, mahasiswaCount, dosenCount }: NotificationCenterProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [typeFilter, setTypeFilter] = useState(filters.type);
  const [statusFilter, setStatusFilter] = useState(filters.status);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    target: 'all',
    title: '',
    message: '',
    type: 'info',
    priority: 'normal',
    action_url: '',
    scheduled_at: '',
    target_type: 'mahasiswa',
    target_ids: [] as number[],
  });

  const handleFilter = () => {
    router.get('/admin/notification-center', { type: typeFilter, status: statusFilter }, { preserveState: true });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Hapus ${selectedIds.length} notifikasi?`)) {
      router.post('/admin/notification-center/bulk-delete', { ids: selectedIds }, {
        onSuccess: () => setSelectedIds([])
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reminder': return Clock;
      case 'announcement': return Bell;
      case 'alert': return AlertTriangle;
      case 'achievement': return CheckCircle;
      case 'warning': return AlertTriangle;
      default: return Bell;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'reminder': return 'from-blue-500 to-cyan-600';
      case 'announcement': return 'from-purple-500 to-violet-600';
      case 'alert': return 'from-red-500 to-rose-600';
      case 'achievement': return 'from-emerald-500 to-green-600';
      case 'warning': return 'from-amber-500 to-orange-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-600 dark:text-red-400">Urgent</span>;
      case 'high': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-600 dark:text-orange-400">High</span>;
      case 'normal': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-600 dark:text-blue-400">Normal</span>;
      default: return <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-600 dark:text-slate-400">Low</span>;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.post('/admin/notification-center', formData, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setFormData({
          target: 'all',
          title: '',
          message: '',
          type: 'info',
          priority: 'normal',
          action_url: '',
          scheduled_at: '',
          target_type: 'mahasiswa',
          target_ids: [],
        });
      },
    });
  };

  return (
    <AppLayout>
      <Head title="Notification Center" />

      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-6 space-y-8">

        {/* ═══════ HEADER — Matching Rekap Kehadiran Style ═══════ */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
        >
          {/* Animated Gradient Background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundSize: '200% 200%',
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          {/* Pulsating Rings */}
          <motion.div
            className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
            animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div
            className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
            animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1 }}
          />

          <div className="relative">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center gap-5">
                <motion.div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Bell className="h-8 w-8 text-white" />
                </motion.div>
                <div>
                  <p className="text-sm text-blue-100 font-medium tracking-wide">Pusat Komunikasi</p>
                  <h1 className="text-3xl font-bold text-white">Notification Center</h1>
                  <p className="mt-1 text-blue-100 max-w-lg">
                    Kelola dan kirim notifikasi ke mahasiswa dan dosen
                  </p>
                </div>
              </div>

              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 rounded-xl bg-white/20 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/30 border border-white/20 shadow-lg"
                  >
                    <Plus className="h-5 w-5" />
                    Buat Notifikasi
                  </motion.button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-2xl max-h-[90vh] flex flex-col">
                  {/* ── Animated Gradient Header ── */}
                  <div className="relative overflow-hidden p-6 text-white">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500"
                      animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />
                    <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                    <motion.div
                      className="absolute right-8 top-1/2 -translate-y-1/2 h-20 w-20 rounded-full border-2 border-white/10"
                      animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.div
                      className="absolute right-8 top-1/2 -translate-y-1/2 h-20 w-20 rounded-full border-2 border-white/10"
                      animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1 }}
                    />

                    <div className="relative flex items-center gap-4">
                      <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl"
                      >
                        <Send className="h-7 w-7 text-white" />
                      </motion.div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Buat Notifikasi Baru</h2>
                        <p className="text-sm text-blue-100">Kirim notifikasi ke mahasiswa dan dosen</p>
                      </div>
                    </div>
                  </div>

                  {/* ── Form Body ── */}
                  <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-5">
                      {/* Target */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          <Users className="h-4 w-4 text-blue-500" />
                          Target Penerima
                        </label>
                        <Select value={formData.target} onValueChange={(value) => setFormData({ ...formData, target: value })}>
                          <SelectTrigger className="h-11 rounded-xl bg-neutral-50/80 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white backdrop-blur">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl">
                            <SelectItem value="all"><span className="flex items-center gap-2"><Globe className="h-4 w-4 text-blue-500" /> Semua Pengguna</span></SelectItem>
                            <SelectItem value="mahasiswa"><span className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-indigo-500" /> Semua Mahasiswa ({mahasiswaCount})</span></SelectItem>
                            <SelectItem value="dosen"><span className="flex items-center gap-2"><UserCog className="h-4 w-4 text-purple-500" /> Semua Dosen ({dosenCount})</span></SelectItem>
                            <SelectItem value="specific"><span className="flex items-center gap-2"><Target className="h-4 w-4 text-cyan-500" /> Spesifik</span></SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Judul */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          <MessageSquare className="h-4 w-4 text-indigo-500" />
                          Judul Notifikasi
                        </label>
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Masukkan judul notifikasi..."
                          className="h-11 rounded-xl bg-neutral-50/80 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white backdrop-blur placeholder:text-neutral-400"
                          required
                        />
                      </div>

                      {/* Pesan */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          <Mail className="h-4 w-4 text-cyan-500" />
                          Isi Pesan
                        </label>
                        <Textarea
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Tulis isi pesan notifikasi..."
                          rows={4}
                          className="rounded-xl bg-neutral-50/80 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white backdrop-blur placeholder:text-neutral-400 resize-none"
                          required
                        />
                      </div>

                      {/* Tipe & Prioritas */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                            <Bell className="h-4 w-4 text-purple-500" />
                            Tipe
                          </label>
                          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                            <SelectTrigger className="h-11 rounded-xl bg-neutral-50/80 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white backdrop-blur">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl">
                              <SelectItem value="info"><span className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-500" /> Info</span></SelectItem>
                              <SelectItem value="reminder"><span className="flex items-center gap-2"><Clock className="h-4 w-4 text-amber-500" /> Reminder</span></SelectItem>
                              <SelectItem value="announcement"><span className="flex items-center gap-2"><Megaphone className="h-4 w-4 text-purple-500" /> Pengumuman</span></SelectItem>
                              <SelectItem value="alert"><span className="flex items-center gap-2"><Siren className="h-4 w-4 text-red-500" /> Alert</span></SelectItem>
                              <SelectItem value="warning"><span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Peringatan</span></SelectItem>
                              <SelectItem value="achievement"><span className="flex items-center gap-2"><Trophy className="h-4 w-4 text-emerald-500" /> Achievement</span></SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            Prioritas
                          </label>
                          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                            <SelectTrigger className="h-11 rounded-xl bg-neutral-50/80 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white backdrop-blur">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl">
                              <SelectItem value="low"><span className="flex items-center gap-2"><Circle className="h-3 w-3 fill-emerald-500 text-emerald-500" /> Low</span></SelectItem>
                              <SelectItem value="normal"><span className="flex items-center gap-2"><Circle className="h-3 w-3 fill-blue-500 text-blue-500" /> Normal</span></SelectItem>
                              <SelectItem value="high"><span className="flex items-center gap-2"><Circle className="h-3 w-3 fill-amber-500 text-amber-500" /> High</span></SelectItem>
                              <SelectItem value="urgent"><span className="flex items-center gap-2"><Circle className="h-3 w-3 fill-red-500 text-red-500" /> Urgent</span></SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Jadwal */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          <Clock className="h-4 w-4 text-emerald-500" />
                          Jadwal Pengiriman
                          <span className="text-xs text-neutral-400 font-normal">(Opsional)</span>
                        </label>
                        <Input
                          type="datetime-local"
                          value={formData.scheduled_at}
                          onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                          className="h-11 rounded-xl bg-neutral-50/80 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white backdrop-blur"
                        />
                      </div>
                    </div>

                    {/* ── Footer ── */}
                    <div className="p-5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl px-5">
                        Batal
                      </Button>
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Button type="submit" className="rounded-xl px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:from-blue-600 hover:to-indigo-700">
                          <Send className="h-4 w-4 mr-2" />
                          Kirim Notifikasi
                        </Button>
                      </motion.div>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </motion.div>

        {/* ═══════ STAT CARDS — Glassmorphism ═══════ */}
        <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Bell, label: 'Total', value: stats.total, color: 'from-purple-400 to-violet-600', shadow: 'shadow-purple-500/30', gradientBg: 'from-purple-500/5 to-violet-500/5 dark:from-purple-500/10 dark:to-violet-500/10', blurColor: 'bg-purple-500' },
            { icon: Mail, label: 'Unread', value: stats.unread, color: 'from-blue-400 to-cyan-600', shadow: 'shadow-blue-500/30', gradientBg: 'from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10', blurColor: 'bg-blue-500' },
            { icon: Clock, label: 'Scheduled', value: stats.scheduled, color: 'from-amber-400 to-orange-600', shadow: 'shadow-amber-500/30', gradientBg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10', blurColor: 'bg-amber-500' },
            { icon: Users, label: 'Recipients', value: mahasiswaCount + dosenCount, color: 'from-emerald-400 to-teal-600', shadow: 'shadow-emerald-500/30', gradientBg: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10', blurColor: 'bg-emerald-500' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={cardVariants}
              whileHover="hover"
              onHoverStart={() => setHoveredCard(stat.label)}
              onHoverEnd={() => setHoveredCard(null)}
              className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all dark:border-white/5 cursor-pointer"
            >
              <div className={cn('absolute inset-0 bg-gradient-to-br', stat.gradientBg)} />
              <motion.div
                animate={{
                  scale: hoveredCard === stat.label ? 1.5 : 1,
                  opacity: hoveredCard === stat.label ? 0.4 : 0.2,
                }}
                className={cn('absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl transition-all duration-500', stat.blurColor)}
              />
              <div className="relative flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  className={cn('flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg', stat.color, stat.shadow)}
                >
                  <stat.icon className="h-7 w-7" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{stat.label}</p>
                  <div className="mt-1">
                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                      <AnimatedCounter value={stat.value} duration={1200} />
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ═══════ FILTER SECTION ═══════ */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl border border-white/20 bg-white/50 p-5 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/20">
              <Filter className="h-5 w-5" />
            </div>
            <h2 className="font-bold text-neutral-900 dark:text-white text-lg">Filter Notifikasi</h2>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px] bg-white/60 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white">
                <SelectValue placeholder="Semua Tipe" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
                <SelectItem value="announcement">Pengumuman</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
                <SelectItem value="warning">Peringatan</SelectItem>
                <SelectItem value="achievement">Achievement</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px] bg-white/60 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="unread">Belum Dibaca</SelectItem>
                <SelectItem value="read">Sudah Dibaca</SelectItem>
              </SelectContent>
            </Select>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFilter}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
            >
              <Filter className="h-4 w-4" />
              Filter
            </motion.button>

            <AnimatePresence>
              {selectedIds.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -20 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition-all ml-auto"
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus ({selectedIds.length})
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ═══════ NOTIFICATIONS LIST ═══════ */}
        <motion.div variants={itemVariants}>
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-neutral-900 dark:text-white text-lg">Daftar Notifikasi</h2>
              <p className="text-xs text-neutral-500">{notifications.data.length} notifikasi ditemukan</p>
            </div>
          </div>

          {/* Notification Cards */}
          <div className="space-y-4">
            <AnimatePresence>
              {notifications.data.map((notification, index) => {
                const TypeIcon = getTypeIcon(notification.type);
                const typeColor = getTypeColor(notification.type);

                // Border color based on type
                const borderAccent = (() => {
                  switch (notification.type) {
                    case 'reminder': return 'border-l-blue-500';
                    case 'announcement': return 'border-l-purple-500';
                    case 'alert': return 'border-l-red-500';
                    case 'achievement': return 'border-l-emerald-500';
                    case 'warning': return 'border-l-amber-500';
                    default: return 'border-l-indigo-500';
                  }
                })();

                // Type label
                const typeLabel = (() => {
                  switch (notification.type) {
                    case 'reminder': return 'Reminder';
                    case 'announcement': return 'Pengumuman';
                    case 'alert': return 'Alert';
                    case 'achievement': return 'Achievement';
                    case 'warning': return 'Peringatan';
                    default: return 'Info';
                  }
                })();

                const isUnread = !notification.read_at;

                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                    transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 24 }}
                    whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
                    className={cn(
                      'group relative overflow-hidden rounded-2xl border-l-4 bg-white/60 shadow-md backdrop-blur-xl transition-all hover:shadow-xl dark:bg-neutral-900/60',
                      borderAccent,
                      isUnread
                        ? 'border border-blue-100 dark:border-blue-900/30 ring-1 ring-blue-500/10'
                        : 'border border-white/20 dark:border-neutral-800',
                    )}
                  >
                    {/* Unread glow effect */}
                    {isUnread && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/5 to-transparent pointer-events-none" />
                    )}

                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <div className="pt-1">
                          <Checkbox
                            checked={selectedIds.includes(notification.id)}
                            onCheckedChange={(checked) => {
                              setSelectedIds(prev =>
                                checked
                                  ? [...prev, notification.id]
                                  : prev.filter(id => id !== notification.id)
                              );
                            }}
                          />
                        </div>

                        {/* Type Icon with glow */}
                        <div className="relative">
                          <div className={cn(
                            'relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg transition-transform group-hover:scale-110',
                            typeColor,
                          )}>
                            <TypeIcon className="h-6 w-6 text-white" />
                          </div>
                          <div className={cn(
                            'absolute inset-0 rounded-2xl bg-gradient-to-br blur-lg opacity-30 group-hover:opacity-50 transition-opacity',
                            typeColor,
                          )} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Title row */}
                          <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                            <h3 className={cn(
                              'font-bold text-[15px]',
                              isUnread ? 'text-neutral-900 dark:text-white' : 'text-neutral-700 dark:text-neutral-300',
                            )}>
                              {notification.title}
                            </h3>
                            {getPriorityBadge(notification.priority)}
                            {isUnread ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                                Baru
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                                <Eye className="h-3 w-3" />
                                Dibaca
                              </span>
                            )}
                            {notification.scheduled_at && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20">
                                <Clock className="h-3 w-3" />
                                Terjadwal
                              </span>
                            )}
                          </div>

                          {/* Message */}
                          <p className={cn(
                            'text-sm mb-3 leading-relaxed line-clamp-2',
                            isUnread ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-500 dark:text-neutral-400',
                          )}>
                            {notification.message}
                          </p>

                          {/* Metadata row */}
                          <div className="flex items-center gap-4 text-xs text-neutral-500">
                            <span className="inline-flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              {new Date(notification.created_at).toLocaleString('id-ID', {
                                day: 'numeric', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </span>
                            {notification.target_type && (
                              <span className="inline-flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5" />
                                {notification.target_type === 'mahasiswa' ? 'Mahasiswa' : notification.target_type === 'dosen' ? 'Dosen' : notification.target_type}
                              </span>
                            )}
                            <span className={cn(
                              'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium',
                              notification.type === 'alert' || notification.type === 'warning'
                                ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
                            )}>
                              <TypeIcon className="h-3 w-3" />
                              {typeLabel}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              if (confirm('Hapus notifikasi ini?')) {
                                router.delete(`/admin/notification-center/${notification.id}`);
                              }
                            }}
                            className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all shadow-sm"
                            title="Hapus notifikasi"
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Empty State */}
            {notifications.data.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl p-16 text-center"
              >
                <div className="relative inline-block mb-6">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative z-10"
                  >
                    <div className="flex h-24 w-24 mx-auto items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-2 border-dashed border-blue-200 dark:border-blue-800">
                      <Bell className="h-12 w-12 text-blue-400/50" />
                    </div>
                  </motion.div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-2 rounded-full bg-black/5 dark:bg-white/5 blur-sm" />
                </div>
                <p className="text-neutral-800 dark:text-neutral-300 font-bold text-lg mb-1">Tidak ada notifikasi</p>
                <p className="text-neutral-500 text-sm max-w-xs mx-auto">Belum ada notifikasi yang cocok dengan filter. Buat notifikasi baru untuk memulai.</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Pagination */}
        {notifications.last_page > 1 && (
          <div className="flex justify-center gap-2">
            {notifications.links.map((link: any, i: number) => (
              <motion.button
                key={i}
                whileHover={{ scale: link.url ? 1.05 : 1 }}
                whileTap={{ scale: link.url ? 0.95 : 1 }}
                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                disabled={!link.url}
                className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  link.active
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                    : link.url
                      ? 'bg-white/60 text-neutral-600 hover:bg-white/80 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700'
                      : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-400 cursor-not-allowed'
                )}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
