# PROMPT ULTRA ADVANCED: MONITORING KEHADIRAN MAHASISWA (CEKLIS ABSENSI)

## 🎯 TUJUAN PENGEMBANGAN
Membuat halaman monitoring kehadiran mahasiswa yang komprehensif dengan sistem ceklis per pertemuan untuk semua mata kuliah. Sistem ini dirancang untuk membantu mahasiswa melacak kehadiran mereka dengan logika SKS yang kompleks, sistem periode bergantian (offline/online), dan rolling schedule setelah UTS.

---

## 📋 OVERVIEW FITUR

### Tujuan Utama
1. **Monitoring Absensi**: Melacak kehadiran mahasiswa di setiap pertemuan
2. **Bukti Kehadiran**: Membantu mahasiswa mengingat pertemuan mana yang sudah dikerjakan
3. **Progress Tracking**: Visualisasi progress kehadiran per mata kuliah
4. **Smart Logic**: Otomatis menghitung pertemuan online/offline berdasarkan SKS dan periode

### Lokasi Menu
- **Path**: `/mahasiswa/akademik/kehadiran`
- **Menu Parent**: Akademik (Student Menu)
- **Icon**: CheckSquare (untuk header)

---

## 🎨 DESIGN SYSTEM

### Color Palette (Matching Dashboard)
```typescript
const colors = {
  primary: '#3b82f6',      // Blue
  success: '#10b981',      // Green
  warning: '#f59e0b',      // Orange
  danger: '#ef4444',       // Red
  info: '#06b6d4',         // Cyan
  purple: '#8b5cf6',       // Purple
  
  // Status Colors
  hadir: '#10b981',        // Green - Present
  tidakHadir: '#ef4444',   // Red - Absent
  online: '#06b6d4',       // Cyan - Online Meeting
  offline: '#8b5cf6',      // Purple - Offline Meeting
  belumDimulai: '#94a3b8', // Gray - Not Started
  
  // Background
  bgPrimary: '#ffffff',
  bgSecondary: '#f8fafc',
  bgCard: '#ffffff',
  
  // Border & Shadow
  border: '#e2e8f0',
  shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  shadowMd: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  shadowLg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
};
```

### Typography
```typescript
const typography = {
  // Headers
  h1: 'text-2xl md:text-3xl font-bold text-gray-900',
  h2: 'text-xl md:text-2xl font-semibold text-gray-900',
  h3: 'text-lg md:text-xl font-semibold text-gray-800',
  h4: 'text-base md:text-lg font-semibold text-gray-800',
  
  // Body
  body: 'text-sm md:text-base text-gray-700',
  bodySmall: 'text-xs md:text-sm text-gray-600',
  caption: 'text-xs text-gray-500',
  
  // Special
  label: 'text-sm font-medium text-gray-700',
  value: 'text-sm font-semibold text-gray-900',
};
```

---

## 🧮 LOGIKA SKS & PERIODE (CRITICAL)

### Aturan Dasar SKS
```typescript
const SKS_RULES = {
  SKS_3: {
    totalPertemuan: 21,
    pertemuanPerMinggu: 1, // Offline: 1x/minggu, Online: 2x/minggu
  },
  SKS_2: {
    totalPertemuan: 14,
    pertemuanPerMinggu: 1,
  },
};
```

### Sistem Periode

#### PERIODE 1 (Offline Sekarang)

### Perubahan Setelah UTS (Mid-Term Exam)
**PENTING**: Setelah UTS, periode akan di-rolling (dibalik):
- **Periode 1**: Berubah menjadi ONLINE
- **Periode 2**: Berubah menjadi OFFLINE

Logika mode pertemuan akan disesuaikan otomatis berdasarkan periode baru ini.

### Tujuan Fitur
1. **Monitoring Real-time**: Mahasiswa dapat melihat status kehadiran per pertemuan
2. **Pencegahan Lupa**: Membantu mahasiswa mengingat pertemuan mana yang sudah dikerjakan
3. **Visualisasi Progress**: Menampilkan progress kehadiran dalam bentuk checklist visual
4. **Perencanaan**: Membantu mahasiswa merencanakan kehadiran di pertemuan mendatang
5. **Transparansi**: Memberikan informasi jelas tentang mode pertemuan (online/offline)

## 🎨 DESIGN SYSTEM REFERENCE

### Warna Utama (Sesuai Dashboard Admin)
```typescript
const colors = {
  primary: {
    gradient: 'from-blue-500 to-blue-600',
    solid: '#3B82F6',
    light: '#DBEAFE',
    dark: '#1E40AF'
  },
  success: {
    gradient: 'from-green-500 to-green-600',
    solid: '#10B981',
    light: '#D1FAE5',
    dark: '#047857'
  },
  warning: {
    gradient: 'from-yellow-500 to-yellow-600',
    solid: '#F59E0B',
    light: '#FEF3C7',
    dark: '#D97706'
  },
  danger: {
    gradient: 'from-red-500 to-red-600',
    solid: '#EF4444',
    light: '#FEE2E2',
    dark: '#DC2626'
  },
  info: {
    gradient: 'from-cyan-500 to-cyan-600',
    solid: '#06B6D4',
    light: '#CFFAFE',
    dark: '#0891B2'
  },
  purple: {
    gradient: 'from-purple-500 to-purple-600',
    solid: '#A855F7',
    light: '#F3E8FF',
    dark: '#7E22CE'
  }
}
```

### Typography
```typescript
const typography = {
  pageTitle: 'text-2xl md:text-3xl font-bold text-gray-800',
  sectionTitle: 'text-xl font-semibold text-gray-800',
  cardTitle: 'text-lg font-semibold text-gray-800',
  body: 'text-sm text-gray-600',
  caption: 'text-xs text-gray-500',
  label: 'text-sm font-medium text-gray-700'
}
```


### Spacing & Layout
```typescript
const spacing = {
  containerPadding: 'p-4 md:p-6 lg:p-8',
  cardPadding: 'p-4 md:p-6',
  sectionGap: 'space-y-6',
  cardGap: 'space-y-4',
  elementGap: 'space-y-2'
}
```

### Shadows & Borders
```typescript
const effects = {
  cardShadow: 'shadow-lg hover:shadow-xl transition-shadow duration-300',
  borderRadius: 'rounded-xl',
  border: 'border border-gray-200'
}
```

## 🏗️ STRUKTUR HALAMAN

### 1. Header Section
```typescript
// PENTING: NO container wrapper pada icon header
// NO floating animations pada icon
<div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
  <div className="container mx-auto px-4 py-6 md:py-8">
    {/* Back Button - Matching style dengan menu lain */}
    <button className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors">
      <ArrowLeft className="w-5 h-5" />
      <span className="text-sm font-medium">Kembali</span>
    </button>

    {/* Header Content */}
    <div className="flex items-center gap-4">
      {/* Icon - NO container, NO floating animation */}
      <CheckSquare className="w-10 h-10 md:w-12 md:h-12 text-white" />
      
      <div className="flex-1">
        <h1 className="text-2xl md:text-3xl font-bold">
          Monitoring Kehadiran
        </h1>
        <p className="text-white/90 text-sm md:text-base mt-1">
          Pantau kehadiran Anda di setiap mata kuliah
        </p>
      </div>
    </div>
  </div>
</div>
```

### 2. Filter & Summary Section
```typescript
<div className="container mx-auto px-4 py-6 space-y-6">
  {/* Period Selector */}
  <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* Period Toggle */}
      <div className="flex items-center gap-3">
        <Calendar className="w-5 h-5 text-blue-500" />
        <div>
          <p className="text-sm font-medium text-gray-700">Periode Aktif</p>
          <p className="text-xs text-gray-500">
            {isBeforeUTS ? 'Sebelum UTS' : 'Setelah UTS'}
          </p>
        </div>
      </div>

      {/* Period Buttons */}
      <div className="flex gap-2">
        <button className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
          selectedPeriod === 1 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}>
          Periode 1 {isBeforeUTS ? '(Offline)' : '(Online)'}
        </button>
        <button className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
          selectedPeriod === 2 
            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}>
          Periode 2 {isBeforeUTS ? '(Online)' : '(Offline)'}
        </button>
      </div>
    </div>

    {/* UTS Status Banner */}
    <div className={`mt-4 p-3 rounded-lg ${
      isBeforeUTS 
        ? 'bg-blue-50 border border-blue-200' 
        : 'bg-purple-50 border border-purple-200'
    }`}>
      <div className="flex items-center gap-2">
        <Info className={`w-4 h-4 ${isBeforeUTS ? 'text-blue-500' : 'text-purple-500'}`} />
        <p className="text-sm text-gray-700">
          {isBeforeUTS 
            ? 'Periode saat ini: Sebelum UTS. Periode 1 = Offline, Periode 2 = Online'
            : 'Periode saat ini: Setelah UTS. Periode 1 = Online, Periode 2 = Offline (Rolling)'
          }
        </p>
      </div>
    </div>
  </div>


  {/* Overall Summary Cards */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {/* Total Mata Kuliah */}
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-xs mb-1">Total Mata Kuliah</p>
          <p className="text-2xl font-bold">{totalCourses}</p>
        </div>
        <BookOpen className="w-8 h-8 text-white/30" />
      </div>
    </div>

    {/* Total Pertemuan */}
    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-xs mb-1">Total Pertemuan</p>
          <p className="text-2xl font-bold">{totalMeetings}</p>
        </div>
        <Calendar className="w-8 h-8 text-white/30" />
      </div>
    </div>

    {/* Kehadiran */}
    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-xs mb-1">Hadir</p>
          <p className="text-2xl font-bold">{attendedMeetings}</p>
          <p className="text-white/70 text-xs">{attendancePercentage}%</p>
        </div>
        <CheckCircle className="w-8 h-8 text-white/30" />
      </div>
    </div>

    {/* Tidak Hadir */}
    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-xs mb-1">Tidak Hadir</p>
          <p className="text-2xl font-bold">{absentMeetings}</p>
          <p className="text-white/70 text-xs">{absentPercentage}%</p>
        </div>
        <XCircle className="w-8 h-8 text-white/30" />
      </div>
    </div>
  </div>
</div>
```

