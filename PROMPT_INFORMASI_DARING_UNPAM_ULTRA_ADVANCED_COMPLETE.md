# PROMPT IMPLEMENTASI: INFORMASI DARING UNPAM - ULTRA ADVANCED COMPLETE

## 🎯 EXECUTIVE SUMMARY

Implementasi fitur "Informasi Daring UNPAM" untuk memberikan admin kemampuan mengelola informasi akses pembelajaran daring UNPAM yang bersumber dari web daring eksternal. Fitur ini BUKAN scheduling engine, melainkan sistem informasi read-only untuk mahasiswa dengan full CRUD untuk admin.

**Key Principles:**
- Admin-owned data management
- Student read-only access
- Integrated via Notification Center (NO new sidebar menu)
- Consistent UI/UX with existing admin pages
- Mobile-responsive design
- Security-first approach

---

## 📋 TECHNICAL SPECIFICATIONS

### 1. DATABASE SCHEMA

**Table: `admin_daring_infos`**

```sql
CREATE TABLE admin_daring_infos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    mata_kuliah_id BIGINT UNSIGNED NOT NULL,
    class_label VARCHAR(50) NULL COMMENT 'e.g., TI-6A, SI-4B',
    title VARCHAR(255) NOT NULL,
    platform_name VARCHAR(100) DEFAULT 'UNPAM Daring',
    portal_url TEXT NULL,
    forum_url TEXT NULL,
    access_instructions TEXT NULL,
    support_contact VARCHAR(255) NULL,
    valid_from DATETIME NULL,
    valid_until DATETIME NULL,
    is_published BOOLEAN DEFAULT FALSE,
    created_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    INDEX idx_mata_kuliah (mata_kuliah_id),
    INDEX idx_published (is_published),
    INDEX idx_validity (valid_from, valid_until),
    INDEX idx_created_by (created_by),
    
    FOREIGN KEY (mata_kuliah_id) REFERENCES mata_kuliah(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```


**Migration File Structure:**
- Timestamp: `YYYY_MM_DD_HHMMSS_create_admin_daring_infos_table.php`
- Use Laravel migration conventions
- Include proper indexes for performance
- Add foreign key constraints with CASCADE/SET NULL

---

### 2. MODEL IMPLEMENTATION

