# PROMPT: DETAIL VOTING PENGELUARAN KAS - ADMIN
## Ultra Advanced Implementation dengan Inovasi Signifikan

---

## 🎯 OBJECTIVE
Membuat halaman Detail Voting Pengeluaran Kas yang sangat lengkap dan profesional untuk admin dengan fitur-fitur inovatif untuk monitoring voting secara real-time, analisis mendalam, manajemen keputusan, dan transparansi penuh.

**File Target**: `resources/js/pages/admin/kas-voting-detail.tsx` (NEW PAGE)  
**Reference**: Dashboard Admin Design System & `resources/js/pages/admin/kas-voting.tsx`

---

## 📋 CURRENT STATE ANALYSIS

### ✅ Yang Sudah Ada di List Page
- Header dengan icon voting kas
- Stats cards (Total, Voting, Disetujui, Ditolak)
- Tab navigation (Semua, Sedang Voting, Disetujui, Ditolak, Ditutup)
- List voting dengan status dan progress
- Modal detail voters
- Modal reject dengan alasan
- Approve/Reject actions

### ❌ Yang Perlu Dibuat (Detail Page)
- Halaman detail voting individual
- Timeline voting activity
- Detailed vote breakdown dengan grafik
- Comment/discussion section
- Vote history & audit trail
- Financial impact analysis
- Related transactions
- Decision reasoning documentation
- Export voting report
- Real-time vote updates

---

## 🎨 DESIGN SYSTEM (100% Match Dashboard Admin)

### Color Palette
```css
/* Primary Gradient */
--gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--gradient-indigo-pink: linear-gradient(to bottom right, #6366f1, #ec4899);

/* Background */
--bg-dark: #0a0a0a;
--bg-card: rgba(255, 255, 255, 0.40);
--bg-card-dark: rgba(23, 23, 23, 0.40);

/* Borders */
--border-light: rgba(255, 255, 255, 0.20);
--border-hover: rgba(255, 255, 255, 0.30);

/* Status Colors */
--open: #3b82f6 (blue);
--approved: #10b981 (emerald);
--rejected: #ef4444 (red);
--closed: #64748b (slate);
```

### Typography
- Heading 1: `text-2xl sm:text-3xl font-bold`
- Heading 2: `text-xl font-bold`
- Body: `text-sm leading-relaxed`
- Caption: `text-xs text-slate-500`

---

## 🚀 INOVASI FITUR SIGNIFIKAN

### 1. REAL-TIME VOTING DASHBOARD


#### Fitur:
- **Live Vote Counter**: Counter yang update real-time saat ada vote baru
- **Vote Progress Animation**: Animasi progress bar yang smooth
- **Active Voters Indicator**: Menunjukkan siapa yang sedang melihat halaman
- **Vote Velocity**: Kecepatan voting (votes per hour)
- **Predicted Outcome**: Prediksi hasil berdasarkan trend voting
- **Time Remaining**: Countdown timer sampai deadline

#### Implementation:
```typescript
// State untuk real-time monitoring
const [liveVotes, setLiveVotes] = useState(voting.stats);
const [activeViewers, setActiveViewers] = useState<string[]>([]);
const [voteVelocity, setVoteVelocity] = useState(0);

// Auto refresh setiap 10 detik
useEffect(() => {
    const interval = setInterval(() => {
        router.reload({ only: ['voting'] });
    }, 10000);
    return () => clearInterval(interval);
}, []);

// Calculate vote velocity
useEffect(() => {
    const recentVotes = voting.votes.filter(v => {
        const voteTime = new Date(v.created_at);
        const hourAgo = new Date(Date.now() - 3600000);
        return voteTime > hourAgo;
    });
    setVoteVelocity(recentVotes.length);
}, [voting.votes]);
```

### 2. ADVANCED VOTE ANALYTICS

