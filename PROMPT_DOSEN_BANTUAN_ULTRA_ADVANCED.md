# PROMPT: MENU BANTUAN DOSEN - ULTRA ADVANCED

## TUJUAN
Membuat menu Bantuan (Help Center) untuk Dosen (`resources/js/pages/dosen/help.tsx`) dengan UI/UX yang SANGAT SANGAT ADVANCE, mengadopsi style dari menu Uang Kas Admin dengan fitur-fitur komprehensif untuk membantu dosen.

---

## UI/UX REFERENCE - WAJIB IKUTI 100%

### Warna & Gradient (EXACT dari Kas Admin)
```tsx
// Background Header
bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600

// Animated Background Position
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

// Container Cards
rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-xl

// Category Cards dengan Glow Effect
rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl
```

### Animation Variants
```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
  hover: {
    scale: 1.03,
    y: -8,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10,
    },
  },
} as const;
```

---

## STRUKTUR MENU

### 1. HEADER SECTION
- Background: `bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600`
- Animated background position (15s infinite)
- 3 Pulse rings dengan delay
- Icon: `HelpCircle` dengan backdrop-blur
- Title: "Pusat Bantuan Dosen"
- Subtitle: "Temukan jawaban cepat, panduan lengkap, dan dukungan untuk semua kebutuhan Anda"
- Search bar dengan icon dan placeholder: "Cari bantuan, panduan, atau pertanyaan..."

### 2. QUICK STATS (4 Cards)


**Card 1: Total Artikel**
- Icon: `BookOpen` (gradient blue-cyan)
- Value: Total artikel bantuan
- Subtitle: "artikel tersedia"
- Glow color: blue-500

**Card 2: Video Tutorial**
- Icon: `Video` (gradient purple-pink)
- Value: Total video tutorial
- Subtitle: "video panduan"
- Glow color: purple-500

**Card 3: FAQ**
- Icon: `MessageCircle` (gradient orange-amber)
- Value: Total FAQ
- Subtitle: "pertanyaan umum"
- Glow color: orange-500

**Card 4: Ticket Support**
- Icon: `Headphones` (gradient emerald-teal)
- Value: Total ticket aktif
- Subtitle: "tiket dukungan"
- Glow color: emerald-500

### 3. KATEGORI BANTUAN (6 Categories)

**Kategori 1: Panduan Lengkap**
- Icon: `Book` (gradient blue-indigo)
- Badge: "Populer"
- Deskripsi: "Dokumentasi lengkap sistem presensi, manajemen kelas, dan fitur-fitur advanced"
- Jumlah artikel: 25 Artikel
- Rating: 4.8
- Glow color: blue-500

**Kategori 2: Tips & Trik**
- Icon: `Lightbulb` (gradient yellow-orange)
- Badge: "Trending"
- Deskripsi: "Maksimalkan produktivitas dengan tips praktis dan shortcut yang efisien"
- Jumlah artikel: 32 Tips
- Rating: 4.9
- Glow color: yellow-500

**Kategori 3: Keamanan**
- Icon: `Shield` (gradient green-emerald)
- Badge: "Penting"
- Deskripsi: "Panduan lengkap keamanan akun, privasi data, dan best practices"
- Jumlah artikel: 15 Panduan
- Rating: 4.8
- Glow color: green-500

**Kategori 4: Video Tutorial**
- Icon: `PlayCircle` (gradient purple-pink)
- Badge: "Baru"
- Deskripsi: "Tutorial video step-by-step untuk semua fitur sistem"
- Jumlah artikel: 18 Video
- Rating: 4.7
- Glow color: purple-500

**Kategori 5: Troubleshooting**
- Icon: `Wrench` (gradient red-orange)
- Badge: "Pemula"
- Deskripsi: "Solusi cepat untuk masalah umum dan error yang sering terjadi"
- Jumlah artikel: 28 Solusi
- Rating: 4.6
- Glow color: red-500

**Kategori 6: API & Integrasi**
- Icon: `Code` (gradient cyan-blue)
- Badge: "Pro"
- Deskripsi: "Dokumentasi API, webhook, dan integrasi dengan sistem eksternal"
- Jumlah artikel: 12 Docs
- Rating: 4.9
- Glow color: cyan-500