### 3. Course Attendance Cards Section
```typescript
<div className="container mx-auto px-4 pb-8 space-y-6">
  {courses.map((course) => {
    const totalMeetings = course.sks === 3 ? 21 : 14;
    const attendedCount = course.meetings.filter(m => m.attended).length;
    const attendanceRate = (attendedCount / totalMeetings) * 100;
    
    return (
      <div key={course.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Course Header */}
        <div className={`bg-gradient-to-r ${course.colorGradient} p-4 md:p-6 text-white`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5" />
                <h3 className="text-lg md:text-xl font-bold">
                  {course.name}
                </h3>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>SKS {course.sks}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{course.lecturer}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{course.room}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{course.time}</span>
                </div>
              </div>
            </div>

            {/* Attendance Badge */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
              <p className="text-xs text-white/80 mb-1">Kehadiran</p>
              <p className="text-xl font-bold">{attendanceRate.toFixed(0)}%</p>
              <p className="text-xs text-white/80">{attendedCount}/{totalMeetings}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="bg-white/20 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-white h-full transition-all duration-500"
                style={{ width: `${attendanceRate}%` }}
              />
            </div>
          </div>
        </div>


        {/* Meetings Checklist */}
        <div className="p-4 md:p-6">
          {/* Meeting Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {Array.from({ length: totalMeetings }, (_, index) => {
              const meetingNumber = index + 1;
              const meeting = course.meetings.find(m => m.number === meetingNumber);
              const isOnline = getMeetingMode(course.sks, course.period, meetingNumber, isBeforeUTS);
              const status = meeting?.status || 'upcoming'; // attended, absent, upcoming
              
              return (
                <div
                  key={meetingNumber}
                  className={`relative rounded-lg p-3 border-2 transition-all duration-300 ${
                    status === 'attended'
                      ? 'bg-green-50 border-green-500 shadow-md'
                      : status === 'absent'
                      ? 'bg-red-50 border-red-500 shadow-md'
                      : 'bg-gray-50 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {/* Meeting Number */}
                  <div className="text-center mb-2">
                    <p className="text-xs text-gray-500 mb-1">Pertemuan</p>
                    <p className={`text-2xl font-bold ${
                      status === 'attended' ? 'text-green-600' :
                      status === 'absent' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {meetingNumber}
                    </p>
                  </div>

                  {/* Mode Badge */}
                  <div className={`flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                    isOnline 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {isOnline ? (
                      <>
                        <Wifi className="w-3 h-3" />
                        <span>Online</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3 h-3" />
                        <span>Offline</span>
                      </>
                    )}
                  </div>

                  {/* Status Icon */}
                  <div className="absolute -top-2 -right-2">
                    {status === 'attended' && (
                      <div className="bg-green-500 rounded-full p-1 shadow-lg">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    {status === 'absent' && (
                      <div className="bg-red-500 rounded-full p-1 shadow-lg">
                        <X className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Meeting Date (if available) */}
                  {meeting?.date && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      {formatDate(meeting.date)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">Keterangan:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-gray-600">Hadir</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <X className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-gray-600">Tidak Hadir</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded-full" />
                <span className="text-sm text-gray-600">Belum Terlaksana</span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  })}
</div>
```


## 🔧 LOGIKA IMPLEMENTASI

### 1. Function: getMeetingMode
```typescript
/**
 * Menentukan mode pertemuan (online/offline) berdasarkan SKS, periode, dan status UTS
 * 
 * @param sks - SKS mata kuliah (2 atau 3)
 * @param period - Periode mata kuliah (1 atau 2)
 * @param meetingNumber - Nomor pertemuan (1-21 untuk SKS 3, 1-14 untuk SKS 2)
 * @param isBeforeUTS - Status apakah sebelum UTS atau tidak
 * @returns boolean - true jika online, false jika offline
 */
function getMeetingMode(
  sks: number, 
  period: number, 
  meetingNumber: number, 
  isBeforeUTS: boolean
): boolean {
  // Setelah UTS, periode di-rolling (dibalik)
  const effectivePeriod = isBeforeUTS ? period : (period === 1 ? 2 : 1);
  
  // PERIODE 1 (Offline sebelum UTS, Online setelah UTS)
  if (effectivePeriod === 1) {
    if (isBeforeUTS) {
      // Periode 1 = Offline
      if (sks === 3) {
        // SKS 3: Pertemuan 3, 6, 9, 12, 15, 18, 21 adalah online
        return meetingNumber % 3 === 0;
      } else {
        // SKS 2: Semua offline
        return false;
      }
    } else {
      // Setelah UTS, Periode 1 = Online
      return true; // Semua online
    }
  }
  
  // PERIODE 2 (Online sebelum UTS, Offline setelah UTS)
  if (effectivePeriod === 2) {
    if (isBeforeUTS) {
      // Periode 2 = Online
      return true; // Semua online
    } else {
      // Setelah UTS, Periode 2 = Offline
      if (sks === 3) {
        // SKS 3: Pertemuan 3, 6, 9, 12, 15, 18, 21 adalah online
        return meetingNumber % 3 === 0;
      } else {
        // SKS 2: Semua offline
        return false;
      }
    }
  }
  
  return false;
}
```

### 2. Function: calculateAttendanceStats
```typescript
/**
 * Menghitung statistik kehadiran untuk semua mata kuliah
 */
function calculateAttendanceStats(courses: Course[]) {
  let totalMeetings = 0;
  let attendedMeetings = 0;
  let absentMeetings = 0;
  let upcomingMeetings = 0;

  courses.forEach(course => {
    const courseTotalMeetings = course.sks === 3 ? 21 : 14;
    totalMeetings += courseTotalMeetings;

    course.meetings.forEach(meeting => {
      if (meeting.status === 'attended') {
        attendedMeetings++;
      } else if (meeting.status === 'absent') {
        absentMeetings++;
      } else {
        upcomingMeetings++;
      }
    });
  });

  const attendancePercentage = totalMeetings > 0 
    ? ((attendedMeetings / totalMeetings) * 100).toFixed(1)
    : '0.0';

  const absentPercentage = totalMeetings > 0
    ? ((absentMeetings / totalMeetings) * 100).toFixed(1)
    : '0.0';

  return {
    totalMeetings,
    attendedMeetings,
    absentMeetings,
    upcomingMeetings,
    attendancePercentage,
    absentPercentage
  };
}
```

### 3. Function: getAttendanceWarning
```typescript
/**
 * Memberikan warning jika kehadiran di bawah batas minimum
 * Batas minimum kehadiran: 75%
 */
function getAttendanceWarning(attendanceRate: number): {
  show: boolean;
  level: 'danger' | 'warning' | 'safe';
  message: string;
} {
  if (attendanceRate < 75) {
    return {
      show: true,
      level: 'danger',
      message: 'Kehadiran Anda di bawah 75%! Segera tingkatkan kehadiran untuk memenuhi syarat mengikuti ujian.'
    };
  } else if (attendanceRate < 80) {
    return {
      show: true,
      level: 'warning',
      message: 'Kehadiran Anda mendekati batas minimum. Pastikan untuk hadir di pertemuan selanjutnya.'
    };
  }
  
  return {
    show: false,
    level: 'safe',
    message: ''
  };
}
```


**SKS 3 (Offline - Periode 1)**:
- Total: 21 pertemuan
- Pola: Mayoritas offline, tapi ada pertemuan online di pertemuan ke-3, 6, 9, 12, 15, 18, 21 (setiap kelipatan 3)
- Contoh: P1 (offline) → P2 (offline) → P3 (online) → P4 (offline) → P5 (offline) → P6 (online) → dst

**SKS 2 (Offline - Periode 1)**:
- Total: 14 pertemuan
- Pola: Full offline, tidak ada pertemuan online
- Contoh: P1-P14 semua offline

#### PERIODE 2 (Online Sekarang)

**SKS 3 (Online - Periode 2)**:
- Total: 21 pertemuan
- Pola: Semua online, 2 pertemuan per minggu
- Minggu 1: P1, P2 (online)
- Minggu 2: P3, P4 (online)
- Minggu 3: P5, P6 (online)
- dst sampai P21

**SKS 2 (Online - Periode 2)**:
- Total: 14 pertemuan
- Pola: Semua online, 1 pertemuan per minggu
- Contoh: P1-P14 semua online

### Rolling System (Setelah UTS)

Setelah UTS (Mid-Term), periode akan di-flip:
- **Periode 1** yang tadinya offline → menjadi online
- **Periode 2** yang tadinya online → menjadi offline

```typescript
interface PeriodeConfig {
  periode: 1 | 2;
  isBeforeUTS: boolean;
  mode: 'offline' | 'online';
}

function getPeriodeMode(periode: 1 | 2, isBeforeUTS: boolean): 'offline' | 'online' {
  if (isBeforeUTS) {
    return periode === 1 ? 'offline' : 'online';
  } else {
    // After UTS: flip
    return periode === 1 ? 'online' : 'offline';
  }
}
```


### 4. Data Structure
```typescript
interface Meeting {
  number: number;           // Nomor pertemuan (1-21 atau 1-14)
  date?: string;            // Tanggal pertemuan (ISO format)
  status: 'attended' | 'absent' | 'upcoming';
  mode?: 'online' | 'offline'; // Calculated based on logic
  topic?: string;           // Topik pertemuan (optional)
  notes?: string;           // Catatan (optional)
}

interface Course {
  id: string;
  name: string;             // Nama mata kuliah
  code: string;             // Kode mata kuliah
  sks: 2 | 3;              // SKS mata kuliah
  period: 1 | 2;           // Periode (1 atau 2)
  lecturer: string;         // Nama dosen
  room: string;             // Ruangan (e.g., "V.109")
  time: string;             // Waktu (e.g., "08:00 - 10:30")
  day: string;              // Hari (e.g., "Senin")
  colorGradient: string;    // Gradient color untuk card
  meetings: Meeting[];      // Array of meetings
}

interface AttendanceData {
  courses: Course[];
  isBeforeUTS: boolean;     // Status UTS
  selectedPeriod: 1 | 2;    // Periode yang dipilih
  lastUpdated: string;      // Timestamp last update
}
```

## 🎯 FITUR INOVATIF

### 1. Smart Attendance Prediction
```typescript
// Prediksi kehadiran yang dibutuhkan untuk mencapai target 75%
function calculateRequiredAttendance(
  totalMeetings: number,
  attendedMeetings: number,
  remainingMeetings: number
): {
  required: number;
  canAchieve: boolean;
  message: string;
} {
  const targetPercentage = 75;
  const requiredTotal = Math.ceil((targetPercentage / 100) * totalMeetings);
  const required = requiredTotal - attendedMeetings;
  const canAchieve = required <= remainingMeetings;

  return {
    required: Math.max(0, required),
    canAchieve,
    message: canAchieve
      ? `Anda perlu hadir di ${required} dari ${remainingMeetings} pertemuan tersisa untuk mencapai 75%`
      : `Tidak mungkin mencapai 75% kehadiran. Maksimal yang bisa dicapai: ${
          ((attendedMeetings + remainingMeetings) / totalMeetings * 100).toFixed(1)
        }%`
  };
}
```

### 2. Attendance Streak Tracker
```typescript
// Melacak streak kehadiran berturut-turut
function calculateAttendanceStreak(meetings: Meeting[]): {
  currentStreak: number;
  longestStreak: number;
  isActive: boolean;
} {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const sortedMeetings = meetings
    .filter(m => m.status !== 'upcoming')
    .sort((a, b) => a.number - b.number);

  for (let i = sortedMeetings.length - 1; i >= 0; i--) {
    if (sortedMeetings[i].status === 'attended') {
      if (i === sortedMeetings.length - 1) {
        currentStreak++;
      }
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      if (i === sortedMeetings.length - 1) {
        currentStreak = 0;
      }
      tempStreak = 0;
    }
  }

  return {
    currentStreak,
    longestStreak,
    isActive: currentStreak > 0
  };
}
```

### 3. Weekly Schedule Preview
```typescript
// Menampilkan pertemuan yang akan datang minggu ini
function getUpcomingMeetingsThisWeek(courses: Course[]): {
  course: Course;
  meeting: Meeting;
  daysUntil: number;
}[] {
  const today = new Date();
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);

  const upcoming: any[] = [];

  courses.forEach(course => {
    course.meetings
      .filter(m => m.status === 'upcoming' && m.date)
      .forEach(meeting => {
        const meetingDate = new Date(meeting.date!);
        if (meetingDate >= today && meetingDate <= weekEnd) {
          const daysUntil = Math.ceil(
            (meetingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );
          upcoming.push({ course, meeting, daysUntil });
        }
      });
  });

  return upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
}
```


### Algoritma Penentuan Mode Pertemuan

```typescript
function getMeetingMode(
  pertemuan: number,
  sks: 2 | 3,
  periode: 1 | 2,
  isBeforeUTS: boolean
): 'online' | 'offline' {
  const periodeMode = getPeriodeMode(periode, isBeforeUTS);
  
  // SKS 2: Selalu mengikuti mode periode
  if (sks === 2) {
    return periodeMode;
  }
  
  // SKS 3: Ada logika khusus
  if (periodeMode === 'offline') {
    // Offline mode: pertemuan 3, 6, 9, 12, 15, 18, 21 adalah online
    return pertemuan % 3 === 0 ? 'online' : 'offline';
  } else {
    // Online mode: semua online
    return 'online';
  }
}
```

---

## 📊 DATA STRUCTURE

### Course Data (8 Mata Kuliah)
```typescript
interface MataKuliah {
  id: string;
  kode: string;
  nama: string;
  sks: 2 | 3;
  dosen: string;
  kelas: string;
  hari: string;
  waktu: string;
  periode: 1 | 2;
  ruangan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
}

const mataKuliahList: MataKuliah[] = [
  // Data dari gambar yang diberikan user
  // Contoh struktur (sesuaikan dengan data real)
];
```

### Meeting Data
```typescript
interface Pertemuan {
  id: string;
  mataKuliahId: string;
  nomorPertemuan: number;
  tanggal: string;
  waktu: string;
  mode: 'online' | 'offline';
  status: 'hadir' | 'tidak-hadir' | 'belum-dimulai';
  topik?: string;
  catatan?: string;
}
```


### 4. Export Attendance Report
```typescript
// Export laporan kehadiran ke PDF atau Excel
function exportAttendanceReport(
  courses: Course[],
  format: 'pdf' | 'excel'
): void {
  const reportData = courses.map(course => {
    const totalMeetings = course.sks === 3 ? 21 : 14;
    const attended = course.meetings.filter(m => m.status === 'attended').length;
    const absent = course.meetings.filter(m => m.status === 'absent').length;
    const rate = ((attended / totalMeetings) * 100).toFixed(1);

    return {
      'Mata Kuliah': course.name,
      'Kode': course.code,
      'SKS': course.sks,
      'Dosen': course.lecturer,
      'Total Pertemuan': totalMeetings,
      'Hadir': attended,
      'Tidak Hadir': absent,
      'Persentase': `${rate}%`,
      'Status': parseFloat(rate) >= 75 ? 'Memenuhi Syarat' : 'Tidak Memenuhi Syarat'
    };
  });

  if (format === 'pdf') {
    generatePDF(reportData);
  } else {
    generateExcel(reportData);
  }
}
```

### 5. Attendance Reminder System
```typescript
// Sistem reminder untuk pertemuan yang akan datang
function getAttendanceReminders(courses: Course[]): {
  urgent: any[];      // Pertemuan hari ini atau besok
  upcoming: any[];    // Pertemuan minggu ini
  critical: any[];    // Mata kuliah dengan kehadiran < 75%
} {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);

  const urgent: any[] = [];
  const upcoming: any[] = [];
  const critical: any[] = [];

  courses.forEach(course => {
    const totalMeetings = course.sks === 3 ? 21 : 14;
    const attended = course.meetings.filter(m => m.status === 'attended').length;
    const rate = (attended / totalMeetings) * 100;

    // Check critical attendance
    if (rate < 75) {
      critical.push({
        course,
        rate: rate.toFixed(1),
        required: Math.ceil((0.75 * totalMeetings) - attended)
      });
    }

    // Check upcoming meetings
    course.meetings
      .filter(m => m.status === 'upcoming' && m.date)
      .forEach(meeting => {
        const meetingDate = new Date(meeting.date!);
        
        if (meetingDate <= tomorrow) {
          urgent.push({ course, meeting, date: meetingDate });
        } else if (meetingDate <= weekEnd) {
          upcoming.push({ course, meeting, date: meetingDate });
        }
      });
  });

  return { urgent, upcoming, critical };
}
```

## 📱 RESPONSIVE DESIGN

### Mobile View (< 768px)
```typescript
// Stack layout untuk mobile
<div className="space-y-4">
  {/* Header - Full width */}
  <div className="px-4 py-6">
    {/* Compact header */}
  </div>

  {/* Period selector - Vertical stack */}
  <div className="px-4">
    <div className="flex flex-col gap-2">
      {/* Period buttons full width */}
    </div>
  </div>

  {/* Summary cards - 2 columns */}
  <div className="grid grid-cols-2 gap-3 px-4">
    {/* Summary cards */}
  </div>

  {/* Course cards - Full width */}
  <div className="px-4 space-y-4">
    {/* Meeting grid - 2 columns on mobile */}
    <div className="grid grid-cols-2 gap-2">
      {/* Meeting items */}
    </div>
  </div>
</div>
```

### Tablet View (768px - 1024px)
```typescript
// Optimized for tablet
<div className="space-y-6">
  {/* Summary cards - 2 columns */}
  <div className="grid grid-cols-2 gap-4">
    {/* Cards */}
  </div>

  {/* Meeting grid - 3-4 columns */}
  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
    {/* Meetings */}
  </div>
</div>
```

### Desktop View (> 1024px)
```typescript
// Full layout
<div className="space-y-6">
  {/* Summary cards - 4 columns */}
  <div className="grid grid-cols-4 gap-4">
    {/* Cards */}
  </div>

  {/* Meeting grid - 7 columns (1 week) */}
  <div className="grid grid-cols-7 gap-3">
    {/* Meetings */}
  </div>
</div>
```


### Progress Data
```typescript
interface ProgressMataKuliah {
  mataKuliahId: string;
  totalPertemuan: number;
  pertemuanHadir: number;
  pertemuanTidakHadir: number;
  pertemuanBelumDimulai: number;
  persentaseKehadiran: number;
  statusKehadiran: 'baik' | 'cukup' | 'kurang' | 'buruk';
}
```

---

## 🎨 UI/UX STRUCTURE

### 1. Header Section
```tsx
<div className="bg-white border-b border-gray-200 sticky top-0 z-10">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
    {/* Back Button */}
    <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
      <ChevronLeft className="w-5 h-5" />
      <span className="text-sm font-medium">Kembali</span>
    </button>
    
    {/* Header Content */}
    <div className="flex items-start gap-4">
      {/* Icon - NO CONTAINER */}
      <div className="flex-shrink-0">
        <CheckSquare className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
      </div>
      
      {/* Title & Description */}
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Monitoring Kehadiran
        </h1>
        <p className="mt-1 text-sm md:text-base text-gray-600">
          Pantau dan lacak kehadiran Anda di setiap pertemuan mata kuliah
        </p>
      </div>
    </div>
  </div>
</div>
```

### 2. Summary Statistics Section
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {/* Total Mata Kuliah */}
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <BookOpen className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500">Total Mata Kuliah</p>
          <p className="text-xl font-bold text-gray-900">8</p>
        </div>
      </div>
    </div>
    
    {/* Total Pertemuan */}
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-50 rounded-lg">
          <Calendar className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500">Total Pertemuan</p>
          <p className="text-xl font-bold text-gray-900">142</p>
        </div>
      </div>
    </div>

    
    {/* Kehadiran */}
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-50 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500">Hadir</p>
          <p className="text-xl font-bold text-gray-900">98</p>
        </div>
      </div>
    </div>
    
    {/* Persentase */}
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-cyan-50 rounded-lg">
          <TrendingUp className="w-5 h-5 text-cyan-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500">Persentase</p>
          <p className="text-xl font-bold text-gray-900">89%</p>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 3. Filter & Search Section
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Search */}
      <div className="md:col-span-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari mata kuliah..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
      
      {/* Filter Periode */}
      <select className="px-4 py-2 border border-gray-300 rounded-lg">
        <option value="">Semua Periode</option>
        <option value="1">Periode 1</option>
        <option value="2">Periode 2</option>
      </select>
      
      {/* Filter SKS */}
      <select className="px-4 py-2 border border-gray-300 rounded-lg">
        <option value="">Semua SKS</option>
        <option value="2">SKS 2</option>
        <option value="3">SKS 3</option>
      </select>
    </div>
  </div>
</div>
```


## 🎨 ADDITIONAL UI COMPONENTS

### 1. Attendance Warning Banner
```typescript
// Banner peringatan untuk kehadiran rendah
{courses.map(course => {
  const totalMeetings = course.sks === 3 ? 21 : 14;
  const attended = course.meetings.filter(m => m.status === 'attended').length;
  const rate = (attended / totalMeetings) * 100;
  const warning = getAttendanceWarning(rate);

  return warning.show && (
    <div key={course.id} className={`rounded-lg p-4 mb-4 ${
      warning.level === 'danger' 
        ? 'bg-red-50 border-l-4 border-red-500' 
        : 'bg-yellow-50 border-l-4 border-yellow-500'
    }`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={`w-5 h-5 mt-0.5 ${
          warning.level === 'danger' ? 'text-red-500' : 'text-yellow-500'
        }`} />
        <div className="flex-1">
          <p className={`font-semibold text-sm ${
            warning.level === 'danger' ? 'text-red-800' : 'text-yellow-800'
          }`}>
            {course.name}
          </p>
          <p className={`text-sm mt-1 ${
            warning.level === 'danger' ? 'text-red-700' : 'text-yellow-700'
          }`}>
            {warning.message}
          </p>
          <p className="text-xs mt-2 text-gray-600">
            Kehadiran saat ini: {rate.toFixed(1)}% ({attended}/{totalMeetings} pertemuan)
          </p>
        </div>
      </div>
    </div>
  );
})}
```

### 2. Upcoming Meetings Widget
```typescript
// Widget pertemuan yang akan datang
<div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
  <div className="flex items-center gap-2 mb-4">
    <Calendar className="w-5 h-5 text-blue-500" />
    <h3 className="text-lg font-semibold text-gray-800">
      Pertemuan Minggu Ini
    </h3>
  </div>

  {upcomingThisWeek.length === 0 ? (
    <div className="text-center py-8">
      <CalendarX className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500 text-sm">
        Tidak ada pertemuan minggu ini
      </p>
    </div>
  ) : (
    <div className="space-y-3">
      {upcomingThisWeek.map((item, index) => {
        const isOnline = getMeetingMode(
          item.course.sks,
          item.course.period,
          item.meeting.number,
          isBeforeUTS
        );

        return (
          <div
            key={index}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.course.colorGradient} flex items-center justify-center text-white font-bold`}>
              {item.meeting.number}
            </div>
            
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-800">
                {item.course.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  isOnline 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
                <span className="text-xs text-gray-500">
                  {item.course.time}
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500">
                {item.daysUntil === 0 ? 'Hari ini' : 
                 item.daysUntil === 1 ? 'Besok' : 
                 `${item.daysUntil} hari lagi`}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  )}
</div>
```

### 3. Attendance Statistics Card
```typescript
// Card statistik kehadiran detail
<div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
  <div className="flex items-center gap-2 mb-4">
    <TrendingUp className="w-5 h-5 text-green-500" />
    <h3 className="text-lg font-semibold text-gray-800">
      Statistik Kehadiran
    </h3>
  </div>

  <div className="space-y-4">
    {/* Overall Progress */}
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">Kehadiran Keseluruhan</span>
        <span className="text-sm font-semibold text-gray-800">
          {stats.attendancePercentage}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            parseFloat(stats.attendancePercentage) >= 75
              ? 'bg-gradient-to-r from-green-500 to-green-600'
              : 'bg-gradient-to-r from-red-500 to-red-600'
          }`}
          style={{ width: `${stats.attendancePercentage}%` }}
        />
      </div>
    </div>

    {/* Breakdown */}
    <div className="grid grid-cols-3 gap-3">
      <div className="text-center p-3 bg-green-50 rounded-lg">
        <p className="text-2xl font-bold text-green-600">
          {stats.attendedMeetings}
        </p>
        <p className="text-xs text-gray-600 mt-1">Hadir</p>
      </div>
      <div className="text-center p-3 bg-red-50 rounded-lg">
        <p className="text-2xl font-bold text-red-600">
          {stats.absentMeetings}
        </p>
        <p className="text-xs text-gray-600 mt-1">Tidak Hadir</p>
      </div>
      <div className="text-center p-3 bg-gray-50 rounded-lg">
        <p className="text-2xl font-bold text-gray-600">
          {stats.upcomingMeetings}
        </p>
        <p className="text-xs text-gray-600 mt-1">Mendatang</p>
      </div>
    </div>

    {/* Streak */}
    {streak.isActive && (
      <div className="p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">
              Streak Kehadiran: {streak.currentStreak} pertemuan
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              Rekor terbaik: {streak.longestStreak} pertemuan
            </p>
          </div>
        </div>
      </div>
    )}
  </div>
</div>
```