**File: `app/Models/AdminDaringInfo.php`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminDaringInfo extends Model
{
    protected $table = 'admin_daring_infos';

    protected $fillable = [
        'mata_kuliah_id',
        'class_label',
        'title',
        'platform_name',
        'portal_url',
        'forum_url',
        'access_instructions',
        'support_contact',
        'valid_from',
        'valid_until',
        'is_published',
        'created_by',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'valid_from' => 'datetime',
        'valid_until' => 'datetime',
    ];

    public function mataKuliah(): BelongsTo
    {
        return $this->belongsTo(MataKuliah::class, 'mata_kuliah_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeValid($query)
    {
        $now = now();
        return $query->where(function ($q) use ($now) {
            $q->whereNull('valid_from')
              ->orWhere('valid_from', '<=', $now);
        })->where(function ($q) use ($now) {
            $q->whereNull('valid_until')
              ->orWhere('valid_until', '>=', $now);
        });
    }

    public function isValid(): bool
    {
        $now = now();
        $validFrom = $this->valid_from === null || $this->valid_from <= $now;
        $validUntil = $this->valid_until === null || $this->valid_until >= $now;
        return $validFrom && $validUntil;
    }
}
```


---

### 3. CONTROLLER IMPLEMENTATION

**File: `app/Http/Controllers/Admin/DaringInfoController.php`**

**Key Methods:**
- `index()` - List with filters (search, status, validity)
- `store()` - Create new daring info
- `update($id)` - Update existing info
- `destroy($id)` - Delete info
- `publish($id)` - Toggle publish status

**Validation Rules:**
```php
'mata_kuliah_id' => 'required|exists:mata_kuliah,id',
'class_label' => 'nullable|string|max:50',
'title' => 'required|string|max:255',
'platform_name' => 'nullable|string|max:100',
'portal_url' => 'nullable|url|max:500',
'forum_url' => 'nullable|url|max:500',
'access_instructions' => 'nullable|string|max:5000',
'support_contact' => 'nullable|string|max:255',
'valid_from' => 'nullable|date',
'valid_until' => 'nullable|date|after:valid_from',
'is_published' => 'boolean',
```

**Security Measures:**
- Auth middleware: `auth:web`
- Admin authorization check
- URL sanitization (strip_tags, filter_var)
- XSS prevention
- SQL injection protection via Eloquent
- Rate limiting on write operations

**Response Format:**
```php
return Inertia::render('admin/notification-center-daring', [
    'daringInfos' => $daringInfos->paginate(15),
    'courses' => MataKuliah::with('dosen')->get(),
    'stats' => [
        'total' => AdminDaringInfo::count(),
        'published' => AdminDaringInfo::published()->count(),
        'valid' => AdminDaringInfo::published()->valid()->count(),
        'expired' => AdminDaringInfo::published()->where('valid_until', '<', now())->count(),
    ],
    'filters' => $request->only(['search', 'status', 'validity']),
]);
```


---

### 4. ROUTING CONFIGURATION

**File: `routes/web.php`**

Add inside `middleware(['auth:web,dosen'])` group:

```php
// Admin Daring Info (Informasi Daring UNPAM)
Route::get('admin/notification-center/daring', [\App\Http\Controllers\Admin\DaringInfoController::class, 'index'])
    ->name('admin.notification-center.daring');
Route::post('admin/notification-center/daring', [\App\Http\Controllers\Admin\DaringInfoController::class, 'store'])
    ->name('admin.notification-center.daring.store');
Route::patch('admin/notification-center/daring/{id}', [\App\Http\Controllers\Admin\DaringInfoController::class, 'update'])
    ->name('admin.notification-center.daring.update');
Route::delete('admin/notification-center/daring/{id}', [\App\Http\Controllers\Admin\DaringInfoController::class, 'destroy'])
    ->name('admin.notification-center.daring.destroy');
Route::patch('admin/notification-center/daring/{id}/publish', [\App\Http\Controllers\Admin\DaringInfoController::class, 'publish'])
    ->name('admin.notification-center.daring.publish');
```

**Route Naming Convention:**
- Prefix: `admin.notification-center.daring`
- RESTful pattern
- Consistent with existing admin routes


---

### 5. FRONTEND IMPLEMENTATION

**File: `resources/js/pages/admin/notification-center-daring.tsx`**

#### 5.1 UI/UX Design Principles

**Visual Consistency:**
- Match `notification-center.tsx` and `sesi-absen.tsx` styling
- Glassmorphism cards with backdrop-blur
- Gradient headers (indigo-purple-pink spectrum)
- Rounded-3xl containers
- Framer Motion animations (subtle, professional)
- Dark mode support

**Color Palette:**
```typescript
const colorScheme = {
  primary: 'from-indigo-600 via-purple-600 to-pink-500',
  cards: {
    total: { from: 'from-sky-400', to: 'to-indigo-600', icon: 'bg-sky-500' },
    published: { from: 'from-emerald-400', to: 'to-teal-600', icon: 'bg-emerald-500' },
    valid: { from: 'from-amber-400', to: 'to-orange-600', icon: 'bg-amber-500' },
    expired: { from: 'from-rose-400', to: 'to-pink-600', icon: 'bg-rose-500' },
  },
  status: {
    published: 'bg-emerald-500/20 text-emerald-600',
    draft: 'bg-slate-500/20 text-slate-600',
    expired: 'bg-rose-500/20 text-rose-600',
  }
};
```

**Header Design:**
```tsx
<motion.div className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl">
  {/* Animated Gradient Background */}
  <motion.div
    className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
    animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
    style={{ backgroundSize: '200% 200%' }}
  />
  
  {/* NO animated icon container - REMOVE floating animation */}
  {/* NO moving orbs in header */}
  
  <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
    <div className="flex items-center gap-5">
      {/* Static icon - NO animation */}
      <div className="relative flex h-20 w-20 shrink-0">
        <img src={daringIcon} alt="Daring UNPAM" className="h-full w-full object-contain drop-shadow-2xl" />
      </div>
      <div>
        <p className="text-sm text-blue-100 font-medium">Pembelajaran Online</p>
        <h1 className="text-3xl font-bold">Informasi Daring UNPAM</h1>
      </div>
    </div>
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-2 rounded-xl bg-white/20 px-6 py-3.5 text-sm font-semibold hover:bg-white/30 transition-colors backdrop-blur-xl border border-white/20 shadow-lg"
    >
      <Plus className="h-4 w-4" />
      Tambah Info Daring
    </motion.button>
  </div>
  
  <p className="relative mt-4 text-blue-100/80">
    Kelola informasi akses pembelajaran daring UNPAM untuk mahasiswa
  </p>
</motion.div>
```


#### 5.2 Stats Cards

**Design Pattern (Match Dashboard):**
```tsx
<motion.div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
  {[
    { title: 'Total Info', value: stats.total, icon: totalIcon, color: 'sky' },
    { title: 'Published', value: stats.published, icon: publishedIcon, color: 'emerald' },
    { title: 'Valid', value: stats.valid, icon: validIcon, color: 'amber' },
    { title: 'Expired', value: stats.expired, icon: expiredIcon, color: 'rose' },
  ].map((stat, i) => (
    <motion.div
      key={i}
      variants={cardVariants}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-4 sm:p-6 shadow-xl backdrop-blur-xl"
    >
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorConfig.gradientBg} opacity-50`} />
      
      {/* Icon + Value */}
      <div className="relative z-10 flex items-center gap-4">
        <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="relative h-14 w-14">
          <img src={stat.icon} alt={stat.title} className="h-full w-full object-contain drop-shadow-lg" />
        </motion.div>
        <div>
          <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{stat.title}</h3>
          <span className="text-3xl font-extrabold text-neutral-900 dark:text-white">{stat.value}</span>
        </div>
      </div>
    </motion.div>
  ))}
</motion.div>
```

**Icon Requirements:**
- Create custom icons or use existing admin icons
- Consistent style with notification-center icons
- PNG format, transparent background
- Size: 64x64px minimum


#### 5.3 Filter Section

```tsx
<motion.div className="rounded-3xl border border-white/20 bg-white/50 p-5 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50">
  <div className="flex items-center gap-3 mb-4">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
      <Filter className="h-5 w-5" />
    </div>
    <h2 className="font-bold text-neutral-900 dark:text-white text-lg">Filter Informasi</h2>
  </div>
  
  <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
    {/* Search Input */}
    <div className="relative flex-1 min-w-[200px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
      <Input
        placeholder="Cari judul atau mata kuliah..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="pl-10 bg-white/60 dark:bg-neutral-800"
      />
    </div>
    
    {/* Status Filter */}
    <Select value={statusFilter} onValueChange={setStatusFilter}>
      <SelectTrigger className="w-full sm:w-[180px]">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Semua Status</SelectItem>
        <SelectItem value="published">Published</SelectItem>
        <SelectItem value="draft">Draft</SelectItem>
      </SelectContent>
    </Select>
    
    {/* Validity Filter */}
    <Select value={validityFilter} onValueChange={setValidityFilter}>
      <SelectTrigger className="w-full sm:w-[180px]">
        <SelectValue placeholder="Validitas" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Semua</SelectItem>
        <SelectItem value="valid">Aktif</SelectItem>
        <SelectItem value="expired">Kedaluwarsa</SelectItem>
      </SelectContent>
    </Select>
    
    {/* Apply Filter Button */}
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleFilter}
      className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg"
    >
      <Filter className="h-4 w-4" />
      Filter
    </motion.button>
  </div>
</motion.div>
```


#### 5.4 Data Table/List

```tsx
<motion.div variants={itemVariants}>
  <div className="flex items-center gap-3 mb-5">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg">
      <BookOpen className="h-5 w-5" />
    </div>
    <div>
      <h2 className="font-bold text-neutral-900 dark:text-white text-lg">Daftar Informasi Daring</h2>
      <p className="text-xs text-neutral-500">{daringInfos.data.length} informasi ditemukan</p>
    </div>
  </div>

  <div className="space-y-4">
    <AnimatePresence>
      {daringInfos.data.map((info, index) => (
        <motion.div
          key={info.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ delay: index * 0.04 }}
          whileHover={{ y: -4 }}
          className="group relative overflow-hidden rounded-2xl border-l-4 border-l-indigo-500 bg-white/60 shadow-md backdrop-blur-xl transition-all hover:shadow-xl dark:bg-neutral-900/60"
        >
          <div className="p-5">
            <div className="flex items-start gap-4">
              {/* Course Icon */}
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                  <Globe className="h-6 w-6 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Title Row */}
                <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                  <h3 className="font-bold text-[15px] text-neutral-900 dark:text-white">
                    {info.title}
                  </h3>
                  {info.is_published ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/20">
                      Published
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/15 text-slate-600">
                      Draft
                    </span>
                  )}
                  {info.valid_until && new Date(info.valid_until) < new Date() && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/15 text-rose-600 ring-1 ring-rose-500/20">
                      Expired
                    </span>
                  )}
                </div>

                {/* Course Info */}
                <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-2">
                  {info.mata_kuliah.nama} {info.class_label && `• ${info.class_label}`}
                </p>

                {/* Access Instructions Preview */}
                {info.access_instructions && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-3">
                    {info.access_instructions}
                  </p>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-neutral-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {info.valid_from ? new Date(info.valid_from).toLocaleDateString('id-ID') : 'Tidak terbatas'}
                  </span>
                  {info.platform_name && (
                    <span className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" />
                      {info.platform_name}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEdit(info)}
                  className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 hover:bg-blue-100"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleTogglePublish(info.id)}
                  className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 hover:bg-emerald-100"
                  title={info.is_published ? 'Unpublish' : 'Publish'}
                >
                  {info.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(info.id)}
                  className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100"
                  title="Hapus"
                >
                  <Trash2 className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>

    {/* Empty State */}
    {daringInfos.data.length === 0 && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl p-16 text-center"
      >
        <div className="flex h-24 w-24 mx-auto items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-2 border-dashed border-blue-200 dark:border-blue-800 mb-6">
          <Globe className="h-12 w-12 text-blue-400/50" />
        </div>
        <p className="text-neutral-800 dark:text-neutral-300 font-bold text-lg mb-1">Belum ada informasi daring</p>
        <p className="text-neutral-500 text-sm max-w-xs mx-auto">Tambahkan informasi akses pembelajaran daring untuk mahasiswa</p>
      </motion.div>
    )}
  </div>
</motion.div>
```


#### 5.5 Create/Edit Modal

```tsx
<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
  <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-3xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-2xl max-h-[90vh] flex flex-col">
    {/* Animated Gradient Header */}
    <div className="relative overflow-hidden p-6 text-white">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: '200% 200%' }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />
      
      <div className="relative flex items-center gap-4">
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl"
        >
          <Globe className="h-7 w-7 text-white" />
        </motion.div>
        <div>
          <h2 className="text-xl font-bold text-white">
            {editMode ? 'Edit Informasi Daring' : 'Tambah Informasi Daring'}
          </h2>
          <p className="text-sm text-indigo-100">Kelola akses pembelajaran daring UNPAM</p>
        </div>
      </div>
    </div>

    {/* Form Body */}
    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
      <div className="p-6 space-y-5">
        {/* Mata Kuliah */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            <BookOpen className="h-4 w-4 text-indigo-500" />
            Mata Kuliah
          </label>
          <Select value={formData.mata_kuliah_id} onValueChange={(value) => setFormData({ ...formData, mata_kuliah_id: value })}>
            <SelectTrigger className="h-11 rounded-xl bg-neutral-50/80 dark:bg-neutral-800/50">
              <SelectValue placeholder="Pilih mata kuliah" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.nama} ({course.sks} SKS)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Class Label */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            <Users className="h-4 w-4 text-purple-500" />
            Label Kelas <span className="text-xs text-neutral-400 font-normal">(Opsional)</span>
          </label>
          <Input
            value={formData.class_label}
            onChange={(e) => setFormData({ ...formData, class_label: e.target.value })}
            placeholder="Contoh: TI-6A, SI-4B"
            className="h-11 rounded-xl bg-neutral-50/80 dark:bg-neutral-800/50"
          />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            <FileText className="h-4 w-4 text-cyan-500" />
            Judul Informasi
          </label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Contoh: Akses Pembelajaran Daring Semester Genap"
            className="h-11 rounded-xl bg-neutral-50/80 dark:bg-neutral-800/50"
            required
          />
        </div>

        {/* Platform Name */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            <Globe className="h-4 w-4 text-emerald-500" />
            Nama Platform
          </label>
          <Input
            value={formData.platform_name}
            onChange={(e) => setFormData({ ...formData, platform_name: e.target.value })}
            placeholder="Default: UNPAM Daring"
            className="h-11 rounded-xl bg-neutral-50/80 dark:bg-neutral-800/50"
          />
        </div>

        {/* Portal URL */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            <Link className="h-4 w-4 text-blue-500" />
            URL Portal <span className="text-xs text-neutral-400 font-normal">(Opsional)</span>
          </label>
          <Input
            type="url"
            value={formData.portal_url}
            onChange={(e) => setFormData({ ...formData, portal_url: e.target.value })}
            placeholder="https://daring.unpam.ac.id/..."
            className="h-11 rounded-xl bg-neutral-50/80 dark:bg-neutral-800/50"
          />
        </div>

        {/* Forum URL */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            <MessageSquare className="h-4 w-4 text-amber-500" />
            URL Forum <span className="text-xs text-neutral-400 font-normal">(Opsional)</span>
          </label>
          <Input
            type="url"
            value={formData.forum_url}
            onChange={(e) => setFormData({ ...formData, forum_url: e.target.value })}
            placeholder="https://forum.unpam.ac.id/..."
            className="h-11 rounded-xl bg-neutral-50/80 dark:bg-neutral-800/50"
          />
        </div>

        {/* Access Instructions */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            <FileText className="h-4 w-4 text-rose-500" />
            Instruksi Akses
          </label>
          <Textarea
            value={formData.access_instructions}
            onChange={(e) => setFormData({ ...formData, access_instructions: e.target.value })}
            placeholder="Tulis instruksi lengkap cara mengakses pembelajaran daring..."
            rows={6}
            className="rounded-xl bg-neutral-50/80 dark:bg-neutral-800/50 resize-none"
          />
          <p className="text-xs text-neutral-500">
            Gunakan bahasa yang jelas dan terstruktur. Mahasiswa akan membaca ini sebagai panduan.
          </p>
        </div>

        {/* Support Contact */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            <Phone className="h-4 w-4 text-teal-500" />
            Kontak Support <span className="text-xs text-neutral-400 font-normal">(Opsional)</span>
          </label>
          <Input
            value={formData.support_contact}
            onChange={(e) => setFormData({ ...formData, support_contact: e.target.value })}
            placeholder="Email atau nomor telepon support"
            className="h-11 rounded-xl bg-neutral-50/80 dark:bg-neutral-800/50"
          />
        </div>

        {/* Validity Period */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              <Calendar className="h-4 w-4 text-green-500" />
              Berlaku Dari
            </label>
            <Input
              type="datetime-local"
              value={formData.valid_from}
              onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
              className="h-11 rounded-xl bg-neutral-50/80 dark:bg-neutral-800/50"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              <Calendar className="h-4 w-4 text-red-500" />
              Berlaku Hingga
            </label>
            <Input
              type="datetime-local"
              value={formData.valid_until}
              onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
              className="h-11 rounded-xl bg-neutral-50/80 dark:bg-neutral-800/50"
            />
          </div>
        </div>

        {/* Publish Toggle */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50/80 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
          <Checkbox
            id="is_published"
            checked={formData.is_published}
            onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked as boolean })}
          />
          <label htmlFor="is_published" className="flex-1 cursor-pointer">
            <p className="font-semibold text-neutral-900 dark:text-white">Publish Sekarang</p>
            <p className="text-xs text-neutral-500">Informasi akan langsung terlihat oleh mahasiswa</p>
          </label>
        </div>
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl px-5">
          Batal
        </Button>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button type="submit" className="rounded-xl px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg">
            <Save className="h-4 w-4 mr-2" />
            {editMode ? 'Update' : 'Simpan'}
          </Button>
        </motion.div>
      </div>
    </form>
  </DialogContent>
</Dialog>
```


#### 5.6 Mobile Responsiveness

**Breakpoints:**
- Mobile: < 640px (sm)
- Tablet: 640px - 1024px (sm-lg)
- Desktop: > 1024px (lg+)

**Mobile Optimizations:**
```tsx
// Header: Stack vertically on mobile
<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
    {/* Icon + Title */}
  </div>
  <div className="w-full md:w-auto flex justify-center md:justify-end">
    {/* Action Button */}
  </div>
</div>

// Stats Cards: 2 columns on mobile, 4 on desktop
<div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">

// Filter: Stack vertically on mobile
<div className="flex flex-col sm:flex-row flex-wrap gap-3">

// Table: Horizontal scroll on mobile
<div className="overflow-x-auto">
  <table className="min-w-full">
```

**Touch Targets:**
- Minimum 44x44px for buttons
- Adequate spacing between interactive elements
- Swipe gestures for mobile navigation


#### 5.7 Back Button Implementation

**Consistent with Other Admin Pages:**
```tsx
import { ArrowLeft } from 'lucide-react';
import { router } from '@inertiajs/react';

// Add to header section
<motion.button
  onClick={() => router.get('/admin/notification-center')}
  className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
  whileHover={{ x: -4 }}
>
  <ArrowLeft className="h-5 w-5" />
  <span className="text-sm font-medium">Kembali ke Notification Center</span>
</motion.button>
```

**Position:**
- Top-left of header (before title)
- OR as separate row above header
- Consistent with sesi-absen.tsx pattern


---

### 6. NOTIFICATION CENTER INTEGRATION

**File: `resources/js/pages/admin/notification-center.tsx`**

**Add CTA Button in Header Actions:**
```tsx
<div className="flex gap-3">
  {/* Existing "Buat Notifikasi" button */}
  <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
    {/* ... existing code ... */}
  </Dialog>
  
  {/* NEW: Kelola Info Daring Button */}
  <motion.button
    onClick={() => router.get('/admin/notification-center/daring')}
    className="flex items-center gap-2 rounded-xl bg-white/20 px-6 py-3.5 text-sm font-semibold hover:bg-white/30 transition-colors backdrop-blur-xl border border-white/20 shadow-lg"
    whileHover={{ scale: 1.03, y: -2 }}
    whileTap={{ scale: 0.97 }}
  >
    <Globe className="h-4 w-4" />
    Kelola Info Daring
  </motion.button>
</div>
```

**Alternative: Add as Card in Stats Section:**
```tsx
<motion.div
  whileHover={{ y: -5, scale: 1.02 }}
  onClick={() => router.get('/admin/notification-center/daring')}
  className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-4 sm:p-6 shadow-xl backdrop-blur-xl cursor-pointer"
>
  <div className="relative z-10 flex items-center gap-4">
    <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="relative h-14 w-14">
      <Globe className="h-full w-full text-indigo-500" />
    </motion.div>
    <div>
      <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Info Daring</h3>
      <p className="text-lg font-bold text-neutral-900 dark:text-white">Kelola</p>
      <p className="text-xs text-neutral-500">Pembelajaran Online</p>
    </div>
  </div>
  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
</motion.div>
```

**DO NOT:**
- Add new sidebar menu item
- Modify existing notification flow
- Change notification-center.tsx core functionality


---

### 7. STUDENT READ-ONLY INTEGRATION

#### 7.1 Schedule Detail Page Enhancement

**File: `resources/js/pages/user/schedule-detail.tsx` (or equivalent)**

**Add Daring Info Section:**
```tsx
// Fetch daring info in controller
public function show($courseId)
{
    $course = MataKuliah::findOrFail($courseId);
    $daringInfo = AdminDaringInfo::where('mata_kuliah_id', $courseId)
        ->published()
        ->valid()
        ->first();
    
    return Inertia::render('user/schedule-detail', [
        'course' => $course,
        'daringInfo' => $daringInfo,
        // ... other data
    ]);
}

// Display in frontend
{daringInfo && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl border border-indigo-200/50 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 p-6 shadow-lg"
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
        <Globe className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-bold text-neutral-900 dark:text-white text-lg">
          Informasi Daring UNPAM
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {daringInfo.platform_name}
        </p>
      </div>
    </div>

    <div className="space-y-4">
      <div>
        <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">
          {daringInfo.title}
        </h4>
        {daringInfo.class_label && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
            Kelas: {daringInfo.class_label}
          </p>
        )}
      </div>

      {daringInfo.access_instructions && (
        <div className="rounded-xl bg-white/60 dark:bg-neutral-900/60 p-4 border border-neutral-200 dark:border-neutral-800">
          <h5 className="font-semibold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-500" />
            Cara Akses
          </h5>
          <div className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
            {daringInfo.access_instructions}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {daringInfo.portal_url && (
          <a
            href={daringInfo.portal_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors shadow-lg"
          >
            <ExternalLink className="h-4 w-4" />
            Buka Portal
          </a>
        )}
        {daringInfo.forum_url && (
          <a
            href={daringInfo.forum_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-colors shadow-lg"
          >
            <MessageSquare className="h-4 w-4" />
            Forum Diskusi
          </a>
        )}
      </div>

      {daringInfo.support_contact && (
        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          <Phone className="h-4 w-4" />
          <span>Support: {daringInfo.support_contact}</span>
        </div>
      )}

      {daringInfo.valid_until && (
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <Clock className="h-3.5 w-3.5" />
          <span>
            Berlaku hingga: {new Date(daringInfo.valid_until).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </span>
        </div>
      )}
    </div>
  </motion.div>
)}

{!daringInfo && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 p-8 text-center"
  >
    <Globe className="h-12 w-12 mx-auto text-neutral-400 mb-3" />
    <p className="text-neutral-600 dark:text-neutral-400 text-sm">
      Informasi pembelajaran daring belum tersedia untuk mata kuliah ini
    </p>
  </motion.div>
)}
```


#### 7.2 Remove Student Write Access

**Ensure NO student endpoints exist:**
```php
// DO NOT create these routes:
// Route::post('user/schedule/{course}/daring-info', ...); // ❌
// Route::put('user/schedule/{course}/daring-info', ...);  // ❌
// Route::delete('user/schedule/{course}/daring-info', ...); // ❌
```

**Controller Authorization:**
```php
// In DaringInfoController
public function __construct()
{
    $this->middleware('auth:web'); // Admin only
}

// Additional check in each method
public function store(Request $request)
{
    if (!auth()->guard('web')->check()) {
        abort(403, 'Unauthorized');
    }
    // ... rest of code
}
```


---

### 8. SECURITY IMPLEMENTATION

#### 8.1 Input Validation & Sanitization

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'mata_kuliah_id' => 'required|exists:mata_kuliah,id',
        'class_label' => 'nullable|string|max:50',
        'title' => 'required|string|max:255',
        'platform_name' => 'nullable|string|max:100',
        'portal_url' => 'nullable|url|max:500',
        'forum_url' => 'nullable|url|max:500',
        'access_instructions' => 'nullable|string|max:5000',
        'support_contact' => 'nullable|string|max:255',
        'valid_from' => 'nullable|date',
        'valid_until' => 'nullable|date|after:valid_from',
        'is_published' => 'boolean',
    ]);

    if ($validator->fails()) {
        return back()->withErrors($validator)->withInput();
    }

    $validated = $validator->validated();

    // Sanitize URLs
    if (!empty($validated['portal_url'])) {
        $validated['portal_url'] = filter_var($validated['portal_url'], FILTER_SANITIZE_URL);
        if (!filter_var($validated['portal_url'], FILTER_VALIDATE_URL)) {
            return back()->withErrors(['portal_url' => 'URL portal tidak valid'])->withInput();
        }
    }

    if (!empty($validated['forum_url'])) {
        $validated['forum_url'] = filter_var($validated['forum_url'], FILTER_SANITIZE_URL);
        if (!filter_var($validated['forum_url'], FILTER_VALIDATE_URL)) {
            return back()->withErrors(['forum_url' => 'URL forum tidak valid'])->withInput();
        }
    }

    // Sanitize text fields
    $validated['title'] = strip_tags($validated['title']);
    $validated['class_label'] = strip_tags($validated['class_label'] ?? '');
    $validated['platform_name'] = strip_tags($validated['platform_name'] ?? 'UNPAM Daring');
    $validated['support_contact'] = strip_tags($validated['support_contact'] ?? '');
    
    // Allow basic HTML in instructions (sanitize with HTMLPurifier if needed)
    $validated['access_instructions'] = Str::limit(strip_tags($validated['access_instructions'] ?? '', '<p><br><strong><em><ul><ol><li>'), 5000);

    $validated['created_by'] = auth()->id();

    AdminDaringInfo::create($validated);

    return back()->with('success', 'Informasi daring berhasil ditambahkan');
}
```

#### 8.2 Authorization Middleware

```php
// In routes/web.php
Route::middleware(['auth:web', 'can:manage-daring-info'])->group(function () {
    Route::get('admin/notification-center/daring', [DaringInfoController::class, 'index']);
    // ... other routes
});

// Create Policy: app/Policies/DaringInfoPolicy.php
<?php

namespace App\Policies;

use App\Models\User;
use App\Models\AdminDaringInfo;

class DaringInfoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_admin; // Adjust based on your admin check
    }

    public function create(User $user): bool
    {
        return $user->is_admin;
    }

    public function update(User $user, AdminDaringInfo $daringInfo): bool
    {
        return $user->is_admin;
    }

    public function delete(User $user, AdminDaringInfo $daringInfo): bool
    {
        return $user->is_admin;
    }
}
```

#### 8.3 Rate Limiting

```php
// In app/Providers/RouteServiceProvider.php
protected function configureRateLimiting()
{
    RateLimiter::for('daring-info-write', function (Request $request) {
        return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
    });
}

