import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  Bell, Send, Users, Mail, MessageSquare,
  Eye, Plus, Filter, Trash2, CheckCircle, Clock, AlertTriangle,
  Globe, GraduationCap, UserCog, Target, Info, Megaphone, Siren, Trophy, Circle, BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

// Custom Icons
import notifikasiIcon from '@/assets/admin/notification-center/icon-notifikasi.png';
import totalIcon from '@/assets/admin/notification-center/total.png';
import unreadIcon from '@/assets/admin/notification-center/unread.png';
import scheduledIcon from '@/assets/admin/notification-center/scheduled.png';
import recipientsIcon from '@/assets/admin/notification-center/recipients.png';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: string;
  read_at: string | null;
  scheduled_at: string | null;
  created_at: string;
  total_recipients: number;
  read_count: number;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface StatColorConfig {
  from: string;
  to: string;
  shadow: string;
  bg: string;
  hoverShadow: string;
  gradientBg: string;
}

interface NotificationCenterProps {
  notifications: {
    data: Notification[];
    links: PaginationLink[];
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
  visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function NotificationCenter({ notifications, stats, filters, mahasiswaCount, dosenCount }: NotificationCenterProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; mode: 'single' | 'bulk'; id: number | null }>({
    open: false,
    mode: 'single',
    id: null,
  });
  const [typeFilter, setTypeFilter] = useState(filters.type);
  const [statusFilter, setStatusFilter] = useState(filters.status);
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
    setDeleteDialog({ open: true, mode: 'bulk', id: null });
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.mode === 'bulk') {
      if (selectedIds.length === 0) return;
      router.post('/admin/notification-center/bulk-delete', { ids: selectedIds }, {
        onSuccess: () => {
          setSelectedIds([]);
          setDeleteDialog({ open: false, mode: 'single', id: null });
        },
      });
      return;
    }

    if (!deleteDialog.id) return;

    router.delete(`/admin/notification-center/${deleteDialog.id}`, {
      onSuccess: () => setDeleteDialog({ open: false, mode: 'single', id: null }),
    });
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