### 4. Course Cards with Checklist
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
  {mataKuliahList.map((matkul) => (
    <div key={matkul.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Card Header */}
      <div className="p-4 md:p-6 border-b border-gray-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Kode & Nama */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                {matkul.kode}
              </span>
              <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded">
                SKS {matkul.sks}
              </span>
              <span className="px-2 py-1 bg-cyan-50 text-cyan-700 text-xs font-medium rounded">
                Periode {matkul.periode}
              </span>
            </div>
            <h3 className="mt-2 text-lg font-semibold text-gray-900">
              {matkul.nama}
            </h3>
            
            {/* Info */}
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{matkul.dosen}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{matkul.hari}, {matkul.waktu}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{matkul.ruangan}</span>
              </div>
            </div>
          </div>
          
          {/* Progress Circle */}
          <div className="flex-shrink-0">
            <div className="relative w-16 h-16">
              {/* SVG Circle Progress */}
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#e5e7eb"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#10b981"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${progress.persentaseKehadiran * 1.76} 176`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-900">
                  {progress.persentaseKehadiran}%
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Progress Kehadiran</span>
            <span>{progress.pertemuanHadir} / {progress.totalPertemuan} Pertemuan</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.persentaseKehadiran}%` }}
            />
          </div>
        </div>
      </div>

      
      {/* Checklist Pertemuan */}
      <div className="p-4 md:p-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">
          Daftar Pertemuan ({matkul.sks === 3 ? '21' : '14'} Pertemuan)
        </h4>
        
        {/* Grid Checklist */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {pertemuanList.map((pertemuan) => (
            <button
              key={pertemuan.id}
              className={`
                relative p-3 rounded-lg border-2 transition-all duration-200
                ${getChecklistStyle(pertemuan.status, pertemuan.mode)}
              `}
            >
              {/* Nomor Pertemuan */}
              <div className="text-center">
                <div className="text-xs font-medium mb-1">P{pertemuan.nomorPertemuan}</div>
                
                {/* Icon Status */}
                <div className="flex justify-center">
                  {pertemuan.status === 'hadir' && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  {pertemuan.status === 'tidak-hadir' && (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  {pertemuan.status === 'belum-dimulai' && (
                    <Clock className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                
                {/* Mode Badge */}
                <div className="mt-1">
                  {pertemuan.mode === 'online' ? (
                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-cyan-50 rounded text-[10px] text-cyan-700">
                      <Wifi className="w-3 h-3" />
                      <span>Online</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-50 rounded text-[10px] text-purple-700">
                      <MapPin className="w-3 h-3" />
                      <span>Offline</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Tooltip on Hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block">
                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  {pertemuan.tanggal}
                </div>
              </div>
            </button>
          ))}
        </div>
        
        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-gray-600">Hadir</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-gray-600">Tidak Hadir</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Belum Dimulai</span>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-cyan-600" />
              <span className="text-gray-600">Online</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-600" />
              <span className="text-gray-600">Offline</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>
```


### 4. Filter & Sort Options
```typescript
// Filter dan sorting untuk mata kuliah
<div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6">
  <div className="flex flex-col md:flex-row gap-4">
    {/* Search */}
    <div className="flex-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari mata kuliah..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>

    {/* Filter by SKS */}
    <select
      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      value={filterSKS}
      onChange={(e) => setFilterSKS(e.target.value)}
    >
      <option value="all">Semua SKS</option>
      <option value="2">SKS 2</option>
      <option value="3">SKS 3</option>
    </select>

    {/* Sort */}
    <select
      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
    >
      <option value="name">Nama Mata Kuliah</option>
      <option value="attendance-asc">Kehadiran Terendah</option>
      <option value="attendance-desc">Kehadiran Tertinggi</option>
      <option value="sks">SKS</option>
    </select>
  </div>
</div>
```

### 5. Quick Actions Floating Button
```typescript
// Floating action button untuk aksi cepat
<div className="fixed bottom-6 right-6 z-50">
  <div className="relative">
    {/* Main FAB */}
    <button
      onClick={() => setShowActions(!showActions)}
      className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
    >
      {showActions ? (
        <X className="w-6 h-6" />
      ) : (
        <MoreVertical className="w-6 h-6" />
      )}
    </button>

    {/* Action Menu */}
    {showActions && (
      <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl p-2 space-y-1 min-w-[200px]">
        <button
          onClick={() => exportAttendanceReport(courses, 'pdf')}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FileText className="w-4 h-4 text-red-500" />
          <span>Export PDF</span>
        </button>
        
        <button
          onClick={() => exportAttendanceReport(courses, 'excel')}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4 text-green-500" />
          <span>Export Excel</span>
        </button>

        <button
          onClick={() => setShowReminders(true)}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell className="w-4 h-4 text-yellow-500" />
          <span>Lihat Reminder</span>
        </button>

        <button
          onClick={() => refreshData()}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-blue-500" />
          <span>Refresh Data</span>
        </button>
      </div>
    )}
  </div>
</div>
```

## 🔄 STATE MANAGEMENT

### React State Structure
```typescript
// Main component state
const [courses, setCourses] = useState<Course[]>([]);
const [isBeforeUTS, setIsBeforeUTS] = useState<boolean>(true);
const [selectedPeriod, setSelectedPeriod] = useState<1 | 2>(1);
const [searchQuery, setSearchQuery] = useState<string>('');
const [filterSKS, setFilterSKS] = useState<'all' | '2' | '3'>('all');
const [sortBy, setSortBy] = useState<string>('name');
const [showActions, setShowActions] = useState<boolean>(false);
const [showReminders, setShowReminders] = useState<boolean>(false);
const [loading, setLoading] = useState<boolean>(true);
const [error, setError] = useState<string | null>(null);

// Computed values
const stats = useMemo(() => calculateAttendanceStats(courses), [courses]);
const upcomingThisWeek = useMemo(() => getUpcomingMeetingsThisWeek(courses), [courses]);
const reminders = useMemo(() => getAttendanceReminders(courses), [courses]);

// Filtered and sorted courses
const filteredCourses = useMemo(() => {
  let filtered = courses;

  // Filter by period
  filtered = filtered.filter(c => c.period === selectedPeriod);

  // Filter by search query
  if (searchQuery) {
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lecturer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Filter by SKS
  if (filterSKS !== 'all') {
    filtered = filtered.filter(c => c.sks === parseInt(filterSKS));
  }

  // Sort
  filtered = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'attendance-asc': {
        const rateA = (a.meetings.filter(m => m.status === 'attended').length / (a.sks === 3 ? 21 : 14)) * 100;
        const rateB = (b.meetings.filter(m => m.status === 'attended').length / (b.sks === 3 ? 21 : 14)) * 100;
        return rateA - rateB;
      }
      case 'attendance-desc': {
        const rateA = (a.meetings.filter(m => m.status === 'attended').length / (a.sks === 3 ? 21 : 14)) * 100;
        const rateB = (b.meetings.filter(m => m.status === 'attended').length / (b.sks === 3 ? 21 : 14)) * 100;
        return rateB - rateA;
      }
      case 'sks':
        return b.sks - a.sks;
      default:
        return 0;
    }
  });

  return filtered;
}, [courses, selectedPeriod, searchQuery, filterSKS, sortBy]);
```


---

## 🎯 INOVASI SIGNIFIKAN

### 1. Smart Meeting Mode Calculator
Otomatis menghitung mode pertemuan (online/offline) berdasarkan:
- SKS mata kuliah
- Periode (1 atau 2)
- Status UTS (sebelum/sesudah)
- Nomor pertemuan

### 2. Visual Progress Tracking
- Circle progress indicator per mata kuliah
- Progress bar dengan animasi smooth
- Color-coded status (hijau/merah/abu-abu)
- Persentase kehadiran real-time

### 3. Interactive Checklist Grid
- Grid responsif (3 cols mobile, 7 cols desktop)
- Hover tooltip dengan tanggal
- Click untuk detail pertemuan
- Visual feedback untuk setiap status

### 4. Period Rolling System
- Otomatis flip periode setelah UTS
- Indikator periode aktif
- Countdown ke UTS
- Notifikasi perubahan periode

### 5. Smart Filtering
- Filter by periode
- Filter by SKS
- Filter by status kehadiran
- Search mata kuliah

### 6. Attendance Analytics
- Total kehadiran per mata kuliah
- Persentase kehadiran keseluruhan
- Trend kehadiran (naik/turun)
- Prediksi kehadiran akhir semester

### 7. Meeting Detail Modal
Klik pada checklist item untuk melihat:
- Tanggal & waktu pertemuan
- Topik pertemuan
- Dosen pengampu
- Mode (online/offline)
- Link meeting (jika online)
- Lokasi ruangan (jika offline)
- Catatan kehadiran

### 8. Export & Print
- Export ke PDF per mata kuliah
- Export ke Excel (semua data)
- Print-friendly view
- Share via WhatsApp/Email


---

## 💻 IMPLEMENTASI LENGKAP

### 1. Main Component
```typescript
import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  CheckSquare, ChevronLeft, BookOpen, Calendar, CheckCircle,
  TrendingUp, Search, User, Clock, MapPin, XCircle, Wifi,
  Download, Printer, Share2, Filter
} from 'lucide-react';

interface MataKuliah {
  id: string;
  kode: string;
  nama: string;
  sks: 2 | 3;
  dosen: string;
  kelas: string;
  hari: string;
  waktu: string;
  periode: 1 | 2;
  ruangan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
}

interface Pertemuan {
  id: string;
  mataKuliahId: string;
  nomorPertemuan: number;
  tanggal: string;
  waktu: string;
  mode: 'online' | 'offline';
  status: 'hadir' | 'tidak-hadir' | 'belum-dimulai';
  topik?: string;
  catatan?: string;
  linkMeeting?: string;
}

interface Props {
  mataKuliahList: MataKuliah[];
  pertemuanData: Record<string, Pertemuan[]>;
  isBeforeUTS: boolean;
  tanggalUTS: string;
}

export default function MonitoringKehadiran({
  mataKuliahList,
  pertemuanData,
  isBeforeUTS,
  tanggalUTS
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPeriode, setFilterPeriode] = useState<string>('');
  const [filterSKS, setFilterSKS] = useState<string>('');
  const [selectedPertemuan, setSelectedPertemuan] = useState<Pertemuan | null>(null);

  // Calculate meeting mode based on complex logic
  const getMeetingMode = (
    pertemuan: number,
    sks: 2 | 3,
    periode: 1 | 2
  ): 'online' | 'offline' => {
    const periodeMode = isBeforeUTS
      ? (periode === 1 ? 'offline' : 'online')
      : (periode === 1 ? 'online' : 'offline');

    if (sks === 2) {
      return periodeMode;
    }

    if (periodeMode === 'offline') {
      return pertemuan % 3 === 0 ? 'online' : 'offline';
    }

    return 'online';
  };

  // Calculate progress for each course
  const calculateProgress = (matkul: MataKuliah) => {
    const pertemuanList = pertemuanData[matkul.id] || [];
    const totalPertemuan = matkul.sks === 3 ? 21 : 14;
    const pertemuanHadir = pertemuanList.filter(p => p.status === 'hadir').length;
    const pertemuanTidakHadir = pertemuanList.filter(p => p.status === 'tidak-hadir').length;
    const pertemuanBelumDimulai = pertemuanList.filter(p => p.status === 'belum-dimulai').length;
    const persentaseKehadiran = Math.round((pertemuanHadir / totalPertemuan) * 100);

    return {
      totalPertemuan,
      pertemuanHadir,
      pertemuanTidakHadir,
      pertemuanBelumDimulai,
      persentaseKehadiran,
      statusKehadiran: getStatusKehadiran(persentaseKehadiran)
    };
  };

  const getStatusKehadiran = (persentase: number): 'baik' | 'cukup' | 'kurang' | 'buruk' => {
    if (persentase >= 80) return 'baik';
    if (persentase >= 70) return 'cukup';
    if (persentase >= 60) return 'kurang';
    return 'buruk';
  };

## 📡 API INTEGRATION

### 1. Fetch Attendance Data
```typescript
// GET /api/student/attendance
async function fetchAttendanceData(): Promise<AttendanceData> {
  try {
    const response = await fetch('/api/student/attendance', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch attendance data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching attendance:', error);
    throw error;
  }
}

// Usage in component
useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchAttendanceData();
      setCourses(data.courses);
      setIsBeforeUTS(data.isBeforeUTS);
    } catch (err) {
      setError('Gagal memuat data kehadiran. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);
```

### 2. Expected API Response Format
```typescript
// Response structure
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "course-001",
        "name": "Pemrograman Web",
        "code": "TIF101",
        "sks": 3,
        "period": 1,
        "lecturer": "Dr. John Doe",
        "room": "V.109",
        "time": "08:00 - 10:30",
        "day": "Senin",
        "colorGradient": "from-blue-500 to-blue-600",
        "meetings": [
          {
            "number": 1,
            "date": "2024-09-02T08:00:00Z",
            "status": "attended",
            "topic": "Pengenalan HTML & CSS",
            "notes": null
          },
          {
            "number": 2,
            "date": "2024-09-09T08:00:00Z",
            "status": "attended",
            "topic": "JavaScript Fundamentals",
            "notes": null
          },
          {
            "number": 3,
            "date": "2024-09-16T08:00:00Z",
            "status": "absent",
            "topic": "DOM Manipulation (Online)",
            "notes": "Sakit"
          },
          {
            "number": 4,
            "date": "2024-09-23T08:00:00Z",
            "status": "upcoming",
            "topic": "React Basics",
            "notes": null
          }
          // ... up to 21 meetings for SKS 3
        ]
      }
      // ... more courses
    ],
    "isBeforeUTS": true,
    "lastUpdated": "2024-09-20T10:30:00Z"
  }
}
```

### 3. Refresh Data Function
```typescript
async function refreshData(): Promise<void> {
  try {
    const data = await fetchAttendanceData();
    setCourses(data.courses);
    setIsBeforeUTS(data.isBeforeUTS);
    
    // Show success toast
    toast.success('Data berhasil diperbarui');
  } catch (error) {
    toast.error('Gagal memperbarui data');
  }
}
```

## 🎯 IMPLEMENTATION CHECKLIST

### Phase 1: Basic Structure (Priority: HIGH)
- [ ] Setup halaman baru di route `/akademik/kehadiran`
- [ ] Implementasi header section dengan back button
- [ ] Buat period selector (Periode 1 & 2)
- [ ] Implementasi UTS status banner
- [ ] Buat summary cards (Total Mata Kuliah, Total Pertemuan, Hadir, Tidak Hadir)
- [ ] Setup responsive layout untuk mobile, tablet, desktop

### Phase 2: Core Logic (Priority: HIGH)
- [ ] Implementasi function `getMeetingMode()` untuk menentukan online/offline
- [ ] Implementasi logic SKS 3: pertemuan kelipatan 3 adalah online (Periode 1 sebelum UTS)
- [ ] Implementasi logic SKS 2: semua offline (Periode 1 sebelum UTS)
- [ ] Implementasi logic Periode 2: semua online sebelum UTS
- [ ] Implementasi rolling logic setelah UTS (periode dibalik)
- [ ] Implementasi function `calculateAttendanceStats()`
- [ ] Implementasi function `getAttendanceWarning()`

### Phase 3: Course Cards (Priority: HIGH)
- [ ] Buat course card component dengan gradient header
- [ ] Tampilkan informasi mata kuliah (nama, SKS, dosen, ruangan, waktu)
- [ ] Implementasi attendance badge dengan persentase
- [ ] Implementasi progress bar kehadiran
- [ ] Buat meeting grid dengan responsive columns (2/3/4/7 columns)
- [ ] Implementasi meeting item dengan status indicator (hadir/tidak hadir/upcoming)
- [ ] Tampilkan mode badge (online/offline) per meeting
- [ ] Implementasi status icon (check/x) pada meeting item
- [ ] Tampilkan tanggal meeting jika tersedia
- [ ] Buat legend untuk keterangan status

### Phase 4: Innovative Features (Priority: MEDIUM)
- [ ] Implementasi attendance warning banner untuk kehadiran < 75%
- [ ] Implementasi smart attendance prediction
- [ ] Implementasi attendance streak tracker
- [ ] Implementasi upcoming meetings widget (pertemuan minggu ini)
- [ ] Implementasi attendance statistics card dengan breakdown
- [ ] Implementasi streak display dengan flame icon
- [ ] Buat filter & search functionality
- [ ] Implementasi sort options (nama, kehadiran, SKS)
- [ ] Implementasi filter by SKS (2 atau 3)

### Phase 5: Export & Actions (Priority: MEDIUM)
- [ ] Implementasi floating action button (FAB)
- [ ] Implementasi export to PDF functionality
- [ ] Implementasi export to Excel functionality
- [ ] Implementasi attendance reminder system
- [ ] Buat reminder modal dengan urgent/upcoming/critical sections
- [ ] Implementasi refresh data functionality
- [ ] Implementasi loading states
- [ ] Implementasi error handling dengan user-friendly messages

### Phase 6: API Integration (Priority: HIGH)
- [ ] Setup API endpoint `/api/student/attendance`
- [ ] Implementasi fetch attendance data on component mount
- [ ] Implementasi error handling untuk API calls
- [ ] Implementasi loading spinner saat fetch data
- [ ] Setup auto-refresh setiap 5 menit (optional)
- [ ] Implementasi offline mode dengan cached data (optional)

### Phase 7: UI/UX Polish (Priority: MEDIUM)
- [ ] Pastikan NO container pada icon header
- [ ] Pastikan NO floating animations
- [ ] Implementasi smooth transitions untuk semua interactions
- [ ] Pastikan icon colors match container gradient colors
- [ ] Implementasi hover effects pada interactive elements
- [ ] Pastikan typography consistency (1 tema)
- [ ] Implementasi proper spacing dan padding
- [ ] Pastikan shadow effects sesuai design system
- [ ] Test responsive design di berbagai screen sizes
- [ ] Implementasi skeleton loading untuk better UX



  // Filter courses
  const filteredMataKuliah = useMemo(() => {
    return mataKuliahList.filter(matkul => {
      const matchSearch = matkul.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         matkul.kode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPeriode = !filterPeriode || matkul.periode.toString() === filterPeriode;
      const matchSKS = !filterSKS || matkul.sks.toString() === filterSKS;
      
      return matchSearch && matchPeriode && matchSKS;
    });
  }, [mataKuliahList, searchQuery, filterPeriode, filterSKS]);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    let totalPertemuan = 0;
    let totalHadir = 0;
    
    mataKuliahList.forEach(matkul => {
      const progress = calculateProgress(matkul);
      totalPertemuan += progress.totalPertemuan;
      totalHadir += progress.pertemuanHadir;
    });
    
    return {
      totalMataKuliah: mataKuliahList.length,
      totalPertemuan,
      totalHadir,
      persentaseKeseluruhan: Math.round((totalHadir / totalPertemuan) * 100)
    };
  }, [mataKuliahList, pertemuanData]);

  const getChecklistStyle = (status: string, mode: string) => {
    const baseStyle = 'hover:scale-105 cursor-pointer group';
    
    if (status === 'hadir') {
      return `${baseStyle} border-green-300 bg-green-50 hover:border-green-400`;
    }
    if (status === 'tidak-hadir') {
      return `${baseStyle} border-red-300 bg-red-50 hover:border-red-400`;
    }
    return `${baseStyle} border-gray-200 bg-gray-50 hover:border-gray-300`;
  };

  return (
    <>
      <Head title="Monitoring Kehadiran" />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.visit('/mahasiswa/akademik')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Kembali</span>
          </button>
          
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <CheckSquare className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Monitoring Kehadiran
              </h1>
              <p className="mt-1 text-sm md:text-base text-gray-600">
                Pantau dan lacak kehadiran Anda di setiap pertemuan mata kuliah
              </p>
              
              {/* UTS Info */}
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Calendar className="w-4 h-4 text-yellow-600" />
                <span className="text-xs text-yellow-700">
                  {isBeforeUTS ? 'Sebelum UTS' : 'Setelah UTS'} • {tanggalUTS}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Summary Statistics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Mata Kuliah</p>
                <p className="text-xl font-bold text-gray-900">{overallStats.totalMataKuliah}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Pertemuan</p>
                <p className="text-xl font-bold text-gray-900">{overallStats.totalPertemuan}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Hadir</p>
                <p className="text-xl font-bold text-gray-900">{overallStats.totalHadir}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Persentase</p>
                <p className="text-xl font-bold text-gray-900">{overallStats.persentaseKeseluruhan}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari mata kuliah..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <select
              value={filterPeriode}
              onChange={(e) => setFilterPeriode(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Periode</option>
              <option value="1">Periode 1</option>
              <option value="2">Periode 2</option>
            </select>
            
            <select
              value={filterSKS}
              onChange={(e) => setFilterSKS(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua SKS</option>
              <option value="2">SKS 2</option>
              <option value="3">SKS 3</option>
            </select>
          </div>
        </div>
      </div>

### Phase 8: Testing & Validation (Priority: HIGH)
- [ ] Test logic SKS 3 dengan 21 pertemuan
- [ ] Test logic SKS 2 dengan 14 pertemuan
- [ ] Test mode pertemuan untuk Periode 1 sebelum UTS
- [ ] Test mode pertemuan untuk Periode 2 sebelum UTS
- [ ] Test rolling logic setelah UTS
- [ ] Test attendance calculation accuracy
- [ ] Test warning system untuk kehadiran < 75%
- [ ] Test filter dan sort functionality
- [ ] Test export PDF/Excel functionality
- [ ] Test responsive design di mobile devices
- [ ] Test responsive design di tablet devices
- [ ] Test responsive design di desktop
- [ ] Test dengan data real (bukan dummy data)
- [ ] Test edge cases (0 kehadiran, 100% kehadiran, dll)
- [ ] Test performance dengan banyak mata kuliah

### Phase 9: Accessibility & Performance (Priority: LOW)
- [ ] Implementasi keyboard navigation
- [ ] Implementasi ARIA labels untuk screen readers
- [ ] Implementasi focus indicators
- [ ] Optimize image loading (jika ada)
- [ ] Implement lazy loading untuk course cards
- [ ] Optimize re-renders dengan React.memo
- [ ] Implement virtualization untuk long lists (optional)
- [ ] Test dengan slow network connection
- [ ] Implement service worker untuk offline support (optional)

### Phase 10: Documentation (Priority: LOW)
- [ ] Dokumentasi API endpoints
- [ ] Dokumentasi data structures
- [ ] Dokumentasi business logic (SKS, periode, UTS)
- [ ] Dokumentasi component props
- [ ] Dokumentasi helper functions
- [ ] Buat user guide untuk mahasiswa
- [ ] Dokumentasi troubleshooting common issues

## 💡 BEST PRACTICES

### 1. Code Organization
```typescript
// Organize by feature
src/
  pages/
    student/
      attendance/
        index.tsx              // Main page component
        components/
          CourseCard.tsx       // Course card component
          MeetingItem.tsx      // Meeting item component
          SummaryCard.tsx      // Summary card component
          FilterBar.tsx        // Filter & search bar
          UpcomingWidget.tsx   // Upcoming meetings widget
          StatsCard.tsx        // Statistics card
          WarningBanner.tsx    // Warning banner
          FloatingActions.tsx  // FAB component
        hooks/
          useAttendance.ts     // Custom hook for attendance logic
          useFilters.ts        // Custom hook for filters
        utils/
          attendanceLogic.ts   // Business logic functions
          calculations.ts      // Calculation functions
          formatters.ts        // Date/number formatters
        types/
          attendance.types.ts  // TypeScript types