// Apply to routes
Route::middleware(['throttle:daring-info-write'])->group(function () {
    Route::post('admin/notification-center/daring', ...);
    Route::patch('admin/notification-center/daring/{id}', ...);
    Route::delete('admin/notification-center/daring/{id}', ...);
});
```

#### 8.4 CSRF Protection

```tsx
// Inertia automatically handles CSRF tokens
// Ensure all forms use Inertia's router.post/patch/delete

import { router } from '@inertiajs/react';

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  router.post('/admin/notification-center/daring', formData, {
    onSuccess: () => {
      // Success handling
    },
    onError: (errors) => {
      // Error handling
    }
  });
};
```


---

### 9. QUALITY ASSURANCE

#### 9.1 PHP Syntax Check

```bash
# Check all modified PHP files
find app/Http/Controllers/Admin -name "DaringInfoController.php" -exec php -l {} \;
find app/Models -name "AdminDaringInfo.php" -exec php -l {} \;
find database/migrations -name "*_create_admin_daring_infos_table.php" -exec php -l {} \;
```

#### 9.2 ESLint Check

```bash
# Check TypeScript/React files
npx eslint resources/js/pages/admin/notification-center-daring.tsx --fix
npx eslint resources/js/pages/admin/notification-center.tsx --fix
```

#### 9.3 Migration Test

```bash
# Test migration
php artisan migrate:fresh --seed
php artisan migrate:rollback
php artisan migrate
```

#### 9.4 Manual Testing Checklist

**Admin Flow:**
- [ ] Access `/admin/notification-center/daring` (authenticated)
- [ ] Create new daring info with all fields
- [ ] Create with minimal fields (only required)
- [ ] Edit existing info
- [ ] Toggle publish/unpublish
- [ ] Delete info
- [ ] Filter by status (all/published/draft)
- [ ] Filter by validity (all/valid/expired)
- [ ] Search by title/course name
- [ ] Pagination works correctly
- [ ] Mobile responsive (test on 375px, 768px, 1024px)
- [ ] Dark mode toggle
- [ ] Back button navigation

**Student Flow:**
- [ ] View daring info in schedule detail (published + valid)
- [ ] Empty state when no info available
- [ ] Cannot access admin endpoints
- [ ] External links open in new tab
- [ ] Mobile responsive display

**Security:**
- [ ] Unauthenticated access blocked
- [ ] Student cannot access admin routes
- [ ] XSS prevention (test with `<script>alert('xss')</script>`)
- [ ] SQL injection prevention (test with `' OR '1'='1`)
- [ ] URL validation works
- [ ] Rate limiting triggers after 10 requests/minute


---

### 10. IMPLEMENTATION CHECKLIST

#### Phase 1: Database & Model
- [ ] Create migration file `YYYY_MM_DD_HHMMSS_create_admin_daring_infos_table.php`
- [ ] Run migration: `php artisan migrate`
- [ ] Create model `app/Models/AdminDaringInfo.php`
- [ ] Add relationships to `MataKuliah` model
- [ ] Test model queries in tinker

#### Phase 2: Backend Logic
- [ ] Create controller `app/Http/Controllers/Admin/DaringInfoController.php`
- [ ] Implement `index()` method with filters
- [ ] Implement `store()` method with validation
- [ ] Implement `update()` method
- [ ] Implement `destroy()` method
- [ ] Implement `publish()` toggle method
- [ ] Add routes to `routes/web.php`
- [ ] Test all endpoints with Postman/Insomnia

#### Phase 3: Admin Frontend
- [ ] Create `resources/js/pages/admin/notification-center-daring.tsx`
- [ ] Implement header with gradient animation
- [ ] Implement stats cards
- [ ] Implement filter section
- [ ] Implement data table/list
- [ ] Implement create/edit modal
- [ ] Implement delete confirmation
- [ ] Add loading states
- [ ] Add error states
- [ ] Add empty states
- [ ] Test mobile responsiveness
- [ ] Test dark mode

#### Phase 4: Integration
- [ ] Add CTA button in `notification-center.tsx`
- [ ] Test navigation flow
- [ ] Ensure no sidebar menu added
- [ ] Test back button functionality

#### Phase 5: Student Integration
- [ ] Update `ScheduleDetailController` to fetch daring info
- [ ] Add daring info section in schedule detail page
- [ ] Implement empty state for students
- [ ] Test read-only access
- [ ] Verify no write endpoints for students

#### Phase 6: Security & Testing
- [ ] Run PHP syntax check
- [ ] Run ESLint
- [ ] Test all security measures
- [ ] Test rate limiting
- [ ] Test authorization
- [ ] Perform manual testing (all checklist items)
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test on different devices (mobile, tablet, desktop)

#### Phase 7: Documentation
- [ ] Update README if needed
- [ ] Document API endpoints
- [ ] Add inline code comments
- [ ] Create user guide for admins


---

### 11. DESIGN INNOVATIONS

#### 11.1 Writing Style & Content Guidelines

**Tone & Voice:**
- Professional yet approachable
- Clear and concise instructions
- Use active voice
- Avoid jargon unless necessary
- Consistent terminology throughout

**Content Structure:**
```
1. Title: Clear, descriptive (max 255 chars)
2. Platform Name: Consistent branding
3. Access Instructions:
   - Step-by-step format
   - Numbered or bulleted lists
   - Include screenshots references if needed
   - Troubleshooting tips
   - Expected outcomes