        {/* ═══════ HEADER — Matching Sesi Absen Style ═══════ */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
        >
          {/* Animated Gradient Background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
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

          {/* Overlay & Glow Orbs */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left w-full">
              <motion.div
                className="relative flex shrink-0 h-24 w-24 sm:h-20 sm:w-20"
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <img src={notifikasiIcon} alt="Notifikasi" className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl" />
              </motion.div>
              <div className="flex-1 mt-1 sm:mt-0">
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-blue-100 font-medium tracking-wide"
                >
                  Pusat Komunikasi
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl sm:text-3xl font-bold"
                >
                  Notification Center
                </motion.h1>
              </div>
            </div>
            <motion.div
              className="w-fit mx-auto md:mx-0 flex justify-center md:justify-end shrink-0"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  type="button"
                  onClick={() => router.get('/admin/weekly-digest')}
                  className="flex w-fit justify-center items-center gap-2 rounded-xl bg-white/20 px-6 py-3.5 text-sm font-semibold hover:bg-white/30 transition-colors backdrop-blur-xl border border-white/20 shadow-lg"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <BookOpen className="h-4 w-4" />
                  Info Pekanan
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => router.get('/admin/notification-center/create')}
                  className="flex w-fit justify-center items-center gap-2 rounded-xl bg-white/20 px-6 py-3.5 text-sm font-semibold hover:bg-white/30 transition-colors backdrop-blur-xl border border-white/20 shadow-lg"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Plus className="h-4 w-4" />
                  Buat Notifikasi
                </motion.button>
              </div>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="relative mt-4 text-blue-100/80 text-center sm:text-left"
          >
            Kelola dan kirim notifikasi ke mahasiswa dan dosen
          </motion.p>
        </motion.div>

        {/* ═══════ STAT CARDS — Dashboard Style ═══════ */}
        <motion.div
          className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.2 } }
          }}
        >
          {[
            { title: 'Total', value: stats.total.toString(), change: 'All time', isUp: true, imgSrc: totalIcon, color: 'purple' },
            { title: 'Unread', value: stats.unread.toString(), change: 'Action needed', isUp: false, imgSrc: unreadIcon, color: 'blue' },
            { title: 'Scheduled', value: stats.scheduled.toString(), change: 'Upcoming', isUp: true, imgSrc: scheduledIcon, color: 'amber' },
            { title: 'Recipients', value: (mahasiswaCount + dosenCount).toString(), change: 'Users', isUp: true, imgSrc: recipientsIcon, color: 'emerald' },
          ].map((stat, i) => {
            const colorConfigs: Record<string, StatColorConfig> = {
              purple: { from: 'from-purple-400', to: 'to-fuchsia-600', shadow: 'shadow-purple-500/30', bg: 'bg-purple-500', hoverShadow: 'hover:shadow-purple-500/10', gradientBg: 'from-purple-500/5 to-fuchsia-500/5 dark:from-purple-500/10 dark:to-fuchsia-500/10' },
              blue: { from: 'from-sky-400', to: 'to-blue-600', shadow: 'shadow-blue-500/30', bg: 'bg-blue-500', hoverShadow: 'hover:shadow-blue-500/10', gradientBg: 'from-blue-500/5 to-sky-500/5 dark:from-blue-500/10 dark:to-sky-500/10' },
              indigo: { from: 'from-indigo-400', to: 'to-violet-600', shadow: 'shadow-indigo-500/30', bg: 'bg-indigo-500', hoverShadow: 'hover:shadow-indigo-500/10', gradientBg: 'from-indigo-500/5 to-violet-500/5 dark:from-indigo-500/10 dark:to-violet-500/10' },
              emerald: { from: 'from-emerald-400', to: 'to-teal-600', shadow: 'shadow-emerald-500/30', bg: 'bg-emerald-500', hoverShadow: 'hover:shadow-emerald-500/10', gradientBg: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10' },
              amber: { from: 'from-amber-400', to: 'to-orange-600', shadow: 'shadow-amber-500/30', bg: 'bg-amber-500', hoverShadow: 'hover:shadow-amber-500/10', gradientBg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10' },
              rose: { from: 'from-rose-400', to: 'to-pink-600', shadow: 'shadow-rose-500/30', bg: 'bg-rose-500', hoverShadow: 'hover:shadow-rose-500/10', gradientBg: 'from-rose-500/5 to-pink-500/5 dark:from-rose-500/10 dark:to-pink-500/10' },
            };
            const colorConfig = colorConfigs[stat.color] || colorConfigs['indigo'];

            return (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.95 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { type: 'spring', stiffness: 100, damping: 15 }
                  }
                }}
                whileHover={{ y: -5, scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-4 sm:p-6 shadow-xl backdrop-blur-xl transition-all ${colorConfig.hoverShadow} dark:border-white/5`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${colorConfig.gradientBg} opacity-50 dark:opacity-100`} />

                <motion.div
                  className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${colorConfig.bg} blur-3xl transition-all opacity-20 group-hover:opacity-40`}
                />

                <div className="relative z-10 flex flex-col items-center sm:items-start gap-4 sm:gap-5 h-full justify-between">
                  <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      className="relative flex shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center transition-transform duration-300"
                    >
                      <img src={stat.imgSrc} alt={stat.title} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]" />
                    </motion.div>
                    <div className="flex flex-col">
                      <h3 className="text-[10px] sm:text-sm font-medium leading-tight text-neutral-500 dark:text-neutral-400 mb-0.5 sm:mb-1">{stat.title}</h3>
                      <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                        <span className="text-xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-none">
                          {stat.value}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1 justify-center sm:justify-start">
                        <div className={`flex items-center gap-0.5 text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-sm border ${stat.isUp
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400'
                          }`}>
                          {stat.isUp ? <ArrowUpRight className="h-2 w-2" /> : <ArrowDownRight className="h-2 w-2" />}
                          {stat.change}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ═══════ FILTER SECTION ═══════ */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl border border-white/20 bg-white/50 p-5 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
              <Filter className="h-5 w-5" />
            </div>
            <h2 className="font-bold text-neutral-900 dark:text-white text-lg">Filter Notifikasi</h2>
          </div>
          {/* Filter Controls Row */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[200px] bg-white/60 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white">
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
              <SelectTrigger className="w-full sm:w-[200px] bg-white/60 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white">
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
              className="w-full sm:w-auto flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all sm:ml-auto md:ml-0"
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
                  className="w-full sm:w-auto flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition-all sm:ml-auto"
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

                const isUnread = notification.read_count === 0;

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
                            {notification.read_count === notification.total_recipients && notification.total_recipients > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
                                <Eye className="h-3 w-3" />
                                Semua Dibaca
                              </span>
                            ) : notification.read_count > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                                {notification.read_count}/{notification.total_recipients} Dibaca
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-500 ring-1 ring-neutral-200 dark:ring-neutral-700">
                                0/{notification.total_recipients} Dibaca
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
                            <span className="inline-flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5" />
                              {notification.total_recipients} Penerima
                            </span>
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
                            onClick={() => router.get(`/admin/notification-center/${notification.id}`)}
                            className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all shadow-sm"
                            title="Lihat detail notifikasi"
                          >
                            <Eye className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                mode: 'single',
                                id: notification.id,
                              })
                            }
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
            {notifications.links.map((link, i: number) => (
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

        <ConfirmDialog
          open={deleteDialog.open}
          onOpenChange={(open) =>
            setDeleteDialog((prev) => ({
              ...prev,
              open,
              id: open ? prev.id : null,
              mode: open ? prev.mode : 'single',
            }))
          }
          onConfirm={handleConfirmDelete}
          title={deleteDialog.mode === 'bulk' ? 'Hapus Notifikasi Terpilih' : 'Hapus Notifikasi'}
          message={
            deleteDialog.mode === 'bulk'
              ? `Yakin ingin menghapus ${selectedIds.length} notifikasi? Tindakan ini tidak dapat dibatalkan.`
              : 'Yakin ingin menghapus notifikasi ini? Tindakan ini tidak dapat dibatalkan.'
          }
          variant="danger"
          confirmText={deleteDialog.mode === 'bulk' ? 'Ya, Hapus Semua' : 'Ya, Hapus'}
          cancelText="Batal"
        />
      </motion.div>
    </AppLayout >
  );
}