```

### 2. Performance Optimization
```typescript
// Use React.memo for expensive components
const CourseCard = React.memo(({ course, isBeforeUTS }) => {
  // Component logic
});

// Use useMemo for expensive calculations
const stats = useMemo(() => 
  calculateAttendanceStats(courses), 
  [courses]
);

// Use useCallback for event handlers
const handlePeriodChange = useCallback((period: 1 | 2) => {
  setSelectedPeriod(period);
}, []);

// Debounce search input
const debouncedSearch = useMemo(
  () => debounce((query: string) => setSearchQuery(query), 300),
  []
);
```

### 3. Error Handling
```typescript
// Comprehensive error handling
try {
  const data = await fetchAttendanceData();
  setCourses(data.courses);
} catch (error) {
  if (error instanceof NetworkError) {
    setError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
  } else if (error instanceof AuthError) {
    setError('Sesi Anda telah berakhir. Silakan login kembali.');
    // Redirect to login
  } else {
    setError('Terjadi kesalahan. Silakan coba lagi nanti.');
  }
  
  // Log error for debugging
  console.error('Attendance fetch error:', error);
}
```

### 4. Accessibility
```typescript
// Proper ARIA labels
<button
  aria-label="Export laporan kehadiran ke PDF"
  onClick={() => exportAttendanceReport(courses, 'pdf')}