Example:
"Cara Mengakses Pembelajaran Daring:

1. Buka browser dan kunjungi portal.unpam.ac.id
2. Login menggunakan NIM dan password UNPAM Anda
3. Pilih menu 'Mata Kuliah Saya'
4. Klik pada mata kuliah yang ingin diakses
5. Materi pembelajaran akan tersedia di tab 'Konten'

Catatan: Jika mengalami kesulitan login, hubungi support di bawah."
```

#### 11.2 Visual Enhancements

**Icon Consistency:**
- Use Lucide React icons throughout
- Match icon colors with card gradients
- Consistent sizing (h-4 w-4 for small, h-6 w-6 for medium)

**Animation Principles:**
- Subtle, professional animations
- No distracting movements
- Smooth transitions (300-400ms)
- Use spring physics for natural feel
- Respect user's motion preferences

**Color Harmony:**
```typescript
// Semantic colors
const semanticColors = {
  success: 'emerald',
  warning: 'amber',
  error: 'rose',
  info: 'blue',
  primary: 'indigo',
  secondary: 'purple',
};

// Status indicators
const statusColors = {
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  draft: 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400',
  expired: 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400',
  valid: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
};
```

#### 11.3 UX Improvements

**Loading States:**
```tsx
{isLoading && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-center justify-center p-12"
  >
    <div className="flex flex-col items-center gap-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="h-8 w-8 rounded-full border-4 border-indigo-200 border-t-indigo-600"
      />
      <p className="text-sm text-neutral-600 dark:text-neutral-400">Memuat data...</p>
    </div>
  </motion.div>
)}
```

**Error States:**
```tsx
{error && (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-4"
  >
    <div className="flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
      <div>
        <h4 className="font-semibold text-rose-900 dark:text-rose-200">Terjadi Kesalahan</h4>
        <p className="text-sm text-rose-700 dark:text-rose-300 mt-1">{error}</p>
      </div>
    </div>
  </motion.div>
)}
```

**Success Feedback:**
```tsx
{showSuccess && (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, y: -20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9, y: -20 }}
    className="fixed top-4 right-4 z-50 rounded-xl bg-emerald-500 text-white px-6 py-4 shadow-2xl"
  >
    <div className="flex items-center gap-3">
      <CheckCircle className="h-5 w-5" />
      <p className="font-semibold">Berhasil disimpan!</p>
    </div>
  </motion.div>
)}
```

#### 11.4 Accessibility

**ARIA Labels:**
```tsx
<button
  aria-label="Edit informasi daring"
  aria-describedby="edit-tooltip"
  onClick={handleEdit}
