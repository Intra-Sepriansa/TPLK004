# PROMPT ULTRA ADVANCED: DETAIL KEHADIRAN MATA KULIAH

## 🎯 TUJUAN PENGEMBANGAN
Membuat halaman detail kehadiran untuk satu mata kuliah spesifik yang menampilkan informasi lengkap tentang semua pertemuan, statistik kehadiran, timeline pertemuan, dan fitur-fitur advanced untuk monitoring kehadiran mahasiswa secara mendalam.

---

## 📋 OVERVIEW FITUR

### Tujuan Utama
1. **Detail Lengkap**: Menampilkan semua informasi mata kuliah dan pertemuan
2. **Timeline View**: Visualisasi timeline pertemuan dengan status
3. **Statistik Mendalam**: Analytics kehadiran yang komprehensif
4. **Meeting History**: Riwayat lengkap setiap pertemuan
5. **Export & Print**: Kemampuan export dan print laporan

### Lokasi Menu
- **Path**: `/mahasiswa/akademik/kehadiran/:mataKuliahId`
- **Accessed From**: Click pada course card di halaman monitoring kehadiran
- **Icon**: BookOpen (untuk header)

---

## 🎨 DESIGN SYSTEM

### Color Palette (Matching Dashboard)
```typescript
const colors = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6',
  
  // Status Colors
  hadir: '#10b981',
  tidakHadir: '#ef4444',
  izin: '#f59e0b',
  sakit: '#f97316',
  alpha: '#6b7280',
  
  // Mode Colors
  online: '#06b6d4',
  offline: '#8b5cf6',
};
```


### 2. Statistics Overview Section
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
    {/* Total Pertemuan */}
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="p-2 bg-blue-50 rounded-lg mb-2">
          <Calendar className="w-5 h-5 text-blue-600" />
        </div>
        <p className="text-xs text-gray-500 mb-1">Total Pertemuan</p>
        <p className="text-2xl font-bold text-gray-900">{stats.totalPertemuan}</p>
      </div>
    </div>
    
    {/* Hadir */}
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="p-2 bg-green-50 rounded-lg mb-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
        </div>
        <p className="text-xs text-gray-500 mb-1">Hadir</p>
        <p className="text-2xl font-bold text-green-600">{stats.hadir}</p>
      </div>
    </div>
    
    {/* Tidak Hadir */}
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="p-2 bg-red-50 rounded-lg mb-2">
          <XCircle className="w-5 h-5 text-red-600" />
        </div>
        <p className="text-xs text-gray-500 mb-1">Tidak Hadir</p>
        <p className="text-2xl font-bold text-red-600">{stats.tidakHadir}</p>
      </div>
    </div>
    
    {/* Persentase */}
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="p-2 bg-cyan-50 rounded-lg mb-2">
          <TrendingUp className="w-5 h-5 text-cyan-600" />
        </div>
        <p className="text-xs text-gray-500 mb-1">Persentase</p>
        <p className={`text-2xl font-bold ${
          stats.persentase >= 75 ? 'text-green-600' : 'text-red-600'
        }`}>
          {stats.persentase}%
        </p>
      </div>
    </div>
    
    {/* Status */}
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className={`p-2 rounded-lg mb-2 ${
          stats.persentase >= 75 ? 'bg-green-50' : 'bg-red-50'
        }`}>
          {stats.persentase >= 75 ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600" />
          )}
        </div>
        <p className="text-xs text-gray-500 mb-1">Status</p>
        <p className={`text-sm font-semibold ${
          stats.persentase >= 75 ? 'text-green-600' : 'text-red-600'
        }`}>
          {stats.persentase >= 75 ? 'Memenuhi' : 'Tidak Memenuhi'}
        </p>
      </div>
    </div>
  </div>
</div>
```

### 3. Progress & Prediction Section
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Progress Card */}
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Progress Kehadiran
      </h3>
      
      {/* Circular Progress */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-40 h-40">
          <svg className="w-40 h-40 transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke={stats.persentase >= 75 ? '#10b981' : '#ef4444'}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${stats.persentase * 4.4} 440`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900">
              {stats.persentase}%
            </span>
            <span className="text-xs text-gray-500 mt-1">
              {stats.hadir}/{stats.totalPertemuan}
            </span>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Hadir</span>
            <span>{stats.hadir} pertemuan</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(stats.hadir / stats.totalPertemuan) * 100}%` }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Tidak Hadir</span>
            <span>{stats.tidakHadir} pertemuan</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-red-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(stats.tidakHadir / stats.totalPertemuan) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>

### Typography
```typescript
const typography = {
  pageTitle: 'text-2xl md:text-3xl font-bold text-gray-900',
  sectionTitle: 'text-xl md:text-2xl font-semibold text-gray-900',
  cardTitle: 'text-lg font-semibold text-gray-800',
  body: 'text-sm md:text-base text-gray-700',
  caption: 'text-xs text-gray-500',
  label: 'text-sm font-medium text-gray-700',
};
```

---

## 🏗️ STRUKTUR HALAMAN

### 1. Header Section
```tsx
<div className="bg-white border-b border-gray-200 sticky top-0 z-10">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
    {/* Back Button */}
    <button
      onClick={() => router.visit('/mahasiswa/akademik/kehadiran')}
      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
    >
      <ChevronLeft className="w-5 h-5" />
      <span className="text-sm font-medium">Kembali ke Monitoring Kehadiran</span>
    </button>
    
    {/* Header Content */}
    <div className="flex items-start gap-4">
      {/* Icon - NO CONTAINER */}
      <div className="flex-shrink-0">
        <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
      </div>
      
      {/* Course Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
            {mataKuliah.kode}
          </span>
          <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded">
            SKS {mataKuliah.sks}
          </span>
          <span className="px-2 py-1 bg-cyan-50 text-cyan-700 text-xs font-medium rounded">
            Periode {mataKuliah.periode}
          </span>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {mataKuliah.nama}
        </h1>
        
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{mataKuliah.dosen}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{mataKuliah.hari}, {mataKuliah.waktu}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{mataKuliah.ruangan}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Kelas {mataKuliah.kelas}</span>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex-shrink-0 flex gap-2">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Download className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Printer className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Share2 className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  </div>
</div>
```

### 2. Statistics Overview Section
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
    {/* Total Pertemuan */}
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="p-3 bg-blue-50 rounded-full mb-2">
          <Calendar className="w-6 h-6 text-blue-600" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.totalPertemuan}</p>
        <p className="text-xs text-gray-500 mt-1">Total Pertemuan</p>
      </div>
    </div>
    
    {/* Hadir */}
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="p-3 bg-green-50 rounded-full mb-2">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <p className="text-2xl font-bold text-green-600">{stats.hadir}</p>
        <p className="text-xs text-gray-500 mt-1">Hadir</p>
      </div>
    </div>
    
    {/* Tidak Hadir */}
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="p-3 bg-red-50 rounded-full mb-2">
          <XCircle className="w-6 h-6 text-red-600" />
        </div>
        <p className="text-2xl font-bold text-red-600">{stats.tidakHadir}</p>
        <p className="text-xs text-gray-500 mt-1">Tidak Hadir</p>
      </div>
    </div>

    
    {/* Izin/Sakit */}
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="p-3 bg-yellow-50 rounded-full mb-2">
          <FileText className="w-6 h-6 text-yellow-600" />
        </div>
        <p className="text-2xl font-bold text-yellow-600">{stats.izinSakit}</p>
        <p className="text-xs text-gray-500 mt-1">Izin/Sakit</p>
      </div>
    </div>
    
    {/* Persentase */}
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="p-3 bg-cyan-50 rounded-full mb-2">
          <TrendingUp className="w-6 h-6 text-cyan-600" />
        </div>
        <p className="text-2xl font-bold text-cyan-600">{stats.persentase}%</p>
        <p className="text-xs text-gray-500 mt-1">Persentase</p>
      </div>
    </div>
  </div>
  
  {/* Progress Bar */}
  <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-semibold text-gray-900">Progress Kehadiran</h3>
      <span className="text-sm text-gray-600">
        {stats.hadir} dari {stats.totalPertemuan} pertemuan
      </span>
    </div>
    
    <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
      <div
        className={`h-full transition-all duration-500 ${
          stats.persentase >= 75 ? 'bg-green-600' : 'bg-red-600'
        }`}
        style={{ width: `${stats.persentase}%` }}
      />
    </div>
    
    {/* Warning if below 75% */}
    {stats.persentase < 75 && (
      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-red-800">
            Perhatian: Kehadiran di bawah 75%
          </p>
          <p className="text-xs text-red-700 mt-1">
            Anda perlu hadir di {Math.ceil((0.75 * stats.totalPertemuan) - stats.hadir)} pertemuan lagi 
            untuk memenuhi syarat mengikuti ujian akhir.
          </p>
        </div>
      </div>
    )}
  </div>
</div>
```

### 3. View Mode Toggle
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-gray-900">Tampilan</h3>
      
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('grid')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'grid'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Grid className="w-4 h-4 inline mr-2" />
          Grid
        </button>
        
        <button
          onClick={() => setViewMode('timeline')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'timeline'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <List className="w-4 h-4 inline mr-2" />
          Timeline
        </button>
        
        <button
          onClick={() => setViewMode('calendar')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'calendar'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Kalender
        </button>
      </div>
    </div>
  </div>
</div>
```


    
    {/* Prediction Card */}
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Prediksi Kehadiran
      </h3>
      
      {prediction.canAchieve75 ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800">
                Anda Bisa Mencapai 75%!
              </p>
              <p className="text-xs text-green-700 mt-1">
                Dengan hadir di {prediction.requiredAttendance} dari {prediction.remainingMeetings} pertemuan tersisa
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pertemuan Tersisa</span>
              <span className="font-semibold text-gray-900">{prediction.remainingMeetings}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Harus Hadir Minimal</span>
              <span className="font-semibold text-gray-900">{prediction.requiredAttendance}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Boleh Tidak Hadir</span>
              <span className="font-semibold text-gray-900">
                {prediction.remainingMeetings - prediction.requiredAttendance}
              </span>
            </div>
          </div>
          
          {/* Visual Prediction */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Proyeksi Akhir Semester</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${prediction.projectedPercentage}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-green-600">
                {prediction.projectedPercentage}%
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">
                Tidak Bisa Mencapai 75%
              </p>
              <p className="text-xs text-red-700 mt-1">
                Maksimal yang bisa dicapai: {prediction.maxPossiblePercentage}%
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pertemuan Tersisa</span>
              <span className="font-semibold text-gray-900">{prediction.remainingMeetings}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Maksimal Kehadiran</span>
              <span className="font-semibold text-red-600">
                {stats.hadir + prediction.remainingMeetings}/{stats.totalPertemuan}
              </span>
            </div>
          </div>
          
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              💡 Hubungi dosen untuk konsultasi mengenai kehadiran Anda
            </p>
          </div>
        </div>
      )}
    </div>
  </div>