>
  <FileText className="w-4 h-4" />
  <span>Export PDF</span>
</button>

// Keyboard navigation
<div
  role="button"
  tabIndex={0}
  onKeyPress={(e) => e.key === 'Enter' && handleClick()}
  onClick={handleClick}
>
  {/* Content */}
</div>

// Screen reader announcements
<div role="status" aria-live="polite" className="sr-only">
  {loading ? 'Memuat data kehadiran...' : 'Data kehadiran berhasil dimuat'}
</div>
```

## 🎨 EXAMPLE IMPLEMENTATION

### Complete Page Component
```typescript
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ArrowLeft, CheckSquare, Calendar, Info, BookOpen, 
  CheckCircle, XCircle, Award, Users, MapPin, Clock,
  Wifi, Check, X, AlertTriangle, Search, MoreVertical,
  FileText, FileSpreadsheet, Bell, RefreshCw, Flame,
  TrendingUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Types
interface Meeting {
  number: number;
  date?: string;
  status: 'attended' | 'absent' | 'upcoming';
  topic?: string;
  notes?: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  sks: 2 | 3;
  period: 1 | 2;
  lecturer: string;
  room: string;
  time: string;
  day: string;
  colorGradient: string;
  meetings: Meeting[];
}

// Helper Functions
function getMeetingMode(
  sks: number,
  period: number,
  meetingNumber: number,
  isBeforeUTS: boolean
): boolean {
  const effectivePeriod = isBeforeUTS ? period : (period === 1 ? 2 : 1);
  
  if (effectivePeriod === 1) {
    if (isBeforeUTS) {
      if (sks === 3) {
        return meetingNumber % 3 === 0;
      }
      return false;
    }
    return true;
  }
  
  if (effectivePeriod === 2) {
    if (isBeforeUTS) {
      return true;
    }
    if (sks === 3) {
      return meetingNumber % 3 === 0;
    }
    return false;
  }
  
  return false;
}

function calculateAttendanceStats(courses: Course[]) {
  let totalMeetings = 0;
  let attendedMeetings = 0;
  let absentMeetings = 0;

  courses.forEach(course => {
    const courseTotalMeetings = course.sks === 3 ? 21 : 14;
    totalMeetings += courseTotalMeetings;

    course.meetings.forEach(meeting => {
      if (meeting.status === 'attended') {
        attendedMeetings++;
      } else if (meeting.status === 'absent') {
        absentMeetings++;
      }
    });
  });

  const attendancePercentage = totalMeetings > 0 
    ? ((attendedMeetings / totalMeetings) * 100).toFixed(1)
    : '0.0';

  const absentPercentage = totalMeetings > 0
    ? ((absentMeetings / totalMeetings) * 100).toFixed(1)
    : '0.0';

  return {
    totalMeetings,
    attendedMeetings,
    absentMeetings,
    attendancePercentage,
    absentPercentage
  };
}

// Main Component
export default function MonitoringKehadiran() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isBeforeUTS, setIsBeforeUTS] = useState<boolean>(true);
  const [selectedPeriod, setSelectedPeriod] = useState<1 | 2>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSKS, setFilterSKS] = useState<'all' | '2' | '3'>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [showActions, setShowActions] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/student/attendance');
        const data = await response.json();
        setCourses(data.courses);
        setIsBeforeUTS(data.isBeforeUTS);
      } catch (err) {
        setError('Gagal memuat data kehadiran');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Computed values
  const stats = useMemo(() => calculateAttendanceStats(courses), [courses]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    let filtered = courses.filter(c => c.period === selectedPeriod);

    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterSKS !== 'all') {
      filtered = filtered.filter(c => c.sks === parseInt(filterSKS));
    }

    return filtered;
  }, [courses, selectedPeriod, searchQuery, filterSKS]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <button className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Kembali</span>
          </button>

          <div className="flex items-center gap-4">
            <CheckSquare className="w-10 h-10 md:w-12 md:h-12 text-white" />
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold">
                Monitoring Kehadiran
              </h1>
              <p className="text-white/90 text-sm md:text-base mt-1">
                Pantau kehadiran Anda di setiap mata kuliah
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Period Selector & Summary Cards */}
        {/* ... (implement as shown in structure above) */}

        {/* Course Cards */}
        {filteredCourses.map(course => (
          <div key={course.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Course header and meetings grid */}
            {/* ... (implement as shown in structure above) */}
          </div>
        ))}
      </div>
    </div>
  );
}
```



      {/* Course Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20">
        {filteredMataKuliah.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Tidak ada mata kuliah yang ditemukan</p>
          </div>
        ) : (
          filteredMataKuliah.map((matkul) => {
            const progress = calculateProgress(matkul);
            const pertemuanList = pertemuanData[matkul.id] || [];
            
            return (
              <div key={matkul.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                {/* Card Header */}
                <div className="p-4 md:p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                          {matkul.kode}
                        </span>
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded">
                          SKS {matkul.sks}
                        </span>
                        <span className="px-2 py-1 bg-cyan-50 text-cyan-700 text-xs font-medium rounded">
                          Periode {matkul.periode}
                        </span>
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-gray-900">
                        {matkul.nama}
                      </h3>
                      
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{matkul.dosen}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{matkul.hari}, {matkul.waktu}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{matkul.ruangan}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Circle */}
                    <div className="flex-shrink-0">
                      <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="#e5e7eb"
                            strokeWidth="4"
                            fill="none"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="#10b981"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${progress.persentaseKehadiran * 1.76} 176`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold text-gray-900">
                            {progress.persentaseKehadiran}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Progress Kehadiran</span>
                      <span>{progress.pertemuanHadir} / {progress.totalPertemuan} Pertemuan</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress.persentaseKehadiran}%` }}
                      />
                    </div>
                  </div>
                </div>

                
                {/* Checklist Pertemuan */}
                <div className="p-4 md:p-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">
                    Daftar Pertemuan ({matkul.sks === 3 ? '21' : '14'} Pertemuan)
                  </h4>
                  
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {pertemuanList.map((pertemuan) => (
                      <button
                        key={pertemuan.id}
                        onClick={() => setSelectedPertemuan(pertemuan)}
                        className={`
                          relative p-3 rounded-lg border-2 transition-all duration-200
                          ${getChecklistStyle(pertemuan.status, pertemuan.mode)}
                        `}
                      >
                        <div className="text-center">
                          <div className="text-xs font-medium mb-1">
                            P{pertemuan.nomorPertemuan}
                          </div>
                          
                          <div className="flex justify-center">
                            {pertemuan.status === 'hadir' && (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                            {pertemuan.status === 'tidak-hadir' && (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                            {pertemuan.status === 'belum-dimulai' && (
                              <Clock className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          
                          <div className="mt-1">
                            {pertemuan.mode === 'online' ? (
                              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-cyan-50 rounded text-[10px] text-cyan-700">
                                <Wifi className="w-3 h-3" />
                                <span>Online</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-50 rounded text-[10px] text-purple-700">
                                <MapPin className="w-3 h-3" />
                                <span>Offline</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                          <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                            {pertemuan.tanggal}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-gray-600">Hadir</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-gray-600">Tidak Hadir</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Belum Dimulai</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wifi className="w-4 h-4 text-cyan-600" />
                        <span className="text-gray-600">Online</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-600" />
                        <span className="text-gray-600">Offline</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Meeting Detail Modal */}
      {selectedPertemuan && (
        <MeetingDetailModal
          pertemuan={selectedPertemuan}
          onClose={() => setSelectedPertemuan(null)}
        />
      )}
    </>
  );
}
```