>
  <Edit className="h-4 w-4" />
</button>
```

**Keyboard Navigation:**
```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isModalOpen) {
      setIsModalOpen(false);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      // Open search/filter
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isModalOpen]);
```

**Focus Management:**
```tsx
const modalRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (isModalOpen && modalRef.current) {
    const firstInput = modalRef.current.querySelector('input, select, textarea');
    if (firstInput instanceof HTMLElement) {
      firstInput.focus();
    }
  }
}, [isModalOpen]);
```


---

### 12. PERFORMANCE OPTIMIZATION

#### 12.1 Database Optimization

**Indexes:**
```sql
-- Already included in migration
INDEX idx_mata_kuliah (mata_kuliah_id)
INDEX idx_published (is_published)
INDEX idx_validity (valid_from, valid_until)
INDEX idx_created_by (created_by)
```

**Query Optimization:**
```php
// Eager loading to prevent N+1 queries
$daringInfos = AdminDaringInfo::with(['mataKuliah.dosen', 'creator'])
    ->when($search, function ($query, $search) {
        $query->where('title', 'like', "%{$search}%")
              ->orWhereHas('mataKuliah', function ($q) use ($search) {
                  $q->where('nama', 'like', "%{$search}%");
              });
    })
    ->when($status !== 'all', function ($query) use ($status) {
        $query->where('is_published', $status === 'published');
    })
    ->when($validity === 'valid', function ($query) {
        $query->valid();
    })
    ->when($validity === 'expired', function ($query) {
        $query->where('valid_until', '<', now());
    })
    ->latest()
    ->paginate(15);