#### Fitur:
- **Vote Distribution Chart**: Pie chart/donut chart untuk visualisasi
- **Vote Timeline**: Timeline kapan setiap vote masuk
- **Voting Pattern Analysis**: Analisis pola voting (pagi/siang/malam)
- **Demographic Breakdown**: Breakdown berdasarkan angkatan/kelas
- **Influence Score**: Skor pengaruh voter (berdasarkan partisipasi)
- **Consensus Level**: Tingkat konsensus (seberapa bulat keputusan)

#### Metrics:
- Approval rate
- Rejection rate
- Participation rate
- Average response time
- Peak voting hours
- Consensus score (0-100)

### 3. INTERACTIVE VOTE BREAKDOWN

#### Fitur:
- **Voter List dengan Filter**: Filter by vote type, time, class
- **Voter Profile Cards**: Card untuk setiap voter dengan detail
- **Vote Comments**: Komentar/alasan dari setiap voter
- **Vote Change History**: Riwayat jika voter mengubah vote
- **Voter Engagement Score**: Skor keterlibatan voter
- **Search Voters**: Cari voter berdasarkan nama/NIM

### 4. DECISION MANAGEMENT SYSTEM

#### Fitur:
- **Decision Timeline**: Timeline keputusan admin
- **Decision Reasoning**: Dokumentasi alasan keputusan
- **Alternative Actions**: Opsi alternatif selain approve/reject
- **Conditional Approval**: Setujui dengan syarat tertentu
- **Partial Approval**: Setujui sebagian jumlah
- **Defer Decision**: Tunda keputusan dengan alasan

#### Implementation:
```typescript
// Decision options
const decisionOptions = [
    { value: 'approve', label: 'Setujui Penuh', icon: CheckCircle, color: 'emerald' },
    { value: 'approve_partial', label: 'Setujui Sebagian', icon: CheckCircle2, color: 'blue' },
    { value: 'approve_conditional', label: 'Setujui Bersyarat', icon: AlertCircle, color: 'amber' },
    { value: 'defer', label: 'Tunda Keputusan', icon: Clock, color: 'slate' },
    { value: 'reject', label: 'Tolak', icon: XCircle, color: 'red' },
];
```

### 5. FINANCIAL IMPACT ANALYSIS

#### Fitur:
- **Budget Impact**: Dampak terhadap saldo kas
- **Historical Comparison**: Perbandingan dengan pengeluaran serupa
- **Category Spending**: Total spending per kategori
- **Budget Forecast**: Proyeksi saldo setelah pengeluaran
- **Alternative Suggestions**: Saran alternatif yang lebih murah
- **Cost Breakdown**: Breakdown detail biaya

### 6. DISCUSSION & COLLABORATION

#### Fitur:
- **Admin Notes**: Catatan internal admin
- **Discussion Thread**: Thread diskusi untuk admin
- **Mention System**: Mention admin lain untuk input
- **File Attachments**: Lampiran dokumen pendukung
- **Decision Poll**: Polling keputusan antar admin
- **Notification System**: Notifikasi untuk stakeholder

### 7. AUDIT TRAIL & TRANSPARENCY

#### Fitur:
- **Complete Activity Log**: Log semua aktivitas
- **Change History**: Riwayat perubahan status
- **Admin Actions Log**: Log aksi admin
- **Voter Activity**: Aktivitas setiap voter
- **Export Audit Report**: Export laporan audit
- **Transparency Score**: Skor transparansi proses

---

## 📱 STRUKTUR HALAMAN LENGKAP

### HEADER SECTION (Enhanced - NO Container, NO Floating Animation)