## 🚀 ADVANCED FEATURES (OPTIONAL ENHANCEMENTS)

### 1. Calendar View Mode
```typescript
// Alternative view: Calendar mode untuk melihat kehadiran dalam format kalender
<div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold text-gray-800">Kalender Kehadiran</h3>
    <div className="flex gap-2">
      <button
        className={`px-3 py-1 rounded-lg text-sm ${
          viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
        }`}
        onClick={() => setViewMode('grid')}
      >
        Grid
      </button>
      <button
        className={`px-3 py-1 rounded-lg text-sm ${
          viewMode === 'calendar' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
        }`}
        onClick={() => setViewMode('calendar')}
      >
        Kalender
      </button>
    </div>
  </div>

  {viewMode === 'calendar' && (
    <div className="grid grid-cols-7 gap-2">
      {/* Calendar implementation */}
    </div>
  )}
</div>
```

### 2. Attendance Goals & Achievements
```typescript
// Gamification: Goals dan achievements untuk motivasi mahasiswa
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

const achievements: Achievement[] = [
  {
    id: 'perfect-month',
    title: 'Perfect Month',
    description: 'Hadir di semua pertemuan dalam 1 bulan',
    icon: '🏆',
    unlocked: false,
    progress: 8,
    target: 12
  },
  {
    id: 'streak-master',
    title: 'Streak Master',
    description: 'Hadir berturut-turut 10 pertemuan',
    icon: '🔥',
    unlocked: true,
    progress: 10,
    target: 10
  },
  // ... more achievements
];

// Achievement display
<div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
  <h3 className="text-lg font-semibold text-gray-800 mb-4">Pencapaian</h3>
  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
    {achievements.map(achievement => (
      <div
        key={achievement.id}
        className={`p-3 rounded-lg border-2 ${
          achievement.unlocked
            ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300'
            : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className="text-3xl mb-2 text-center">
          {achievement.unlocked ? achievement.icon : '🔒'}
        </div>
        <p className="text-sm font-semibold text-gray-800 text-center">
          {achievement.title}
        </p>
        <p className="text-xs text-gray-600 text-center mt-1">
          {achievement.description}
        </p>
        {!achievement.unlocked && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full"
                style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center mt-1">
              {achievement.progress}/{achievement.target}
            </p>
          </div>
        )}
      </div>
    ))}
  </div>
</div>
```

### 3. Attendance Comparison with Class Average
```typescript
// Perbandingan kehadiran dengan rata-rata kelas
interface ClassComparison {
  courseId: string;
  studentAttendance: number;
  classAverage: number;
  rank: number;
  totalStudents: number;
}