```

#### 12.2 Frontend Optimization

**Code Splitting:**
```tsx
// Lazy load modal components
const CreateEditModal = lazy(() => import('@/components/admin/daring-info-modal'));

// Use Suspense
<Suspense fallback={<LoadingSpinner />}>
  <CreateEditModal />
</Suspense>
```

**Memoization:**
```tsx
const filteredData = useMemo(() => {
  return daringInfos.data.filter(info => {
    // Filter logic
  });
}, [daringInfos.data, filters]);

const handleFilter = useCallback(() => {
  router.get('/admin/notification-center/daring', filters, { preserveState: true });
}, [filters]);
```

**Debounced Search:**
```tsx
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback((value: string) => {
  router.get('/admin/notification-center/daring', { search: value }, { preserveState: true });
}, 500);

<Input
  onChange={(e) => {
    setSearch(e.target.value);
    debouncedSearch(e.target.value);
  }}
/>
```

#### 12.3 Caching Strategy

```php
// Cache course list (rarely changes)
$courses = Cache::remember('mata_kuliah_list', 3600, function () {
    return MataKuliah::with('dosen')->get();
});

// Cache stats (refresh every 5 minutes)
$stats = Cache::remember('daring_info_stats', 300, function () {
    return [
        'total' => AdminDaringInfo::count(),
        'published' => AdminDaringInfo::published()->count(),
        'valid' => AdminDaringInfo::published()->valid()->count(),
        'expired' => AdminDaringInfo::published()->where('valid_until', '<', now())->count(),
    ];
});