</div>
```

### 4. Timeline Kehadiran Section
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-gray-900">
        Timeline Kehadiran
      </h3>
      
      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('timeline')}
          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
            viewMode === 'timeline'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Timeline
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
            viewMode === 'list'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          List
        </button>
      </div>
    </div>

### 4. Grid View (Default)
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
      Daftar Pertemuan
    </h3>
    
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {pertemuanList.map((pertemuan) => (
        <button
          key={pertemuan.id}
          onClick={() => setSelectedPertemuan(pertemuan)}
          className={`
            relative p-4 rounded-lg border-2 transition-all duration-200
            hover:scale-105 cursor-pointer group
            ${getStatusStyle(pertemuan.status)}
          `}
        >
          {/* Nomor Pertemuan */}
          <div className="text-center mb-2">
            <p className="text-xs text-gray-500 mb-1">Pertemuan</p>
            <p className={`text-2xl font-bold ${getStatusColor(pertemuan.status)}`}>
              {pertemuan.nomorPertemuan}
            </p>
          </div>
          
          {/* Status Icon */}
          <div className="flex justify-center mb-2">
            {pertemuan.status === 'hadir' && (
              <CheckCircle className="w-6 h-6 text-green-600" />
            )}
            {pertemuan.status === 'tidak-hadir' && (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
            {pertemuan.status === 'izin' && (
              <FileText className="w-6 h-6 text-yellow-600" />
            )}
            {pertemuan.status === 'sakit' && (
              <Heart className="w-6 h-6 text-orange-600" />
            )}
            {pertemuan.status === 'belum-dimulai' && (
              <Clock className="w-6 h-6 text-gray-400" />
            )}
          </div>
          
          {/* Mode Badge */}
          <div className="flex justify-center">
            {pertemuan.mode === 'online' ? (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-50 rounded text-[10px] text-cyan-700">
                <Wifi className="w-3 h-3" />
                <span>Online</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 rounded text-[10px] text-purple-700">
                <MapPin className="w-3 h-3" />
                <span>Offline</span>
              </div>
            )}
          </div>
          
          {/* Date */}
          <p className="text-[10px] text-gray-500 text-center mt-2">
            {formatDate(pertemuan.tanggal)}
          </p>
          
          {/* Hover Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
            <div className="bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-nowrap">
              <p className="font-medium">{pertemuan.topik || 'Pertemuan ' + pertemuan.nomorPertemuan}</p>
              <p className="text-gray-300">{pertemuan.tanggal}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  </div>
</div>
```