function AttendanceComparison({ comparison }: { comparison: ClassComparison }) {
  const difference = comparison.studentAttendance - comparison.classAverage;
  const isAboveAverage = difference > 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Perbandingan dengan Kelas
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Kehadiran Anda</span>
          <span className="text-lg font-bold text-blue-600">
            {comparison.studentAttendance.toFixed(1)}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Rata-rata Kelas</span>
          <span className="text-lg font-bold text-gray-600">
            {comparison.classAverage.toFixed(1)}%
          </span>
        </div>

        <div className={`p-3 rounded-lg ${
          isAboveAverage ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <p className={`text-sm font-medium ${
            isAboveAverage ? 'text-green-700' : 'text-red-700'
          }`}>
            {isAboveAverage ? '↑' : '↓'} {Math.abs(difference).toFixed(1)}% 
            {isAboveAverage ? ' di atas' : ' di bawah'} rata-rata kelas
          </p>
        </div>

        <div className="pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Peringkat: <span className="font-semibold text-gray-800">
              #{comparison.rank}
            </span> dari {comparison.totalStudents} mahasiswa
          </p>
        </div>
      </div>
    </div>
  );
}
```

### 4. Push Notifications for Upcoming Classes
```typescript
// Request notification permission dan kirim reminder
async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

function scheduleClassReminder(course: Course, meeting: Meeting) {
  if (!meeting.date) return;

  const meetingDate = new Date(meeting.date);
  const reminderTime = new Date(meetingDate.getTime() - 30 * 60 * 1000); // 30 minutes before

  const now = new Date();
  const timeUntilReminder = reminderTime.getTime() - now.getTime();

  if (timeUntilReminder > 0) {
    setTimeout(() => {
      new Notification('Reminder Perkuliahan', {
        body: `${course.name} akan dimulai dalam 30 menit di ${course.room}`,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: `class-${course.id}-${meeting.number}`,
        requireInteraction: true
      });
    }, timeUntilReminder);
  }
}
```

### 5. Attendance Notes & Excuses
```typescript
// Fitur untuk menambahkan catatan atau alasan ketidakhadiran
interface AttendanceNote {
  meetingId: string;
  note: string;
  attachments?: string[];
  submittedAt: string;
}

function AddNoteModal({ 
  meeting, 
  onSave 
}: { 
  meeting: Meeting; 
  onSave: (note: AttendanceNote) => void;
}) {
  const [note, setNote] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = async () => {
    const attachments = await uploadFiles(files);
    
    onSave({
      meetingId: meeting.number.toString(),
      note,
      attachments,
      submittedAt: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Tambah Catatan Kehadiran
        </h3>

        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 text-sm"
          rows={4}
          placeholder="Alasan ketidakhadiran atau catatan lainnya..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lampiran (Surat Sakit, dll)
          </label>
          <input
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            className="w-full text-sm"
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Simpan
          </button>
          <button
            onClick={() => onSave(null)}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
```


### 2. Meeting Detail Modal Component
```typescript
interface MeetingDetailModalProps {
  pertemuan: Pertemuan;
  onClose: () => void;
}

function MeetingDetailModal({ pertemuan, onClose }: MeetingDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Detail Pertemuan {pertemuan.nomorPertemuan}
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 space-y-4">
          {/* Status Badge */}
          <div className="flex justify-center">
            {pertemuan.status === 'hadir' && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">Hadir</span>
              </div>
            )}
            {pertemuan.status === 'tidak-hadir' && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-700">Tidak Hadir</span>
              </div>
            )}
            {pertemuan.status === 'belum-dimulai' && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Belum Dimulai</span>
              </div>
            )}
          </div>

          {/* Info Grid */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Tanggal</p>
                <p className="text-sm font-medium text-gray-900">{pertemuan.tanggal}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Waktu</p>
                <p className="text-sm font-medium text-gray-900">{pertemuan.waktu}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              {pertemuan.mode === 'online' ? (
                <Wifi className="w-5 h-5 text-cyan-600 mt-0.5" />
              ) : (
                <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
              )}
              <div>
                <p className="text-xs text-gray-500">Mode Pertemuan</p>
                <p className="text-sm font-medium text-gray-900">
                  {pertemuan.mode === 'online' ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>

            {pertemuan.topik && (
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Topik</p>
                  <p className="text-sm font-medium text-gray-900">{pertemuan.topik}</p>
                </div>
              </div>
            )}

            {pertemuan.linkMeeting && pertemuan.mode === 'online' && (
              <div className="flex items-start gap-3">
                <Wifi className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Link Meeting</p>
                  <a
                    href={pertemuan.linkMeeting}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 underline break-all"
                  >
                    {pertemuan.linkMeeting}
                  </a>
                </div>
              </div>
            )}

            {pertemuan.catatan && (
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Catatan</p>
                  <p className="text-sm text-gray-700">{pertemuan.catatan}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
```


---

## 📱 MOBILE RESPONSIVE DESIGN

### Breakpoints
```typescript
const breakpoints = {
  sm: '640px',   // Small devices
  md: '768px',   // Medium devices
  lg: '1024px',  // Large devices
  xl: '1280px',  // Extra large devices
};
```

### Mobile Optimizations

1. **Header**: Stack vertically on mobile, horizontal on desktop
2. **Statistics Cards**: 2 columns on mobile, 4 columns on desktop
3. **Filter Section**: Stack vertically on mobile, horizontal on desktop
4. **Checklist Grid**: 3 columns on mobile, 7 columns on desktop
5. **Course Info**: Stack vertically on mobile, 3 columns on desktop

### Touch Interactions
- Larger tap targets (min 44x44px)
- Smooth scroll behavior
- Pull-to-refresh support
- Swipe gestures for navigation

---

## 🎨 STYLING GUIDELINES

### NO Container on Header Icon
```tsx
// ❌ WRONG
<div className="p-3 bg-blue-50 rounded-lg">
  <CheckSquare className="w-8 h-8 text-blue-600" />
</div>

// ✅ CORRECT
<CheckSquare className="w-8 h-8 text-blue-600" />
```

### NO Floating Animations
```tsx
// ❌ WRONG
<div className="animate-bounce">
  <CheckSquare />
</div>

// ✅ CORRECT
<CheckSquare className="w-8 h-8 text-blue-600" />
```

### Consistent Icon Colors
```tsx
// Icon color must match container color
<div className="p-2 bg-blue-50 rounded-lg">
  <BookOpen className="w-5 h-5 text-blue-600" /> {/* blue-600 matches blue-50 */}
</div>
```


## 📊 DATA VISUALIZATION ENHANCEMENTS

### 1. Attendance Trend Chart
```typescript
// Chart untuk melihat trend kehadiran dari waktu ke waktu
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function AttendanceTrendChart({ courses }: { courses: Course[] }) {
  // Prepare data: group by week
  const trendData = useMemo(() => {
    const weeks: { [key: string]: { attended: number; total: number } } = {};

    courses.forEach(course => {
      course.meetings
        .filter(m => m.date && m.status !== 'upcoming')
        .forEach(meeting => {
          const date = new Date(meeting.date!);
          const weekKey = `Week ${Math.ceil(date.getDate() / 7)}`;

          if (!weeks[weekKey]) {
            weeks[weekKey] = { attended: 0, total: 0 };
          }

          weeks[weekKey].total++;
          if (meeting.status === 'attended') {
            weeks[weekKey].attended++;
          }
        });
    });

    return Object.entries(weeks).map(([week, data]) => ({
      week,
      percentage: (data.attended / data.total) * 100
    }));
  }, [courses]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Trend Kehadiran
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="percentage" 
            stroke="#3B82F6" 
            strokeWidth={2}
            dot={{ fill: '#3B82F6', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### 2. Course Attendance Heatmap
```typescript
// Heatmap untuk visualisasi kehadiran per mata kuliah
function AttendanceHeatmap({ courses }: { courses: Course[] }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Heatmap Kehadiran
      </h3>
      
      <div className="space-y-3">
        {courses.map(course => {
          const totalMeetings = course.sks === 3 ? 21 : 14;
          const weeks = Math.ceil(totalMeetings / 7);

          return (
            <div key={course.id}>
              <p className="text-sm font-medium text-gray-700 mb-2">
                {course.name}
              </p>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: totalMeetings }, (_, i) => {
                  const meeting = course.meetings.find(m => m.number === i + 1);
                  const status = meeting?.status || 'upcoming';

                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded ${
                        status === 'attended'
                          ? 'bg-green-500'
                          : status === 'absent'
                          ? 'bg-red-500'
                          : 'bg-gray-200'
                      }`}
                      title={`Pertemuan ${i + 1}: ${status}`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span className="text-xs text-gray-600">Hadir</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <span className="text-xs text-gray-600">Tidak Hadir</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded" />
          <span className="text-xs text-gray-600">Belum Terlaksana</span>
        </div>
      </div>
    </div>
  );
}
```

## 🔐 SECURITY & PRIVACY

### 1. Data Privacy
```typescript
// Pastikan data kehadiran hanya bisa diakses oleh mahasiswa yang bersangkutan
// Implementasi di backend
app.get('/api/student/attendance', authenticateStudent, async (req, res) => {
  const studentId = req.user.id;
  
  // Only fetch attendance for the authenticated student
  const attendance = await AttendanceModel.find({ studentId });
  
  res.json({ success: true, data: attendance });
});
```

### 2. Rate Limiting
```typescript
// Prevent abuse dengan rate limiting
import rateLimit from 'express-rate-limit';

const attendanceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Terlalu banyak request. Silakan coba lagi nanti.'
});

app.use('/api/student/attendance', attendanceLimiter);
```

## 🎓 USER EDUCATION

### 1. Onboarding Tour
```typescript
// First-time user tour menggunakan library seperti react-joyride
import Joyride from 'react-joyride';

const tourSteps = [
  {
    target: '.period-selector',
    content: 'Pilih periode untuk melihat kehadiran Anda. Periode akan berubah setelah UTS.',
    disableBeacon: true,
  },
  {
    target: '.summary-cards',
    content: 'Lihat ringkasan kehadiran Anda di semua mata kuliah.',
  },
  {
    target: '.course-card',
    content: 'Setiap kartu menampilkan detail kehadiran per mata kuliah dengan checklist per pertemuan.',
  },
  {
    target: '.meeting-item',
    content: 'Pertemuan dengan tanda centang hijau berarti Anda hadir, tanda X merah berarti tidak hadir.',
  },
  {
    target: '.mode-badge',
    content: 'Badge menunjukkan mode pertemuan: Online atau Offline.',
  },
];

function AttendanceOnboarding() {
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('attendance-tour-completed');
    if (!hasSeenTour) {
      setRunTour(true);
    }
  }, []);

  const handleTourEnd = () => {
    localStorage.setItem('attendance-tour-completed', 'true');
    setRunTour(false);
  };

  return (
    <Joyride
      steps={tourSteps}
      run={runTour}
      continuous
      showProgress
      showSkipButton
      callback={handleTourEnd}
      styles={{
        options: {
          primaryColor: '#3B82F6',
        },
      }}
    />
  );
}
```

### 2. Help Center Integration
```typescript
// Link ke help center atau FAQ
<button
  onClick={() => window.open('/help/attendance', '_blank')}
  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
>
  <HelpCircle className="w-4 h-4" />
  <span>Butuh bantuan?</span>
</button>
```

## 📝 FINAL NOTES

### Critical Requirements Recap
1. **NO Container** pada icon header
2. **NO Floating Animations** pada icon
3. **Match Dashboard Design** untuk semua elemen (warna, typography, spacing)
4. **Mobile-First Responsive** design
5. **NO Dummy Data** - gunakan data real dari API
6. **Complex Logic Implementation**:
   - SKS 3 = 21 pertemuan, SKS 2 = 14 pertemuan
   - Periode 1 (Offline sebelum UTS, Online setelah UTS)
   - Periode 2 (Online sebelum UTS, Offline setelah UTS)
   - SKS 3 Periode 1 sebelum UTS: pertemuan kelipatan 3 adalah online
   - SKS 2 Periode 1 sebelum UTS: semua offline
   - Periode 2 sebelum UTS: semua online
7. **Icon Colors** harus match dengan container gradient colors
8. **Back Button** style harus sama dengan menu lain
9. **Typography** konsisten dengan 1 tema
10. **Significant Innovation** dengan fitur-fitur advanced

### Testing Scenarios
1. Test dengan mahasiswa yang punya mata kuliah SKS 2 dan SKS 3
2. Test sebelum dan setelah UTS (rolling periode)
3. Test dengan berbagai tingkat kehadiran (0%, 50%, 75%, 100%)
4. Test responsive di mobile (iPhone, Android), tablet (iPad), desktop
5. Test filter dan sort functionality
6. Test export PDF dan Excel
7. Test dengan koneksi internet lambat
8. Test error handling (API down, network error)

### Performance Targets
- Initial load: < 2 seconds
- Filter/sort operations: < 100ms
- Smooth animations: 60fps
- Mobile performance score: > 90 (Lighthouse)

### Accessibility Targets
- WCAG 2.1 Level AA compliance (as much as possible)
- Keyboard navigation support
- Screen reader friendly
- Proper color contrast ratios
- Focus indicators on all interactive elements

---

## 🎉 CONCLUSION

Prompt ini dirancang untuk membuat halaman **Monitoring Kehadiran Mahasiswa** yang sangat komprehensif, user-friendly, dan inovatif. Dengan mengikuti semua spesifikasi, logika bisnis, dan best practices yang dijelaskan di atas, Anda akan menghasilkan fitur yang tidak hanya memenuhi kebutuhan fungsional, tetapi juga memberikan pengalaman pengguna yang luar biasa.

Fitur ini akan membantu mahasiswa untuk:
- Memantau kehadiran mereka dengan mudah
- Memahami pola kehadiran mereka
- Mengidentifikasi mata kuliah yang perlu perhatian lebih
- Merencanakan kehadiran di pertemuan mendatang
- Mencapai target kehadiran minimum 75%

**Selamat mengembangkan! 🚀**

---

## ✅ CHECKLIST PENGEMBANGAN (45+ Items)

### Phase 1: Setup & Structure (10 items)
- [ ] Create route `/mahasiswa/akademik/kehadiran`
- [ ] Setup page component with TypeScript interfaces
- [ ] Implement header section with back button
- [ ] Add CheckSquare icon (NO container)
- [ ] Setup color palette matching dashboard
- [ ] Configure responsive breakpoints
- [ ] Setup state management (search, filters)
- [ ] Create data structures (MataKuliah, Pertemuan)
- [ ] Implement getMeetingMode algorithm
- [ ] Setup period rolling logic

### Phase 2: Summary Statistics (5 items)
- [ ] Create 4 statistics cards
- [ ] Implement overall progress calculation
- [ ] Add icon containers with matching colors
- [ ] Make responsive (2 cols mobile, 4 cols desktop)
- [ ] Add smooth transitions

### Phase 3: Filter & Search (5 items)
- [ ] Implement search input with icon
- [ ] Add periode filter dropdown
- [ ] Add SKS filter dropdown
- [ ] Implement filter logic
- [ ] Add clear filters button

### Phase 4: Course Cards (10 items)
- [ ] Create course card layout
- [ ] Add course header with badges (kode, SKS, periode)
- [ ] Implement progress circle (SVG)
- [ ] Add progress bar with animation
- [ ] Display course info (dosen, waktu, ruangan)
- [ ] Make header responsive
- [ ] Add icon color matching
- [ ] Implement progress calculation
- [ ] Add status color coding
- [ ] Add hover effects

### Phase 5: Checklist Grid (10 items)
- [ ] Create responsive grid (3 cols mobile, 7 cols desktop)
- [ ] Implement checklist items
- [ ] Add status icons (CheckCircle, XCircle, Clock)
- [ ] Add mode badges (Online, Offline)
- [ ] Implement hover tooltips with date
- [ ] Add click handler for detail modal
- [ ] Style based on status (hadir/tidak-hadir/belum-dimulai)
- [ ] Add smooth transitions
- [ ] Create legend section
- [ ] Implement touch-friendly tap targets

### Phase 6: Meeting Detail Modal (8 items)
- [ ] Create modal component
- [ ] Add modal header with close button
- [ ] Display status badge
- [ ] Show meeting info (tanggal, waktu, mode)
- [ ] Add topik and catatan fields
- [ ] Show link meeting for online classes
- [ ] Make modal scrollable
- [ ] Add close on backdrop click

### Phase 7: SKS & Period Logic (10 items)
- [ ] Implement SKS_RULES constants
- [ ] Create getPeriodeMode function
- [ ] Implement getMeetingMode algorithm
- [ ] Handle SKS 3 offline pattern (every 3rd online)
- [ ] Handle SKS 2 full offline
- [ ] Handle SKS 3 online (2x per week)
- [ ] Implement UTS rolling system
- [ ] Add isBeforeUTS flag
- [ ] Test all period combinations
- [ ] Validate meeting mode calculations

### Phase 8: Progress & Analytics (5 items)
- [ ] Calculate progress per course
- [ ] Calculate overall statistics
- [ ] Implement persentase kehadiran
- [ ] Add status kehadiran (baik/cukup/kurang/buruk)
- [ ] Create progress visualization

### Phase 9: Mobile Optimization (5 items)
- [ ] Test on mobile devices
- [ ] Optimize touch targets
- [ ] Fix layout on small screens
- [ ] Test filter section on mobile
- [ ] Ensure checklist grid works on mobile

### Phase 10: Testing & Polish (7 items)
- [ ] Test all filter combinations
- [ ] Test search functionality
- [ ] Verify SKS logic accuracy
- [ ] Test period rolling after UTS
- [ ] Check responsive design on all breakpoints
- [ ] Validate color consistency
- [ ] Test modal interactions
- [ ] Performance optimization
- [ ] Add loading states
- [ ] Handle empty states
- [ ] Cross-browser testing


---

## 🔧 BACKEND REQUIREMENTS

### Database Schema

#### Table: mata_kuliah
```sql
CREATE TABLE mata_kuliah (
  id VARCHAR(36) PRIMARY KEY,
  kode VARCHAR(20) NOT NULL,
  nama VARCHAR(255) NOT NULL,
  sks TINYINT NOT NULL CHECK (sks IN (2, 3)),
  dosen_id VARCHAR(36) NOT NULL,
  kelas VARCHAR(10) NOT NULL,
  hari VARCHAR(20) NOT NULL,
  waktu VARCHAR(20) NOT NULL,
  periode TINYINT NOT NULL CHECK (periode IN (1, 2)),
  ruangan VARCHAR(50) NOT NULL,
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dosen_id) REFERENCES users(id)
);
```

#### Table: pertemuan
```sql
CREATE TABLE pertemuan (
  id VARCHAR(36) PRIMARY KEY,
  mata_kuliah_id VARCHAR(36) NOT NULL,
  nomor_pertemuan TINYINT NOT NULL,
  tanggal DATE NOT NULL,
  waktu VARCHAR(20) NOT NULL,
  mode ENUM('online', 'offline') NOT NULL,
  topik TEXT,
  link_meeting VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (mata_kuliah_id) REFERENCES mata_kuliah(id) ON DELETE CASCADE
);
```

#### Table: kehadiran
```sql
CREATE TABLE kehadiran (
  id VARCHAR(36) PRIMARY KEY,
  pertemuan_id VARCHAR(36) NOT NULL,
  mahasiswa_id VARCHAR(36) NOT NULL,
  status ENUM('hadir', 'tidak-hadir') NOT NULL,
  waktu_absen TIMESTAMP,
  catatan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pertemuan_id) REFERENCES pertemuan(id) ON DELETE CASCADE,
  FOREIGN KEY (mahasiswa_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_kehadiran (pertemuan_id, mahasiswa_id)
);
```

#### Table: semester_config
```sql
CREATE TABLE semester_config (
  id VARCHAR(36) PRIMARY KEY,
  tahun_ajaran VARCHAR(20) NOT NULL,
  semester ENUM('ganjil', 'genap') NOT NULL,
  tanggal_uts DATE NOT NULL,
  tanggal_uas DATE NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```


### API Endpoints

#### GET /api/mahasiswa/kehadiran
```typescript
// Response
{
  mataKuliahList: MataKuliah[];
  pertemuanData: Record<string, Pertemuan[]>;
  isBeforeUTS: boolean;
  tanggalUTS: string;
  semesterConfig: {
    tahunAjaran: string;
    semester: 'ganjil' | 'genap';
    tanggalUTS: string;
    tanggalUAS: string;
  };
}
```

#### GET /api/mahasiswa/kehadiran/:mataKuliahId
```typescript
// Response
{
  mataKuliah: MataKuliah;
  pertemuanList: Pertemuan[];
  progress: ProgressMataKuliah;
}
```

#### POST /api/mahasiswa/kehadiran/export-pdf
```typescript
// Request
{
  mataKuliahId?: string; // Optional, if not provided export all
  format: 'pdf' | 'excel';
}

// Response
{
  downloadUrl: string;
  filename: string;
}
```

### Controller Logic (Laravel)

```php
<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KehadiranController extends Controller
{
    public function index(Request $request)
    {
        $mahasiswaId = auth()->id();
        
        // Get active semester config
        $semesterConfig = SemesterConfig::where('is_active', true)->first();
        $isBeforeUTS = now()->lt($semesterConfig->tanggal_uts);
        
        // Get enrolled courses
        $mataKuliahList = MataKuliah::whereHas('enrollments', function($q) use ($mahasiswaId) {
            $q->where('mahasiswa_id', $mahasiswaId);
        })->with('dosen')->get();
        
        // Get all meetings with attendance status
        $pertemuanData = [];
        foreach ($mataKuliahList as $matkul) {
            $pertemuanList = Pertemuan::where('mata_kuliah_id', $matkul->id)
                ->with(['kehadiran' => function($q) use ($mahasiswaId) {
                    $q->where('mahasiswa_id', $mahasiswaId);
                }])
                ->orderBy('nomor_pertemuan')
                ->get()
                ->map(function($pertemuan) use ($isBeforeUTS, $matkul) {
                    $kehadiran = $pertemuan->kehadiran->first();
                    
                    return [
                        'id' => $pertemuan->id,
                        'mataKuliahId' => $pertemuan->mata_kuliah_id,
                        'nomorPertemuan' => $pertemuan->nomor_pertemuan,
                        'tanggal' => $pertemuan->tanggal->format('d M Y'),
                        'waktu' => $pertemuan->waktu,
                        'mode' => $this->calculateMeetingMode(
                            $pertemuan->nomor_pertemuan,
                            $matkul->sks,
                            $matkul->periode,
                            $isBeforeUTS
                        ),
                        'status' => $this->getAttendanceStatus($pertemuan, $kehadiran),
                        'topik' => $pertemuan->topik,
                        'catatan' => $kehadiran?->catatan,
                        'linkMeeting' => $pertemuan->link_meeting,
                    ];
                });
            
            $pertemuanData[$matkul->id] = $pertemuanList;
        }
        
        return Inertia::render('Mahasiswa/Kehadiran/Index', [
            'mataKuliahList' => $mataKuliahList,
            'pertemuanData' => $pertemuanData,
            'isBeforeUTS' => $isBeforeUTS,
            'tanggalUTS' => $semesterConfig->tanggal_uts->format('d M Y'),
        ]);
    }
    
    private function calculateMeetingMode($pertemuan, $sks, $periode, $isBeforeUTS)
    {
        $periodeMode = $isBeforeUTS
            ? ($periode === 1 ? 'offline' : 'online')
            : ($periode === 1 ? 'online' : 'offline');
        
        if ($sks === 2) {
            return $periodeMode;
        }
        
        if ($periodeMode === 'offline') {
            return $pertemuan % 3 === 0 ? 'online' : 'offline';
        }
        
        return 'online';
    }
    
    private function getAttendanceStatus($pertemuan, $kehadiran)
    {
        if (now()->lt($pertemuan->tanggal)) {
            return 'belum-dimulai';
        }
        
        if (!$kehadiran) {
            return 'tidak-hadir';
        }
        
        return $kehadiran->status;
    }
}
```


---

## 🎯 VALIDATION RULES

### Frontend Validation
```typescript
const validationRules = {
  search: {
    minLength: 0,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s]*$/,
  },
  filter: {
    periode: ['', '1', '2'],
    sks: ['', '2', '3'],
  },
};
```

### Data Validation
```typescript
// Validate SKS and meeting count
function validateMeetingCount(sks: number, meetingCount: number): boolean {
  if (sks === 3 && meetingCount !== 21) return false;
  if (sks === 2 && meetingCount !== 14) return false;
  return true;
}

// Validate period
function validatePeriod(periode: number): boolean {
  return periode === 1 || periode === 2;
}

// Validate meeting mode
function validateMeetingMode(mode: string): boolean {
  return mode === 'online' || mode === 'offline';
}
```

---

## 🚀 PERFORMANCE OPTIMIZATION

### 1. Memoization
```typescript
// Use useMemo for expensive calculations
const filteredMataKuliah = useMemo(() => {
  return mataKuliahList.filter(/* filter logic */);
}, [mataKuliahList, searchQuery, filterPeriode, filterSKS]);

const overallStats = useMemo(() => {
  // Calculate statistics
}, [mataKuliahList, pertemuanData]);
```

### 2. Lazy Loading
```typescript
// Load meeting details only when needed
const [selectedPertemuan, setSelectedPertemuan] = useState<Pertemuan | null>(null);
```

### 3. Virtual Scrolling
For large lists of courses, consider implementing virtual scrolling:
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';
```

### 4. Debounced Search
```typescript
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const debouncedSearch = useDebouncedValue(searchQuery, 300);
```


---

## 🎨 ACCESSIBILITY

### ARIA Labels
```tsx
<button
  aria-label={`Pertemuan ${pertemuan.nomorPertemuan} - ${pertemuan.status}`}
  role="button"
  tabIndex={0}
>
  {/* Content */}
</button>
```

### Keyboard Navigation
```typescript
const handleKeyPress = (e: React.KeyboardEvent, pertemuan: Pertemuan) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    setSelectedPertemuan(pertemuan);
  }
};
```

### Focus Management
```typescript
// Focus trap in modal
useEffect(() => {
  if (selectedPertemuan) {
    const modal = document.getElementById('meeting-detail-modal');
    modal?.focus();
  }
}, [selectedPertemuan]);
```

### Screen Reader Support
```tsx
<div role="status" aria-live="polite">
  {filteredMataKuliah.length} mata kuliah ditemukan
</div>
```

---

## 📊 TESTING SCENARIOS

### Unit Tests
1. Test `getMeetingMode` function with all combinations
2. Test `calculateProgress` function
3. Test `getStatusKehadiran` function
4. Test filter logic
5. Test search functionality

### Integration Tests
1. Test course card rendering
2. Test checklist grid rendering
3. Test modal open/close
4. Test filter interactions
5. Test search interactions

### E2E Tests
1. Navigate to kehadiran page
2. Search for a course
3. Apply filters
4. Click on a meeting
5. View meeting details
6. Close modal

### Test Cases for SKS Logic

#### SKS 3 - Periode 1 (Offline) - Before UTS
```typescript
expect(getMeetingMode(1, 3, 1, true)).toBe('offline');
expect(getMeetingMode(2, 3, 1, true)).toBe('offline');
expect(getMeetingMode(3, 3, 1, true)).toBe('online');  // Every 3rd
expect(getMeetingMode(4, 3, 1, true)).toBe('offline');
expect(getMeetingMode(5, 3, 1, true)).toBe('offline');
expect(getMeetingMode(6, 3, 1, true)).toBe('online');  // Every 3rd
```

#### SKS 3 - Periode 2 (Online) - Before UTS
```typescript
expect(getMeetingMode(1, 3, 2, true)).toBe('online');
expect(getMeetingMode(2, 3, 2, true)).toBe('online');
expect(getMeetingMode(3, 3, 2, true)).toBe('online');
// All online
```

#### SKS 2 - Periode 1 (Offline) - Before UTS
```typescript
expect(getMeetingMode(1, 2, 1, true)).toBe('offline');
expect(getMeetingMode(2, 2, 1, true)).toBe('offline');
// All offline
```

#### After UTS (Flipped)
```typescript
expect(getMeetingMode(1, 3, 1, false)).toBe('online');  // Flipped
expect(getMeetingMode(1, 3, 2, false)).toBe('offline'); // Flipped
```


---

## 🎯 EDGE CASES & ERROR HANDLING

### Edge Cases to Handle

1. **No Enrolled Courses**
```tsx
{mataKuliahList.length === 0 && (
  <div className="text-center py-12">
    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <p className="text-gray-600">Anda belum terdaftar di mata kuliah manapun</p>
  </div>
)}
```

2. **No Meetings Yet**
```tsx
{pertemuanList.length === 0 && (
  <div className="text-center py-8">
    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
    <p className="text-sm text-gray-500">Belum ada pertemuan</p>
  </div>
)}
```

3. **Search No Results**
```tsx
{filteredMataKuliah.length === 0 && searchQuery && (
  <div className="text-center py-12">
    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <p className="text-gray-600">Tidak ada hasil untuk "{searchQuery}"</p>
    <button onClick={() => setSearchQuery('')} className="mt-4 text-blue-600">
      Clear Search
    </button>
  </div>
)}
```

4. **Invalid Period Configuration**
```typescript
if (!semesterConfig || !semesterConfig.tanggal_uts) {
  return (
    <div className="text-center py-12">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <p className="text-gray-600">Konfigurasi semester tidak valid</p>
    </div>
  );
}
```

5. **Loading State**
```tsx
{isLoading && (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
  </div>
)}
```

### Error Handling

```typescript
try {
  const response = await fetch('/api/mahasiswa/kehadiran');
  if (!response.ok) throw new Error('Failed to fetch data');
  const data = await response.json();
  // Process data
} catch (error) {
  console.error('Error fetching kehadiran:', error);
  toast.error('Gagal memuat data kehadiran');
}
```

---

## 📝 ADDITIONAL FEATURES (Future Enhancements)

### 1. Attendance Reminder
- Push notification before class starts
- Email reminder for upcoming meetings
- WhatsApp notification integration

### 2. QR Code Attendance
- Generate QR code for each meeting
- Scan QR to mark attendance
- Location verification

### 3. Attendance Analytics
- Weekly/monthly attendance trends
- Comparison with class average
- Predictive analytics for final attendance

### 4. Export Options
- Export to PDF with custom template
- Export to Excel with charts
- Share attendance report via email

### 5. Gamification
- Attendance streak counter
- Badges for perfect attendance
- Leaderboard (optional, privacy-aware)

### 6. Calendar Integration
- Sync with Google Calendar
- Add meetings to Apple Calendar
- iCal export

### 7. Offline Support
- Cache attendance data
- Sync when online
- Progressive Web App (PWA)

### 8. Multi-language Support
- Indonesian (default)
- English
- Other languages


---

## 🎓 BUSINESS RULES

### Attendance Requirements
1. Minimum 75% attendance required to take final exam
2. 3 consecutive absences trigger warning notification
3. Attendance cannot be modified after 24 hours
4. Late attendance (>15 minutes) marked as "Terlambat"

### Meeting Rules
1. SKS 3 = 21 meetings (3 credits × 7 weeks × 1 meeting)
2. SKS 2 = 14 meetings (2 credits × 7 weeks × 1 meeting)
3. Online meetings for SKS 3 offline: every 3rd meeting (3, 6, 9, 12, 15, 18, 21)
4. Period flip after UTS (mid-term exam)

### Period Rules
1. **Periode 1 (Before UTS)**: Offline mode
   - SKS 3: Mostly offline, online every 3rd meeting
   - SKS 2: Full offline
2. **Periode 2 (Before UTS)**: Online mode
   - SKS 3: All online, 2 meetings per week
   - SKS 2: All online, 1 meeting per week
3. **After UTS**: Periods flip
   - Periode 1 becomes online
   - Periode 2 becomes offline

### Status Rules
1. **Hadir**: Student attended the meeting
2. **Tidak Hadir**: Student did not attend
3. **Belum Dimulai**: Meeting hasn't started yet
4. **Terlambat**: Student arrived late (>15 minutes)
5. **Izin**: Student has permission to be absent
6. **Sakit**: Student is sick (with medical certificate)

---

## 🔐 SECURITY CONSIDERATIONS

### Authorization
```php
// Ensure student can only view their own attendance
Gate::define('view-kehadiran', function ($user, $mahasiswaId) {
    return $user->id === $mahasiswaId && $user->role === 'mahasiswa';
});
```

### Data Privacy
- Students can only see their own attendance
- Attendance data is encrypted at rest
- API endpoints require authentication
- Rate limiting on API calls

### Input Sanitization
```typescript
// Sanitize search input
const sanitizeInput = (input: string): string => {
  return input.replace(/[<>]/g, '').trim();
};
```

---

## 📚 DOCUMENTATION

### Component Props Documentation
```typescript
/**
 * MonitoringKehadiran Component
 * 
 * Main component for student attendance monitoring page.
 * Displays all enrolled courses with attendance checklist.
 * 
 * @param {MataKuliah[]} mataKuliahList - List of enrolled courses
 * @param {Record<string, Pertemuan[]>} pertemuanData - Meeting data grouped by course ID
 * @param {boolean} isBeforeUTS - Whether current date is before UTS
 * @param {string} tanggalUTS - UTS date in readable format
 * 
 * @example
 * <MonitoringKehadiran
 *   mataKuliahList={courses}
 *   pertemuanData={meetings}
 *   isBeforeUTS={true}
 *   tanggalUTS="15 Nov 2024"
 * />
 */
```

### Function Documentation
```typescript
/**
 * Calculate meeting mode based on SKS, period, and UTS status
 * 
 * @param {number} pertemuan - Meeting number (1-21 for SKS 3, 1-14 for SKS 2)
 * @param {2 | 3} sks - Course credits
 * @param {1 | 2} periode - Period number
 * @param {boolean} isBeforeUTS - Whether before UTS
 * @returns {'online' | 'offline'} Meeting mode
 * 
 * @example
 * getMeetingMode(3, 3, 1, true) // Returns 'online' (every 3rd meeting)
 * getMeetingMode(1, 2, 1, true) // Returns 'offline' (SKS 2 full offline)
 */
```


---

## 🎯 SUMMARY

### Key Features Implemented
1. ✅ Comprehensive attendance monitoring with checklist
2. ✅ Complex SKS logic (SKS 2 = 14 meetings, SKS 3 = 21 meetings)
3. ✅ Period system with rolling after UTS
4. ✅ Smart meeting mode calculation (online/offline)
5. ✅ Visual progress tracking with circle and bar
6. ✅ Interactive checklist grid (responsive)
7. ✅ Meeting detail modal
8. ✅ Filter and search functionality
9. ✅ Overall statistics dashboard
10. ✅ Mobile-optimized design

### Design Principles Followed
1. ✅ Match dashboard design 100%
2. ✅ NO container on header icon
3. ✅ NO floating animations
4. ✅ Icon colors match container colors
5. ✅ Consistent typography (1 theme)
6. ✅ Mobile-first responsive design
7. ✅ Clean and professional UI
8. ✅ Smooth transitions and interactions

### Technical Excellence
1. ✅ TypeScript for type safety
2. ✅ React hooks for state management
3. ✅ Memoization for performance
4. ✅ Comprehensive validation
5. ✅ Error handling and edge cases
6. ✅ Accessibility support
7. ✅ SEO optimization
8. ✅ Clean code architecture

### Innovation Highlights
1. 🚀 Smart meeting mode calculator
2. 🚀 Period rolling system
3. 🚀 Visual progress indicators
4. 🚀 Interactive checklist with tooltips
5. 🚀 Real-time statistics
6. 🚀 Advanced filtering
7. 🚀 Meeting detail modal
8. 🚀 Mobile-optimized grid

---

## 📞 SUPPORT & MAINTENANCE

### Common Issues & Solutions

**Issue 1: Meeting mode calculation incorrect**
- Solution: Verify SKS, periode, and isBeforeUTS values
- Check: `getMeetingMode` function logic

**Issue 2: Progress not updating**
- Solution: Ensure pertemuanData is properly structured
- Check: `calculateProgress` function

**Issue 3: Filters not working**
- Solution: Verify filter state management
- Check: `filteredMataKuliah` useMemo dependencies

**Issue 4: Modal not closing**
- Solution: Check `setSelectedPertemuan(null)` is called
- Check: Backdrop click handler

**Issue 5: Mobile layout broken**
- Solution: Verify responsive classes (sm:, md:, lg:)
- Check: Grid column counts on different breakpoints

### Maintenance Checklist
- [ ] Update semester config before each semester
- [ ] Verify UTS date is correct
- [ ] Test period rolling logic
- [ ] Check attendance data integrity
- [ ] Monitor API performance
- [ ] Review error logs
- [ ] Update documentation
- [ ] Test on new devices/browsers

---

## 🎉 CONCLUSION

Prompt ini menyediakan panduan lengkap dan detail untuk mengembangkan fitur **Monitoring Kehadiran Mahasiswa** dengan:

1. **Logika SKS yang Kompleks**: Menangani SKS 2 (14 pertemuan) dan SKS 3 (21 pertemuan) dengan pola online/offline yang berbeda
2. **Sistem Periode Bergantian**: Periode 1 dan 2 yang flip setelah UTS
3. **UI/UX yang Konsisten**: Matching 100% dengan dashboard design
4. **Inovasi Signifikan**: Smart calculator, visual progress, interactive checklist
5. **Mobile-First Design**: Responsive di semua breakpoint
6. **Clean Code**: TypeScript, proper structure, comprehensive validation
7. **Dokumentasi Lengkap**: 45+ checklist items, testing scenarios, API specs

Fitur ini akan sangat membantu mahasiswa dalam monitoring kehadiran mereka dengan cara yang visual, interaktif, dan mudah dipahami. Sistem ceklis per pertemuan memudahkan mahasiswa untuk tracking progress dan memastikan mereka tidak melewatkan pertemuan penting.

**Selamat mengembangkan! 🚀**