### 4. POPULAR ARTICLES (Top 5)
- List dengan ranking (1-5)
- Icon artikel
- Judul artikel
- Views count
- Rating stars
- Estimated read time
- Hover effect dengan arrow indicator

### 5. FAQ SECTION (Accordion)
- Interactive accordion dengan smooth animation
- Search dalam FAQ
- Categories: Umum, Teknis, Akun, Fitur, Lainnya
- Expand/Collapse all button
- Vote helpful (thumbs up/down)
- "Masih butuh bantuan?" link

### 6. VIDEO TUTORIALS (Grid)
- Thumbnail dengan play button overlay
- Duration badge
- Title & description
- Views count
- Category badge
- Hover effect dengan scale

### 7. CONTACT SUPPORT
- Live Chat button (floating)
- Email support form
- WhatsApp support link
- Phone support
- Support hours indicator
- Average response time

### 8. RECENT UPDATES
- Timeline view
- Update date
- Update title
- Update description
- "What's New" badge
- Link to full changelog

---

## FITUR ULTRA ADVANCED

### 1. Smart Search
```tsx
<motion.div className="relative">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
  <Input
    placeholder="Cari bantuan, panduan, atau pertanyaan..."
    className="pl-12 pr-4 py-3 rounded-xl"
  />
  // Auto-suggest dropdown
  // Recent searches
  // Popular searches
  // Search by category
  // Keyboard shortcuts (Cmd+K)
</motion.div>
```

### 2. Article Detail Modal
**Modal Header:**
- Gradient background
- Article title
- Category badge
- Author info
- Published date
- Read time
- Share buttons

**Modal Content:**
- Rich text content
- Code blocks dengan syntax highlighting
- Images dengan lightbox
- Videos embedded
- Table of contents (sticky sidebar)
- Related articles
- Helpful vote buttons
- Comment section

### 3. Video Player Modal
- Custom video player
- Playback speed control
- Quality selector
- Fullscreen mode
- Transcript/Subtitles
- Chapters/Timestamps
- Related videos
- Download option

### 4. Interactive FAQ
```tsx
<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>
      <div className="flex items-center gap-3">
        <HelpCircle className="h-5 w-5" />
        <span>Pertanyaan FAQ</span>
      </div>
    </AccordionTrigger>
    <AccordionContent>
      // Answer content
      // Helpful buttons
      // Related FAQs
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

### 5. Support Ticket System
**Create Ticket Modal:**
- Subject input
- Category dropdown (Bug, Feature Request, Question, Other)
- Priority selector (Low, Medium, High, Urgent)
- Description textarea dengan rich text
- File attachments (drag & drop)
- Screenshot tool
- Submit button

**Ticket List:**
- Status badges (Open, In Progress, Resolved, Closed)
- Priority indicators
- Created date
- Last updated
- Assigned to
- Quick actions (View, Reply, Close)

**Ticket Detail:**
- Ticket info header
- Conversation thread
- Reply form
- Status history
- Attachments
- Internal notes (for admin)

### 6. Live Chat Widget
```tsx
<motion.div
  className="fixed bottom-6 right-6 z-50"
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
>
  <Button
    size="lg"
    className="rounded-full h-14 w-14 shadow-2xl"
    onClick={toggleChat}
  >
    <MessageCircle className="h-6 w-6" />
    {unreadCount > 0 && (
      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs">
        {unreadCount}
      </span>
    )}
  </Button>
</motion.div>

// Chat window:
// - Header dengan agent info
// - Message list dengan timestamps
// - Typing indicator
// - File upload
// - Emoji picker
// - Quick replies
// - End chat button
```

### 7. Guided Tours
- Interactive product tours
- Step-by-step walkthroughs
- Spotlight highlights
- Tooltips dengan arrows
- Progress indicator
- Skip/Next/Previous buttons
- "Don't show again" option

### 8. Feedback System
```tsx
<div className="rounded-2xl border p-6">
  <h3>Apakah artikel ini membantu?</h3>
  <div className="flex gap-3 mt-4">
    <Button variant="outline" onClick={handleHelpful}>
      <ThumbsUp className="mr-2 h-4 w-4" />
      Ya, membantu
    </Button>
    <Button variant="outline" onClick={handleNotHelpful}>
      <ThumbsDown className="mr-2 h-4 w-4" />
      Tidak membantu
    </Button>
  </div>
  // Follow-up form jika "Tidak membantu"
  // Thank you message jika "Ya, membantu"