// Clear cache on create/update/delete
public function store(Request $request)
{
    // ... validation
    
    AdminDaringInfo::create($validated);
    
    Cache::forget('daring_info_stats');
    
    return back()->with('success', 'Informasi daring berhasil ditambahkan');
}
```


---

### 13. ERROR HANDLING

#### 13.1 Backend Error Handling

```php
public function store(Request $request)
{
    try {
        $validated = $request->validate([
            // ... validation rules
        ]);

        // Sanitization
        // ... sanitization code

        $daringInfo = AdminDaringInfo::create($validated);

        return back()->with('success', 'Informasi daring berhasil ditambahkan');

    } catch (\Illuminate\Validation\ValidationException $e) {
        return back()->withErrors($e->errors())->withInput();
    } catch (\Exception $e) {
        \Log::error('Failed to create daring info', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'user_id' => auth()->id(),
        ]);

        return back()->with('error', 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.');
    }
}

public function update(Request $request, $id)
{
    try {
        $daringInfo = AdminDaringInfo::findOrFail($id);
        
        $validated = $request->validate([
            // ... validation rules
        ]);

        // Sanitization
        // ... sanitization code

        $daringInfo->update($validated);

        return back()->with('success', 'Informasi daring berhasil diperbarui');

    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return back()->with('error', 'Data tidak ditemukan');
    } catch (\Illuminate\Validation\ValidationException $e) {
        return back()->withErrors($e->errors())->withInput();
    } catch (\Exception $e) {
        \Log::error('Failed to update daring info', [
            'id' => $id,
            'error' => $e->getMessage(),
            'user_id' => auth()->id(),
        ]);

        return back()->with('error', 'Terjadi kesalahan saat memperbarui data. Silakan coba lagi.');
    }
}

public function destroy($id)
{
    try {
        $daringInfo = AdminDaringInfo::findOrFail($id);
        $daringInfo->delete();

        Cache::forget('daring_info_stats');

        return back()->with('success', 'Informasi daring berhasil dihapus');

    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return back()->with('error', 'Data tidak ditemukan');
    } catch (\Exception $e) {
        \Log::error('Failed to delete daring info', [
            'id' => $id,
            'error' => $e->getMessage(),
            'user_id' => auth()->id(),
        ]);

        return back()->with('error', 'Terjadi kesalahan saat menghapus data. Silakan coba lagi.');
    }
}
```

#### 13.2 Frontend Error Handling

```tsx
const [errors, setErrors] = useState<Record<string, string>>({});
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  setErrors({});
  setIsSubmitting(true);

  router.post('/admin/notification-center/daring', formData, {
    onSuccess: () => {
      setIsModalOpen(false);
      setFormData(initialFormData);
      // Show success toast
    },
    onError: (errors) => {
      setErrors(errors);
      // Show error toast
    },
    onFinish: () => {
      setIsSubmitting(false);
    },
  });
};

// Display errors in form
{errors.title && (
  <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">
    {errors.title}
  </p>
)}
```

#### 13.3 Network Error Handling

```tsx
const [networkError, setNetworkError] = useState<string | null>(null);