```tsx
{/* Header - NO CONTAINER on Icon, NO Floating Animation */}
<motion.div
    variants={iV}
    className="relative overflow-hidden rounded-3xl p-5 text-white shadow-2xl sm:p-6 md:p-8"
>
    {/* Background Gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
    
    {/* Decorative Elements */}
    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
    <div className="absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-white/5 blur-2xl" />

    <div className="relative z-10">
        {/* Back Button - Consistent Style */}
        <motion.button
            whileHover={{ scale: 1.02, x: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.visit('/admin/kas-voting')}
            className="mb-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white"
        >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Voting
        </motion.button>

        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            {/* Left: Title & Info */}
            <div className="flex w-full flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left lg:w-auto">
                {/* Icon - NO CONTAINER, NO FLOATING ANIMATION */}
                <motion.div
                    className="relative h-16 w-16 shrink-0 sm:h-20 sm:w-20"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                    <img
                        src={VotingKasIcon}
                        alt="Detail Voting"
                        className="h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                    />
                </motion.div>

                <div className="flex-1">
                    {/* Status Badge */}
                    <div className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                        <span className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase',
                            voting.status === 'open' && 'bg-blue-100 text-blue-700',
                            voting.status === 'approved' && 'bg-emerald-100 text-emerald-700',
                            voting.status === 'rejected' && 'bg-red-100 text-red-700',
                            voting.status === 'closed' && 'bg-slate-100 text-slate-700'
                        )}>
                            <StatusIcon className="h-3.5 w-3.5" />
                            {statusLabel}
                        </span>
                        <span className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold',
                            categoryConfig.color
                        )}>
                            <span>{categoryConfig.icon}</span>
                            {categoryConfig.label}
                        </span>
                        {voting.is_expired && voting.status === 'open' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                                <Clock className="h-3 w-3" /> Expired
                            </span>
                        )}
                    </div>

                    <h1 className="text-2xl font-bold sm:text-3xl">{voting.title}</h1>
                    
                    {/* Amount */}
                    <motion.p
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="mt-2 bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-3xl font-black text-transparent"
                    >
                        {formatCurrency(voting.amount)}
                    </motion.p>

                    {/* Meta Info */}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-purple-100">
                        <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {voting.creator?.nama || 'Unknown'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {voting.created_at}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Deadline: {voting.voting_deadline}
                        </span>
                    </div>
                </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                {voting.status === 'open' && (
                    <>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                onClick={() => setApproveDialogOpen(true)}
                                className="rounded-xl bg-emerald-500 text-white hover:bg-emerald-600"
                            >
                                <CheckCircle className="mr-2 h-4 w-4" /> Setujui
                            </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                onClick={() => setRejectDialogOpen(true)}
                                className="rounded-xl bg-red-500 text-white hover:bg-red-600"
                            >
                                <XCircle className="mr-2 h-4 w-4" /> Tolak
                            </Button>
                        </motion.div>
                    </>
                )}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        onClick={() => setExportDialogOpen(true)}
                        className="rounded-xl border border-white/20 bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
                    >
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                </motion.div>
            </div>
        </div>
    </div>
</motion.div>
```

### QUICK STATS SECTION (Enhanced with Real-time Data)