### 5. Timeline View
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      Timeline Pertemuan
    </h3>
    
    <div className="space-y-4">
      {pertemuanList.map((pertemuan, index) => (
        <div key={pertemuan.id} className="relative">
          {/* Timeline Line */}
          {index < pertemuanList.length - 1 && (
            <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
          )}
          
          {/* Timeline Item */}
          <div className="flex gap-4">
            {/* Icon */}
            <div className={`
              relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
              ${getStatusBgColor(pertemuan.status)}
            `}>
              {pertemuan.status === 'hadir' && (
                <CheckCircle className="w-6 h-6 text-green-600" />
              )}
              {pertemuan.status === 'tidak-hadir' && (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
              {pertemuan.status === 'izin' && (
                <FileText className="w-6 h-6 text-yellow-600" />
              )}
              {pertemuan.status === 'sakit' && (
                <Heart className="w-6 h-6 text-orange-600" />
              )}
              {pertemuan.status === 'belum-dimulai' && (
                <Clock className="w-6 h-6 text-gray-400" />
              )}
            </div>

    
    {viewMode === 'timeline' ? (
      /* Timeline View */
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />
        
        <div className="space-y-6">
          {pertemuanList.map((pertemuan, index) => (
            <div key={pertemuan.id} className="relative flex gap-4">
              {/* Timeline Dot */}
              <div className="relative z-10 flex-shrink-0">
                <div className={`w-16 h-16 rounded-full border-4 border-white flex items-center justify-center ${
                  pertemuan.status === 'hadir'
                    ? 'bg-green-500'
                    : pertemuan.status === 'tidak-hadir'
                    ? 'bg-red-500'
                    : 'bg-gray-300'
                }`}>
                  {pertemuan.status === 'hadir' ? (
                    <Check className="w-6 h-6 text-white" />
                  ) : pertemuan.status === 'tidak-hadir' ? (
                    <X className="w-6 h-6 text-white" />
                  ) : (
                    <Clock className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-2">
                  <span className="text-xs font-semibold text-gray-600">
                    P{pertemuan.nomorPertemuan}
                  </span>
                </div>
              </div>
              
              {/* Content Card */}
              <div className="flex-1 pb-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Pertemuan {pertemuan.nomorPertemuan}
                      </h4>
                      {pertemuan.topik && (
                        <p className="text-sm text-gray-600">{pertemuan.topik}</p>
                      )}
                    </div>
                    
                    {/* Mode Badge */}
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      pertemuan.mode === 'online'
                        ? 'bg-cyan-50 text-cyan-700'
                        : 'bg-purple-50 text-purple-700'
                    }`}>
                      {pertemuan.mode === 'online' ? (
                        <div className="flex items-center gap-1">
                          <Wifi className="w-3 h-3" />
                          <span>Online</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>Offline</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{pertemuan.tanggal}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{pertemuan.waktu}</span>
                    </div>
                  </div>
                  
                  {pertemuan.catatan && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Catatan:</p>
                      <p className="text-sm text-gray-700">{pertemuan.catatan}</p>
                    </div>
                  )}
                  
                  {pertemuan.linkMeeting && pertemuan.mode === 'online' && (
                    <div className="mt-3">
                      <a
                        href={pertemuan.linkMeeting}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Link Meeting</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : (
      /* List View */
      <div className="space-y-3">
        {pertemuanList.map((pertemuan) => (
          <div
            key={pertemuan.id}
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            {/* Status Icon */}
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              pertemuan.status === 'hadir'
                ? 'bg-green-100'
                : pertemuan.status === 'tidak-hadir'
                ? 'bg-red-100'
                : 'bg-gray-200'
            }`}>
              {pertemuan.status === 'hadir' ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : pertemuan.status === 'tidak-hadir' ? (
                <XCircle className="w-6 h-6 text-red-600" />
              ) : (
                <Clock className="w-6 h-6 text-gray-500" />
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900">
                  Pertemuan {pertemuan.nomorPertemuan}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  pertemuan.mode === 'online'
                    ? 'bg-cyan-50 text-cyan-700'
                    : 'bg-purple-50 text-purple-700'
                }`}>
                  {pertemuan.mode === 'online' ? 'Online' : 'Offline'}
                </span>
              </div>
              {pertemuan.topik && (
                <p className="text-sm text-gray-600 truncate">{pertemuan.topik}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {pertemuan.tanggal} • {pertemuan.waktu}
              </p>
            </div>
            
            {/* Status Badge */}
            <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
              pertemuan.status === 'hadir'
                ? 'bg-green-100 text-green-700'
                : pertemuan.status === 'tidak-hadir'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-200 text-gray-700'
            }`}>
              {pertemuan.status === 'hadir' ? 'Hadir' :
               pertemuan.status === 'tidak-hadir' ? 'Tidak Hadir' :
               'Belum Dimulai'}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
</div>
```


            
            {/* Content */}
            <div className="flex-1 pb-8">
              <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                   onClick={() => setSelectedPertemuan(pertemuan)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                        Pertemuan {pertemuan.nomorPertemuan}
                      </span>
                      {pertemuan.mode === 'online' ? (
                        <span className="px-2 py-1 bg-cyan-50 text-cyan-700 text-xs font-medium rounded flex items-center gap-1">
                          <Wifi className="w-3 h-3" />
                          Online
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Offline
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(pertemuan.status)}`}>
                        {getStatusLabel(pertemuan.status)}
                      </span>
                    </div>
                    
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      {pertemuan.topik || `Pertemuan ${pertemuan.nomorPertemuan}`}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(pertemuan.tanggal)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{pertemuan.waktu}</span>
                      </div>
                      {pertemuan.waktuAbsen && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Absen: {pertemuan.waktuAbsen}</span>
                        </div>
                      )}
                    </div>
                    
                    {pertemuan.catatan && (
                      <p className="mt-2 text-xs text-gray-600 italic">
                        "{pertemuan.catatan}"
                      </p>
                    )}
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
```

### 6. Calendar View
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-gray-900">
        Kalender Kehadiran
      </h3>
      
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <span className="text-sm font-medium text-gray-900 min-w-[120px] text-center">
          {currentMonth}
        </span>
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
    
    {/* Calendar Grid */}
    <div className="grid grid-cols-7 gap-2">
      {/* Day Headers */}
      {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
        <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
          {day}
        </div>
      ))}
      
      {/* Calendar Days */}
      {calendarDays.map((day, index) => {
        const meeting = getMeetingByDate(day.date);
        
        return (
          <div
            key={index}
            className={`
              aspect-square p-2 rounded-lg border transition-all
              ${day.isCurrentMonth ? 'border-gray-200' : 'border-transparent bg-gray-50'}
              ${meeting ? 'cursor-pointer hover:shadow-md' : ''}
              ${day.isToday ? 'ring-2 ring-blue-500' : ''}
            `}
            onClick={() => meeting && setSelectedPertemuan(meeting)}
          >
            <div className="text-xs font-medium text-gray-900 mb-1">
              {day.date.getDate()}
            </div>
            
            {meeting && (
              <div className={`
                w-full h-1 rounded-full
                ${meeting.status === 'hadir' ? 'bg-green-500' : ''}
                ${meeting.status === 'tidak-hadir' ? 'bg-red-500' : ''}
                ${meeting.status === 'izin' ? 'bg-yellow-500' : ''}
                ${meeting.status === 'sakit' ? 'bg-orange-500' : ''}
                ${meeting.status === 'belum-dimulai' ? 'bg-gray-300' : ''}
              `} />
            )}
          </div>
        );
      })}
    </div>
  </div>
</div>
```


### 5. Attendance Pattern Analysis Section
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Pattern Card */}
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Pola Kehadiran
      </h3>
      
      <div className="space-y-4">
        {/* Streak */}
        {pattern.currentStreak > 0 && (
          <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <Flame className="w-5 h-5 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-orange-800">
                Streak Kehadiran: {pattern.currentStreak} Pertemuan
              </p>
              <p className="text-xs text-orange-700 mt-1">
                Rekor terbaik: {pattern.longestStreak} pertemuan berturut-turut
              </p>
            </div>
          </div>
        )}
        
        {/* Attendance by Day */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Kehadiran per Hari
          </p>
          <div className="space-y-2">
            {pattern.byDay.map((day) => (
              <div key={day.name} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-16">{day.name}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${day.percentage}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-900 w-12 text-right">
                  {day.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Attendance by Mode */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Kehadiran per Mode
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200">
              <div className="flex items-center gap-2 mb-1">
                <Wifi className="w-4 h-4 text-cyan-600" />
                <span className="text-xs text-cyan-700">Online</span>
              </div>
              <p className="text-xl font-bold text-cyan-900">
                {pattern.onlinePercentage}%
              </p>
              <p className="text-xs text-cyan-700 mt-1">
                {pattern.onlineAttended}/{pattern.onlineTotal} pertemuan
              </p>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-purple-700">Offline</span>
              </div>
              <p className="text-xl font-bold text-purple-900">
                {pattern.offlinePercentage}%
              </p>
              <p className="text-xs text-purple-700 mt-1">
                {pattern.offlineAttended}/{pattern.offlineTotal} pertemuan
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Recommendations Card */}
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Rekomendasi
      </h3>
      
      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 p-3 rounded-lg border ${
              rec.type === 'success'
                ? 'bg-green-50 border-green-200'
                : rec.type === 'warning'
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            {rec.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : rec.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                rec.type === 'success'
                  ? 'text-green-800'
                  : rec.type === 'warning'
                  ? 'text-yellow-800'
                  : 'text-blue-800'
              }`}>
                {rec.title}
              </p>
              <p className={`text-xs mt-1 ${
                rec.type === 'success'
                  ? 'text-green-700'
                  : rec.type === 'warning'
                  ? 'text-yellow-700'
                  : 'text-blue-700'
              }`}>
                {rec.message}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-3">
          Aksi Cepat
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleExportPDF}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">Export PDF</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="text-sm font-medium">Export Excel</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
```


### 7. Meeting Detail Modal (Enhanced)
```tsx
interface MeetingDetailModalProps {
  pertemuan: Pertemuan;
  mataKuliah: MataKuliah;
  onClose: () => void;
}

function MeetingDetailModal({ pertemuan, mataKuliah, onClose }: MeetingDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                  Pertemuan {pertemuan.nomorPertemuan}
                </span>
                {pertemuan.mode === 'online' ? (
                  <span className="px-2 py-1 bg-cyan-50 text-cyan-700 text-xs font-medium rounded flex items-center gap-1">
                    <Wifi className="w-3 h-3" />
                    Online
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Offline
                  </span>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900">
                {pertemuan.topik || `Pertemuan ${pertemuan.nomorPertemuan}`}
              </h3>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Status Card */}
          <div className={`
            p-4 rounded-lg border-2
            ${pertemuan.status === 'hadir' ? 'bg-green-50 border-green-200' : ''}
            ${pertemuan.status === 'tidak-hadir' ? 'bg-red-50 border-red-200' : ''}
            ${pertemuan.status === 'izin' ? 'bg-yellow-50 border-yellow-200' : ''}
            ${pertemuan.status === 'sakit' ? 'bg-orange-50 border-orange-200' : ''}
            ${pertemuan.status === 'belum-dimulai' ? 'bg-gray-50 border-gray-200' : ''}
          `}>
            <div className="flex items-center gap-3">
              {pertemuan.status === 'hadir' && (
                <>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">Hadir</p>
                    <p className="text-sm text-green-700">Anda hadir di pertemuan ini</p>
                  </div>
                </>
              )}
              {pertemuan.status === 'tidak-hadir' && (
                <>
                  <XCircle className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-800">Tidak Hadir</p>
                    <p className="text-sm text-red-700">Anda tidak hadir di pertemuan ini</p>
                  </div>
                </>
              )}
              {pertemuan.status === 'izin' && (
                <>
                  <FileText className="w-8 h-8 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-yellow-800">Izin</p>
                    <p className="text-sm text-yellow-700">Anda izin tidak hadir</p>
                  </div>
                </>
              )}
              {pertemuan.status === 'sakit' && (
                <>
                  <Heart className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="font-semibold text-orange-800">Sakit</p>
                    <p className="text-sm text-orange-700">Anda sakit dan tidak hadir</p>
                  </div>
                </>
              )}
              {pertemuan.status === 'belum-dimulai' && (
                <>
                  <Clock className="w-8 h-8 text-gray-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Belum Dimulai</p>
                    <p className="text-sm text-gray-700">Pertemuan belum berlangsung</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Meeting Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Tanggal</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDateLong(pertemuan.tanggal)}
                  </p>
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
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Lokasi</p>
                  <p className="text-sm font-medium text-gray-900">
                    {pertemuan.mode === 'online' ? 'Online Meeting' : mataKuliah.ruangan}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Dosen</p>
                  <p className="text-sm font-medium text-gray-900">{mataKuliah.dosen}</p>
                </div>
              </div>

              {pertemuan.waktuAbsen && (
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Waktu Absen</p>
                    <p className="text-sm font-medium text-gray-900">{pertemuan.waktuAbsen}</p>
                  </div>
                </div>
              )}

              {pertemuan.durasi && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Durasi</p>
                    <p className="text-sm font-medium text-gray-900">{pertemuan.durasi}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

---

## 💻 IMPLEMENTASI LENGKAP

### Main Component
```typescript
import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  ChevronLeft, BookOpen, User, Clock, MapPin, Download, Printer,
  Calendar, CheckCircle, XCircle, TrendingUp, AlertTriangle,
  Check, X, Wifi, ExternalLink, Flame, Info, FileText,
  FileSpreadsheet
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
}

interface Pertemuan {
  id: string;
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
  mataKuliah: MataKuliah;
  pertemuanList: Pertemuan[];
  isBeforeUTS: boolean;
}

export default function DetailKehadiranMataKuliah({
  mataKuliah,
  pertemuanList,
  isBeforeUTS
}: Props) {
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');

  // Calculate statistics
  const stats = useMemo(() => {
    const totalPertemuan = mataKuliah.sks === 3 ? 21 : 14;
    const hadir = pertemuanList.filter(p => p.status === 'hadir').length;
    const tidakHadir = pertemuanList.filter(p => p.status === 'tidak-hadir').length;
    const persentase = Math.round((hadir / totalPertemuan) * 100);

    return {
      totalPertemuan,
      hadir,
      tidakHadir,
      persentase
    };
  }, [mataKuliah.sks, pertemuanList]);

  // Calculate prediction
  const prediction = useMemo(() => {
    const completedMeetings = pertemuanList.filter(
      p => p.status !== 'belum-dimulai'
    ).length;
    const remainingMeetings = stats.totalPertemuan - completedMeetings;
    const requiredTotal = Math.ceil(stats.totalPertemuan * 0.75);
    const requiredAttendance = Math.max(0, requiredTotal - stats.hadir);
    const canAchieve75 = requiredAttendance <= remainingMeetings;
    const maxPossibleAttendance = stats.hadir + remainingMeetings;
    const maxPossiblePercentage = Math.round(
      (maxPossibleAttendance / stats.totalPertemuan) * 100
    );
    const projectedPercentage = canAchieve75
      ? Math.round(((stats.hadir + requiredAttendance) / stats.totalPertemuan) * 100)
      : maxPossiblePercentage;

    return {
      remainingMeetings,
      requiredAttendance,
      canAchieve75,
      maxPossiblePercentage,
      projectedPercentage
    };
  }, [stats, pertemuanList]);

  // Calculate attendance pattern
  const pattern = useMemo(() => {
    // Streak calculation
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const completedMeetings = pertemuanList
      .filter(p => p.status !== 'belum-dimulai')
      .sort((a, b) => a.nomorPertemuan - b.nomorPertemuan);

    for (let i = completedMeetings.length - 1; i >= 0; i--) {
      if (completedMeetings[i].status === 'hadir') {
        if (i === completedMeetings.length - 1) currentStreak++;
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        if (i === completedMeetings.length - 1) currentStreak = 0;
        tempStreak = 0;
      }
    }

    // Online vs Offline
    const onlineMeetings = pertemuanList.filter(p => p.mode === 'online');
    const offlineMeetings = pertemuanList.filter(p => p.mode === 'offline');
    const onlineAttended = onlineMeetings.filter(p => p.status === 'hadir').length;
    const offlineAttended = offlineMeetings.filter(p => p.status === 'hadir').length;

    return {
      currentStreak,
      longestStreak,
      onlineTotal: onlineMeetings.length,
      onlineAttended,
      onlinePercentage: onlineMeetings.length > 0
        ? Math.round((onlineAttended / onlineMeetings.length) * 100)
        : 0,
      offlineTotal: offlineMeetings.length,
      offlineAttended,
      offlinePercentage: offlineMeetings.length > 0
        ? Math.round((offlineAttended / offlineMeetings.length) * 100)
        : 0,
      byDay: [] // Implement if needed
    };
  }, [pertemuanList]);

  // Generate recommendations
  const recommendations = useMemo(() => {
    const recs = [];

    if (stats.persentase >= 80) {
      recs.push({
        type: 'success',
        title: 'Kehadiran Sangat Baik!',
        message: 'Pertahankan kehadiran Anda untuk hasil yang optimal.'
      });
    } else if (stats.persentase >= 75) {
      recs.push({
        type: 'warning',
        title: 'Kehadiran Cukup',
        message: 'Anda memenuhi syarat minimal, tapi usahakan untuk meningkatkan.'
      });
    } else {
      recs.push({
        type: 'warning',
        title: 'Kehadiran Kurang',
        message: 'Tingkatkan kehadiran Anda untuk memenuhi syarat ujian.'
      });
    }

    if (prediction.canAchieve75 && prediction.requiredAttendance > 0) {
      recs.push({
        type: 'info',
        title: 'Target Kehadiran',
        message: `Hadir di ${prediction.requiredAttendance} pertemuan lagi untuk mencapai 75%.`
      });
    }

    if (pattern.currentStreak >= 3) {
      recs.push({
        type: 'success',
        title: 'Streak Bagus!',
        message: `Anda sudah hadir ${pattern.currentStreak} pertemuan berturut-turut.`
      });
    }

    return recs;
  }, [stats, prediction, pattern]);

  const handleExportPDF = () => {
    // Implementation
    window.open(`/api/mahasiswa/kehadiran/${mataKuliah.id}/export-pdf`, '_blank');
  };

  const handleExportExcel = () => {
    // Implementation
    window.open(`/api/mahasiswa/kehadiran/${mataKuliah.id}/export-excel`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Head title={`Detail Kehadiran - ${mataKuliah.nama}`} />
      
      {/* Header Section */}
      {/* ... (as shown above) */}
      
      {/* Statistics Overview Section */}
      {/* ... (as shown above) */}
      
      {/* Progress & Prediction Section */}
      {/* ... (as shown above) */}
      
      {/* Timeline Section */}
      {/* ... (as shown above) */}
      
      {/* Pattern Analysis Section */}
      {/* ... (as shown above) */}
    </>
  );
}
```



          {/* Link Meeting (if online) */}
          {pertemuan.mode === 'online' && pertemuan.linkMeeting && (
            <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Wifi className="w-5 h-5 text-cyan-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-cyan-900 mb-2">Link Meeting</p>
                  <a
                    href={pertemuan.linkMeeting}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-cyan-700 hover:text-cyan-800 underline break-all"
                  >
                    {pertemuan.linkMeeting}
                  </a>
                  <button
                    onClick={() => navigator.clipboard.writeText(pertemuan.linkMeeting)}
                    className="mt-2 text-xs text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Materi/Topik */}
          {pertemuan.materi && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Materi Pertemuan</h4>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{pertemuan.materi}</p>
              </div>
            </div>
          )}

          {/* Catatan */}
          {pertemuan.catatan && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Catatan</h4>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-gray-700 italic">{pertemuan.catatan}</p>
              </div>
            </div>
          )}

          {/* Attachments */}
          {pertemuan.attachments && pertemuan.attachments.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Lampiran</h4>
              <div className="space-y-2">
                {pertemuan.attachments.map((file, index) => (
                  <a
                    key={index}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.size}</p>
                    </div>
                    <Download className="w-4 h-4 text-gray-400" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
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

## 💻 IMPLEMENTASI LENGKAP

### Main Component
```typescript
import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  BookOpen, ChevronLeft, Calendar, CheckCircle, XCircle, Clock,
  TrendingUp, User, MapPin, Users, Download, Printer, Share2,
  Wifi, FileText, Heart, AlertTriangle, Grid, List, Copy,
  ChevronRight, X
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
  nomorPertemuan: number;
  tanggal: string;
  waktu: string;
  mode: 'online' | 'offline';
  status: 'hadir' | 'tidak-hadir' | 'izin' | 'sakit' | 'belum-dimulai';
  topik?: string;
  materi?: string;
  catatan?: string;
  linkMeeting?: string;
  waktuAbsen?: string;
  durasi?: string;
  attachments?: Array<{
    name: string;
    url: string;
    size: string;
  }>;
}

interface Props {
  mataKuliah: MataKuliah;
  pertemuanList: Pertemuan[];
  stats: {
    totalPertemuan: number;
    hadir: number;
    tidakHadir: number;
    izinSakit: number;
    persentase: number;
  };
}

export default function DetailKehadiranMataKuliah({
  mataKuliah,
  pertemuanList,
  stats
}: Props) {
  const [viewMode, setViewMode] = useState<'grid' | 'timeline' | 'calendar'>('grid');
  const [selectedPertemuan, setSelectedPertemuan] = useState<Pertemuan | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getStatusStyle = (status: string): string => {
    switch (status) {
      case 'hadir':
        return 'border-green-300 bg-green-50 hover:border-green-400';
      case 'tidak-hadir':
        return 'border-red-300 bg-red-50 hover:border-red-400';
      case 'izin':
        return 'border-yellow-300 bg-yellow-50 hover:border-yellow-400';
      case 'sakit':
        return 'border-orange-300 bg-orange-50 hover:border-orange-400';
      default:
        return 'border-gray-200 bg-gray-50 hover:border-gray-300';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'hadir': return 'text-green-600';
      case 'tidak-hadir': return 'text-red-600';
      case 'izin': return 'text-yellow-600';
      case 'sakit': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBgColor = (status: string): string => {
    switch (status) {
      case 'hadir': return 'bg-green-50';
      case 'tidak-hadir': return 'bg-red-50';
      case 'izin': return 'bg-yellow-50';
      case 'sakit': return 'bg-orange-50';
      default: return 'bg-gray-50';
    }
  };

  const getStatusBadge = (status: string): string => {
    switch (status) {
      case 'hadir': return 'bg-green-100 text-green-700';
      case 'tidak-hadir': return 'bg-red-100 text-red-700';
      case 'izin': return 'bg-yellow-100 text-yellow-700';
      case 'sakit': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'hadir': return 'Hadir';
      case 'tidak-hadir': return 'Tidak Hadir';
      case 'izin': return 'Izin';
      case 'sakit': return 'Sakit';
      default: return 'Belum Dimulai';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const formatDateLong = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleExportPDF = () => {
    // Export logic
    window.open(`/api/mahasiswa/kehadiran/${mataKuliah.id}/export-pdf`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Kehadiran ${mataKuliah.nama}`,
        text: `Persentase kehadiran: ${stats.persentase}%`,
        url: window.location.href
      });
    }
  };

---

## 🎯 INOVASI SIGNIFIKAN

### 1. Smart Prediction System
- Prediksi apakah mahasiswa bisa mencapai 75% minimum
- Hitung berapa pertemuan lagi harus hadir
- Proyeksi persentase akhir semester
- Visual feedback dengan color coding

### 2. Interactive Timeline View
- Timeline visual dengan dot indicators
- Status icon per pertemuan (check/x/clock)
- Expandable content cards
- Smooth animations

### 3. Attendance Pattern Analysis
- Streak counter (current & longest)
- Kehadiran per mode (online vs offline)
- Kehadiran per hari (jika ada data)
- Visual progress bars

### 4. Smart Recommendations
- Context-aware recommendations
- Action-oriented suggestions
- Color-coded by priority
- Dynamic based on attendance status

### 5. Dual View Mode
- Timeline view: Visual chronological
- List view: Compact table format
- Toggle between views
- Responsive on all devices

### 6. Export & Print
- Export to PDF with custom template
- Export to Excel with charts
- Print-friendly CSS
- Include all statistics

### 7. Real-time Statistics
- Circular progress indicator
- Multiple progress bars
- Percentage calculations
- Status badges

### 8. Meeting Details
- Topik pertemuan
- Link meeting (online)
- Catatan kehadiran
- Waktu dan tanggal lengkap

---

## 📱 MOBILE RESPONSIVE

### Breakpoints
```css
/* Mobile First */
.stats-grid {
  grid-template-columns: repeat(2, 1fr); /* Mobile: 2 cols */
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(5, 1fr); /* Desktop: 5 cols */
  }
}

/* Timeline adjustments */
@media (max-width: 768px) {
  .timeline-dot {
    width: 48px;
    height: 48px;
  }
  
  .timeline-content {
    font-size: 0.875rem;
  }
}
```

### Touch Optimizations
- Larger tap targets (min 44x44px)
- Swipe gestures for view toggle
- Pull-to-refresh support
- Smooth scroll behavior

---

## ✅ CHECKLIST PENGEMBANGAN (50+ Items)

### Phase 1: Setup & Structure (8 items)
- [ ] Create route `/mahasiswa/akademik/kehadiran/:id`
- [ ] Setup page component with TypeScript
- [ ] Implement header with back button
- [ ] Add BookOpen icon (NO container)
- [ ] Setup color palette
- [ ] Configure responsive breakpoints
- [ ] Create data structures
- [ ] Setup state management

### Phase 2: Statistics Section (8 items)
- [ ] Create 5 statistics cards
- [ ] Implement total pertemuan counter
- [ ] Add hadir counter with green color
- [ ] Add tidak hadir counter with red color
- [ ] Calculate persentase kehadiran
- [ ] Add status indicator (Memenuhi/Tidak)
- [ ] Make responsive (2 cols mobile, 5 cols desktop)
- [ ] Add icon containers with matching colors

### Phase 3: Progress & Prediction (10 items)
- [ ] Create circular progress SVG
- [ ] Implement progress calculation
- [ ] Add progress bars (hadir/tidak hadir)
- [ ] Calculate remaining meetings
- [ ] Implement 75% prediction logic
- [ ] Calculate required attendance
- [ ] Add success/warning alerts
- [ ] Show projected percentage
- [ ] Add visual prediction bar
- [ ] Handle edge cases (can't achieve 75%)

### Phase 4: Timeline View (10 items)
- [ ] Create timeline layout with vertical line
- [ ] Implement timeline dots with status colors
- [ ] Add status icons (check/x/clock)
- [ ] Create content cards per meeting
- [ ] Display meeting number, topik, tanggal
- [ ] Add mode badges (online/offline)
- [ ] Show link meeting for online
- [ ] Add catatan field
- [ ] Implement smooth animations
- [ ] Make responsive on mobile

### Phase 5: List View (6 items)
- [ ] Create list layout
- [ ] Add status icons
- [ ] Display meeting info in compact format
- [ ] Add mode badges
- [ ] Implement hover effects
- [ ] Make responsive

### Phase 6: Pattern Analysis (8 items)
- [ ] Calculate current streak
- [ ] Calculate longest streak
- [ ] Add flame icon for streak
- [ ] Calculate online attendance percentage
- [ ] Calculate offline attendance percentage
- [ ] Create progress bars for mode analysis
- [ ] Add visual indicators
- [ ] Display statistics cards

### Phase 7: Recommendations (6 items)
- [ ] Generate context-aware recommendations
- [ ] Add success recommendations (>80%)
- [ ] Add warning recommendations (<75%)
- [ ] Add info recommendations (targets)
- [ ] Color-code by type
- [ ] Add action buttons

### Phase 8: Export & Print (6 items)
- [ ] Implement export to PDF
- [ ] Implement export to Excel
- [ ] Add print functionality
- [ ] Create print-friendly CSS
- [ ] Add download buttons
- [ ] Handle export errors

### Phase 9: View Toggle (4 items)
- [ ] Create view mode state
- [ ] Add toggle buttons
- [ ] Implement timeline view
- [ ] Implement list view

### Phase 10: Testing & Polish (10 items)
- [ ] Test with SKS 2 (14 meetings)
- [ ] Test with SKS 3 (21 meetings)
- [ ] Test prediction accuracy
- [ ] Test streak calculation
- [ ] Test responsive design
- [ ] Test export functionality
- [ ] Test print layout
- [ ] Verify color consistency
- [ ] Check accessibility
- [ ] Performance optimization



  return (
    <>
      <Head title={`Detail Kehadiran - ${mataKuliah.nama}`} />
      
      {/* Header Section */}
      {/* ... (implement as shown in structure above) */}
      
      {/* Statistics Overview */}
      {/* ... (implement as shown in structure above) */}
      
      {/* View Mode Toggle */}
      {/* ... (implement as shown in structure above) */}
      
      {/* Content based on view mode */}
      {viewMode === 'grid' && (
        /* Grid View */
      )}
      
      {viewMode === 'timeline' && (
        /* Timeline View */
      )}
      
      {viewMode === 'calendar' && (
        /* Calendar View */
      )}
      
      {/* Meeting Detail Modal */}
      {selectedPertemuan && (
        <MeetingDetailModal
          pertemuan={selectedPertemuan}
          mataKuliah={mataKuliah}
          onClose={() => setSelectedPertemuan(null)}
        />
      )}
    </>
  );
}
```

---

## 🎯 INOVASI SIGNIFIKAN

### 1. Multiple View Modes
- **Grid View**: Visual checklist dengan card per pertemuan
- **Timeline View**: Chronological timeline dengan detail
- **Calendar View**: Monthly calendar dengan color-coded status

### 2. Enhanced Statistics
- Total pertemuan, hadir, tidak hadir, izin/sakit
- Persentase kehadiran dengan progress bar
- Warning alert jika di bawah 75%
- Prediksi kehadiran yang dibutuhkan

### 3. Rich Meeting Details
- Complete meeting information
- Online meeting links dengan copy button
- Materi pertemuan
- Catatan kehadiran
- File attachments
- Waktu absen dan durasi

### 4. Interactive Timeline
- Visual timeline dengan connecting lines
- Status icons dan badges
- Clickable items untuk detail
- Hover effects

### 5. Calendar Integration
- Monthly calendar view
- Color-coded attendance status
- Navigate between months
- Click on date untuk detail

### 6. Export & Share
- Export to PDF
- Print-friendly layout
- Share via native share API
- Copy meeting links

### 7. Smart Status Indicators
- 5 status types: Hadir, Tidak Hadir, Izin, Sakit, Belum Dimulai
- Color-coded throughout UI
- Consistent iconography
- Clear visual feedback

### 8. Responsive Design
- Mobile-optimized layouts
- Touch-friendly interactions
- Adaptive grid columns
- Smooth transitions

---

## 📱 MOBILE RESPONSIVE

### Breakpoints
```typescript
const breakpoints = {
  sm: '640px',   // 2 cols grid
  md: '768px',   // 4 cols grid
  lg: '1024px',  // 7 cols grid
};
```

### Mobile Optimizations
1. **Header**: Stack vertically, hide some info
2. **Statistics**: 2 cols on mobile, 5 cols on desktop
3. **Grid View**: 2 cols mobile, 7 cols desktop
4. **Timeline**: Full width, compact spacing
5. **Calendar**: Smaller cells, touch-friendly
6. **Modal**: Full screen on mobile

---

## ✅ CHECKLIST PENGEMBANGAN (50+ Items)

### Phase 1: Setup & Structure (8 items)
- [ ] Create route `/mahasiswa/akademik/kehadiran/:mataKuliahId`
- [ ] Setup page component with TypeScript interfaces
- [ ] Implement header with back button
- [ ] Add BookOpen icon (NO container)
- [ ] Display course information
- [ ] Add action buttons (export, print, share)
- [ ] Setup state management
- [ ] Configure responsive layout

### Phase 2: Statistics Section (6 items)
- [ ] Create 5 statistics cards
- [ ] Implement progress bar with animation
- [ ] Add warning alert for <75%
- [ ] Calculate required attendance
- [ ] Add icon containers with matching colors
- [ ] Make responsive (2 cols mobile, 5 cols desktop)

### Phase 3: View Mode Toggle (4 items)
- [ ] Create view mode buttons (Grid, Timeline, Calendar)
- [ ] Implement view mode state
- [ ] Add active state styling
- [ ] Add smooth transitions

### Phase 4: Grid View (8 items)
- [ ] Create responsive grid layout
- [ ] Implement meeting cards
- [ ] Add status icons and colors
- [ ] Add mode badges (online/offline)
- [ ] Implement hover tooltips
- [ ] Add click handler for modal
- [ ] Style based on status
- [ ] Add smooth animations

### Phase 5: Timeline View (8 items)
- [ ] Create timeline layout
- [ ] Add connecting lines
- [ ] Implement timeline items
- [ ] Add status icons
- [ ] Display meeting info
- [ ] Add badges and labels
- [ ] Implement click handler
- [ ] Add hover effects

### Phase 6: Calendar View (8 items)
- [ ] Create calendar grid
- [ ] Generate calendar days
- [ ] Add day headers
- [ ] Implement month navigation
- [ ] Color-code meeting status
- [ ] Highlight today
- [ ] Add click handler
- [ ] Make responsive

### Phase 7: Meeting Detail Modal (10 items)
- [ ] Create enhanced modal component
- [ ] Add modal header with close button
- [ ] Display status card with icon
- [ ] Show meeting info grid
- [ ] Add online meeting link with copy
- [ ] Display materi/topik
- [ ] Show catatan
- [ ] List attachments with download
- [ ] Make modal scrollable
- [ ] Add close on backdrop click

### Phase 8: Export & Share (5 items)
- [ ] Implement export to PDF
- [ ] Implement print functionality
- [ ] Add native share API
- [ ] Add copy link functionality
- [ ] Handle errors gracefully

### Phase 9: Helper Functions (8 items)
- [ ] Implement getStatusStyle
- [ ] Implement getStatusColor
- [ ] Implement getStatusBgColor
- [ ] Implement getStatusBadge
- [ ] Implement getStatusLabel
- [ ] Implement formatDate
- [ ] Implement formatDateLong
- [ ] Implement getMeetingByDate

### Phase 10: Testing & Polish (10 items)
- [ ] Test all view modes
- [ ] Test modal interactions
- [ ] Test export/print/share
- [ ] Verify responsive design
- [ ] Check color consistency
- [ ] Test on mobile devices
- [ ] Validate data accuracy
- [ ] Performance optimization
- [ ] Add loading states
- [ ] Cross-browser testing


---

## 🔧 BACKEND REQUIREMENTS

### API Endpoint
```php
// GET /api/mahasiswa/kehadiran/{mataKuliahId}
public function show(Request $request, $mataKuliahId)
{
    $mahasiswaId = auth()->id();
    
    // Get mata kuliah
    $mataKuliah = MataKuliah::with('dosen')
        ->whereHas('enrollments', function($q) use ($mahasiswaId) {
            $q->where('mahasiswa_id', $mahasiswaId);
        })
        ->findOrFail($mataKuliahId);
    
    // Get all meetings with attendance
    $pertemuanList = Pertemuan::where('mata_kuliah_id', $mataKuliahId)
        ->with(['kehadiran' => function($q) use ($mahasiswaId) {
            $q->where('mahasiswa_id', $mahasiswaId);
        }])
        ->orderBy('nomor_pertemuan')
        ->get()
        ->map(function($pertemuan) use ($mahasiswaId, $mataKuliah) {
            $kehadiran = $pertemuan->kehadiran->first();
            
            return [
                'id' => $pertemuan->id,
                'nomorPertemuan' => $pertemuan->nomor_pertemuan,
                'tanggal' => $pertemuan->tanggal->format('d M Y'),
                'waktu' => $pertemuan->waktu,
                'mode' => $this->calculateMeetingMode(
                    $pertemuan->nomor_pertemuan,
                    $mataKuliah->sks,
                    $mataKuliah->periode,
                    $this->isBeforeUTS()
                ),
                'status' => $this->getAttendanceStatus($pertemuan, $kehadiran),
                'topik' => $pertemuan->topik,
                'catatan' => $kehadiran?->catatan,
                'linkMeeting' => $pertemuan->link_meeting,
            ];
        });
    
    return Inertia::render('Mahasiswa/Kehadiran/Detail', [
        'mataKuliah' => $mataKuliah,
        'pertemuanList' => $pertemuanList,
        'isBeforeUTS' => $this->isBeforeUTS(),
    ]);
}
```

### Export PDF Endpoint
```php
// GET /api/mahasiswa/kehadiran/{mataKuliahId}/export-pdf
public function exportPDF($mataKuliahId)
{
    $mahasiswaId = auth()->id();
    
    // Get data
    $mataKuliah = MataKuliah::findOrFail($mataKuliahId);
    $pertemuanList = $this->getPertemuanList($mataKuliahId, $mahasiswaId);
    $stats = $this->calculateStats($pertemuanList, $mataKuliah->sks);
    
    // Generate PDF
    $pdf = PDF::loadView('exports.kehadiran-detail', [
        'mataKuliah' => $mataKuliah,
        'pertemuanList' => $pertemuanList,
        'stats' => $stats,
        'mahasiswa' => auth()->user(),
    ]);
    
    return $pdf->download("kehadiran-{$mataKuliah->kode}.pdf");
}
```

### Export Excel Endpoint
```php
// GET /api/mahasiswa/kehadiran/{mataKuliahId}/export-excel
public function exportExcel($mataKuliahId)
{
    return Excel::download(
        new KehadiranExport($mataKuliahId, auth()->id()),
        "kehadiran-{$mataKuliahId}.xlsx"
    );
}
```

---

## 🎨 PRINT STYLES

### Print CSS
```css
@media print {
  /* Hide non-essential elements */
  .no-print,
  button,
  .back-button,
  .action-buttons {
    display: none !important;
  }
  
  /* Optimize layout */
  body {
    font-size: 12pt;
    line-height: 1.5;
  }
  
  .page-break {
    page-break-after: always;
  }
  
  /* Ensure colors print */
  .bg-green-50,
  .bg-red-50,
  .text-green-600,
  .text-red-600 {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  /* Timeline adjustments */
  .timeline-dot {
    border: 2px solid #000;
  }
  
  /* Card borders */
  .border {
    border: 1px solid #000 !important;
  }
}
```

---

## 🔐 SECURITY & VALIDATION

### Authorization
```php
// Ensure student can only view their own course attendance
Gate::define('view-kehadiran-detail', function ($user, $mataKuliahId) {
    return $user->enrollments()
        ->where('mata_kuliah_id', $mataKuliahId)
        ->exists();
});

// In controller
$this->authorize('view-kehadiran-detail', $mataKuliahId);
```

### Input Validation
```typescript
// Validate mata kuliah ID
const validateMataKuliahId = (id: string): boolean => {
  return /^[a-zA-Z0-9-]+$/.test(id);
};

// Validate view mode
const validateViewMode = (mode: string): mode is 'timeline' | 'list' => {
  return mode === 'timeline' || mode === 'list';
};
```

---

## 📊 TESTING SCENARIOS

### Unit Tests
```typescript
describe('Prediction Logic', () => {
  test('should predict can achieve 75%', () => {
    const stats = { hadir: 10, totalPertemuan: 21 };
    const completed = 12;
    const prediction = calculatePrediction(stats, completed);
    
    expect(prediction.canAchieve75).toBe(true);
    expect(prediction.requiredAttendance).toBe(6);
  });
  
  test('should predict cannot achieve 75%', () => {
    const stats = { hadir: 5, totalPertemuan: 21 };
    const completed = 18;
    const prediction = calculatePrediction(stats, completed);
    
    expect(prediction.canAchieve75).toBe(false);
  });
});

describe('Streak Calculation', () => {
  test('should calculate current streak', () => {
    const meetings = [
      { status: 'hadir' },
      { status: 'hadir' },
      { status: 'hadir' },
    ];
    const streak = calculateStreak(meetings);
    
    expect(streak.currentStreak).toBe(3);
  });
  
  test('should reset streak on absence', () => {
    const meetings = [
      { status: 'hadir' },
      { status: 'tidak-hadir' },
      { status: 'hadir' },
    ];
    const streak = calculateStreak(meetings);
    
    expect(streak.currentStreak).toBe(1);
  });
});
```

### Integration Tests
```typescript
describe('Detail Kehadiran Page', () => {
  test('should render statistics correctly', () => {
    render(<DetailKehadiranMataKuliah {...props} />);
    
    expect(screen.getByText('21')).toBeInTheDocument(); // Total
    expect(screen.getByText('15')).toBeInTheDocument(); // Hadir
    expect(screen.getByText('71%')).toBeInTheDocument(); // Persentase
  });
  
  test('should toggle between timeline and list view', () => {
    render(<DetailKehadiranMataKuliah {...props} />);
    
    const listButton = screen.getByText('List');
    fireEvent.click(listButton);
    
    expect(screen.getByTestId('list-view')).toBeInTheDocument();
  });
});
```


---

## 🔧 BACKEND REQUIREMENTS

### API Endpoint

#### GET /api/mahasiswa/kehadiran/:mataKuliahId
```typescript
// Response
{
  mataKuliah: {
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
  };
  pertemuanList: Array<{
    id: string;
    nomorPertemuan: number;
    tanggal: string;
    waktu: string;
    mode: 'online' | 'offline';
    status: 'hadir' | 'tidak-hadir' | 'izin' | 'sakit' | 'belum-dimulai';
    topik?: string;
    materi?: string;
    catatan?: string;
    linkMeeting?: string;
    waktuAbsen?: string;
    durasi?: string;
    attachments?: Array<{
      name: string;
      url: string;
      size: string;
    }>;
  }>;
  stats: {
    totalPertemuan: number;
    hadir: number;
    tidakHadir: number;
    izinSakit: number;
    persentase: number;
  };
}
```

### Controller Logic (Laravel)
```php
<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DetailKehadiranController extends Controller
{
    public function show(Request $request, $mataKuliahId)
    {
        $mahasiswaId = auth()->id();
        
        // Get course details
        $mataKuliah = MataKuliah::with('dosen')
            ->findOrFail($mataKuliahId);
        
        // Verify enrollment
        $enrollment = Enrollment::where('mahasiswa_id', $mahasiswaId)
            ->where('mata_kuliah_id', $mataKuliahId)
            ->firstOrFail();
        
        // Get all meetings with attendance
        $pertemuanList = Pertemuan::where('mata_kuliah_id', $mataKuliahId)
            ->with(['kehadiran' => function($q) use ($mahasiswaId) {
                $q->where('mahasiswa_id', $mahasiswaId);
            }, 'attachments'])
            ->orderBy('nomor_pertemuan')
            ->get()
            ->map(function($pertemuan) use ($mahasiswaId) {
                $kehadiran = $pertemuan->kehadiran->first();
                
                return [
                    'id' => $pertemuan->id,
                    'nomorPertemuan' => $pertemuan->nomor_pertemuan,
                    'tanggal' => $pertemuan->tanggal->format('Y-m-d'),
                    'waktu' => $pertemuan->waktu,
                    'mode' => $pertemuan->mode,
                    'status' => $this->getAttendanceStatus($pertemuan, $kehadiran),
                    'topik' => $pertemuan->topik,
                    'materi' => $pertemuan->materi,
                    'catatan' => $kehadiran?->catatan,
                    'linkMeeting' => $pertemuan->link_meeting,
                    'waktuAbsen' => $kehadiran?->waktu_absen?->format('H:i'),
                    'durasi' => $pertemuan->durasi,
                    'attachments' => $pertemuan->attachments->map(function($file) {
                        return [
                            'name' => $file->name,
                            'url' => $file->url,
                            'size' => $this->formatFileSize($file->size),
                        ];
                    }),
                ];
            });
        
        // Calculate statistics
        $totalPertemuan = $mataKuliah->sks === 3 ? 21 : 14;
        $hadir = $pertemuanList->where('status', 'hadir')->count();
        $tidakHadir = $pertemuanList->where('status', 'tidak-hadir')->count();
        $izinSakit = $pertemuanList->whereIn('status', ['izin', 'sakit'])->count();
        $persentase = $totalPertemuan > 0 
            ? round(($hadir / $totalPertemuan) * 100, 1)
            : 0;
        
        $stats = [
            'totalPertemuan' => $totalPertemuan,
            'hadir' => $hadir,
            'tidakHadir' => $tidakHadir,
            'izinSakit' => $izinSakit,
            'persentase' => $persentase,
        ];
        
        return Inertia::render('Mahasiswa/Kehadiran/Detail', [
            'mataKuliah' => $mataKuliah,
            'pertemuanList' => $pertemuanList,
            'stats' => $stats,
        ]);
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
    
    private function formatFileSize($bytes)
    {
        if ($bytes >= 1048576) {
            return round($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return round($bytes / 1024, 2) . ' KB';
        }
        return $bytes . ' B';
    }
    
    public function exportPDF($mataKuliahId)
    {
        // PDF export logic
        $mahasiswaId = auth()->id();
        
        // Get data
        $mataKuliah = MataKuliah::findOrFail($mataKuliahId);
        $pertemuanList = /* ... get attendance data ... */;
        
        // Generate PDF
        $pdf = PDF::loadView('pdf.kehadiran-detail', [
            'mataKuliah' => $mataKuliah,
            'pertemuanList' => $pertemuanList,
        ]);
        
        return $pdf->download("kehadiran-{$mataKuliah->kode}.pdf");
    }
}
```

---

## 🎨 STYLING GUIDELINES

### NO Container on Header Icon
```tsx
// ✅ CORRECT
<BookOpen className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
```

### NO Floating Animations
```tsx
// ✅ CORRECT - Only smooth transitions
<div className="transition-all duration-200 hover:scale-105">
  {/* Content */}
</div>
```

### Consistent Icon Colors
```tsx
// Icon color matches container
<div className="p-3 bg-green-50 rounded-full">
  <CheckCircle className="w-6 h-6 text-green-600" />
</div>
```

### Typography Consistency
```tsx
// Use consistent font weights and sizes
<h1 className="text-2xl md:text-3xl font-bold text-gray-900">
<h3 className="text-lg font-semibold text-gray-800">
<p className="text-sm text-gray-600">
```

---

## 📊 ADDITIONAL FEATURES

### 1. Attendance Prediction
```typescript
function predictFinalAttendance(
  currentAttendance: number,
  totalMeetings: number,
  completedMeetings: number
): number {
  const remainingMeetings = totalMeetings - completedMeetings;
  const maxPossible = currentAttendance + remainingMeetings;
  return Math.round((maxPossible / totalMeetings) * 100);
}
```

### 2. Attendance Comparison
```typescript
// Compare with class average
interface ClassComparison {
  studentPercentage: number;
  classAverage: number;
  rank: number;
  totalStudents: number;
}
```

### 3. Meeting Reminders
```typescript
// Get upcoming meetings
function getUpcomingMeetings(pertemuanList: Pertemuan[]): Pertemuan[] {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  return pertemuanList.filter(p => {
    const meetingDate = new Date(p.tanggal);
    return meetingDate >= today && meetingDate <= nextWeek;
  });
}
```

### 4. Attendance Streak
```typescript
// Calculate attendance streak
function calculateStreak(pertemuanList: Pertemuan[]): {
  current: number;
  longest: number;
} {
  let current = 0;
  let longest = 0;
  let temp = 0;
  
  const completed = pertemuanList.filter(p => 
    p.status !== 'belum-dimulai'
  ).reverse();
  
  for (const meeting of completed) {
    if (meeting.status === 'hadir') {
      temp++;
      if (current === temp - 1) current = temp;
      longest = Math.max(longest, temp);
    } else {
      temp = 0;
    }
  }
  
  return { current, longest };
}
```


---

## 🎯 EDGE CASES & ERROR HANDLING

### Edge Cases

1. **No Meetings Yet**
```tsx
{pertemuanList.length === 0 && (
  <div className="text-center py-12">
    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <p className="text-gray-600">Belum ada pertemuan untuk mata kuliah ini</p>
  </div>
)}
```

2. **All Meetings Completed**
```tsx
{prediction.remainingMeetings === 0 && (
  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <p className="text-sm text-blue-800">
      Semua pertemuan telah selesai. Persentase akhir: {stats.persentase}%
    </p>
  </div>
)}
```

3. **Perfect Attendance**
```tsx
{stats.persentase === 100 && (
  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
    <div className="flex items-center gap-2">
      <Trophy className="w-5 h-5 text-green-600" />
      <p className="text-sm font-semibold text-green-800">
        Kehadiran Sempurna! 🎉
      </p>
    </div>
  </div>
)}
```

4. **Zero Attendance**
```tsx
{stats.hadir === 0 && stats.tidakHadir > 0 && (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
    <div className="flex items-center gap-2">
      <AlertTriangle className="w-5 h-5 text-red-600" />
      <p className="text-sm font-semibold text-red-800">
        Anda belum pernah hadir. Segera hubungi dosen!
      </p>
    </div>
  </div>
)}
```

### Error Handling

```typescript
// Handle fetch errors
try {
  const response = await fetch(`/api/mahasiswa/kehadiran/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  const data = await response.json();
} catch (error) {
  console.error('Error:', error);
  toast.error('Gagal memuat detail kehadiran');
  router.visit('/mahasiswa/akademik/kehadiran');
}

// Handle export errors
const handleExportPDF = async () => {
  try {
    setExporting(true);
    const response = await fetch(`/api/mahasiswa/kehadiran/${id}/export-pdf`);
    if (!response.ok) throw new Error('Export failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kehadiran-${mataKuliah.kode}.pdf`;
    a.click();
    
    toast.success('PDF berhasil diunduh');
  } catch (error) {
    console.error('Export error:', error);
    toast.error('Gagal export PDF');
  } finally {
    setExporting(false);
  }
};
```

---

## 💡 ADDITIONAL FEATURES (Future)

### 1. Attendance Comparison
Compare with class average:
```tsx
<div className="bg-white rounded-lg border border-gray-200 p-6">
  <h3 className="text-lg font-semibold mb-4">Perbandingan Kelas</h3>
  <div className="space-y-3">
    <div className="flex justify-between">
      <span>Kehadiran Anda</span>
      <span className="font-bold">{stats.persentase}%</span>
    </div>
    <div className="flex justify-between">
      <span>Rata-rata Kelas</span>
      <span className="font-bold">{classAverage}%</span>
    </div>
    <div className={`text-sm ${
      stats.persentase > classAverage ? 'text-green-600' : 'text-red-600'
    }`}>
      {stats.persentase > classAverage ? '↑' : '↓'} 
      {Math.abs(stats.persentase - classAverage)}% dari rata-rata
    </div>
  </div>
</div>
```

### 2. Calendar Integration
Add to Google Calendar:
```typescript
const addToCalendar = (pertemuan: Pertemuan) => {
  const event = {
    title: `${mataKuliah.nama} - Pertemuan ${pertemuan.nomorPertemuan}`,
    start: pertemuan.tanggal,
    duration: '2 hours',
    location: pertemuan.mode === 'online' ? pertemuan.linkMeeting : mataKuliah.ruangan,
  };
  
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}`;
  window.open(url, '_blank');
};
```

### 3. Attendance Notes
Add personal notes:
```tsx
<button
  onClick={() => setShowNoteModal(true)}
  className="text-sm text-blue-600 hover:text-blue-700"
>
  + Tambah Catatan
</button>
```

### 4. Share Report
Share via WhatsApp/Email:
```typescript
const shareReport = () => {
  const text = `Laporan Kehadiran ${mataKuliah.nama}\n` +
               `Persentase: ${stats.persentase}%\n` +
               `Hadir: ${stats.hadir}/${stats.totalPertemuan}`;
  
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(whatsappUrl, '_blank');
};
```

### 5. Attendance Alerts
Set reminders:
```tsx
<button className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg">
  <Bell className="w-4 h-4" />
  <span>Aktifkan Reminder</span>
</button>
```

---

## 🎓 BUSINESS RULES

### Attendance Status Rules
1. **Hadir**: Student attended (marked by system/dosen)
2. **Tidak Hadir**: Student did not attend
3. **Belum Dimulai**: Meeting hasn't occurred yet
4. **Izin**: Excused absence (with permission)
5. **Sakit**: Sick leave (with medical certificate)

### Minimum Attendance
- 75% attendance required to take final exam
- Calculated from total meetings (SKS 3 = 21, SKS 2 = 14)
- Includes all types of absence (tidak hadir, izin, sakit)

### Prediction Rules
- Based on remaining meetings
- Assumes best case (attend all remaining)
- Shows realistic target
- Updates in real-time

---

## 📚 DOCUMENTATION

### Component Props
```typescript
/**
 * DetailKehadiranMataKuliah Component
 * 
 * Displays detailed attendance information for a specific course.
 * Includes statistics, timeline, predictions, and pattern analysis.
 * 
 * @param {MataKuliah} mataKuliah - Course information
 * @param {Pertemuan[]} pertemuanList - List of all meetings with attendance
 * @param {boolean} isBeforeUTS - Whether current date is before UTS
 * 
 * @example
 * <DetailKehadiranMataKuliah
 *   mataKuliah={course}
 *   pertemuanList={meetings}
 *   isBeforeUTS={true}
 * />
 */
```

### Function Documentation
```typescript
/**
 * Calculate attendance prediction
 * 
 * @param {Object} stats - Current attendance statistics
 * @param {number} completedMeetings - Number of completed meetings
 * @returns {Object} Prediction data including canAchieve75, requiredAttendance
 */
function calculatePrediction(stats, completedMeetings) {
  // Implementation
}

/**
 * Calculate attendance streak
 * 
 * @param {Pertemuan[]} meetings - List of meetings
 * @returns {Object} Streak data including current and longest
 */
function calculateStreak(meetings) {
  // Implementation
}
```


---

## 🎯 SUMMARY

### Key Features Implemented
1. ✅ Comprehensive statistics overview (5 cards)
2. ✅ Circular progress indicator with percentage
3. ✅ Smart prediction system (can achieve 75%?)
4. ✅ Interactive timeline view with status dots
5. ✅ Compact list view alternative
6. ✅ Attendance pattern analysis (streak, mode)
7. ✅ Context-aware recommendations
8. ✅ Export to PDF and Excel
9. ✅ Print-friendly layout
10. ✅ Mobile-responsive design

### Design Principles Followed
1. ✅ Match dashboard design 100%
2. ✅ NO container on header icon
3. ✅ NO floating animations
4. ✅ Icon colors match container colors
5. ✅ Consistent typography
6. ✅ Mobile-first responsive
7. ✅ Clean professional UI
8. ✅ Smooth transitions

### Technical Excellence
1. ✅ TypeScript for type safety
2. ✅ React hooks and useMemo
3. ✅ Complex calculations (prediction, streak)
4. ✅ Dual view modes (timeline/list)
5. ✅ Export functionality
6. ✅ Print optimization
7. ✅ Error handling
8. ✅ Accessibility support

### Innovation Highlights
1. 🚀 Smart prediction algorithm
2. 🚀 Visual timeline with status dots
3. 🚀 Attendance streak tracker
4. 🚀 Mode-based analysis (online/offline)
5. 🚀 Context-aware recommendations
6. 🚀 Dual view toggle
7. 🚀 Real-time statistics
8. 🚀 Export & print ready

---

## 📞 SUPPORT & MAINTENANCE

### Common Issues

**Issue 1: Prediction not accurate**
- Solution: Verify completed meetings count
- Check: `prediction.remainingMeetings` calculation

**Issue 2: Timeline not rendering**
- Solution: Check pertemuanList data structure
- Verify: Each meeting has required fields

**Issue 3: Export not working**
- Solution: Check API endpoint availability
- Verify: User has permission to export

**Issue 4: Streak calculation wrong**
- Solution: Verify meeting order (sort by nomorPertemuan)
- Check: Status filtering logic

### Maintenance Checklist
- [ ] Update statistics calculations
- [ ] Verify prediction accuracy
- [ ] Test export functionality
- [ ] Check print layout
- [ ] Monitor API performance
- [ ] Review error logs
- [ ] Update documentation
- [ ] Test on new devices

---

## 🎉 CONCLUSION

Prompt ini menyediakan panduan lengkap untuk mengembangkan halaman **Detail Kehadiran Mata Kuliah** dengan:

1. **Statistik Komprehensif**: 5 kartu statistik dengan visual indicators
2. **Prediksi Cerdas**: Algoritma prediksi apakah bisa mencapai 75% minimum
3. **Timeline Interaktif**: Visual timeline dengan status dots dan content cards
4. **Analisis Pola**: Streak counter, mode analysis, recommendations
5. **Dual View Mode**: Timeline dan list view dengan toggle
6. **Export & Print**: PDF, Excel, dan print-friendly layout
7. **Mobile-First**: Responsive di semua breakpoint
8. **Clean Code**: TypeScript, proper structure, comprehensive validation

Fitur ini memberikan mahasiswa insight mendalam tentang kehadiran mereka di satu mata kuliah, dengan prediksi yang membantu mereka merencanakan kehadiran di pertemuan mendatang untuk mencapai target minimum 75%.

**Selamat mengembangkan! 🚀**

---

## 🎯 EDGE CASES & ERROR HANDLING

### Edge Cases

1. **No Meetings Yet**
```tsx
{pertemuanList.length === 0 && (
  <div className="text-center py-12">
    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <p className="text-gray-600">Belum ada pertemuan untuk mata kuliah ini</p>
  </div>
)}
```

2. **All Meetings Completed**
```tsx
{allCompleted && (
  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <p className="text-sm text-blue-800">
      Semua pertemuan telah selesai. Persentase akhir: {stats.persentase}%
    </p>
  </div>
)}
```

3. **Perfect Attendance**
```tsx
{stats.persentase === 100 && (
  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
    <Award className="w-6 h-6 text-green-600" />
    <div>
      <p className="text-sm font-semibold text-green-800">Perfect Attendance!</p>
      <p className="text-xs text-green-700">Anda hadir di semua pertemuan</p>
    </div>
  </div>
)}
```

4. **Critical Attendance**
```tsx
{stats.persentase < 60 && (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
    <div className="flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-red-800">Kehadiran Kritis</p>
        <p className="text-xs text-red-700 mt-1">
          Kehadiran Anda sangat rendah. Segera hubungi dosen untuk konsultasi.
        </p>
      </div>
    </div>
  </div>
)}
```

### Error Handling

```typescript
// Handle API errors
try {
  const response = await fetch(`/api/mahasiswa/kehadiran/${mataKuliahId}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Mata kuliah tidak ditemukan');
    } else if (response.status === 403) {
      throw new Error('Anda tidak memiliki akses ke mata kuliah ini');
    }
    throw new Error('Gagal memuat data');
  }
  const data = await response.json();
  // Process data
} catch (error) {
  console.error('Error:', error);
  toast.error(error.message);
  router.visit('/mahasiswa/akademik/kehadiran');
}
```

---

## 📱 PRINT STYLES

### Print CSS
```css
@media print {
  /* Hide non-essential elements */
  .no-print {
    display: none !important;
  }
  
  /* Optimize layout for print */
  .print-container {
    max-width: 100%;
    padding: 0;
  }
  
  /* Ensure proper page breaks */
  .page-break {
    page-break-after: always;
  }
  
  /* Adjust colors for print */
  .bg-gradient-to-r {
    background: white !important;
    color: black !important;
  }
  
  /* Show all content */
  .overflow-hidden {
    overflow: visible !important;
  }
}
```

### Print Component
```tsx
<div className="print:hidden no-print">
  {/* Action buttons, filters, etc */}
</div>

<div className="print-container">
  {/* Printable content */}
</div>
```

---

## 🔐 SECURITY

### Authorization
```php
// Ensure student can only view their own attendance
Gate::define('view-detail-kehadiran', function ($user, $mataKuliahId) {
    return Enrollment::where('mahasiswa_id', $user->id)
        ->where('mata_kuliah_id', $mataKuliahId)
        ->exists();
});

// In controller
$this->authorize('view-detail-kehadiran', $mataKuliahId);
```

### Data Validation
```typescript
// Validate meeting data
function validateMeeting(pertemuan: Pertemuan): boolean {
  if (!pertemuan.id || !pertemuan.nomorPertemuan) return false;
  if (!pertemuan.tanggal || !pertemuan.waktu) return false;
  if (!['online', 'offline'].includes(pertemuan.mode)) return false;
  if (!['hadir', 'tidak-hadir', 'izin', 'sakit', 'belum-dimulai'].includes(pertemuan.status)) {
    return false;
  }
  return true;
}
```

---

## 🎓 BUSINESS RULES

### Attendance Rules
1. Minimum 75% attendance required for final exam
2. Izin and Sakit count as excused absences (still count toward total)
3. Late attendance (>15 minutes) may be marked as "Terlambat"
4. Attendance cannot be modified after 24 hours
5. Online meetings require link access verification

### Status Priority
1. **Hadir**: Student attended (highest priority)
2. **Izin**: Student has permission to be absent
3. **Sakit**: Student is sick (with medical certificate)
4. **Tidak Hadir**: Student did not attend (no excuse)
5. **Belum Dimulai**: Meeting hasn't occurred yet

---

## 📚 DOCUMENTATION

### Component Props
```typescript
/**
 * DetailKehadiranMataKuliah Component
 * 
 * Displays detailed attendance information for a specific course.
 * Includes multiple view modes (grid, timeline, calendar) and
 * comprehensive statistics.
 * 
 * @param {MataKuliah} mataKuliah - Course information
 * @param {Pertemuan[]} pertemuanList - List of all meetings
 * @param {Object} stats - Attendance statistics
 * 
 * @example
 * <DetailKehadiranMataKuliah
 *   mataKuliah={course}
 *   pertemuanList={meetings}
 *   stats={statistics}
 * />
 */
```

### Helper Functions
```typescript
/**
 * Get CSS classes for meeting status
 * 
 * @param {string} status - Meeting attendance status
 * @returns {string} CSS classes for styling
 */
function getStatusStyle(status: string): string;

/**
 * Format date to readable string
 * 
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date (e.g., "15 Nov")
 */
function formatDate(dateString: string): string;
```

---

## 🎉 SUMMARY

### Key Features Implemented
1. ✅ Comprehensive course attendance detail page
2. ✅ Multiple view modes (Grid, Timeline, Calendar)
3. ✅ Enhanced statistics with progress tracking
4. ✅ Rich meeting detail modal
5. ✅ Export to PDF and print functionality
6. ✅ Native share API integration
7. ✅ 5 attendance status types
8. ✅ Online meeting link management
9. ✅ File attachments support
10. ✅ Mobile-optimized responsive design

### Design Principles Followed
1. ✅ Match dashboard design 100%
2. ✅ NO container on header icon
3. ✅ NO floating animations
4. ✅ Icon colors match container colors
5. ✅ Consistent typography
6. ✅ Mobile-first responsive
7. ✅ Clean professional UI
8. ✅ Smooth transitions

### Technical Excellence
1. ✅ TypeScript for type safety
2. ✅ React hooks and state management
3. ✅ Multiple view mode implementation
4. ✅ Calendar generation logic
5. ✅ Comprehensive validation
6. ✅ Error handling
7. ✅ Print optimization
8. ✅ Security best practices

### Innovation Highlights
1. 🚀 3 different view modes
2. 🚀 Interactive timeline with visual connections
3. 🚀 Calendar view with color coding
4. 🚀 Enhanced meeting detail modal
5. 🚀 Copy meeting link functionality
6. 🚀 File attachments display
7. 🚀 Attendance prediction
8. 🚀 Warning alerts for low attendance

---

## 📞 SUPPORT

### Common Issues

**Issue 1: View mode not switching**
- Solution: Check viewMode state management
- Verify: Button onClick handlers

**Issue 2: Modal not showing**
- Solution: Check selectedPertemuan state
- Verify: Modal component rendering condition

**Issue 3: Calendar not displaying correctly**
- Solution: Verify calendar generation logic
- Check: Date calculations and grid layout

**Issue 4: Export/Print not working**
- Solution: Check API endpoint and permissions
- Verify: Print CSS styles

---

## 🎯 CONCLUSION

Prompt ini menyediakan panduan lengkap untuk mengembangkan halaman **Detail Kehadiran Mata Kuliah** dengan:

1. **Multiple View Modes**: Grid, Timeline, dan Calendar untuk fleksibilitas
2. **Rich Information**: Detail lengkap setiap pertemuan dengan attachments
3. **Enhanced Statistics**: Progress tracking dan warning system
4. **Export Capabilities**: PDF, Print, dan Share functionality
5. **Mobile-First Design**: Responsive di semua breakpoint
6. **Clean Code**: TypeScript, proper structure, comprehensive validation
7. **50+ Checklist Items**: Panduan implementasi yang detail

Halaman ini memberikan pengalaman yang sangat baik untuk mahasiswa dalam monitoring kehadiran mereka secara mendalam dengan berbagai cara visualisasi dan informasi yang lengkap.

**Selamat mengembangkan! 🚀**
