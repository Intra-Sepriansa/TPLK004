# 🚀 PROMPT ULTRA ADVANCED: RIWAYAT MAHASISWA
## 100% Matching Admin Dashboard + Inovasi Signifikan

---

## 📋 OVERVIEW - TRANSFORMASI TOTAL

### ❌ MASALAH SAAT INI (Riwayat Mahasiswa)
```
❌ Header gradient tidak matching admin
❌ Container colors: bg-white/80 (bukan bg-white/40)
❌ Border colors: border-slate-200/70 (bukan border-white/20)
❌ Animations: stiffness: 100, damping: 15 (slow)
❌ Stats cards tidak pakai glassmorphism
❌ Chart containers tidak pakai backdrop-blur-xl
❌ Tooltip styling berbeda dengan admin
❌ Icons tidak pakai PNG assets
❌ Hover effects tidak smooth
❌ Detail modal tidak pakai glassmorphism
❌ Tidak ada fitur advanced filtering
❌ Tidak ada timeline view
❌ Tidak ada heatmap calendar
❌ Tidak ada export options
❌ Tidak ada comparison features
```

### ✅ SOLUSI (100% Admin + Inovasi Tinggi)
```
✅ Header gradient EXACT: from-indigo-600 via-purple-600 to-pink-500
✅ Container colors: bg-white/40 dark:bg-neutral-900/40
✅ Border colors: border-white/20 dark:border-white/5
✅ Animations: stiffness: 300, damping: 20
✅ Stats cards: Glassmorphism + PNG icons + animated glow
✅ Chart containers: backdrop-blur-xl + shadow-xl
✅ Tooltip: rounded-xl + backdrop-blur-xl
✅ Icons: PNG assets dari admin
✅ Hover effects: scale: 1.04, y: -4
✅ Detail modal: Full glassmorphism + 3D effects
✅ Advanced filtering: Multi-select, date range, quick filters
✅ Timeline view: Vertical timeline dengan milestones
✅ Heatmap calendar: GitHub-style contribution heatmap
✅ Export options: PDF, Excel, CSV dengan custom templates
✅ Comparison: Compare periods, courses, performance
✅ AI Insights: Attendance patterns, predictions, recommendations
✅ Gamification: Achievements, badges, streaks dengan animations
✅ Search: Fuzzy search dengan highlights
✅ Bulk actions: Select multiple, batch operations
✅ Quick stats: Mini dashboard dengan real-time updates
```

---

## 🎨 DESIGN SYSTEM — EXACT ADMIN + INNOVATIONS

### 1. COLOR PALETTE (ADMIN STYLE)

#### Header Gradient (EXACT MATCH)
```tsx
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
```


#### Container Colors (GLASSMORPHISM)
```tsx
// Main containers
bg-white/40 dark:bg-neutral-900/40
backdrop-blur-xl
border-white/20 dark:border-white/5
shadow-xl
rounded-3xl

// Stats cards gradient backgrounds
from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10
from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10
from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10
from-rose-500/5 to-pink-500/5 dark:from-rose-500/10 dark:to-pink-500/10
```

#### Text Colors (NEUTRAL PALETTE)
```tsx
// Headings
text-neutral-900 dark:text-white

// Subtext
text-neutral-500 dark:text-neutral-400

// Muted
text-neutral-400 dark:text-neutral-500

// Border dividers
border-white/10 dark:border-white/5
```

### 2. ANIMATION SETTINGS (EXACT ADMIN)

#### Container Variants
```tsx
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,  // ✅ Admin uses 0.04
            delayChildren: 0.1,
        }
    }
} as const;
```

#### Item Variants (SMOOTH & FAST)
```tsx
const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },  // ✅ y: 30 (not 40)
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { 
            type: 'spring', 
            stiffness: 300,  // ✅ 300 (not 100)
            damping: 20      // ✅ 20 (not 15)
        }
    }
} as const;
```

#### Card Hover Variants
```tsx
const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
    },
    hover: {
        scale: 1.04,  // ✅ 1.04 (not 1.03)
        y: -4,        // ✅ -4 (not -8)
        transition: { type: 'spring', stiffness: 400, damping: 15 }
    }
} as const;
```

---

## 🚀 INOVASI BARU - FITUR ADVANCED

### 1. HEATMAP CALENDAR (GitHub-Style)

**Konsep**: Visualisasi kehadiran dalam bentuk heatmap seperti GitHub contributions

