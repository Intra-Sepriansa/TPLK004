import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { 
  Bell, Send, Users, Mail, MessageSquare, 
  Smartphone, Eye, MousePointer, Plus, Filter, Trash2, CheckCircle, Clock, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

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

export default function NotificationCenter({ notifications, stats, filters, mahasiswaCount, dosenCount }: NotificationCenterProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
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
      case 'urgent': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">Urgent</span>;
      case 'high': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">High</span>;
      case 'normal': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">Normal</span>;
      default: return <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-400">Low</span>;
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
      
      <div className="p-6 space-y-6">
        {/* Header dengan animasi masuk */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-black p-8 text-white shadow-2xl border border-slate-700/50"
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-purple-500/10 blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, -90, 0],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-indigo-500/10 blur-3xl"
            />
          </div>
          
          <div className="relative">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/50"
                >
                  <Bell className="h-8 w-8" />
                </motion.div>
                <div>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm text-slate-400 font-medium"
                  >
                    Pusat Komunikasi
                  </motion.p>
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent"
                  >
                    Notification Center
                  </motion.h1>
                </div>
              </div>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    Buat Notifikasi
                  </motion.button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-900 to-black border-slate-800">
                  <DialogHeader>
                    <DialogTitle className="text-white">Buat Notifikasi Baru</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-300">Target</label>
                      <Select value={formData.target} onValueChange={(value) => setFormData({ ...formData, target: value })}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800">
                          <SelectItem value="all">Semua Pengguna</SelectItem>
                          <SelectItem value="mahasiswa">Semua Mahasiswa ({mahasiswaCount})</SelectItem>
                          <SelectItem value="dosen">Semua Dosen ({dosenCount})</SelectItem>
                          <SelectItem value="specific">Spesifik</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-300">Judul</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Judul notifikasi"
                        className="bg-slate-800/50 border-slate-700 text-white"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-300">Pesan</label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Isi pesan notifikasi"
                        rows={4}
                        className="bg-slate-800/50 border-slate-700 text-white"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-300">Tipe</label>
                        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                          <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800">
                            <SelectItem value="info">Info</SelectItem>
                            <SelectItem value="reminder">Reminder</SelectItem>
                            <SelectItem value="announcement">Pengumuman</SelectItem>
                            <SelectItem value="alert">Alert</SelectItem>
                            <SelectItem value="warning">Peringatan</SelectItem>
                            <SelectItem value="achievement">Achievement</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-slate-300">Prioritas</label>
                        <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                          <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800">
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-300">Jadwal (Opsional)</label>
                      <Input
                        type="datetime-local"
                        value={formData.scheduled_at}
                        onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                        className="bg-slate-800/50 border-slate-700 text-white"
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                        Batal
                      </Button>
                      <Button type="submit" className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
                        Kirim Notifikasi
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-slate-400"
            >
              Kelola dan kirim notifikasi ke mahasiswa dan dosen
            </motion.p>
          </div>
        </motion.div>

        {/* Stats Cards - 4 atas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Bell, label: 'Total', value: stats.total, color: 'from-purple-500 to-indigo-600', delay: 0.1 },
            { icon: Mail, label: 'Unread', value: stats.unread, color: 'from-blue-500 to-cyan-600', delay: 0.15 },
            { icon: Clock, label: 'Scheduled', value: stats.scheduled, color: 'from-amber-500 to-orange-600', delay: 0.2 },
            { icon: Users, label: 'Recipients', value: mahasiswaCount + dosenCount, color: 'from-emerald-500 to-green-600', delay: 0.25 },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: stat.delay, type: "spring", stiffness: 200 }}
              whileHover={{ 
                scale: 1.05, 
                y: -5,
                transition: { type: "spring", stiffness: 400, damping: 10 }
              }}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-black p-6 shadow-xl border border-slate-800/50 cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="relative flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: stat.delay + 0.1, type: "spring" }}
                    className="text-2xl font-bold text-white"
                  >
                    {stat.value}
                  </motion.p>
                </div>
              </div>
              
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent"
                initial={{ width: "0%", opacity: 0 }}
                whileHover={{ width: "100%", opacity: 0.5 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </div>

        {/* Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-gradient-to-br from-slate-900 to-black p-6 shadow-xl border border-slate-800/50"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
              <Filter className="h-5 w-5 text-white" />
            </div>
            <h2 className="font-semibold text-white text-lg">Filter Notifikasi</h2>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px] bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="Semua Tipe" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800">
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
              <SelectTrigger className="w-[200px] bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800">
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="unread">Belum Dibaca</SelectItem>
                <SelectItem value="read">Sudah Dibaca</SelectItem>
              </SelectContent>
            </Select>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFilter}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
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
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all ml-auto"
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus ({selectedIds.length})
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Notifications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-gradient-to-br from-slate-900 to-black shadow-xl border border-slate-800/50 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <h2 className="font-semibold text-white text-lg">Daftar Notifikasi</h2>
            </div>
          </div>
          <div className="divide-y divide-slate-800">
            <AnimatePresence>
              {notifications.data.map((notification, index) => {
                const TypeIcon = getTypeIcon(notification.type);
                const typeColor = getTypeColor(notification.type);
                
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    whileHover={{ 
                      backgroundColor: "rgba(15, 23, 42, 0.5)",
                      transition: { duration: 0.2 }
                    }}
                    className="p-5 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={selectedIds.includes(notification.id)}
                        onCheckedChange={(checked) => {
                          setSelectedIds(prev => 
                            checked 
                              ? [...prev, notification.id]
                              : prev.filter(id => id !== notification.id)
                          );
                        }}
                        className="mt-1"
                      />
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${typeColor} shadow-lg`}>
                        <TypeIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="font-semibold text-white">{notification.title}</span>
                          {getPriorityBadge(notification.priority)}
                          {notification.read_at ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-400">Dibaca</span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">Baru</span>
                          )}
                          {notification.scheduled_at && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">Terjadwal</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mb-2">{notification.message}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(notification.created_at).toLocaleString('id-ID')}
                          {notification.target_type && ` • Target: ${notification.target_type}`}
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (confirm('Hapus notifikasi ini?')) {
                            router.delete(`/admin/notification-center/${notification.id}`);
                          }
                        }}
                        className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-red-500/50 text-slate-400 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {notifications.data.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-12 text-center"
              >
                <Bell className="h-16 w-16 mx-auto text-slate-700 mb-3" />
                <p className="text-slate-500 font-medium">Tidak ada notifikasi</p>
                <p className="text-slate-600 text-sm mt-1">Buat notifikasi baru untuk memulai</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Pagination */}
        {notifications.last_page > 1 && (
          <div className="flex justify-center gap-2">
            {notifications.links.map((link, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: link.url ? 1.05 : 1 }}
                whileTap={{ scale: link.url ? 0.95 : 1 }}
                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                disabled={!link.url}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  link.active
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                    : link.url
                    ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                }`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
