import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import DosenLayout from '@/layouts/dosen-layout';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  HelpCircle, BookOpen, Video, MessageCircle, Headphones,
  Book, Lightbulb, Shield, PlayCircle, Wrench, Code,
  Search, Star, ThumbsUp, ThumbsDown, Send, Paperclip,
  Phone, Mail, MessageSquare, Clock, TrendingUp, Zap,
  FileText, Download, Share2, Eye, ChevronRight, X,
  CheckCircle, AlertCircle, Info, ExternalLink, ArrowRight,
  Menu, Link as LinkIcon, Settings, Image as ImageIcon, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// --- TYPES ---
type Category = { id: string; name: string; icon: any; description: string; articleCount: number; rating: number; badge?: string; color: string; };
type Article = { id: string; title: string; category: string; views: string; rating: number; readTime: string; description: string; difficulty: string; icon: any; };
type VideoItem = { id: string; title: string; duration: string; views: string; category: string; thumbnail: string; desc: string; };
type FAQ = { id: string; question: string; answer: string; category: string; helpful: number; notHelpful: number; };
type Ticket = { id: string; subject: string; description: string; category: string; priority: string; status: string; date: string; };
type Message = { id: string; sender: 'user' | 'agent'; text: string; time: string; };

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
  hover: { scale: 1.03, y: -8, transition: { type: 'spring', stiffness: 400, damping: 10 } },
};