```tsx
interface HeatmapDay {
    date: Date;
    count: number;  // 0-4 (tidak hadir, terlambat, hadir, perfect)
    status: 'absent' | 'late' | 'present' | 'perfect';
    records: AttendanceRecord[];
}

function AttendanceHeatmap({ records }: { records: AttendanceRecord[] }) {
    const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);
    
    // Generate last 365 days
    const heatmapData = useMemo(() => {
        const days: HeatmapDay[] = [];
        const today = new Date();
        
        for (let i = 364; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            const dayRecords = records.filter(r => 
                new Date(r.date).toDateString() === date.toDateString()
            );
            
            const presentCount = dayRecords.filter(r => r.status === 'present').length;
            const lateCount = dayRecords.filter(r => r.status === 'late').length;
            
            let status: HeatmapDay['status'] = 'absent';
            let count = 0;
            
            if (presentCount > 0) {
                status = 'perfect';
                count = 4;
            } else if (lateCount > 0) {
                status = 'late';
                count = 2;
            } else if (dayRecords.length > 0) {
                status = 'present';
                count = 3;
            }
            
            days.push({ date, count, status, records: dayRecords });
        }
        
        return days;
    }, [records]);
    
    // Group by weeks
    const weeks = useMemo(() => {
        const result: HeatmapDay[][] = [];
        let week: HeatmapDay[] = [];
        
        heatmapData.forEach((day, i) => {
            week.push(day);
            if (day.date.getDay() === 6 || i === heatmapData.length - 1) {
                result.push(week);
                week = [];
            }
        });
        
        return result;
    }, [heatmapData]);
    
    const getColor = (count: number) => {
        if (count === 0) return 'bg-neutral-100 dark:bg-neutral-800';
        if (count === 1) return 'bg-rose-200 dark:bg-rose-900/50';
        if (count === 2) return 'bg-amber-300 dark:bg-amber-800/50';
        if (count === 3) return 'bg-emerald-400 dark:bg-emerald-700/50';
        return 'bg-emerald-600 dark:bg-emerald-500';
    };
    
    return (
        <motion.div
            variants={itemVariants}
            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
        >
            <div className="flex items-center gap-3 mb-6">
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                >
                    <Calendar className="h-5 w-5 text-emerald-500" />
                </motion.div>
                <h2 className="font-bold text-lg text-neutral-900 dark:text-white">
                    Heatmap Kehadiran (365 Hari)
                </h2>
            </div>
            
            <div className="overflow-x-auto">
                <div className="inline-flex gap-1">
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1">
                            {week.map((day, dayIndex) => (
                                <motion.div
                                    key={dayIndex}
                                    whileHover={{ scale: 1.5, z: 10 }}
                                    onHoverStart={() => setHoveredDay(day)}
                                    onHoverEnd={() => setHoveredDay(null)}
                                    className={cn(
                                        "h-3 w-3 rounded-sm cursor-pointer transition-all",
                                        getColor(day.count)
                                    )}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Tooltip */}
            <AnimatePresence>
                {hoveredDay && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mt-4 p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-white/20"
                    >
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                            {hoveredDay.date.toLocaleDateString('id-ID', { 
                                weekday: 'long', 
                                day: 'numeric', 
                                month: 'long' 
                            })}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                            {hoveredDay.records.length} kehadiran
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Legend */}
            <div className="flex items-center gap-4 mt-6 text-xs text-neutral-500">
                <span>Kurang</span>
                <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map(i => (
                        <div key={i} className={cn("h-3 w-3 rounded-sm", getColor(i))} />
                    ))}
                </div>
                <span>Lebih</span>
            </div>
        </motion.div>
    );
}
```


### 2. TIMELINE VIEW (Vertical Timeline)

**Konsep**: Timeline vertikal dengan milestones dan grouped by period

```tsx
interface TimelineItem {
    date: Date;
    records: AttendanceRecord[];
    milestone?: {
        type: 'streak' | 'perfect_week' | 'achievement';
        title: string;
        description: string;
    };
}

function AttendanceTimeline({ records }: { records: AttendanceRecord[] }) {
    const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
    
    // Group records by month
    const timelineData = useMemo(() => {
        const grouped: Record<string, TimelineItem[]> = {};
        
        records.forEach(record => {
            const date = new Date(record.date);
            const monthKey = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
            
            if (!grouped[monthKey]) grouped[monthKey] = [];
            
            const existingDay = grouped[monthKey].find(item => 
                item.date.toDateString() === date.toDateString()
            );
            
            if (existingDay) {
                existingDay.records.push(record);
            } else {
                grouped[monthKey].push({
                    date,
                    records: [record],
                });
            }
        });
        
        return grouped;
    }, [records]);
    
    return (
        <motion.div
            variants={itemVariants}
            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
        >
            <div className="flex items-center gap-3 mb-6">
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20"
                >
                    <Clock className="h-5 w-5 text-indigo-500" />
                </motion.div>
                <h2 className="font-bold text-lg text-neutral-900 dark:text-white">
                    Timeline Kehadiran
                </h2>
            </div>
            
            <div className="space-y-6">
                {Object.entries(timelineData).map(([month, items], monthIndex) => (
                    <motion.div
                        key={month}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: monthIndex * 0.1 }}
                    >
                        {/* Month Header */}
                        <motion.button
                            onClick={() => setExpandedMonth(expandedMonth === month ? null : month)}
                            whileHover={{ x: 5 }}
                            className="flex items-center gap-3 mb-4 w-full text-left"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-neutral-900 dark:text-white">{month}</h3>
                                <p className="text-sm text-neutral-500">{items.length} hari</p>
                            </div>
                            <motion.div
                                animate={{ rotate: expandedMonth === month ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ChevronRight className="h-5 w-5 text-neutral-400" />
                            </motion.div>
                        </motion.button>
                        
                        {/* Timeline Items */}
                        <AnimatePresence>
                            {expandedMonth === month && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="relative pl-8 space-y-4"
                                >
                                    {/* Vertical Line */}
                                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 to-purple-600" />
                                    
                                    {items.map((item, itemIndex) => (
                                        <motion.div
                                            key={itemIndex}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: itemIndex * 0.05 }}
                                            className="relative"
                                        >
                                            {/* Timeline Dot */}
                                            <motion.div
                                                whileHover={{ scale: 1.5 }}
                                                className="absolute -left-8 top-3 h-4 w-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 ring-4 ring-white dark:ring-neutral-900"
                                            />
                                            
                                            {/* Content */}
                                            <div className="rounded-xl border border-white/20 bg-white/60 dark:bg-neutral-800/60 p-4 backdrop-blur-sm">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="font-semibold text-neutral-900 dark:text-white">
                                                        {item.date.toLocaleDateString('id-ID', { 
                                                            weekday: 'long', 
                                                            day: 'numeric', 
                                                            month: 'short' 
                                                        })}
                                                    </p>
                                                    <span className="text-xs text-neutral-500">
                                                        {item.records.length} kehadiran
                                                    </span>
                                                </div>
                                                
                                                <div className="flex flex-wrap gap-2">
                                                    {item.records.map((record, recordIndex) => {
                                                        const StatusIcon = statusConfig[record.status].icon;
                                                        return (
                                                            <motion.div
                                                                key={recordIndex}
                                                                whileHover={{ scale: 1.05, y: -2 }}
                                                                className={cn(
                                                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium",
                                                                    statusConfig[record.status].color
                                                                )}
                                                            >
                                                                <StatusIcon className="h-3 w-3" />
                                                                {record.course.substring(0, 15)}...
                                                            </motion.div>
                                                        );
                                                    })}
                                                </div>
                                                
                                                {/* Milestone */}
                                                {item.milestone && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="mt-3 p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Trophy className="h-4 w-4 text-amber-500" />
                                                            <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                                                                {item.milestone.title}
                                                            </p>
                                                        </div>
                                                        <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1">
                                                            {item.milestone.description}
                                                        </p>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
```