</div>
```

### 9. Knowledge Base Search
- Full-text search
- Filters: Category, Type, Date, Rating
- Sort: Relevance, Popular, Recent, Rating
- Search suggestions
- Search history
- Advanced search operators
- Export search results

### 10. Community Forum (Optional)
- Discussion threads
- Categories & tags
- Upvote/Downvote
- Best answer marking
- User reputation
- Badges & achievements
- Moderation tools

---

## TECHNICAL REQUIREMENTS

### Imports
```tsx
import { Head, router } from '@inertiajs/react';
import DosenLayout from '@/layouts/dosen-layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, BookOpen, Video, MessageCircle, Headphones,
  Book, Lightbulb, Shield, PlayCircle, Wrench, Code,
  Search, Star, ThumbsUp, ThumbsDown, Send, Paperclip,
  Phone, Mail, MessageSquare, Clock, TrendingUp, Zap,
  FileText, Download, Share2, Eye, ChevronRight, X,
  CheckCircle, AlertCircle, Info, ExternalLink
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
import { useState, useEffect } from 'react';
```

### State Management
```tsx
const [searchQuery, setSearchQuery] = useState('');
const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
const [showArticleModal, setShowArticleModal] = useState(false);
const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
const [showVideoModal, setShowVideoModal] = useState(false);
const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
const [showTicketModal, setShowTicketModal] = useState(false);
const [showChatWidget, setShowChatWidget] = useState(false);
const [chatMessages, setChatMessages] = useState<Message[]>([]);
const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
const [hoveredCard, setHoveredCard] = useState<string | null>(null);
```

### Types
```tsx
type Category = {
  id: string;
  name: string;
  icon: string;
  description: string;
  articleCount: number;
  rating: number;
  badge?: string;
  color: string;
};

type Article = {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: Category;
  author: string;
  publishedAt: string;
  readTime: number;
  views: number;
  rating: number;
  helpful: number;
  notHelpful: number;
  tags: string[];
  relatedArticles: Article[];
};

type Video = {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  duration: number;
  views: number;
  category: string;
  transcript?: string;
};

type FAQ = {
  id: number;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  notHelpful: number;
  relatedFAQs: FAQ[];
};

type Ticket = {
  id: number;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
};

type Stats = {
  totalArticles: number;
  totalVideos: number;
  totalFAQs: number;
  activeTickets: number;
};

type Props = {
  categories: Category[];
  popularArticles: Article[];
  faqs: FAQ[];
  recentVideos: Video[];
  stats: Stats;
  tickets: Ticket[];
};
```

---

## KESIMPULAN

Menu Bantuan Dosen ini harus menjadi pusat bantuan yang SANGAT KOMPREHENSIF dengan:

1. **UI/UX Premium:** Glassmorphism design dengan emerald-teal-cyan gradient
2. **6 Kategori Bantuan:** Dengan badges, ratings, dan glow effects
3. **Smart Search:** Auto-suggest, recent searches, keyboard shortcuts
4. **Article System:** Rich content, related articles, helpful votes
5. **Video Tutorials:** Custom player, chapters, transcripts
6. **Interactive FAQ:** Accordion dengan search dan voting
7. **Support Ticket:** Create, track, reply dengan file attachments
8. **Live Chat:** Real-time messaging dengan typing indicator
9. **Guided Tours:** Interactive walkthroughs untuk fitur baru
10. **Feedback System:** Helpful votes dan follow-up forms

**PENTING:**
- Gunakan emerald-teal-cyan gradient untuk header
- Glassmorphism untuk semua cards
- Smooth animations dengan Framer Motion
- Lucide React icons (NO emoji)
- Mobile responsive
- Dark mode support
- Accessibility compliant

**Reference Files:**
- `resources/js/pages/user/kas.tsx` (untuk UI/UX style)
- `resources/js/pages/student/help.tsx` (untuk struktur help center)
- `resources/js/components/ui/accordion.tsx` (untuk FAQ)

Selamat mengimplementasikan! 🚀