```tsx
{/* Quick Stats - Icon colors match container colors */}
<motion.div variants={iV} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
    {[
        {
            label: 'Total Votes',
            value: voting.stats.total,
            icon: UsersIcon,
            cardClass: 'border-blue-300/40 bg-blue-100/55 dark:border-blue-500/30 dark:bg-blue-900/20',
            valueClass: 'text-blue-700 dark:text-blue-200',
            iconFilter: 'drop-shadow-[0_8px_14px_rgba(59,130,246,0.35)]',
        },
        {
            label: 'Setuju',
            value: voting.stats.approve,
            icon: ThumbsUpIcon,
            cardClass: 'border-emerald-300/45 bg-emerald-100/55 dark:border-emerald-500/30 dark:bg-emerald-900/20',
            valueClass: 'text-emerald-700 dark:text-emerald-200',
            iconFilter: 'drop-shadow-[0_8px_14px_rgba(16,185,129,0.35)]',
        },
        {
            label: 'Tolak',
            value: voting.stats.reject,
            icon: ThumbsDownIcon,
            cardClass: 'border-red-300/45 bg-red-100/55 dark:border-red-500/30 dark:bg-red-900/20',
            valueClass: 'text-red-700 dark:text-red-200',
            iconFilter: 'drop-shadow-[0_8px_14px_rgba(239,68,68,0.35)]',
        },
        {
            label: 'Approval Rate',
            value: `${voting.stats.approval_percentage}%`,
            icon: PercentIcon,
            cardClass: 'border-violet-300/45 bg-violet-100/55 dark:border-violet-500/30 dark:bg-violet-900/20',
            valueClass: 'text-violet-700 dark:text-violet-200',
            iconFilter: 'drop-shadow-[0_8px_14px_rgba(139,92,246,0.35)]',
        },
        {
            label: 'Participation',
            value: `${participationRate}%`,
            icon: TrendingUpIcon,
            cardClass: 'border-amber-300/45 bg-amber-100/55 dark:border-amber-500/30 dark:bg-amber-900/20',
            valueClass: 'text-amber-700 dark:text-amber-200',
            iconFilter: 'drop-shadow-[0_8px_14px_rgba(245,158,11,0.35)]',
        },
        {
            label: 'Vote Velocity',
            value: `${voteVelocity}/hr`,
            icon: ZapIcon,
            cardClass: 'border-cyan-300/45 bg-cyan-100/55 dark:border-cyan-500/30 dark:bg-cyan-900/20',
            valueClass: 'text-cyan-700 dark:text-cyan-200',
            iconFilter: 'drop-shadow-[0_8px_14px_rgba(6,182,212,0.35)]',
        },
    ].map((stat, index) => (
        <motion.div
            key={index}
            variants={iV}
            whileHover={{ y: -4, scale: 1.02 }}
            className={cn(
                'rounded-2xl border p-4 shadow-lg backdrop-blur-xl transition-all duration-300',
                stat.cardClass
            )}
        >
            <div className="flex items-center justify-between gap-3">
                <stat.icon
                    className="h-11 w-11 shrink-0"
                    style={{ filter: stat.iconFilter }}
                />
                <p className={cn('text-xl font-bold', stat.valueClass)}>{stat.value}</p>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
        </motion.div>
    ))}
</motion.div>
```

### TAB NAVIGATION

```tsx
{/* Tab Navigation */}
<motion.div
    variants={iV}
    className="w-full overflow-hidden rounded-2xl border border-white/10 bg-neutral-100/50 p-1 backdrop-blur-md dark:bg-neutral-900/50"
>
    <div className="max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="inline-flex min-w-max gap-1">
            {[
                { key: 'overview', label: 'Overview', icon: LayoutDashboard },
                { key: 'votes', label: 'Votes', icon: Users, count: voting.stats.total },
                { key: 'analytics', label: 'Analytics', icon: BarChart3 },
                { key: 'discussion', label: 'Discussion', icon: MessageSquare, count: discussionCount },
                { key: 'financial', label: 'Financial', icon: DollarSign },
                { key: 'audit', label: 'Audit Trail', icon: Shield },
            ].map((tab) => {
                const TabIcon = tab.icon;
                return (
                    <Button
                        key={tab.key}
                        variant={activeTab === tab.key ? 'default' : 'outline'}
                        onClick={() => setActiveTab(tab.key)}
                        className={cn(
                            'shrink-0 gap-2 whitespace-nowrap rounded-xl transition-all duration-300',
                            activeTab === tab.key
                                ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-lg'
                                : 'hover:bg-white/50 dark:hover:bg-neutral-800/50'
                        )}
                    >
                        <TabIcon className="h-4 w-4" />
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className={cn(
                                'ml-1 flex h-5 w-5 items-center justify-center rounded-full text-xs',
                                activeTab === tab.key
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-200 text-slate-700 dark:bg-neutral-700 dark:text-slate-300'
                            )}>
                                {tab.count}
                            </span>
                        )}
                    </Button>
                );
            })}
        </div>
    </div>
</motion.div>
```

---

## 🎯 TAB CONTENT DETAILS

### TAB 1: OVERVIEW

**Content:**
- Voting description (full text)
- Vote progress visualization (animated progress bar)
- Real-time countdown timer
- Quick decision buttons
- Recent activity feed
- Key metrics summary