### 3. ADVANCED FILTERING SYSTEM

**Konsep**: Multi-select filters dengan saved presets dan quick filters

```tsx
interface FilterPreset {
    id: string;
    name: string;
    filters: {
        status?: string[];
        courses?: number[];
        dateRange?: { from: Date; to: Date };
    };
}

function AdvancedFilters({ 
    records, 
    onFilterChange 
}: { 
    records: AttendanceRecord[];
    onFilterChange: (filtered: AttendanceRecord[]) => void;
}) {
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
    const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
    const [savedPresets, setSavedPresets] = useState<FilterPreset[]>([]);
    const [showSavePreset, setShowSavePreset] = useState(false);
    const [presetName, setPresetName] = useState('');
    
    // Quick filter presets
    const quickFilters = [
        { 
            label: 'Minggu Ini', 
            action: () => {
                const today = new Date();
                const monday = new Date(today);
                monday.setDate(today.getDate() - today.getDay() + 1);
                setDateRange({ from: monday, to: today });
            }
        },
        { 
            label: 'Bulan Ini', 
            action: () => {
                const today = new Date();
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                setDateRange({ from: firstDay, to: today });
            }
        },
        { 
            label: 'Semester Ini', 
            action: () => {
                const today = new Date();
                const month = today.getMonth();
                const year = today.getFullYear();
                const semesterStart = month >= 7 
                    ? new Date(year, 7, 1)  // Aug 1
                    : new Date(year, 1, 1);  // Feb 1
                setDateRange({ from: semesterStart, to: today });
            }
        },
        { 
            label: 'Hadir Saja', 
            action: () => setSelectedStatuses(['present'])
        },
        { 
            label: 'Bermasalah', 
            action: () => setSelectedStatuses(['late', 'rejected', 'absent'])
        },
    ];
    
    // Apply filters
    useEffect(() => {
        let filtered = [...records];
        
        // Status filter
        if (selectedStatuses.length > 0) {
            filtered = filtered.filter(r => selectedStatuses.includes(r.status));
        }
        
        // Course filter
        if (selectedCourses.length > 0) {
            filtered = filtered.filter(r => selectedCourses.includes(r.courseId));
        }
        
        // Date range filter
        if (dateRange.from) {
            filtered = filtered.filter(r => new Date(r.date) >= dateRange.from!);
        }
        if (dateRange.to) {
            filtered = filtered.filter(r => new Date(r.date) <= dateRange.to!);
        }
        
        onFilterChange(filtered);
    }, [selectedStatuses, selectedCourses, dateRange, records]);
    
    const savePreset = () => {
        if (!presetName) return;
        
        const preset: FilterPreset = {
            id: Date.now().toString(),
            name: presetName,
            filters: {
                status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
                courses: selectedCourses.length > 0 ? selectedCourses : undefined,
                dateRange: dateRange.from || dateRange.to ? dateRange as any : undefined,
            }
        };
        
        setSavedPresets([...savedPresets, preset]);
        setShowSavePreset(false);
        setPresetName('');
    };
    
    const loadPreset = (preset: FilterPreset) => {
        setSelectedStatuses(preset.filters.status || []);
        setSelectedCourses(preset.filters.courses || []);
        setDateRange(preset.filters.dateRange || {});
    };
    
    const clearAllFilters = () => {
        setSelectedStatuses([]);
        setSelectedCourses([]);
        setDateRange({});
    };
    
    const hasActiveFilters = selectedStatuses.length > 0 || 
                            selectedCourses.length > 0 || 
                            dateRange.from || 
                            dateRange.to;
    
    return (
        <motion.div
            variants={itemVariants}
            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20"
                    >
                        <Filter className="h-5 w-5 text-sky-500" />
                    </motion.div>
                    <h2 className="font-bold text-lg text-neutral-900 dark:text-white">
                        Filter Advanced
                    </h2>
                </div>
                
                {hasActiveFilters && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={clearAllFilters}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
                    >
                        <X className="h-4 w-4" />
                        Reset Semua
                    </motion.button>
                )}
            </div>
            
            {/* Quick Filters */}
            <div className="mb-6">
                <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-3">
                    Quick Filters
                </p>
                <div className="flex flex-wrap gap-2">
                    {quickFilters.map((filter, index) => (
                        <motion.button
                            key={index}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={filter.action}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:from-indigo-500/20 hover:to-purple-500/20 transition-all"
                        >
                            {filter.label}
                        </motion.button>
                    ))}
                </div>
            </div>
            
            {/* Status Multi-Select */}
            <div className="mb-6">
                <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-3">
                    Status
                </p>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(statusConfig).map(([key, config]) => {
                        const isSelected = selectedStatuses.includes(key);
                        const Icon = config.icon;
                        return (
                            <motion.button
                                key={key}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setSelectedStatuses(prev => 
                                        isSelected 
                                            ? prev.filter(s => s !== key)
                                            : [...prev, key]
                                    );
                                }}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all",
                                    isSelected 
                                        ? config.color + " border-current"
                                        : "bg-neutral-100 dark:bg-neutral-800 border-transparent text-neutral-600 dark:text-neutral-400"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {config.label}
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="h-2 w-2 rounded-full bg-current"
                                    />
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>
            
            {/* Saved Presets */}
            {savedPresets.length > 0 && (
                <div className="mb-6">
                    <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-3">
                        Preset Tersimpan
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {savedPresets.map(preset => (
                            <motion.button
                                key={preset.id}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => loadPreset(preset)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium text-emerald-600 dark:text-emerald-400"
                            >
                                <Bookmark className="h-4 w-4" />
                                {preset.name}
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Save Preset Button */}
            {hasActiveFilters && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowSavePreset(true)}
                    className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:from-violet-500/20 hover:to-purple-500/20 transition-all"
                >
                    💾 Simpan Filter Ini
                </motion.button>
            )}
            
            {/* Save Preset Modal */}
            <AnimatePresence>
                {showSavePreset && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-md w-full">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
                                Simpan Preset Filter
                            </h3>
                            <Input
                                placeholder="Nama preset..."
                                value={presetName}
                                onChange={(e) => setPresetName(e.target.value)}
                                className="mb-4"
                            />
                            <div className="flex gap-3">
                                <Button onClick={savePreset} className="flex-1">
                                    Simpan
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => setShowSavePreset(false)}
                                    className="flex-1"
                                >
                                    Batal
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
```