useEffect(() => {
  const handleOnline = () => setNetworkError(null);
  const handleOffline = () => setNetworkError('Koneksi internet terputus');

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);

{networkError && (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-amber-500 text-white px-6 py-3 shadow-2xl"
  >
    <div className="flex items-center gap-3">
      <WifiOff className="h-5 w-5" />
      <p className="font-semibold">{networkError}</p>
    </div>
  </motion.div>
)}
```


---

### 14. FINAL DELIVERABLES

#### 14.1 File Structure

```
project-root/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       └── Admin/
│   │           └── DaringInfoController.php (NEW)
│   ├── Models/
│   │   └── AdminDaringInfo.php (NEW)
│   └── Policies/
│       └── DaringInfoPolicy.php (NEW - Optional)
├── database/
│   └── migrations/
│       └── YYYY_MM_DD_HHMMSS_create_admin_daring_infos_table.php (NEW)
├── resources/
│   └── js/
│       └── pages/
│           ├── admin/
│           │   ├── notification-center-daring.tsx (NEW)
│           │   └── notification-center.tsx (MODIFIED)
│           └── user/
│               └── schedule-detail.tsx (MODIFIED - if exists)
└── routes/
    └── web.php (MODIFIED)
```

#### 14.2 Summary of Changes

**New Files:**
1. `database/migrations/YYYY_MM_DD_HHMMSS_create_admin_daring_infos_table.php`
   - Creates `admin_daring_infos` table with proper indexes and foreign keys

2. `app/Models/AdminDaringInfo.php`
   - Model with relationships, scopes, and helper methods

3. `app/Http/Controllers/Admin/DaringInfoController.php`
   - Full CRUD operations with validation and security

4. `resources/js/pages/admin/notification-center-daring.tsx`
   - Complete admin interface with filters, modals, and animations

**Modified Files:**
1. `routes/web.php`
   - Added 5 new routes for daring info management

2. `resources/js/pages/admin/notification-center.tsx`
   - Added CTA button to access daring info page

3. `app/Http/Controllers/User/ScheduleDetailController.php` (if exists)
   - Added daring info fetching for students

4. `resources/js/pages/user/schedule-detail.tsx` (if exists)
   - Added read-only daring info display section

#### 14.3 Technical Decisions & Rationale

**Why separate table instead of extending notifications?**
- Different data structure and lifecycle
- Specific to courses, not general notifications
- Allows for course-specific validations
- Better query performance with dedicated indexes

**Why no new sidebar menu?**
- Keeps navigation clean and focused
- Logically grouped with notification center
- Reduces cognitive load for admins
- Follows existing pattern (similar to sub-features)

**Why admin-only write access?**
- Ensures data quality and consistency
- Prevents spam or incorrect information
- Maintains single source of truth
- Aligns with institutional control requirements

**Why validity dates are optional?**
- Some information is evergreen
- Flexibility for different use cases
- Can be updated as needed
- Reduces admin burden for permanent info


---

### 15. DEPLOYMENT GUIDE

#### 15.1 Pre-Deployment Checklist

- [ ] All code reviewed and tested locally
- [ ] Database migration tested (up and down)
- [ ] No console errors in browser
- [ ] No PHP errors in logs
- [ ] All validation rules working
- [ ] Security measures in place
- [ ] Mobile responsive verified
- [ ] Dark mode working
- [ ] Performance acceptable (< 2s page load)
- [ ] Backup database before deployment

#### 15.2 Deployment Steps

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies (if needed)
composer install --no-dev --optimize-autoloader
npm install
npm run build

# 3. Run migrations
php artisan migrate --force

# 4. Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# 5. Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 6. Restart services
php artisan queue:restart
sudo systemctl restart php8.2-fpm  # Adjust version as needed
```

#### 15.3 Post-Deployment Verification

```bash
# Check application status
php artisan about

# Test database connection
php artisan tinker
>>> AdminDaringInfo::count()

# Monitor logs
tail -f storage/logs/laravel.log

# Test endpoints
curl -I https://your-domain.com/admin/notification-center/daring
```

#### 15.4 Rollback Plan

```bash
# If issues occur, rollback migration
php artisan migrate:rollback --step=1

# Restore previous code version
git reset --hard <previous-commit-hash>

# Rebuild assets
npm run build

# Clear and recache
php artisan cache:clear
php artisan config:cache
php artisan route:cache
```

---

### 16. MAINTENANCE & FUTURE ENHANCEMENTS

#### 16.1 Monitoring

**Key Metrics to Track:**
- Page load time for `/admin/notification-center/daring`
- Number of daring infos created per week
- Student engagement (views on schedule detail)
- Error rate in logs
- Database query performance

**Logging:**
```php
// Add to controller methods
\Log::info('Daring info created', [
    'id' => $daringInfo->id,
    'course_id' => $daringInfo->mata_kuliah_id,
    'created_by' => auth()->id(),
]);
```

#### 16.2 Potential Future Enhancements

1. **Bulk Import/Export**
   - CSV import for multiple daring infos
   - Excel export for reporting

2. **Version History**
   - Track changes to daring info
   - Restore previous versions

3. **Notification Integration**
   - Auto-notify students when new daring info published
   - Reminder before expiry

4. **Analytics Dashboard**
   - Most viewed daring infos
   - Student access patterns
   - Engagement metrics

5. **Rich Text Editor**
   - WYSIWYG editor for access instructions
   - Image upload support
   - Embedded videos

6. **Multi-language Support**
   - Indonesian and English versions
   - Auto-translation option

7. **Template System**
   - Pre-defined templates for common scenarios
   - Quick fill functionality

8. **API Endpoints**
   - RESTful API for mobile app
   - Webhook support for external systems

---

## 🎯 CONCLUSION

This implementation provides a robust, secure, and user-friendly system for managing online learning information at UNPAM. The design prioritizes:

- **Admin Efficiency**: Quick CRUD operations with intuitive UI
- **Student Experience**: Clear, accessible information when needed
- **Security**: Multi-layered protection against common vulnerabilities
- **Performance**: Optimized queries and caching strategies
- **Maintainability**: Clean code structure and comprehensive documentation
- **Scalability**: Ready for future enhancements

**Key Success Factors:**
1. Consistent UI/UX with existing admin pages
2. No disruption to current workflows
3. Mobile-first responsive design
4. Comprehensive error handling
5. Thorough testing before deployment

**Remember:**
- NO dummy data in production
- NO new sidebar menu
- NO animated icon containers in header
- NO student write access
- ALWAYS sanitize user input
- ALWAYS test on multiple devices

---

## 📞 SUPPORT & QUESTIONS

For implementation questions or issues:
1. Review this document thoroughly
2. Check existing similar implementations (notification-center, sesi-absen)
3. Test in local environment first
4. Document any deviations from this spec

**Good luck with the implementation! 🚀**