### TAB 2: VOTES (Detailed Breakdown)

**Content:**
- Filter & search voters
- Voter cards with:
  - Avatar/initial
  - Name & NIM
  - Vote type (Setuju/Tolak)
  - Vote time
  - Comment (if any)
  - Engagement score
- Sort options (Time, Name, Vote Type)
- Export voter list

### TAB 3: ANALYTICS

**Content:**
- Vote distribution chart (Pie/Donut)
- Vote timeline (Line chart)
- Voting pattern analysis (Heatmap)
- Demographic breakdown
- Consensus level indicator
- Predicted outcome
- Comparison with similar votings

### TAB 4: DISCUSSION

**Content:**
- Admin notes section
- Discussion thread
- Comment system
- File attachments
- Mention system
- Activity log

### TAB 5: FINANCIAL

**Content:**
- Budget impact analysis
- Current balance
- Balance after approval
- Category spending chart
- Historical comparison
- Alternative suggestions
- Cost breakdown table

### TAB 6: AUDIT TRAIL

**Content:**
- Complete activity log
- Change history timeline
- Admin actions log
- Voter activity
- System events
- Export audit report

---

## ✅ IMPLEMENTATION CHECKLIST

### Header & Navigation
- [ ] Remove container from header icon
- [ ] Remove floating animation from icon
- [ ] Consistent back button style
- [ ] Responsive header for mobile
- [ ] Status badges with proper colors
- [ ] Amount display with gradient
- [ ] Meta info (creator, date, deadline)
- [ ] Action buttons (Approve, Reject, Export)

### Quick Stats
- [ ] Icon colors match container colors
- [ ] Real-time data updates
- [ ] Hover animations
- [ ] Responsive grid layout
- [ ] Proper drop shadows

### Tab System
- [ ] 6 tabs (Overview, Votes, Analytics, Discussion, Financial, Audit)
- [ ] Tab count badges
- [ ] Smooth tab transitions
- [ ] Mobile-friendly horizontal scroll

### Overview Tab
- [ ] Full description
- [ ] Animated progress bar
- [ ] Countdown timer
- [ ] Quick actions
- [ ] Recent activity
- [ ] Key metrics

### Votes Tab
- [ ] Voter list with cards
- [ ] Filter & search
- [ ] Sort options
- [ ] Vote comments
- [ ] Export functionality

### Analytics Tab
- [ ] Vote distribution chart
- [ ] Timeline chart
- [ ] Pattern analysis
- [ ] Demographic breakdown
- [ ] Consensus indicator
- [ ] Predictions

### Discussion Tab
- [ ] Admin notes
- [ ] Comment thread
- [ ] File attachments
- [ ] Mentions
- [ ] Activity log

### Financial Tab
- [ ] Budget impact
- [ ] Balance calculations
- [ ] Category spending
- [ ] Historical comparison
- [ ] Alternatives
- [ ] Cost breakdown

### Audit Tab
- [ ] Activity log
- [ ] Change history
- [ ] Admin actions
- [ ] Voter activity
- [ ] Export report

### Mobile Responsiveness
- [ ] Test on 320px - 768px
- [ ] Proper text wrapping
- [ ] Touch-friendly buttons
- [ ] Horizontal scroll for tabs
- [ ] Collapsible sections

### Design Consistency
- [ ] Match dashboard admin 100%
- [ ] Consistent border radius
- [ ] Consistent spacing
- [ ] Consistent typography
- [ ] Proper backdrop-blur
- [ ] Gradient consistency

---

## 📝 NOTES

- NO data dummy - all real data
- Icon colors MUST match container colors
- NO container on header icon
- NO floating animation on icon
- Clean mobile UI like dashboard admin
- Consistent back button across all menus
- Write in organized, consistent theme (1 tema rapi)
- Significant innovative features for this critical menu
- Complete, well-organized content writing
- Real-time updates every 10 seconds
- Smooth animations with framer-motion
- Export functionality for reports
- Comprehensive audit trail

---

**END OF PROMPT**