export default function DosenHelp({ auth }: any) {
  // --- STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showChatWidget, setShowChatWidget] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { id: '1', sender: 'agent', text: 'Halo! Ada yang bisa saya bantu hari ini?', time: '09:00' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // --- MOCK DATA ---
  const stats = [
    { id: '1', title: 'Total Artikel', value: '256', sub: 'artikel tersedia', icon: BookOpen, glow: 'bg-blue-500', grad: 'from-blue-500 to-cyan-500' },
    { id: '2', title: 'Video Tutorial', value: '45', sub: 'video panduan', icon: Video, glow: 'bg-purple-500', grad: 'from-purple-500 to-pink-500' },
    { id: '3', title: 'FAQ', value: '128', sub: 'pertanyaan umum', icon: MessageCircle, glow: 'bg-orange-500', grad: 'from-orange-500 to-amber-500' },
    { id: '4', title: 'Ticket Support', value: '3', sub: 'tiket dukungan aktif', icon: Headphones, glow: 'bg-emerald-500', grad: 'from-emerald-500 to-teal-500' }
  ];

  const categories: Category[] = [
    { id: 'c1', name: 'Panduan Lengkap', icon: Book, badge: 'Populer', description: 'Dokumentasi lengkap sistem presensi, manajemen kelas, dan fitur-fitur advanced', articleCount: 25, rating: 4.8, color: 'from-blue-500 to-indigo-500' },
    { id: 'c2', name: 'Tips & Trik', icon: Lightbulb, badge: 'Trending', description: 'Maksimalkan produktivitas dengan tips praktis dan shortcut yang efisien', articleCount: 32, rating: 4.9, color: 'from-yellow-500 to-orange-500' },
    { id: 'c3', name: 'Keamanan', icon: Shield, badge: 'Penting', description: 'Panduan lengkap keamanan akun, privasi data, dan best practices', articleCount: 15, rating: 4.8, color: 'from-green-500 to-emerald-500' },
    { id: 'c4', name: 'Video Tutorial', icon: PlayCircle, badge: 'Baru', description: 'Tutorial video step-by-step untuk semua fitur sistem', articleCount: 18, rating: 4.7, color: 'from-purple-500 to-pink-500' },
    { id: 'c5', name: 'Troubleshooting', icon: Wrench, badge: 'Pemula', description: 'Solusi cepat untuk masalah umum dan error yang sering terjadi', articleCount: 28, rating: 4.6, color: 'from-red-500 to-orange-500' },
    { id: 'c6', name: 'API & Integrasi', icon: Code, badge: 'Pro', description: 'Dokumentasi API, webhook, dan integrasi dengan sistem eksternal', articleCount: 12, rating: 4.9, color: 'from-cyan-500 to-blue-500' },
  ];

  const popularArticles: Article[] = [
    { id: 'a1', icon: Users, title: 'Cara Mengelola Kelas dan Mahasiswa', description: 'Panduan lengkap mengelola kelas, menambah mahasiswa, dan mengatur jadwal perkuliahan', views: '2.8k', rating: 4.9, difficulty: 'Pemula', category: 'Panduan Lengkap', readTime: '5 min' },
    { id: 'a2', icon: FileText, title: 'Membuat dan Mengelola Sesi Absensi', description: 'Tutorial step-by-step membuat sesi absensi dengan QR code, geolocation, dan face recognition', views: '2.1k', rating: 4.8, difficulty: 'Pemula', category: 'Panduan Lengkap', readTime: '7 min' },
    { id: 'a3', icon: Zap, title: 'Fitur Otomatis Approval dan Notifikasi', description: 'Mengatur approval otomatis untuk izin, notifikasi real-time, dan reminder mahasiswa', views: '1.7k', rating: 4.7, difficulty: 'Menengah', category: 'Tips & Trik', readTime: '4 min' },
    { id: 'a4', icon: MessageSquare, title: 'Sistem Notifikasi dan Pengingat Cerdas', description: 'Konfigurasi notifikasi push, email, dan SMS untuk berbagai event penting', views: '1.5k', rating: 4.6, difficulty: 'Menengah', category: 'Keamanan', readTime: '6 min' },
    { id: 'a5', icon: Shield, title: 'Keamanan Akun dan Verifikasi 2FA', description: 'Mengaktifkan two-factor authentication dan mengamankan akun dari akses tidak sah', views: '1.3k', rating: 4.9, difficulty: 'Pro', category: 'Keamanan', readTime: '3 min' },
  ];

  const videos: VideoItem[] = [
    { id: 'v1', title: 'Onboarding Sistem Presensi v2.0', duration: '12:45', views: '4.5k', category: 'Tutorial', desc: 'Pengenalan antarmuka baru dan fitur-fitur unggulan sistem absensi.', thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600&h=350' },
    { id: 'v2', title: 'Manajemen Penilaian Hybrid', duration: '08:20', views: '3.2k', category: 'Tips & Trik', desc: 'Cara efektif melakukan penilaian tugas secara online dan offline.', thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600&h=350' },
    { id: 'v3', title: 'Monitoring Kehadiran Realtime', duration: '05:30', views: '2.1k', category: 'Panduan', desc: 'Memantau presensi mahasiswa kelas besar menggunakan dashboard live.', thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600&h=350' },
  ];

  const faqs: FAQ[] = [
    { id: 'q1', category: 'Umum', question: 'Bagaimana cara reset password akun saya?', answer: 'Anda dapat mereset password melalui halaman profil, pilih menu keamanan, lalu klik "Ubah Password". Sistem akan mengirimkan OTP ke email terdaftar Anda.', helpful: 145, notHelpful: 2 },
    { id: 'q2', category: 'Absensi', question: 'Mengapa QR Code absensi tidak bisa di-scan mahasiswa?', answer: 'Pastikan fitur "Dynamic QR" tidak berkedip terlalu cepat (cek Pengaturan Sesi), dan pastikan mahasiswa menggunakan aplikasi versi terbaru. Anda juga bisa memperbesar QR code dengan klik ikon full-screen.', helpful: 89, notHelpful: 5 },
    { id: 'q3', category: 'Tugas', question: 'Apakah saya bisa menerima tugas lebih dari deadline?', answer: 'Ya, pada menu pengaturan tugas terkait, aktifkan toogle "Beri toleransi keterlambatan" dan tentukan batas waktu tambahan (misal: 24 jam).', helpful: 210, notHelpful: 1 },
  ];

  // --- HANDLERS ---
  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages([...chatMessages, { id: Date.now().toString(), sender: 'user', text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setChatInput('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, { id: Date.now().toString(), sender: 'agent', text: 'Terima kasih atas pesan Anda. Agen kami akan segera merespons.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1000);
  };

  return (
    <DosenLayout>
      <Head title="Pusat Bantuan" />
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-4 md:p-8 space-y-8 md:space-y-12 max-w-7xl mx-auto pb-32">

        {/* 1. HEADER SECTION (EXACT Admin Kas gradient req) */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-14 text-white shadow-2xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-600 border border-white/20 mx-auto w-full">
          {/* Animated Grain Noise Background */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

          {/* Pulsating Rings & Floating Orbs */}
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute -right-20 -top-20 h-[500px] w-[500px] rounded-full bg-white/20 blur-3xl pointer-events-none" />
          <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
            <motion.div whileHover={{ scale: 1.1, rotate: 10 }} transition={{ type: "spring", stiffness: 300, damping: 15 }} className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl ring-4 ring-white/10">
              <HelpCircle className="h-10 w-10 text-white drop-shadow-md" />
            </motion.div>
            <div>
              <p className="font-semibold tracking-wider text-fuchsia-100 uppercase text-xs md:text-sm mb-1 drop-shadow-sm">Panduan Sistem</p>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg mb-4">Pusat Bantuan Dosen</h1>
              <p className="md:text-lg text-fuchsia-50 max-w-2xl drop-shadow-md font-medium mx-auto">Temukan jawaban cepat, panduan lengkap, dan dukungan untuk semua kebutuhan Anda</p>
            </div>
            {/* Smart Search */}
            <motion.div className="relative w-full max-w-2xl mx-auto mt-4 shadow-2xl rounded-2xl" whileHover={{ scale: 1.02 }}>
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-fuchsia-600/50" />
              </div>
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari bantuan, panduan, atau ketik pertanyaan Anda (Cmd+K)..." className="pl-14 pr-32 py-8 text-lg rounded-2xl bg-white/95 text-gray-900 border-none placeholder:text-gray-400 focus-visible:ring-4 ring-white/40" />
              <div className="absolute inset-y-0 right-3 flex items-center">
                <Button className="bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 rounded-xl px-6 py-5 shadow-lg shadow-purple-500/30">Cari</Button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* 2. QUICK STATS (4 Cards) */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(stat => (
            <motion.div key={stat.id} variants={cardVariants} whileHover="hover"
              onHoverStart={() => setHoveredCard(stat.id)} onHoverEnd={() => setHoveredCard(null)}
              className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all dark:border-white/5">
              <motion.div animate={{ scale: hoveredCard === stat.id ? 1.5 : 1, opacity: hoveredCard === stat.id ? 0.3 : 0.1 }}
                className={cn("absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl transition-all duration-500", stat.glow)} />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">{stat.title}</p>
                  <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">{stat.value}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.sub}</p>
                </div>
                <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg", stat.grad)}>
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* 3. KATEGORI BANTUAN (6 Categories) */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl"><BookOpen className="h-6 w-6 text-cyan-600 dark:text-cyan-400" /></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Jelajahi Kategori</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <motion.div key={cat.id} variants={cardVariants} whileHover="hover"
                onHoverStart={() => setHoveredCard(cat.id)} onHoverEnd={() => setHoveredCard(null)}
                className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 xl:p-8 shadow-xl backdrop-blur-xl transition-all dark:border-white/5 hover:border-cyan-500/30">
                <motion.div animate={{ scale: hoveredCard === cat.id ? 1.5 : 1, opacity: hoveredCard === cat.id ? 0.15 : 0.05 }}
                  className={`absolute inset-0 bg-gradient-to-br ${cat.color} transition-all duration-500`} />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-5">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.color} shadow-lg ring-4 ring-white/50 dark:ring-black/20 group-hover:scale-110 transition-transform`}>
                      <cat.icon className="h-8 w-8 text-white" />
                    </div>
                    {cat.badge && (
                      <Badge className={cn("px-3 py-1 font-bold shadow-sm", cat.badge === 'Populer' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : cat.badge === 'Trending' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-green-100 text-green-700 hover:bg-green-200')}>
                        {cat.badge}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{cat.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-2">{cat.description}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-gray-800/50">
                    <span className="text-sm font-semibold text-gray-500">{cat.articleCount} Artikel</span>
                    <div className="flex items-center gap-1.5 text-amber-500 font-bold text-sm bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
                      <Star className="h-4 w-4 fill-amber-500" /> {cat.rating}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 4. POPULAR ARTICLES & 6. VIDEO TUTORIALS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl"><TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400" /></div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Artikel Terpopuler</h2>
              </div>
              <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700">Lihat Semua <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
            <div className="space-y-4">
              {popularArticles.map((article, i) => (
                <motion.div key={article.id} whileHover={{ x: 8, scale: 1.01 }} onClick={() => { setSelectedArticle(article); setShowArticleModal(true); }}
                  className="group flex gap-5 p-5 cursor-pointer rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl hover:border-emerald-500/30 transition-all dark:border-white/5">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 text-emerald-600 dark:text-emerald-400 shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                    <span className="text-xl font-bold absolute -top-2 -left-2 h-6 w-6 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs flex items-center justify-center shadow-md">
                      #{i + 1}
                    </span>
                    <article.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-base font-bold text-gray-900 dark:text-white truncate pr-4 group-hover:text-emerald-600 transition-colors">{article.title}</h4>
                      <Badge variant="outline" className="text-[10px] whitespace-nowrap bg-emerald-50/50">{article.difficulty}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">{article.description}</p>
                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {article.views}</span>
                      <span className="flex items-center gap-1 text-amber-500"><Star className="h-3 w-3 fill-amber-500" /> {article.rating}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {article.readTime}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-xl"><PlayCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" /></div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Video Tutorial</h2>
              </div>
              <Button variant="ghost" className="text-purple-600 hover:text-purple-700">Explore <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
            <div className="grid grid-cols-1 gap-5">
              {videos.map((vid) => (
                <motion.div key={vid.id} whileHover={{ y: -5, scale: 1.02 }} onClick={() => { setSelectedVideo(vid); setShowVideoModal(true); }}
                  className="group cursor-pointer flex gap-4 p-4 rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl transition-all hover:shadow-purple-500/20">
                  <div className="relative h-28 w-40 flex-shrink-0 overflow-hidden rounded-2xl shadow-md">
                    <img src={vid.thumbnail} alt={vid.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/30 backdrop-blur-md shadow-lg group-hover:bg-purple-500 transition-colors">
                        <PlayCircle className="h-5 w-5 text-white fill-white/80" />
                      </div>
                    </div>
                    <Badge className="absolute bottom-2 right-2 py-0.5 px-1.5 text-[10px] bg-black/70 border-none">{vid.duration}</Badge>
                  </div>
                  <div className="flex-1 py-1">
                    <Badge variant="secondary" className="mb-2 text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900/30">{vid.category}</Badge>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-purple-600 transition-colors">{vid.title}</h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-2">
                      <Eye className="h-3 w-3" /> {vid.views} x ditonton
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* 5. INTERACTIVE FAQ SECTION */}
        <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-8 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 text-center md:text-left">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-900/40 text-orange-600 shadow-inner">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pertanyaan Umum (FAQ)</h2>
                <p className="text-sm text-gray-500">Jawaban cepat untuk masalah yang sering ditemui</p>
              </div>
            </div>
            <div className="flex gap-2 justify-center">
              {['Umum', 'Absensi', 'Tugas', 'Teknis'].map(cat => (
                <Badge key={cat} variant={cat === 'Umum' ? 'default' : 'secondary'} className="cursor-pointer hover:bg-emerald-500 hover:text-white px-3 py-1 text-sm">{cat}</Badge>
              ))}
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map(faq => (
              <AccordionItem key={faq.id} value={faq.id} className="border-none bg-white/50 dark:bg-black/20 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50/50 dark:hover:bg-white/5 data-[state=open]:bg-emerald-50/50 dark:data-[state=open]:bg-emerald-900/20 data-[state=open]:text-emerald-600">
                  <div className="flex items-center gap-4 text-left font-bold text-base">
                    <span className="text-emerald-500 font-black">Q.</span>
                    {faq.question}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2 text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                  <div className="pl-8 mb-4 border-l-2 border-emerald-500/30">
                    <span className="font-bold text-emerald-500 mb-2 block">A.</span>
                    {faq.answer}
                  </div>
                  <div className="flex px-8 items-center gap-4 mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                    <span className="font-semibold text-xs text-gray-900 dark:text-white">Apakah jawaban ini membantu?</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-8 rounded-lg border-gray-200 dark:border-gray-700 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"><ThumbsUp className="h-4 w-4 mr-2" /> Ya ({faq.helpful})</Button>
                      <Button size="sm" variant="outline" className="h-8 rounded-lg border-gray-200 dark:border-gray-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"><ThumbsDown className="h-4 w-4 mr-2" /> Tidak ({faq.notHelpful})</Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-8 text-center pt-8 border-t border-gray-200 dark:border-gray-800">
            <p className="text-gray-500 font-medium mb-4">Masih belum menemukan jawaban yang dicari?</p>
            <Button onClick={() => setShowTicketModal(true)} className="bg-gradient-to-r from-gray-900 to-gray-700 hover:from-black hover:to-gray-800 text-white rounded-xl shadow-xl px-8 py-6">
              <Headphones className="h-5 w-5 mr-2" />
              Buat Tiket Dukungan
            </Button>
          </div>
        </motion.div>

        {/* 7. CONTACT SUPPORT */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-3 mb-2 flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 dark:bg-rose-900/30 rounded-xl"><Headphones className="h-6 w-6 text-rose-600 dark:text-rose-400" /></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Hubungi Kami</h2>
          </div>

          <div className="flex flex-col items-center text-center p-8 rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl hover:-translate-y-2 transition-transform">
            <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 shadow-inner"><Mail className="h-8 w-8" /></div>
            <h3 className="font-bold text-lg mb-1">Email Support</h3>
            <p className="text-sm text-gray-500 mb-4">Tanya detail teknis via email</p>
            <a href="mailto:support@tplk004.id" className="font-bold text-blue-600 text-lg">support@tplk004.id</a>
          </div>

          <div className="flex flex-col items-center text-center p-8 rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl hover:-translate-y-2 transition-transform">
            <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-inner"><MessageCircle className="h-8 w-8" /></div>
            <h3 className="font-bold text-lg mb-1">WhatsApp CS</h3>
            <p className="text-sm text-gray-500 mb-4">Respon cepat (Jam 08:00 - 16:00)</p>
            <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 rounded-xl font-bold">Chat Sekarang</Button>
          </div>

          <div className="flex flex-col items-center text-center p-8 rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl hover:-translate-y-2 transition-transform relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">HOTLINE</div>
            <div className="h-16 w-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4 shadow-inner"><Phone className="h-8 w-8" /></div>
            <h3 className="font-bold text-lg mb-1">Telepon Darurat</h3>
            <p className="text-sm text-gray-500 mb-4">24/7 Untuk masalah kritikal</p>
            <a href="tel:1500444" className="font-bold text-rose-600 text-xl tracking-wider">1500-444</a>
          </div>
        </motion.div>
      </motion.div>

      {/* 6. LIVE CHAT WIDGET (Floating) */}
      <motion.div className="fixed bottom-6 right-6 z-50 flex flex-col items-end" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1, type: 'spring' }}>
        <AnimatePresence>
          {showChatWidget && (
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="mb-4 w-[350px] bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col h-[500px]">

              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-10 w-10 flex items-center justify-center bg-white/20 rounded-full border border-white/30 backdrop-blur-sm"><Zap className="h-5 w-5 fill-yellow-400 text-yellow-500" /></div>
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 border-2 border-emerald-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Tim Support (Live)</h4>
                    <p className="text-[10px] text-emerald-100">Membalas dalam waktu &lt; 3 mnt</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="hover:bg-white/20 text-white rounded-full h-8 w-8" onClick={() => setShowChatWidget(false)}><X className="h-4 w-4" /></Button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-neutral-950 space-y-4">
                <div className="text-center text-[10px] text-gray-400 my-2 font-medium bg-gray-100 dark:bg-gray-800 py-1 rounded-full w-max mx-auto px-3">HARI INI</div>
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${msg.sender === 'user' ? 'bg-emerald-500 text-white rounded-tr-sm' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm border border-gray-100 dark:border-none'}`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 mx-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-white dark:bg-neutral-900 border-t border-gray-100 dark:border-gray-800">
                <div className="relative flex items-center">
                  <Button variant="ghost" size="icon" className="absolute left-1 text-gray-400 hover:text-emerald-500"><Paperclip className="h-4 w-4" /></Button>
                  <Input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendChat()} placeholder="Ketik pesan..." className="pl-10 pr-12 py-5 rounded-full bg-gray-50 dark:bg-neutral-800 border-none focus-visible:ring-emerald-500/30" />
                  <Button onClick={handleSendChat} size="icon" className="absolute right-1 h-8 w-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-md"><Send className="h-4 w-4" /></Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button onClick={() => setShowChatWidget(!showChatWidget)} className="rounded-full h-16 w-16 shadow-[0_10px_40px_-10px_rgba(16,185,129,0.8)] bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-110 transition-transform p-0 relative">
          <MessageCircle className="h-7 w-7 text-white" />
          <span className="absolute top-0 right-0 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[9px] font-bold text-white items-center justify-center">1</span>
          </span>
        </Button>
      </motion.div>

      {/* --- MODALS --- */}

      {/* Support Ticket Modal */}
      <Dialog open={showTicketModal} onOpenChange={setShowTicketModal}>
        <DialogContent className="sm:max-w-2xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-neutral-900">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white relative overflow-hidden">
            <div className="absolute -right-20 -top-20 h-40 w-40 bg-white/5 rounded-full blur-2xl" />
            <h2 className="text-2xl font-bold flex items-center gap-3"><Headphones className="h-6 w-6 text-emerald-400" /> Buat Tiket Dukungan</h2>
            <p className="text-gray-400 mt-2 text-sm">Tim teknis kami akan segera menangani laporan Anda maksimal 1x24 jam.</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Kategori Masalah</label>
              <Select defaultValue="bug">
                <SelectTrigger className="w-full rounded-xl border-gray-200 dark:border-gray-800 focus:ring-emerald-500 h-12">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug / Error Aplikasi</SelectItem>
                  <SelectItem value="feature">Permintaan Fitur Baru</SelectItem>
                  <SelectItem value="account">Akses Akun / Login</SelectItem>
                  <SelectItem value="data">Perbaikan Data / Nilai</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Subjek</label>
              <Input placeholder="Contoh: QR Code absensi tidak merespon saat di scan mahasiswa" className="rounded-xl border-gray-200 dark:border-gray-800 focus-visible:ring-emerald-500 h-12" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Deskripsi Detail</label>
              <Textarea placeholder="Jelaskan secara rinci kronologi masalah yang Anda alami..." className="min-h-[120px] rounded-xl border-gray-200 dark:border-gray-800 focus-visible:ring-emerald-500 resize-none p-4" />
            </div>
            <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 hover:bg-emerald-50 dark:bg-neutral-900 dark:hover:bg-emerald-900/10 transition-colors cursor-pointer group">
              <div className="flex flex-col items-center">
                <ImageIcon className="h-8 w-8 text-gray-400 group-hover:text-emerald-500 mb-2 transition-colors" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Klik atau Drag & Drop gambar screenshot masalah disini (Opsional)</p>
              </div>
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowTicketModal(false)} className="rounded-xl px-6">Batal</Button>
              <Button onClick={() => setShowTicketModal(false)} className="rounded-xl px-8 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"><Send className="h-4 w-4 mr-2" /> Kirim Tiket</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Article Detail Modal (RICH UI) */}
      <Dialog open={showArticleModal} onOpenChange={setShowArticleModal}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] rounded-[2.5rem] p-0 overflow-y-auto border-none shadow-2xl bg-white dark:bg-neutral-950 scrollbar-hide">
          {selectedArticle && (
            <>
              <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-10 md:p-14 text-white relative">
                <div className="absolute top-6 right-6 flex gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full bg-black/20 hover:bg-black/40 text-white border border-white/10"><Share2 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="rounded-full bg-black/20 hover:bg-black/40 text-white border border-white/10"><Download className="h-4 w-4" /></Button>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-none backdrop-blur-md mb-6">{selectedArticle.category}</Badge>
                <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight drop-shadow-lg">{selectedArticle.title}</h1>
                <div className="flex items-center gap-6 text-emerald-50 font-medium">
                  <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {selectedArticle.readTime} Read</span>
                  <span className="flex items-center gap-2"><Eye className="h-4 w-4" /> {selectedArticle.views} Views</span>
                  <span className="flex items-center gap-2 text-yellow-300"><Star className="h-4 w-4 fill-yellow-300" /> {selectedArticle.rating} / 5.0</span>
                </div>
              </div>
              <div className="p-10 md:p-14 md:flex gap-12">
                <div className="flex-1 space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                  <p className="text-xl font-medium text-gray-900 dark:text-white border-l-4 border-emerald-500 pl-4 py-1">{selectedArticle.description}</p>
                  <p>Mengelola kelas dan absensi menggunakan sistem digital membutuhkan pemahaman dasar mengenai alur kerja aplikasi. Pada artikel ini, kita akan membahas secara tuntas langkah apa saja yang harus dipersiapkan sebelum memulai sesi perkuliahan.</p>

                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-10">Langkah 1: Persiapan Kelas</h3>
                  <p>Pastikan data mahasiswa di menu <code>Mahasiswa & Kelas</code> sudah sinkron dengan data PDDikti atau SIAKAD Universitas. Jika ada ketidaksesuaian, gunakan fitur <strong>"Sinkronisasi Data"</strong> di panel pengaturan kelas.</p>

                  <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-900/50 flex gap-4 my-8">
                    <Info className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                    <div className="text-sm">
                      <span className="font-bold text-emerald-800 dark:text-emerald-400 block mb-1">Catatan Penting</span>
                      Hanya admin prodi yang dapat menambahkan atau menghapus mahasiswa dari kelas reguler. Dosen ditugaskan sebagai validator.
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Tips Keamanan</h3>
                  <ul className="space-y-3 list-disc pl-6 marker:text-emerald-500">
                    <li>Jangan bagikan QR code absensi di grup chat (WA/Telegram) untuk mencegah kecurangan absen jarak jauh.</li>
                    <li>Gunakan fitur "Dynamic QR" dengan refresh rate 5 detik.</li>
                    <li>Aktifkan validasi lokasi geografis dengan radius 50 meter dari ruangan.</li>
                  </ul>
                </div>
                <div className="w-full md:w-72 flex-shrink-0 space-y-8 mt-10 md:mt-0">
                  <div className="bg-gray-50 dark:bg-neutral-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 sticky top-6">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4">Daftar Isi</h4>
                    <ul className="space-y-3 text-sm font-medium text-gray-500">
                      <li className="text-emerald-600 dark:text-emerald-400 border-l-2 border-emerald-500 pl-3">Persiapan Kelas</li>
                      <li className="hover:text-gray-900 border-l-2 border-transparent pl-3 cursor-pointer">Memulai Sesi Baru</li>
                      <li className="hover:text-gray-900 border-l-2 border-transparent pl-3 cursor-pointer">Validasi Kehadiran Manual</li>
                      <li className="hover:text-gray-900 border-l-2 border-transparent pl-3 cursor-pointer">Export Rekapan</li>
                    </ul>

                    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                      <p className="font-bold text-gray-900 dark:text-white mb-4 text-center">Apakah artikel ini membantu?</p>
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline" className="flex-1 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300"><ThumbsUp className="h-4 w-4 mr-2" /> Ya</Button>
                        <Button variant="outline" className="flex-1 rounded-xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300"><ThumbsDown className="h-4 w-4 mr-2" /> Tidak</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Video Modal (Custom Player Mockup) */}
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent className="sm:max-w-5xl rounded-3xl p-0 overflow-hidden border-none shadow-[0_0_100px_rgba(168,85,247,0.2)] bg-black">
          {selectedVideo && (
            <div className="flex flex-col">
              {/* Fake Video Player View */}
              <div className="w-full aspect-video bg-gray-900 relative group cursor-pointer">
                <img src={selectedVideo.thumbnail} alt="Video" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-20 w-20 bg-purple-600/90 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.8)] scale-110 group-hover:scale-125 transition-transform duration-300">
                    <PlayCircle className="h-10 w-10 text-white fill-white" />
                  </div>
                </div>
                {/* Fake Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden mb-4 cursor-pointer">
                    <div className="h-full w-1/3 bg-purple-500 relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 bg-white rounded-full shadow-lg" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-white">
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="icon" className="hover:bg-white/20"><PlayCircle className="h-6 w-6" /></Button>
                      <span className="text-xs font-medium font-mono">03:45 / {selectedVideo.duration}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Settings className="h-5 w-5 opacity-80 hover:opacity-100 cursor-pointer" />
                      <Badge className="bg-purple-600 text-[10px] rounded hover:bg-purple-700 cursor-pointer">HD 1080p</Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-8">
                <Badge variant="secondary" className="mb-4 bg-purple-100 text-purple-700 dark:bg-purple-900/30 font-bold">{selectedVideo.category}</Badge>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{selectedVideo.title}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-500 font-medium mb-6">
                  <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {selectedVideo.views} Ditonton</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Dipublikasikan 2 minggu lalu</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{selectedVideo.desc}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </DosenLayout>
  );
}