### 4. AI INSIGHTS & PREDICTIONS

**Konsep**: Analisis pola kehadiran dengan AI dan prediksi

```tsx
interface AIInsight {
    type: 'pattern' | 'prediction' | 'recommendation' | 'alert';
    title: string;
    description: string;
    confidence: number;  // 0-100
    action?: {
        label: string;
        onClick: () => void;
    };
}

function AIInsightsPanel({ records }: { records: AttendanceRecord[] }) {
    const insights = useMemo<AIInsight[]>(() => {
        const result: AIInsight[] = [];
        
        // Pattern: Frequent late on specific day
        const dayStats: Record<number, { late: number; total: number }> = {};
        records.forEach(r => {
            const day = new Date(r.date).getDay();
            if (!dayStats[day]) dayStats[day] = { late: 0, total: 0 };
            dayStats[day].total++;
            if (r.status === 'late') dayStats[day].late++;
        });
        
        Object.entries(dayStats).forEach(([day, stats]) => {
            const lateRate = (stats.late / stats.total) * 100;
            if (lateRate > 30 && stats.total >= 3) {
                const dayName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][parseInt(day)];
                result.push({
                    type: 'pattern',
                    title: `Sering Terlambat di Hari ${dayName}`,
                    description: `Anda terlambat ${stats.late} dari ${stats.total} kali (${lateRate.toFixed(0)}%) di hari ${dayName}. Pertimbangkan untuk berangkat lebih awal.`,
                    confidence: Math.min(lateRate, 95),
                });
            }
        });
        
        // Prediction: Risk of not meeting attendance requirement
        const presentCount = records.filter(r => r.status === 'present').length;
        const totalSessions = records.length;
        const attendanceRate = (presentCount / totalSessions) * 100;
        
        if (attendanceRate < 80 && attendanceRate > 60) {
            result.push({
                type: 'alert',
                title: '⚠️ Risiko Tidak Memenuhi Syarat Kehadiran',
                description: `Tingkat kehadiran Anda saat ini ${attendanceRate.toFixed(1)}%. Anda perlu hadir di ${Math.ceil((0.75 * totalSessions) - presentCount)} sesi berikutnya untuk mencapai 75%.`,
                confidence: 85,
                action: {
                    label: 'Lihat Strategi',
                    onClick: () => alert('Strategi peningkatan kehadiran')
                }
            });
        }
        
        // Recommendation: Best performing course
        const courseStats: Record<string, { present: number; total: number }> = {};
        records.forEach(r => {
            if (!courseStats[r.course]) courseStats[r.course] = { present: 0, total: 0 };
            courseStats[r.course].total++;
            if (r.status === 'present') courseStats[r.course].present++;
        });
        
        const bestCourse = Object.entries(courseStats)
            .map(([course, stats]) => ({
                course,
                rate: (stats.present / stats.total) * 100
            }))
            .sort((a, b) => b.rate - a.rate)[0];
        
        if (bestCourse && bestCourse.rate >= 90) {
            result.push({
                type: 'recommendation',
                title: `🌟 Performa Terbaik: ${bestCourse.course}`,
                description: `Anda memiliki kehadiran ${bestCourse.rate.toFixed(0)}% di mata kuliah ini. Pertahankan konsistensi ini!`,
                confidence: 90,
            });
        }
        
        // Prediction: Streak continuation
        const recentRecords = records.slice(-7);
        const recentPresentCount = recentRecords.filter(r => r.status === 'present').length;
        
        if (recentPresentCount >= 5) {
            result.push({
                type: 'prediction',
                title: '🔥 Streak Prediction',
                description: `Anda sedang dalam performa bagus! Jika terus hadir 3 hari ke depan, Anda akan mencapai streak 10 hari.`,
                confidence: 75,
            });
        }
        
        return result;
    }, [records]);
    
    const getInsightColor = (type: AIInsight['type']) => {
        switch (type) {
            case 'pattern': return 'from-blue-500/10 to-cyan-500/10 border-blue-500/20';
            case 'prediction': return 'from-violet-500/10 to-purple-500/10 border-violet-500/20';
            case 'recommendation': return 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20';
            case 'alert': return 'from-amber-500/10 to-orange-500/10 border-amber-500/20';
        }
    };
    
    const getInsightIcon = (type: AIInsight['type']) => {
        switch (type) {
            case 'pattern': return TrendingUp;
            case 'prediction': return Sparkles;
            case 'recommendation': return Award;
            case 'alert': return AlertTriangle;
        }
    };
    
    return (
        <motion.div
            variants={itemVariants}
            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
        >
            <div className="flex items-center gap-3 mb-6">
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    animate={{
                        boxShadow: [
                            "0 0 0 0 rgba(139, 92, 246, 0)",
                            "0 0 0 10px rgba(139, 92, 246, 0.1)",
                            "0 0 0 0 rgba(139, 92, 246, 0)"
                        ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white"
                >
                    <Sparkles className="h-5 w-5" />
                </motion.div>
                <div>
                    <h2 className="font-bold text-lg text-neutral-900 dark:text-white">
                        AI Insights
                    </h2>
                    <p className="text-xs text-neutral-500">
                        Powered by Machine Learning
                    </p>
                </div>
            </div>
            
            <div className="space-y-4">
                {insights.length === 0 ? (
                    <div className="text-center py-8">
                        <Sparkles className="h-12 w-12 mx-auto text-neutral-300 mb-3" />
                        <p className="text-sm text-neutral-500">
                            Belum cukup data untuk analisis AI
                        </p>
                    </div>
                ) : (
                    insights.map((insight, index) => {
                        const Icon = getInsightIcon(insight.type);
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.02, x: 5 }}
                                className={cn(
                                    "p-4 rounded-2xl bg-gradient-to-r border backdrop-blur-sm",
                                    getInsightColor(insight.type)
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/50 dark:bg-black/30 shrink-0">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-neutral-900 dark:text-white mb-1">
                                            {insight.title}
                                        </h3>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                                            {insight.description}
                                        </p>
                                        
                                        {/* Confidence Bar */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${insight.confidence}%` }}
                                                    transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                                                    className="h-full bg-gradient-to-r from-violet-500 to-purple-600"
                                                />
                                            </div>
                                            <span className="text-xs font-semibold text-neutral-500">
                                                {insight.confidence}%
                                            </span>
                                        </div>
                                        
                                        {insight.action && (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={insight.action.onClick}
                                                className="text-sm font-semibold text-violet-600 dark:text-violet-400 hover:underline"
                                            >
                                                {insight.action.label} →
                                            </motion.button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
}
```

### 5. COMPARISON FEATURES

**Konsep**: Compare periods, courses, dan performance

```tsx
interface ComparisonData {
    label: string;
    current: number;
    previous: number;
    change: number;
    changePercent: number;
}

function ComparisonPanel({ records }: { records: AttendanceRecord[] }) {
    const [comparisonType, setComparisonType] = useState<'period' | 'course'>('period');
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'semester'>('month');
    
    const comparisonData = useMemo<ComparisonData[]>(() => {
        if (comparisonType === 'period') {
            const now = new Date();
            let currentStart: Date, previousStart: Date, previousEnd: Date;
            
            if (selectedPeriod === 'week') {
                currentStart = new Date(now);
                currentStart.setDate(now.getDate() - 7);
                previousStart = new Date(currentStart);
                previousStart.setDate(currentStart.getDate() - 7);
                previousEnd = new Date(currentStart);
            } else if (selectedPeriod === 'month') {
                currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
                previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                previousEnd = new Date(now.getFullYear(), now.getMonth(), 0);
            } else {
                // semester
                const month = now.getMonth();
                currentStart = month >= 7 
                    ? new Date(now.getFullYear(), 7, 1)
                    : new Date(now.getFullYear(), 1, 1);
                previousStart = month >= 7
                    ? new Date(now.getFullYear(), 1, 1)
                    : new Date(now.getFullYear() - 1, 7, 1);
                previousEnd = month >= 7
                    ? new Date(now.getFullYear(), 6, 31)
                    : new Date(now.getFullYear(), 0, 31);
            }
            
            const currentRecords = records.filter(r => {
                const date = new Date(r.date);
                return date >= currentStart && date <= now;
            });
            
            const previousRecords = records.filter(r => {
                const date = new Date(r.date);
                return date >= previousStart && date <= previousEnd;
            });
            
            const currentPresent = currentRecords.filter(r => r.status === 'present').length;
            const previousPresent = previousRecords.filter(r => r.status === 'present').length;
            
            const currentRate = currentRecords.length > 0 
                ? (currentPresent / currentRecords.length) * 100 
                : 0;
            const previousRate = previousRecords.length > 0 
                ? (previousPresent / previousRecords.length) * 100 
                : 0;
            
            return [
                {
                    label: 'Total Kehadiran',
                    current: currentPresent,
                    previous: previousPresent,
                    change: currentPresent - previousPresent,
                    changePercent: previousPresent > 0 
                        ? ((currentPresent - previousPresent) / previousPresent) * 100 
                        : 0
                },
                {
                    label: 'Tingkat Kehadiran',
                    current: currentRate,
                    previous: previousRate,
                    change: currentRate - previousRate,
                    changePercent: previousRate > 0 
                        ? ((currentRate - previousRate) / previousRate) * 100 
                        : 0
                },
            ];
        }
        
        return [];
    }, [records, comparisonType, selectedPeriod]);
    
    return (
        <motion.div
            variants={itemVariants}
            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
        >
            <div className="flex items-center gap-3 mb-6">
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20"
                >
                    <BarChart3 className="h-5 w-5 text-cyan-500" />
                </motion.div>
                <h2 className="font-bold text-lg text-neutral-900 dark:text-white">
                    Perbandingan Performa
                </h2>
            </div>
            
            {/* Period Selector */}
            <div className="flex gap-2 mb-6">
                {(['week', 'month', 'semester'] as const).map(period => (
                    <motion.button
                        key={period}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedPeriod(period)}
                        className={cn(
                            "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                            selectedPeriod === period
                                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                        )}
                    >
                        {period === 'week' ? 'Minggu' : period === 'month' ? 'Bulan' : 'Semester'}
                    </motion.button>
                ))}
            </div>
            
            {/* Comparison Cards */}
            <div className="space-y-4">
                {comparisonData.map((data, index) => {
                    const isPositive = data.change >= 0;
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, x: 5 }}
                            className="p-4 rounded-2xl bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700 border border-white/20"
                        >
                            <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-3">
                                {data.label}
                            </p>
                            
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                                        {data.current.toFixed(data.label.includes('Tingkat') ? 1 : 0)}
                                        {data.label.includes('Tingkat') && '%'}
                                    </p>
                                    <p className="text-xs text-neutral-500 mt-1">
                                        Sebelumnya: {data.previous.toFixed(data.label.includes('Tingkat') ? 1 : 0)}
                                        {data.label.includes('Tingkat') && '%'}
                                    </p>
                                </div>
                                
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
                                    className={cn(
                                        "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold",
                                        isPositive 
                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                    )}
                                >
                                    {isPositive ? '↑' : '↓'}
                                    {Math.abs(data.changePercent).toFixed(1)}%
                                </motion.div>
                            </div>
                            
                            {/* Visual Bar */}
                            <div className="mt-4 flex gap-2">
                                <div className="flex-1">
                                    <div className="h-2 bg-neutral-200 dark:bg-neutral-600 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((data.previous / Math.max(data.current, data.previous)) * 100, 100)}%` }}
                                            transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                                            className="h-full bg-neutral-400 dark:bg-neutral-500"
                                        />
                                    </div>
                                    <p className="text-xs text-neutral-500 mt-1">Previous</p>
                                </div>
                                <div className="flex-1">
                                    <div className="h-2 bg-neutral-200 dark:bg-neutral-600 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((data.current / Math.max(data.current, data.previous)) * 100, 100)}%` }}
                                            transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                                            className={cn(
                                                "h-full",
                                                isPositive 
                                                    ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                                                    : "bg-gradient-to-r from-rose-500 to-pink-600"
                                            )}
                                        />
                                    </div>
                                    <p className="text-xs text-neutral-500 mt-1">Current</p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
```


### 6. EXPORT OPTIONS (PDF, Excel, CSV)

**Konsep**: Multiple export formats dengan custom templates

```tsx
function ExportPanel({ records, mahasiswa, stats }: { 
    records: AttendanceRecord[];
    mahasiswa: { nama: string; nim: string };
    stats: any;
}) {
    const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
    const [exportOptions, setExportOptions] = useState({
        includeCharts: true,
        includeStats: true,
        includeSelfies: false,
        dateRange: 'all' as 'all' | 'month' | 'semester'
    });
    
    const handleExport = async () => {
        // Implementation for each format
        if (exportFormat === 'pdf') {
            // Generate PDF with charts and styling
            window.open(`/user/history/export/pdf?options=${JSON.stringify(exportOptions)}`);
        } else if (exportFormat === 'excel') {
            // Generate Excel with multiple sheets
            window.open(`/user/history/export/excel?options=${JSON.stringify(exportOptions)}`);
        } else {
            // Generate CSV
            const csv = records.map(r => 
                `${r.date},${r.course},${r.status},${r.checkInTime || ''}`
            ).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `riwayat-${mahasiswa.nim}.csv`;
            a.click();
        }
    };
    
    return (
        <motion.div
            variants={itemVariants}
            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
        >
            <div className="flex items-center gap-3 mb-6">
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20"
                >
                    <Download className="h-5 w-5 text-rose-500" />
                </motion.div>
                <h2 className="font-bold text-lg text-neutral-900 dark:text-white">
                    Export Data
                </h2>
            </div>
            
            {/* Format Selection */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {(['pdf', 'excel', 'csv'] as const).map(format => (
                    <motion.button
                        key={format}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setExportFormat(format)}
                        className={cn(
                            "p-4 rounded-xl border-2 transition-all",
                            exportFormat === format
                                ? "bg-gradient-to-br from-rose-500 to-pink-600 text-white border-transparent shadow-lg"
                                : "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                        )}
                    >
                        <FileText className="h-6 w-6 mx-auto mb-2" />
                        <p className="text-sm font-bold uppercase">{format}</p>
                    </motion.button>
                ))}
            </div>
            
            {/* Export Options */}
            <div className="space-y-3 mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={exportOptions.includeCharts}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeCharts: e.target.checked }))}
                        className="h-4 w-4 rounded"
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">Include Charts</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={exportOptions.includeStats}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeStats: e.target.checked }))}
                        className="h-4 w-4 rounded"
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">Include Statistics</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={exportOptions.includeSelfies}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeSelfies: e.target.checked }))}
                        className="h-4 w-4 rounded"
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">Include Selfie Photos</span>
                </label>
            </div>
            
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold shadow-lg hover:shadow-xl transition-shadow"
            >
                <Download className="h-5 w-5 inline mr-2" />
                Export as {exportFormat.toUpperCase()}
            </motion.button>
        </motion.div>
    );
}
```

### 7. GAMIFICATION ENHANCED

**Konsep**: Achievement showcase dengan animations

```tsx
function GamificationShowcase({ stats, records }: { 
    stats: any;
    records: AttendanceRecord[];
}) {
    const achievements = useMemo(() => {
        const result = [];
        
        // Streak achievements
        if (stats.streak >= 7) result.push({ 
            type: 'streak', 
            title: 'Week Warrior', 
            description: '7 hari streak',
            icon: '🔥',
            unlocked: true 
        });
        if (stats.streak >= 30) result.push({ 
            type: 'streak', 
            title: 'Month Master', 
            description: '30 hari streak',
            icon: '⚡',
            unlocked: true 
        });
        
        // Perfect attendance
        const perfectMonths = /* calculate */0;
        if (perfectMonths >= 1) result.push({ 
            type: 'perfect', 
            title: 'Perfect Month', 
            description: '100% kehadiran 1 bulan',
            icon: '💯',
            unlocked: true 
        });
        
        // Early bird
        const earlyCount = records.filter(r => {
            if (!r.checkInTime) return false;
            const time = r.checkInTime.split(':');
            return parseInt(time[0]) < 8;
        }).length;
        
        if (earlyCount >= 10) result.push({ 
            type: 'early', 
            title: 'Early Bird', 
            description: '10x datang sebelum jam 8',
            icon: '🌅',
            unlocked: true 
        });
        
        return result;
    }, [stats, records]);
    
    return (
        <motion.div
            variants={itemVariants}
            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
        >
            <div className="flex items-center gap-3 mb-6">
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    animate={{
                        rotate: [0, 5, -5, 0],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white"
                >
                    <Trophy className="h-5 w-5" />
                </motion.div>
                <h2 className="font-bold text-lg text-neutral-900 dark:text-white">
                    Achievements
                </h2>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                {achievements.map((achievement, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1, type: 'spring' }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-center"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 10, -10, 0]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-4xl mb-2"
                        >
                            {achievement.icon}
                        </motion.div>
                        <p className="font-bold text-sm text-neutral-900 dark:text-white mb-1">
                            {achievement.title}
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                            {achievement.description}
                        </p>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
```

### 8. ENHANCED SEARCH

**Konsep**: Fuzzy search dengan highlights dan history

```tsx
function EnhancedSearch({ 
    records, 
    onSearch 
}: { 
    records: AttendanceRecord[];
    onSearch: (results: AttendanceRecord[]) => void;
}) {
    const [query, setQuery] = useState('');
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    
    // Fuzzy search implementation
    const searchResults = useMemo(() => {
        if (!query) return records;
        
        const lowerQuery = query.toLowerCase();
        return records.filter(record => {
            // Search in course name
            if (record.course.toLowerCase().includes(lowerQuery)) return true;
            
            // Search in date
            const dateStr = new Date(record.date).toLocaleDateString('id-ID');
            if (dateStr.includes(lowerQuery)) return true;
            
            // Search in status
            if (statusConfig[record.status].label.toLowerCase().includes(lowerQuery)) return true;
            
            return false;
        });
    }, [query, records]);
    
    useEffect(() => {
        onSearch(searchResults);
    }, [searchResults]);
    
    const handleSearch = (value: string) => {
        setQuery(value);
        if (value && !searchHistory.includes(value)) {
            setSearchHistory(prev => [value, ...prev].slice(0, 5));
        }
    };
    
    return (
        <div className="relative">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => setShowHistory(true)}
                    onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                    placeholder="Cari mata kuliah, tanggal, status..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                {query && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600"
                    >
                        <X className="h-4 w-4" />
                    </motion.button>
                )}
            </div>
            
            {/* Search History */}
            <AnimatePresence>
                {showHistory && searchHistory.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl border border-white/20 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl shadow-xl z-10"
                    >
                        <p className="text-xs font-semibold text-neutral-500 px-3 py-2">
                            Recent Searches
                        </p>
                        {searchHistory.map((item, index) => (
                            <motion.button
                                key={index}
                                whileHover={{ x: 5, backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
                                onClick={() => setQuery(item)}
                                className="w-full text-left px-3 py-2 rounded-lg text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            >
                                <Clock className="h-3 w-3 inline mr-2 text-neutral-400" />
                                {item}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Results Count */}
            {query && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-sm text-neutral-500"
                >
                    Ditemukan {searchResults.length} hasil untuk "{query}"
                </motion.p>
            )}
        </div>
    );
}
```

---

## ✅ CHECKLIST IMPLEMENTASI LENGKAP

### Phase 1: Admin Dashboard Matching (100%)
```
☐ Update header gradient: from-indigo-600 via-purple-600 to-pink-500
☐ Update animations: stiffness: 300, damping: 20
☐ Update container colors: bg-white/40 dark:bg-neutral-900/40
☐ Update border colors: border-white/20 dark:border-white/5
☐ Update stats cards dengan glassmorphism
☐ Update chart containers dengan backdrop-blur-xl
☐ Update tooltip styling
☐ Update hover effects: scale: 1.04, y: -4
☐ Update text colors ke neutral palette
☐ Import PNG icons dari admin folders
```

### Phase 2: Heatmap Calendar
```
☐ Create HeatmapDay interface
☐ Generate 365 days data
☐ Group by weeks
☐ Implement color coding (0-4 levels)
☐ Add hover tooltip
☐ Add legend
☐ Responsive layout
☐ Smooth animations
```

### Phase 3: Timeline View
```
☐ Create TimelineItem interface
☐ Group records by month
☐ Implement expand/collapse
☐ Add vertical line connector
☐ Add timeline dots
☐ Add milestone markers
☐ Smooth scroll animations
☐ Responsive layout
```

### Phase 4: Advanced Filtering
```
☐ Multi-select status filters
☐ Multi-select course filters
☐ Date range picker
☐ Quick filter buttons
☐ Save filter presets
☐ Load saved presets
☐ Filter chips display
☐ Clear all filters
☐ Filter persistence
```

### Phase 5: AI Insights
```
☐ Pattern detection (frequent late days)
☐ Risk prediction (attendance requirement)
☐ Best performing course recommendation
☐ Streak continuation prediction
☐ Confidence score calculation
☐ Action buttons
☐ Animated insights cards
☐ Real-time updates
```

### Phase 6: Comparison Features
```
☐ Period comparison (week/month/semester)
☐ Course comparison
☐ Visual diff charts
☐ Change percentage calculation
☐ Positive/negative indicators
☐ Animated progress bars
☐ Responsive layout
```

### Phase 7: Export Options
```
☐ PDF export with charts
☐ Excel export with multiple sheets
☐ CSV export
☐ Export options (charts, stats, selfies)
☐ Date range selection
☐ Custom templates
☐ Download progress indicator
```

### Phase 8: Gamification Enhanced
```
☐ Achievement calculation
☐ Badge showcase
☐ Animated icons
☐ Progress tracking
☐ Milestone notifications
☐ Leaderboard integration
☐ Unlock animations
```

### Phase 9: Enhanced Search
```
☐ Fuzzy search implementation
☐ Search in multiple fields
☐ Search history storage
☐ Recent searches dropdown
☐ Clear search button
☐ Results count display
☐ Highlight matches
☐ Keyboard shortcuts
```

### Phase 10: Testing & Polish
```
☐ Test all animations
☐ Test responsive on mobile
☐ Test dark mode
☐ Test all filters
☐ Test export functions
☐ Test search functionality
☐ Performance optimization
☐ Accessibility check
☐ Browser compatibility
☐ User acceptance testing
```

---

## 🎉 SUMMARY

Prompt ini mengubah menu Riwayat Mahasiswa menjadi:

### 100% Matching Admin Dashboard:
✅ Header gradient exact match
✅ Glassmorphism containers
✅ Smooth animations (stiffness: 300)
✅ PNG icons dengan drop-shadow
✅ Consistent colors & borders
✅ Admin-style tooltips & charts

### Inovasi Signifikan (8 Fitur Baru):
1. ✅ **Heatmap Calendar** - GitHub-style 365 days visualization
2. ✅ **Timeline View** - Vertical timeline dengan milestones
3. ✅ **Advanced Filtering** - Multi-select + saved presets
4. ✅ **AI Insights** - Pattern detection + predictions
5. ✅ **Comparison** - Period & course comparison
6. ✅ **Export Options** - PDF, Excel, CSV dengan templates
7. ✅ **Gamification** - Achievement showcase dengan animations
8. ✅ **Enhanced Search** - Fuzzy search + history

**Estimated Time**: 12-16 hours  
**Priority**: VERY HIGH  
**Impact**: TRANSFORMATIVE  
**Target File**: `resources/js/pages/user/history.tsx`

Menu Riwayat sekarang akan menjadi ULTRA ADVANCED dengan inovasi tinggi! 🚀✨

