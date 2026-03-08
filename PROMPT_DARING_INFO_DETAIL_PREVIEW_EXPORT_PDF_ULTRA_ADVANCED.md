# PROMPT EXTENSION: Detail Preview & Export PDF - Informasi Daring UNPAM
## Ultra Advanced Complete with Logo UNPAM & SASMITA

---

## 🎯 EXECUTIVE SUMMARY

Extension untuk fitur "Informasi Daring UNPAM" yang menambahkan:
1. **Detail Preview Page** - Halaman preview lengkap sebelum publish
2. **Export PDF Ultra Advanced** - PDF profesional dengan logo UNPAM & SASMITA
3. **Multiple Export Formats** - Summary, Detailed, Batch Export
4. **Real-time Preview** - Live preview sebelum download
5. **Professional Header/Footer** - Dengan logo dan branding UNPAM

---

## 📋 PART 1: DETAIL PREVIEW PAGE

### 1.1 Route Addition

**File: `routes/web.php`**

```php
// Add inside middleware(['auth:web,dosen']) group
Route::get('admin/notification-center/daring/{id}/preview', 
    [\App\Http\Controllers\Admin\DaringInfoController::class, 'preview'])
    ->name('admin.notification-center.daring.preview');
```

### 1.2 Controller Method

**File: `app/Http/Controllers/Admin/DaringInfoController.php`**

```php
public function preview($id)
{
    $daringInfo = AdminDaringInfo::with(['mataKuliah.dosen', 'creator'])
        ->findOrFail($id);
    
    return Inertia::render('admin/notification-center-daring-preview', [
        'daringInfo' => $daringInfo,
        'canEdit' => true,
        'canPublish' => !$daringInfo->is_published,
    ]);
}
```


### 1.3 Preview Page Component

**File: `resources/js/pages/admin/notification-center-daring-preview.tsx`**

```tsx
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Edit, Eye, EyeOff, FileDown, Globe, Calendar, 
  Clock, User, BookOpen, Link as LinkIcon, MessageSquare, 
  Phone, CheckCircle, AlertCircle, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface DaringInfo {
  id: number;
  mata_kuliah_id: number;
  class_label: string | null;
  title: string;
  platform_name: string;
  portal_url: string | null;
  forum_url: string | null;
  access_instructions: string | null;
  support_contact: string | null;
  valid_from: string | null;
  valid_until: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  mata_kuliah: {
    id: number;
    nama: string;
    sks: number;
    dosen: {
      nama: string;
    } | null;
  };
  creator: {
    name: string;
  } | null;
}

interface PreviewPageProps {
  daringInfo: DaringInfo;
  canEdit: boolean;
  canPublish: boolean;
}

export default function DaringInfoPreview({ daringInfo, canEdit, canPublish }: PreviewPageProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handlePublishToggle = () => {
    router.patch(`/admin/notification-center/daring/${daringInfo.id}/publish`, {}, {
      onSuccess: () => {
        // Success handling
      }
    });
  };

  const handleExportPDF = (type: 'summary' | 'detailed') => {
    window.open(`/admin/notification-center/daring/${daringInfo.id}/export-pdf?type=${type}`, '_blank');
  };

  const isExpired = daringInfo.valid_until && new Date(daringInfo.valid_until) < new Date();
  const isValid = !isExpired && (
    !daringInfo.valid_from || new Date(daringInfo.valid_from) <= new Date()
  );

  return (
    <AppLayout>
      <Head title={`Preview: ${daringInfo.title}`} />

      <div className="p-6 space-y-6">
        {/* Header with Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
        >
          {/* Animated Gradient Background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
            animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: '200% 200%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />

          <div className="relative">
            {/* Back Button */}
            <motion.button
              onClick={() => router.get('/admin/notification-center/daring')}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6"
              whileHover={{ x: -4 }}
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Kembali ke Daftar</span>
            </motion.button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative flex h-20 w-20 shrink-0">
                  <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl">
                    <Eye className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-blue-100 font-medium">Preview Mode</p>
                  <h1 className="text-3xl font-bold">Detail Informasi Daring</h1>
                  <p className="text-blue-100/80 mt-1">{daringInfo.title}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {canEdit && (
                  <motion.button
                    onClick={() => router.get(`/admin/notification-center/daring?edit=${daringInfo.id}`)}
                    className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-semibold hover:bg-white/30 transition-colors backdrop-blur-xl border border-white/20 shadow-lg"
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </motion.button>
                )}

                {canPublish && (
                  <motion.button
                    onClick={handlePublishToggle}
                    className="flex items-center gap-2 rounded-xl bg-emerald-500/90 px-4 py-2.5 text-sm font-semibold hover:bg-emerald-600 transition-colors backdrop-blur-xl border border-white/20 shadow-lg"
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Publish
                  </motion.button>
                )}

                {daringInfo.is_published && (
                  <motion.button
                    onClick={handlePublishToggle}
                    className="flex items-center gap-2 rounded-xl bg-amber-500/90 px-4 py-2.5 text-sm font-semibold hover:bg-amber-600 transition-colors backdrop-blur-xl border border-white/20 shadow-lg"
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <EyeOff className="h-4 w-4" />
                    Unpublish
                  </motion.button>
                )}

                {/* Export Button with Dropdown */}
                <div className="relative">
                  <motion.button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-semibold hover:bg-white/30 transition-colors backdrop-blur-xl border border-white/20 shadow-lg"
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <FileDown className="h-4 w-4" />
                    Export PDF
                  </motion.button>

                  {showExportMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-neutral-900 shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden z-50"
                    >
                      <div className="p-2">
                        <button
                          onClick={() => handleExportPDF('summary')}
                          className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
                        >
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shrink-0">
                            <FileDown className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-neutral-900 dark:text-white">Summary PDF</p>
                            <p className="text-xs text-neutral-500">Ringkasan 1-2 halaman</p>
                          </div>
                        </button>

                        <button
                          onClick={() => handleExportPDF('detailed')}
                          className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
                        >
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shrink-0">
                            <Download className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-neutral-900 dark:text-white">Detailed PDF</p>
                            <p className="text-xs text-neutral-500">Laporan lengkap dengan logo</p>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3"
        >
          {daringInfo.is_published ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Published</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800">
              <AlertCircle className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Draft</span>
            </div>
          )}

          {isValid ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-semibold text-green-700 dark:text-green-300">Valid</span>
            </div>
          ) : isExpired ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
              <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              <span className="text-sm font-semibold text-rose-700 dark:text-rose-300">Expired</span>
            </div>
          ) : null}
        </motion.div>


        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl border border-white/20 bg-white/50 dark:bg-neutral-900/50 p-6 shadow-lg backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                  <Globe className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Informasi Dasar</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Judul</label>
                  <p className="text-lg font-bold text-neutral-900 dark:text-white mt-1">{daringInfo.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Mata Kuliah</label>
                    <p className="text-base font-medium text-neutral-900 dark:text-white mt-1">
                      {daringInfo.mata_kuliah.nama}
                    </p>
                    <p className="text-sm text-neutral-500 mt-0.5">{daringInfo.mata_kuliah.sks} SKS</p>
                  </div>

                  {daringInfo.class_label && (
                    <div>
                      <label className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Kelas</label>
                      <p className="text-base font-medium text-neutral-900 dark:text-white mt-1">
                        {daringInfo.class_label}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Platform</label>
                  <p className="text-base font-medium text-neutral-900 dark:text-white mt-1">
                    {daringInfo.platform_name}
                  </p>
                </div>

                {daringInfo.mata_kuliah.dosen && (
                  <div>
                    <label className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Dosen Pengampu</label>
                    <p className="text-base font-medium text-neutral-900 dark:text-white mt-1">
                      {daringInfo.mata_kuliah.dosen.nama}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Access Instructions Card */}
            {daringInfo.access_instructions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-3xl border border-white/20 bg-white/50 dark:bg-neutral-900/50 p-6 shadow-lg backdrop-blur-xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Instruksi Akses</h2>
                </div>

                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <div className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">
                    {daringInfo.access_instructions}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Links Card */}
            {(daringInfo.portal_url || daringInfo.forum_url) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-3xl border border-white/20 bg-white/50 dark:bg-neutral-900/50 p-6 shadow-lg backdrop-blur-xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                    <LinkIcon className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Link Akses</h2>
                </div>

                <div className="space-y-3">
                  {daringInfo.portal_url && (
                    <a
                      href={daringInfo.portal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white">
                        <Globe className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Portal Daring</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 truncate">{daringInfo.portal_url}</p>
                      </div>
                      <LinkIcon className="h-5 w-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
                    </a>
                  )}

                  {daringInfo.forum_url && (
                    <a
                      href={daringInfo.forum_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500 text-white">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">Forum Diskusi</p>
                        <p className="text-xs text-purple-600 dark:text-purple-400 truncate">{daringInfo.forum_url}</p>
                      </div>
                      <LinkIcon className="h-5 w-5 text-purple-500 group-hover:translate-x-1 transition-transform" />
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Metadata */}
          <div className="space-y-6">
            {/* Validity Period Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl border border-white/20 bg-white/50 dark:bg-neutral-900/50 p-6 shadow-lg backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
                  <Calendar className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Periode Berlaku</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Berlaku Dari
                  </label>
                  <p className="text-base font-medium text-neutral-900 dark:text-white mt-1">
                    {daringInfo.valid_from 
                      ? new Date(daringInfo.valid_from).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Tidak terbatas'
                    }
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Berlaku Hingga
                  </label>
                  <p className="text-base font-medium text-neutral-900 dark:text-white mt-1">
                    {daringInfo.valid_until 
                      ? new Date(daringInfo.valid_until).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Tidak terbatas'
                    }
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Support Contact Card */}
            {daringInfo.support_contact && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-3xl border border-white/20 bg-white/50 dark:bg-neutral-900/50 p-6 shadow-lg backdrop-blur-xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg">
                    <Phone className="h-6 w-6" />
                  </div>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Kontak Support</h2>
                </div>

                <p className="text-base font-medium text-neutral-900 dark:text-white">
                  {daringInfo.support_contact}
                </p>
              </motion.div>
            )}

            {/* Metadata Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-3xl border border-white/20 bg-white/50 dark:bg-neutral-900/50 p-6 shadow-lg backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 text-white shadow-lg">
                  <User className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Metadata</h2>
              </div>

              <div className="space-y-3 text-sm">
                {daringInfo.creator && (
                  <div>
                    <label className="text-neutral-500 dark:text-neutral-400">Dibuat oleh</label>
                    <p className="font-medium text-neutral-900 dark:text-white">{daringInfo.creator.name}</p>
                  </div>
                )}

                <div>
                  <label className="text-neutral-500 dark:text-neutral-400">Dibuat pada</label>
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {new Date(daringInfo.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div>
                  <label className="text-neutral-500 dark:text-neutral-400">Terakhir diupdate</label>
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {new Date(daringInfo.updated_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
```



---

## 📋 PART 2: EXPORT PDF ULTRA ADVANCED

### 2.1 Route Addition

**File: `routes/web.php`**

```php
// Add inside middleware(['auth:web,dosen']) group
Route::get('admin/notification-center/daring/{id}/export-pdf', 
    [\App\Http\Controllers\Admin\DaringInfoController::class, 'exportPdf'])
    ->name('admin.notification-center.daring.export-pdf');

// Batch export
Route::post('admin/notification-center/daring/batch-export', 
    [\App\Http\Controllers\Admin\DaringInfoController::class, 'batchExport'])
    ->name('admin.notification-center.daring.batch-export');
```

### 2.2 Install Required Packages

```bash
composer require barryvdh/laravel-dompdf
composer require intervention/image
```

**Config: `config/dompdf.php`**

```php
return [
    'show_warnings' => false,
    'public_path' => public_path(),
    'convert_entities' => true,
    'options' => [
        'font_dir' => storage_path('fonts/'),
        'font_cache' => storage_path('fonts/'),
        'temp_dir' => sys_get_temp_dir(),
        'chroot' => realpath(base_path()),
        'enable_font_subsetting' => false,
        'pdf_backend' => 'CPDF',
        'default_media_type' => 'screen',
        'default_paper_size' => 'a4',
        'default_font' => 'serif',
        'dpi' => 96,
        'enable_php' => false,
        'enable_javascript' => true,
        'enable_remote' => true,
        'font_height_ratio' => 1.1,
        'enable_html5_parser' => true,
    ],
];
```

### 2.3 Logo Assets

**Required Files:**
- `public/assets/logos/unpam-logo.png` (Logo UNPAM)
- `public/assets/logos/sasmita-logo.png` (Logo SASMITA)
- `public/assets/logos/unpam-watermark.png` (Watermark transparan)

**Logo Specifications:**
- Format: PNG with transparent background
- UNPAM Logo: 200x200px minimum
- SASMITA Logo: 200x200px minimum
- Watermark: 800x800px, opacity 10%



### 2.4 Controller Export Methods

**File: `app/Http/Controllers/Admin/DaringInfoController.php`**

```php
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

public function exportPdf(Request $request, $id)
{
    $type = $request->get('type', 'detailed'); // summary, detailed
    
    $daringInfo = AdminDaringInfo::with(['mataKuliah.dosen', 'creator'])
        ->findOrFail($id);
    
    $data = [
        'daringInfo' => $daringInfo,
        'type' => $type,
        'generated_at' => now(),
        'generated_by' => auth()->user()->name ?? 'System',
    ];
    
    $pdf = Pdf::loadView("pdf.daring-info-{$type}", $data);
    
    // Set paper and orientation
    $pdf->setPaper('A4', 'portrait');
    
    // Set options
    $pdf->setOptions([
        'isHtml5ParserEnabled' => true,
        'isRemoteEnabled' => true,
        'defaultFont' => 'sans-serif',
    ]);
    
    $filename = 'Daring_Info_' . str_replace(' ', '_', $daringInfo.title) . '_' . now()->format('YmdHis') . '.pdf';
    
    return $pdf->download($filename);
}

public function batchExport(Request $request)
{
    $validated = $request->validate([
        'ids' => 'required|array|min:1',
        'ids.*' => 'exists:admin_daring_infos,id',
        'type' => 'required|in:summary,detailed',
    ]);
    
    $daringInfos = AdminDaringInfo::with(['mataKuliah.dosen', 'creator'])
        ->whereIn('id', $validated['ids'])
        ->get();
    
    $data = [
        'daringInfos' => $daringInfos,
        'type' => $validated['type'],
        'generated_at' => now(),
        'generated_by' => auth()->user()->name ?? 'System',
    ];
    
    $pdf = Pdf::loadView('pdf.daring-info-batch', $data);
    $pdf->setPaper('A4', 'portrait');
    
    $filename = 'Daring_Info_Batch_' . now()->format('YmdHis') . '.pdf';
    
    return $pdf->download($filename);
}
```



### 2.5 PDF Template - Detailed Version

**File: `resources/views/pdf/daring-info-detailed.blade.php`**

```blade
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Informasi Daring UNPAM - {{ $daringInfo->title }}</title>
    <style>
        @page {
            margin: 0;
            size: A4 portrait;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #1a1a1a;
            position: relative;
        }

        /* Watermark */
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            opacity: 0.05;
            z-index: -1;
            width: 600px;
            height: 600px;
        }

        /* Header - First Page Only */
        .header-first-page {
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #EC4899 100%);
            padding: 40px 50px;
            color: white;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .header-first-page::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        }

        .header-logos {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 60px;
            margin-bottom: 30px;
            position: relative;
            z-index: 1;
        }

        .logo-container {
            background: rgba(255, 255, 255, 0.15);
            padding: 20px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .logo-container img {
            width: 100px;
            height: 100px;
            object-fit: contain;
            display: block;
        }

        .header-title {
            position: relative;
            z-index: 1;
        }

        .header-title h1 {
            font-size: 32pt;
            font-weight: 800;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
            letter-spacing: 1px;
        }

        .header-title h2 {
            font-size: 20pt;
            font-weight: 600;
            margin-bottom: 5px;
            opacity: 0.95;
        }

        .header-title p {
            font-size: 12pt;
            opacity: 0.85;
            margin-top: 15px;
        }

        .header-divider {
            width: 200px;
            height: 4px;
            background: white;
            margin: 20px auto;
            border-radius: 2px;
            opacity: 0.7;
        }

        /* Regular Header for Other Pages */
        .header-regular {
            background: linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%);
            padding: 20px 50px;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 4px solid #EC4899;
        }

        .header-regular .logo-small {
            width: 50px;
            height: 50px;
        }

        .header-regular .title {
            font-size: 14pt;
            font-weight: 700;
        }

        /* Footer */
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(90deg, #1e293b 0%, #334155 100%);
            padding: 15px 50px;
            color: white;
            font-size: 9pt;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 3px solid #4F46E5;
        }

        .footer-left {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .footer-logo {
            width: 30px;
            height: 30px;
        }

        .footer-right {
            text-align: right;
        }

        .page-number:before {
            content: "Halaman " counter(page);
        }

        /* Content Container */
        .content {
            padding: 50px;
            min-height: calc(100vh - 200px);
        }

        /* Section Styling */
        .section {
            margin-bottom: 40px;
            page-break-inside: avoid;
        }

        .section-header {
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 12px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 15px;
            box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);
        }

        .section-icon {
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20pt;
        }

        .section-title {
            font-size: 16pt;
            font-weight: 700;
            letter-spacing: 0.5px;
        }

        /* Info Cards */
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }

        .info-card {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border: 2px solid #cbd5e1;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .info-card-label {
            font-size: 9pt;
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .info-card-value {
            font-size: 13pt;
            color: #1e293b;
            font-weight: 700;
        }

        /* Status Badge */
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 10pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .status-published {
            background: #dcfce7;
            color: #166534;
            border: 2px solid #86efac;
        }

        .status-draft {
            background: #f1f5f9;
            color: #475569;
            border: 2px solid #cbd5e1;
        }

        .status-valid {
            background: #d1fae5;
            color: #065f46;
            border: 2px solid #6ee7b7;
        }

        .status-expired {
            background: #fee2e2;
            color: #991b1b;
            border: 2px solid #fca5a5;
        }

        /* Table Styling */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .info-table tr {
            border-bottom: 1px solid #e2e8f0;
        }

        .info-table tr:last-child {
            border-bottom: none;
        }

        .info-table td {
            padding: 15px 20px;
        }

        .info-table td:first-child {
            background: #f8fafc;
            font-weight: 700;
            color: #475569;
            width: 35%;
            border-right: 2px solid #e2e8f0;
        }

        .info-table td:last-child {
            color: #1e293b;
        }

        /* Instructions Box */
        .instructions-box {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border: 3px solid #3b82f6;
            border-radius: 15px;
            padding: 25px;
            margin: 20px 0;
            box-shadow: 0 4px 6px rgba(59, 130, 246, 0.1);
        }

        .instructions-title {
            font-size: 14pt;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .instructions-content {
            font-size: 11pt;
            color: #1e3a8a;
            line-height: 1.8;
            white-space: pre-wrap;
        }

        /* Link Boxes */
        .link-container {
            display: grid;
            grid-template-columns: 1fr;
            gap: 15px;
            margin: 20px 0;
        }

        .link-box {
            background: white;
            border: 2px solid #e2e8f0;
            border-left: 6px solid #4F46E5;
            border-radius: 10px;
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 15px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .link-icon {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20pt;
            flex-shrink: 0;
        }

        .link-content {
            flex: 1;
        }

        .link-label {
            font-size: 10pt;
            color: #64748b;
            font-weight: 600;
            margin-bottom: 5px;
        }

        .link-url {
            font-size: 11pt;
            color: #4F46E5;
            font-weight: 600;
            word-break: break-all;
        }

        /* Contact Box */
        .contact-box {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border: 3px solid #22c55e;
            border-radius: 15px;
            padding: 20px;
            margin: 20px 0;
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .contact-icon {
            width: 60px;
            height: 60px;
            background: #22c55e;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24pt;
            flex-shrink: 0;
        }

        .contact-content {
            flex: 1;
        }

        .contact-label {
            font-size: 10pt;
            color: #166534;
            font-weight: 600;
            margin-bottom: 5px;
        }

        .contact-value {
            font-size: 13pt;
            color: #14532d;
            font-weight: 700;
        }

        /* Metadata Section */
        .metadata-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin: 20px 0;
        }

        .metadata-item {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 15px;
            text-align: center;
        }

        .metadata-label {
            font-size: 9pt;
            color: #64748b;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .metadata-value {
            font-size: 10pt;
            color: #1e293b;
            font-weight: 700;
        }

        /* Page Break */
        .page-break {
            page-break-after: always;
        }

        /* Signature Section */
        .signature-section {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
        }

        .signature-box {
            text-align: center;
            width: 45%;
        }

        .signature-line {
            border-top: 2px solid #1e293b;
            margin-top: 80px;
            padding-top: 10px;
            font-weight: 700;
        }

        .signature-title {
            font-size: 10pt;
            color: #64748b;
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <!-- Watermark -->
    <div class="watermark">
        <img src="{{ public_path('assets/logos/unpam-watermark.png') }}" alt="Watermark" style="width: 100%; height: 100%; object-fit: contain;">
    </div>

    <!-- First Page Header -->
    <div class="header-first-page">
        <div class="header-logos">
            <div class="logo-container">
                <img src="{{ public_path('assets/logos/unpam-logo.png') }}" alt="Logo UNPAM">
            </div>
            <div class="logo-container">
                <img src="{{ public_path('assets/logos/sasmita-logo.png') }}" alt="Logo SASMITA">
            </div>
        </div>
        
        <div class="header-title">
            <h1>UNIVERSITAS PAMULANG</h1>
            <div class="header-divider"></div>
            <h2>Informasi Pembelajaran Daring</h2>
            <p>Sistem Akademik Terintegrasi SASMITA</p>
        </div>
    </div>

    <!-- Content -->
    <div class="content">
        <!-- Document Info -->
        <div class="section">
            <div style="text-align: center; margin-bottom: 40px;">
                <h2 style="font-size: 20pt; color: #1e293b; margin-bottom: 10px;">{{ $daringInfo->title }}</h2>
                <p style="font-size: 12pt; color: #64748b;">{{ $daringInfo->mata_kuliah->nama }}</p>
                
                <div style="margin-top: 20px; display: flex; justify-content: center; gap: 15px;">
                    @if($daringInfo->is_published)
                        <span class="status-badge status-published">✓ Published</span>
                    @else
                        <span class="status-badge status-draft">Draft</span>
                    @endif
                    
                    @php
                        $isExpired = $daringInfo->valid_until && \Carbon\Carbon::parse($daringInfo->valid_until)->isPast();
                        $isValid = !$isExpired && (!$daringInfo->valid_from || \Carbon\Carbon::parse($daringInfo->valid_from)->isPast());
                    @endphp
                    
                    @if($isValid)
                        <span class="status-badge status-valid">✓ Valid</span>
                    @elseif($isExpired)
                        <span class="status-badge status-expired">✗ Expired</span>
                    @endif
                </div>
            </div>
        </div>

        <!-- Basic Information -->
        <div class="section">
            <div class="section-header">
                <div class="section-icon">📋</div>
                <div class="section-title">Informasi Dasar</div>
            </div>

            <div class="info-grid">
                <div class="info-card">
                    <div class="info-card-label">Mata Kuliah</div>
                    <div class="info-card-value">{{ $daringInfo->mata_kuliah->nama }}</div>
                </div>

                <div class="info-card">
                    <div class="info-card-label">SKS</div>
                    <div class="info-card-value">{{ $daringInfo->mata_kuliah->sks }} SKS</div>
                </div>

                @if($daringInfo->class_label)
                <div class="info-card">
                    <div class="info-card-label">Kelas</div>
                    <div class="info-card-value">{{ $daringInfo->class_label }}</div>
                </div>
                @endif

                <div class="info-card">
                    <div class="info-card-label">Platform</div>
                    <div class="info-card-value">{{ $daringInfo->platform_name }}</div>
                </div>
            </div>

            <table class="info-table">
                @if($daringInfo->mata_kuliah->dosen)
                <tr>
                    <td>Dosen Pengampu</td>
                    <td>{{ $daringInfo->mata_kuliah->dosen->nama }}</td>
                </tr>
                @endif
                
                <tr>
                    <td>Berlaku Dari</td>
                    <td>
                        @if($daringInfo->valid_from)
                            {{ \Carbon\Carbon::parse($daringInfo->valid_from)->isoFormat('D MMMM YYYY, HH:mm') }} WIB
                        @else
                            Tidak terbatas
                        @endif
                    </td>
                </tr>
                
                <tr>
                    <td>Berlaku Hingga</td>
                    <td>
                        @if($daringInfo->valid_until)
                            {{ \Carbon\Carbon::parse($daringInfo->valid_until)->isoFormat('D MMMM YYYY, HH:mm') }} WIB
                        @else
                            Tidak terbatas
                        @endif
                    </td>
                </tr>
            </table>
        </div>

        <!-- Page Break -->
        <div class="page-break"></div>

        <!-- Access Instructions -->
        @if($daringInfo->access_instructions)
        <div class="section">
            <div class="section-header">
                <div class="section-icon">📖</div>
                <div class="section-title">Instruksi Akses Pembelajaran Daring</div>
            </div>

            <div class="instructions-box">
                <div class="instructions-title">
                    <span>📝</span>
                    <span>Panduan Lengkap</span>
                </div>
                <div class="instructions-content">{{ $daringInfo->access_instructions }}</div>
            </div>
        </div>
        @endif

        <!-- Access Links -->
        @if($daringInfo->portal_url || $daringInfo->forum_url)
        <div class="section">
            <div class="section-header">
                <div class="section-icon">🔗</div>
                <div class="section-title">Link Akses</div>
            </div>

            <div class="link-container">
                @if($daringInfo->portal_url)
                <div class="link-box">
                    <div class="link-icon">🌐</div>
                    <div class="link-content">
                        <div class="link-label">Portal Pembelajaran Daring</div>
                        <div class="link-url">{{ $daringInfo->portal_url }}</div>
                    </div>
                </div>
                @endif

                @if($daringInfo->forum_url)
                <div class="link-box">
                    <div class="link-icon">💬</div>
                    <div class="link-content">
                        <div class="link-label">Forum Diskusi</div>
                        <div class="link-url">{{ $daringInfo->forum_url }}</div>
                    </div>
                </div>
                @endif
            </div>
        </div>
        @endif

        <!-- Support Contact -->
        @if($daringInfo->support_contact)
        <div class="section">
            <div class="section-header">
                <div class="section-icon">📞</div>
                <div class="section-title">Kontak Support</div>
            </div>

            <div class="contact-box">
                <div class="contact-icon">☎️</div>
                <div class="contact-content">
                    <div class="contact-label">Hubungi Kami</div>
                    <div class="contact-value">{{ $daringInfo->support_contact }}</div>
                </div>
            </div>
        </div>
        @endif

        <!-- Metadata -->
        <div class="section">
            <div class="section-header">
                <div class="section-icon">ℹ️</div>
                <div class="section-title">Informasi Dokumen</div>
            </div>

            <div class="metadata-grid">
                @if($daringInfo->creator)
                <div class="metadata-item">
                    <div class="metadata-label">Dibuat Oleh</div>
                    <div class="metadata-value">{{ $daringInfo->creator->name }}</div>
                </div>
                @endif

                <div class="metadata-item">
                    <div class="metadata-label">Tanggal Dibuat</div>
                    <div class="metadata-value">{{ \Carbon\Carbon::parse($daringInfo->created_at)->isoFormat('D MMM YYYY') }}</div>
                </div>

                <div class="metadata-item">
                    <div class="metadata-label">Terakhir Update</div>
                    <div class="metadata-value">{{ \Carbon\Carbon::parse($daringInfo->updated_at)->isoFormat('D MMM YYYY') }}</div>
                </div>
            </div>

            <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border: 2px solid #fbbf24; border-radius: 10px;">
                <p style="font-size: 10pt; color: #92400e; text-align: center;">
                    <strong>📄 Dokumen ini digenerate secara otomatis oleh Sistem SASMITA</strong><br>
                    Tanggal Generate: {{ $generated_at->isoFormat('dddd, D MMMM YYYY [pukul] HH:mm') }} WIB<br>
                    Digenerate oleh: {{ $generated_by }}
                </p>
            </div>
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
            <div class="signature-box">
                <p class="signature-title">Mengetahui,</p>
                <div class="signature-line">
                    Koordinator Pembelajaran Daring
                </div>
            </div>

            <div class="signature-box">
                <p class="signature-title">Tangerang Selatan, {{ now()->isoFormat('D MMMM YYYY') }}</p>
                <div class="signature-line">
                    @if($daringInfo->creator)
                        {{ $daringInfo->creator->name }}
                    @else
                        Administrator
                    @endif
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <div class="footer">
        <div class="footer-left">
            <img src="{{ public_path('assets/logos/unpam-logo.png') }}" alt="UNPAM" class="footer-logo">
            <div>
                <strong>Universitas Pamulang</strong><br>
                Jl. Surya Kencana No.1, Pamulang, Tangerang Selatan
            </div>
        </div>
        <div class="footer-right">
            <div class="page-number"></div>
            <div style="margin-top: 5px; font-size: 8pt; opacity: 0.7;">
                © {{ now()->year }} UNPAM - SASMITA System
            </div>
        </div>
    </div>
</body>
</html>
```



### 2.6 PDF Template - Summary Version

**File: `resources/views/pdf/daring-info-summary.blade.php`**

```blade
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Summary - {{ $daringInfo->title }}</title>
    <style>
        /* Reuse most styles from detailed version */
        @page { margin: 0; size: A4 portrait; }
        
        /* ... (copy base styles from detailed version) ... */
        
        /* Summary-specific compact styles */
        .summary-container {
            padding: 30px 40px;
        }
        
        .summary-header {
            background: linear-gradient(135deg, #4F46E5 0%, #EC4899 100%);
            padding: 30px;
            color: white;
            text-align: center;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin: 20px 0;
        }
        
        .summary-item {
            background: #f8fafc;
            border-left: 4px solid #4F46E5;
            padding: 15px;
            border-radius: 8px;
        }
        
        .summary-label {
            font-size: 9pt;
            color: #64748b;
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .summary-value {
            font-size: 11pt;
            color: #1e293b;
            font-weight: 700;
        }
    </style>
</head>
<body>
    <!-- Compact Header -->
    <div class="summary-header">
        <div style="display: flex; justify-content: center; gap: 30px; margin-bottom: 20px;">
            <img src="{{ public_path('assets/logos/unpam-logo.png') }}" style="width: 60px; height: 60px;">
            <img src="{{ public_path('assets/logos/sasmita-logo.png') }}" style="width: 60px; height: 60px;">
        </div>
        <h1 style="font-size: 20pt; margin-bottom: 5px;">Informasi Daring UNPAM</h1>
        <p style="font-size: 12pt; opacity: 0.9;">Ringkasan Singkat</p>
    </div>

    <div class="summary-container">
        <!-- Title -->
        <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="font-size: 18pt; color: #1e293b; margin-bottom: 5px;">{{ $daringInfo->title }}</h2>
            <p style="font-size: 12pt; color: #64748b;">{{ $daringInfo->mata_kuliah->nama }}</p>
        </div>

        <!-- Quick Info Grid -->
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">Platform</div>
                <div class="summary-value">{{ $daringInfo->platform_name }}</div>
            </div>

            @if($daringInfo->class_label)
            <div class="summary-item">
                <div class="summary-label">Kelas</div>
                <div class="summary-value">{{ $daringInfo->class_label }}</div>
            </div>
            @endif

            <div class="summary-item">
                <div class="summary-label">SKS</div>
                <div class="summary-value">{{ $daringInfo->mata_kuliah->sks }} SKS</div>
            </div>

            <div class="summary-item">
                <div class="summary-label">Status</div>
                <div class="summary-value">
                    {{ $daringInfo->is_published ? '✓ Published' : 'Draft' }}
                </div>
            </div>
        </div>

        <!-- Links (if available) -->
        @if($daringInfo->portal_url || $daringInfo->forum_url)
        <div style="margin: 30px 0; padding: 20px; background: #eff6ff; border: 2px solid #3b82f6; border-radius: 10px;">
            <h3 style="font-size: 12pt; color: #1e40af; margin-bottom: 15px;">🔗 Link Akses</h3>
            
            @if($daringInfo->portal_url)
            <p style="margin-bottom: 10px;">
                <strong>Portal:</strong><br>
                <span style="color: #4F46E5; font-size: 10pt;">{{ $daringInfo->portal_url }}</span>
            </p>
            @endif
            
            @if($daringInfo->forum_url)
            <p>
                <strong>Forum:</strong><br>
                <span style="color: #4F46E5; font-size: 10pt;">{{ $daringInfo->forum_url }}</span>
            </p>
            @endif
        </div>
        @endif

        <!-- Instructions (truncated) -->
        @if($daringInfo->access_instructions)
        <div style="margin: 30px 0; padding: 20px; background: #f0fdf4; border: 2px solid #22c55e; border-radius: 10px;">
            <h3 style="font-size: 12pt; color: #166534; margin-bottom: 10px;">📖 Instruksi Singkat</h3>
            <p style="font-size: 10pt; color: #14532d; line-height: 1.6;">
                {{ Str::limit($daringInfo->access_instructions, 300) }}
            </p>
        </div>
        @endif

        <!-- Footer Info -->
        <div style="margin-top: 40px; padding: 15px; background: #fef3c7; border-radius: 8px; text-align: center;">
            <p style="font-size: 9pt; color: #92400e;">
                Digenerate: {{ $generated_at->isoFormat('D MMM YYYY, HH:mm') }} WIB oleh {{ $generated_by }}
            </p>
        </div>
    </div>

    <!-- Simple Footer -->
    <div style="position: fixed; bottom: 0; left: 0; right: 0; background: #1e293b; padding: 10px 40px; color: white; font-size: 8pt; text-align: center;">
        <p>© {{ now()->year }} Universitas Pamulang - SASMITA System | Halaman <span class="page-number"></span></p>
    </div>
</body>
</html>
```



### 2.7 PDF Template - Batch Export

**File: `resources/views/pdf/daring-info-batch.blade.php`**

```blade
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Batch Export - Informasi Daring UNPAM</title>
    <style>
        /* ... (copy base styles) ... */
        
        .batch-item {
            page-break-inside: avoid;
            margin-bottom: 40px;
            border: 3px solid #e2e8f0;
            border-radius: 15px;
            padding: 25px;
            background: white;
        }
        
        .batch-item-header {
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        
        .batch-number {
            display: inline-block;
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            text-align: center;
            line-height: 40px;
            font-size: 16pt;
            font-weight: 700;
            margin-right: 15px;
        }
    </style>
</head>
<body>
    <!-- Cover Page -->
    <div style="height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; background: linear-gradient(135deg, #4F46E5 0%, #EC4899 100%); color: white;">
        <div style="margin-bottom: 40px;">
            <img src="{{ public_path('assets/logos/unpam-logo.png') }}" style="width: 150px; height: 150px; margin: 0 20px;">
            <img src="{{ public_path('assets/logos/sasmita-logo.png') }}" style="width: 150px; height: 150px; margin: 0 20px;">
        </div>
        
        <h1 style="font-size: 36pt; margin-bottom: 20px;">Kumpulan Informasi Daring</h1>
        <h2 style="font-size: 24pt; opacity: 0.9;">Universitas Pamulang</h2>
        
        <div style="margin-top: 60px; padding: 20px 40px; background: rgba(255, 255, 255, 0.2); border-radius: 15px;">
            <p style="font-size: 14pt;">Total: {{ count($daringInfos) }} Informasi</p>
            <p style="font-size: 12pt; opacity: 0.8;">{{ $generated_at->isoFormat('D MMMM YYYY') }}</p>
        </div>
    </div>

    <!-- Table of Contents -->
    <div style="padding: 50px; page-break-after: always;">
        <h2 style="font-size: 24pt; color: #1e293b; margin-bottom: 30px; border-bottom: 4px solid #4F46E5; padding-bottom: 15px;">
            📑 Daftar Isi
        </h2>
        
        <div style="margin-top: 30px;">
            @foreach($daringInfos as $index => $info)
            <div style="display: flex; justify-content: space-between; padding: 15px; border-bottom: 1px dashed #cbd5e1; align-items: center;">
                <div style="flex: 1;">
                    <span style="font-weight: 700; color: #4F46E5; margin-right: 10px;">{{ $index + 1 }}.</span>
                    <span style="font-weight: 600; color: #1e293b;">{{ $info->title }}</span>
                    <br>
                    <span style="font-size: 10pt; color: #64748b; margin-left: 25px;">{{ $info->mata_kuliah->nama }}</span>
                </div>
                <span style="font-weight: 700; color: #64748b;">{{ $index + 2 }}</span>
            </div>
            @endforeach
        </div>
    </div>

    <!-- Individual Items -->
    @foreach($daringInfos as $index => $info)
    <div style="padding: 50px; @if(!$loop->last) page-break-after: always; @endif">
        <div class="batch-item">
            <div class="batch-item-header">
                <span class="batch-number">{{ $index + 1 }}</span>
                <span style="font-size: 16pt; font-weight: 700;">{{ $info->title }}</span>
            </div>

            <!-- Content (similar to summary version) -->
            <div style="padding: 0 10px;">
                <div style="margin-bottom: 20px;">
                    <p style="font-size: 12pt; color: #64748b; margin-bottom: 5px;">Mata Kuliah</p>
                    <p style="font-size: 14pt; font-weight: 700; color: #1e293b;">{{ $info->mata_kuliah->nama }}</p>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0;">
                    <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #4F46E5;">
                        <p style="font-size: 9pt; color: #64748b; margin-bottom: 5px;">Platform</p>
                        <p style="font-size: 11pt; font-weight: 700;">{{ $info->platform_name }}</p>
                    </div>

                    @if($info->class_label)
                    <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #7C3AED;">
                        <p style="font-size: 9pt; color: #64748b; margin-bottom: 5px;">Kelas</p>
                        <p style="font-size: 11pt; font-weight: 700;">{{ $info->class_label }}</p>
                    </div>
                    @endif

                    <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #EC4899;">
                        <p style="font-size: 9pt; color: #64748b; margin-bottom: 5px;">Status</p>
                        <p style="font-size: 11pt; font-weight: 700;">{{ $info->is_published ? '✓ Published' : 'Draft' }}</p>
                    </div>
                </div>

                @if($info->access_instructions)
                <div style="margin: 20px 0; padding: 15px; background: #eff6ff; border: 2px solid #3b82f6; border-radius: 10px;">
                    <p style="font-size: 11pt; font-weight: 700; color: #1e40af; margin-bottom: 10px;">📖 Instruksi</p>
                    <p style="font-size: 10pt; color: #1e3a8a; line-height: 1.6;">
                        {{ Str::limit($info->access_instructions, 200) }}
                    </p>
                </div>
                @endif

                @if($info->portal_url || $info->forum_url)
                <div style="margin: 20px 0;">
                    <p style="font-size: 11pt; font-weight: 700; color: #1e293b; margin-bottom: 10px;">🔗 Link Akses</p>
                    
                    @if($info->portal_url)
                    <p style="font-size: 9pt; color: #4F46E5; margin-bottom: 5px;">
                        <strong>Portal:</strong> {{ $info->portal_url }}
                    </p>
                    @endif
                    
                    @if($info->forum_url)
                    <p style="font-size: 9pt; color: #7C3AED;">
                        <strong>Forum:</strong> {{ $info->forum_url }}
                    </p>
                    @endif
                </div>
                @endif
            </div>
        </div>
    </div>
    @endforeach

    <!-- Footer -->
    <div style="position: fixed; bottom: 0; left: 0; right: 0; background: #1e293b; padding: 15px 50px; color: white; font-size: 9pt; display: flex; justify-content: space-between;">
        <div>
            <strong>Universitas Pamulang</strong> - SASMITA System
        </div>
        <div>
            Halaman <span class="page-number"></span>
        </div>
    </div>
</body>
</html>
```

---

## 📋 PART 3: INTEGRATION & FEATURES

### 3.1 Add "Lihat Detail" Button to List

**File: `resources/js/pages/admin/notification-center-daring.tsx`**

```tsx
// In the data table/list section, add preview button:

<div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
  {/* Preview Button */}
  <motion.button
    whileHover={{ scale: 1.15 }}
    whileTap={{ scale: 0.9 }}
    onClick={() => router.get(`/admin/notification-center/daring/${info.id}/preview`)}
    className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 hover:bg-indigo-100"
    title="Lihat Detail"
  >
    <Eye className="h-4 w-4" />
  </motion.button>

  {/* Edit Button */}
  <motion.button
    whileHover={{ scale: 1.15 }}
    whileTap={{ scale: 0.9 }}
    onClick={() => handleEdit(info)}
    className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 hover:bg-blue-100"
    title="Edit"
  >
    <Edit className="h-4 w-4" />
  </motion.button>

  {/* Publish/Unpublish Button */}
  <motion.button
    whileHover={{ scale: 1.15 }}
    whileTap={{ scale: 0.9 }}
    onClick={() => handleTogglePublish(info.id)}
    className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 hover:bg-emerald-100"
    title={info.is_published ? 'Unpublish' : 'Publish'}
  >
    {info.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </motion.button>

  {/* Delete Button */}
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
```

### 3.2 Batch Export Feature

**Add to list page:**

```tsx
const [selectedIds, setSelectedIds] = useState<number[]>([]);

// Add checkbox column to table
<Checkbox
  checked={selectedIds.includes(info.id)}
  onCheckedChange={(checked) => {
    setSelectedIds(prev =>
      checked
        ? [...prev, info.id]
        : prev.filter(id => id !== info.id)
    );
  }}
/>

// Add batch export button
{selectedIds.length > 0 && (
  <motion.button
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    onClick={() => handleBatchExport()}
    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold shadow-lg"
  >
    <Download className="h-4 w-4" />
    Export {selectedIds.length} Item
  </motion.button>
)}

// Handler
const handleBatchExport = () => {
  router.post('/admin/notification-center/daring/batch-export', {
    ids: selectedIds,
    type: 'detailed'
  }, {
    onSuccess: () => {
      setSelectedIds([]);
    }
  });
};
```



---

## 📋 PART 4: ADVANCED FEATURES & OPTIMIZATIONS

### 4.1 PDF Generation Service (Optional - Better Architecture)

**File: `app/Services/DaringInfoPdfService.php`**

```php
<?php

namespace App\Services;

use App\Models\AdminDaringInfo;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class DaringInfoPdfService
{
    public function generatePdf(AdminDaringInfo $daringInfo, string $type = 'detailed'): \Barryvdh\DomPDF\PDF
    {
        $data = $this->prepareData($daringInfo, $type);
        
        $pdf = Pdf::loadView("pdf.daring-info-{$type}", $data);
        $pdf->setPaper('A4', 'portrait');
        $pdf->setOptions([
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled' => true,
            'defaultFont' => 'sans-serif',
        ]);
        
        return $pdf;
    }
    
    public function generateBatchPdf(array $daringInfoIds, string $type = 'detailed'): \Barryvdh\DomPDF\PDF
    {
        $daringInfos = AdminDaringInfo::with(['mataKuliah.dosen', 'creator'])
            ->whereIn('id', $daringInfoIds)
            ->get();
        
        $data = [
            'daringInfos' => $daringInfos,
            'type' => $type,
            'generated_at' => now(),
            'generated_by' => auth()->user()->name ?? 'System',
        ];
        
        $pdf = Pdf::loadView('pdf.daring-info-batch', $data);
        $pdf->setPaper('A4', 'portrait');
        
        return $pdf;
    }
    
    public function savePdf(AdminDaringInfo $daringInfo, string $type = 'detailed'): string
    {
        $pdf = $this->generatePdf($daringInfo, $type);
        $filename = $this->generateFilename($daringInfo, $type);
        $path = "exports/daring-info/{$filename}";
        
        Storage::disk('public')->put($path, $pdf->output());
        
        return $path;
    }
    
    private function prepareData(AdminDaringInfo $daringInfo, string $type): array
    {
        return [
            'daringInfo' => $daringInfo,
            'type' => $type,
            'generated_at' => now(),
            'generated_by' => auth()->user()->name ?? 'System',
        ];
    }
    
    private function generateFilename(AdminDaringInfo $daringInfo, string $type): string
    {
        $title = str_replace(' ', '_', $daringInfo->title);
        $timestamp = now()->format('YmdHis');
        
        return "Daring_Info_{$type}_{$title}_{$timestamp}.pdf";
    }
}
```

**Usage in Controller:**

```php
use App\Services\DaringInfoPdfService;

public function exportPdf(Request $request, $id, DaringInfoPdfService $pdfService)
{
    $type = $request->get('type', 'detailed');
    $daringInfo = AdminDaringInfo::with(['mataKuliah.dosen', 'creator'])->findOrFail($id);
    
    $pdf = $pdfService->generatePdf($daringInfo, $type);
    $filename = $pdfService->generateFilename($daringInfo, $type);
    
    return $pdf->download($filename);
}
```

### 4.2 Email Export Feature

**Add Route:**

```php
Route::post('admin/notification-center/daring/{id}/email-export', 
    [\App\Http\Controllers\Admin\DaringInfoController::class, 'emailExport'])
    ->name('admin.notification-center.daring.email-export');
```

**Controller Method:**

```php
use Illuminate\Support\Facades\Mail;
use App\Mail\DaringInfoExportMail;

public function emailExport(Request $request, $id, DaringInfoPdfService $pdfService)
{
    $validated = $request->validate([
        'email' => 'required|email',
        'type' => 'required|in:summary,detailed',
        'message' => 'nullable|string|max:500',
    ]);
    
    $daringInfo = AdminDaringInfo::with(['mataKuliah.dosen', 'creator'])->findOrFail($id);
    
    // Generate PDF
    $pdf = $pdfService->generatePdf($daringInfo, $validated['type']);
    $filename = $pdfService->generateFilename($daringInfo, $validated['type']);
    
    // Send email
    Mail::to($validated['email'])->send(
        new DaringInfoExportMail($daringInfo, $pdf->output(), $filename, $validated['message'] ?? null)
    );
    
    return back()->with('success', 'PDF berhasil dikirim ke ' . $validated['email']);
}
```

**Mail Class: `app/Mail/DaringInfoExportMail.php`**

```php
<?php

namespace App\Mail;

use App\Models\AdminDaringInfo;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class DaringInfoExportMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public AdminDaringInfo $daringInfo,
        public string $pdfContent,
        public string $filename,
        public ?string $customMessage = null
    ) {}

    public function build()
    {
        return $this->subject('Export PDF - ' . $this->daringInfo->title)
            ->markdown('emails.daring-info-export')
            ->attachData($this->pdfContent, $this->filename, [
                'mime' => 'application/pdf',
            ]);
    }
}
```

**Email Template: `resources/views/emails/daring-info-export.blade.php`**

```blade
@component('mail::message')
# Export Informasi Daring UNPAM

Berikut adalah export PDF untuk informasi daring:

**{{ $daringInfo->title }}**  
Mata Kuliah: {{ $daringInfo->mata_kuliah->nama }}

@if($customMessage)
---
{{ $customMessage }}
---
@endif

File PDF terlampir pada email ini.

@component('mail::button', ['url' => config('app.url')])
Buka SASMITA
@endcomponent

Terima kasih,<br>
{{ config('app.name') }}
@endcomponent
```

### 4.3 Scheduled Export (Advanced)

**Migration: `create_scheduled_exports_table.php`**

```php
Schema::create('scheduled_exports', function (Blueprint $table) {
    $table->id();
    $table->foreignId('daring_info_id')->constrained('admin_daring_infos')->onDelete('cascade');
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->string('email');
    $table->enum('type', ['summary', 'detailed']);
    $table->enum('frequency', ['once', 'daily', 'weekly', 'monthly']);
    $table->timestamp('scheduled_at');
    $table->timestamp('last_sent_at')->nullable();
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});
```

**Command: `app/Console/Commands/ProcessScheduledExports.php`**

```php
<?php

namespace App\Console\Commands;

use App\Models\ScheduledExport;
use App\Services\DaringInfoPdfService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class ProcessScheduledExports extends Command
{
    protected $signature = 'exports:process-scheduled';
    protected $description = 'Process scheduled PDF exports';

    public function handle(DaringInfoPdfService $pdfService)
    {
        $exports = ScheduledExport::with('daringInfo')
            ->where('is_active', true)
            ->where('scheduled_at', '<=', now())
            ->get();

        foreach ($exports as $export) {
            try {
                $pdf = $pdfService->generatePdf($export->daringInfo, $export->type);
                $filename = $pdfService->generateFilename($export->daringInfo, $export->type);
                
                Mail::to($export->email)->send(
                    new \App\Mail\DaringInfoExportMail(
                        $export->daringInfo,
                        $pdf->output(),
                        $filename
                    )
                );
                
                $export->update([
                    'last_sent_at' => now(),
                    'scheduled_at' => $this->calculateNextSchedule($export),
                ]);
                
                $this->info("Sent export to {$export->email}");
            } catch (\Exception $e) {
                $this->error("Failed to send export: {$e->getMessage()}");
            }
        }
    }
    
    private function calculateNextSchedule(ScheduledExport $export): ?\Carbon\Carbon
    {
        if ($export->frequency === 'once') {
            $export->update(['is_active' => false]);
            return null;
        }
        
        return match($export->frequency) {
            'daily' => now()->addDay(),
            'weekly' => now()->addWeek(),
            'monthly' => now()->addMonth(),
            default => null,
        };
    }
}
```

**Register in `app/Console/Kernel.php`:**

```php
protected function schedule(Schedule $schedule)
{
    $schedule->command('exports:process-scheduled')->hourly();
}
```



---

## 📋 PART 5: TESTING & QUALITY ASSURANCE

### 5.1 Manual Testing Checklist

**Preview Page:**
- [ ] Access preview page from list (Lihat Detail button)
- [ ] All information displayed correctly
- [ ] Status badges show correct state
- [ ] Links are clickable and open in new tab
- [ ] Back button navigates correctly
- [ ] Edit button opens edit modal
- [ ] Publish/Unpublish toggle works
- [ ] Mobile responsive layout
- [ ] Dark mode compatibility

**PDF Export - Summary:**
- [ ] Logo UNPAM displayed correctly
- [ ] Logo SASMITA displayed correctly
- [ ] Header gradient renders properly
- [ ] All basic information included
- [ ] Links formatted correctly
- [ ] Footer with page numbers
- [ ] File downloads successfully
- [ ] Filename format correct
- [ ] PDF opens without errors

**PDF Export - Detailed:**
- [ ] Cover page with both logos
- [ ] Watermark visible (subtle)
- [ ] Table of contents (if enabled)
- [ ] All sections included
- [ ] Instructions formatted properly
- [ ] Tables styled correctly
- [ ] Status badges colored correctly
- [ ] Signature section included
- [ ] Multi-page layout correct
- [ ] Page breaks appropriate

**Batch Export:**
- [ ] Multiple items can be selected
- [ ] Batch export button appears
- [ ] Cover page with item count
- [ ] Table of contents generated
- [ ] Each item on separate page
- [ ] All items included
- [ ] Consistent formatting
- [ ] File size reasonable

**Email Export:**
- [ ] Email validation works
- [ ] PDF attached correctly
- [ ] Email template renders
- [ ] Custom message included
- [ ] Recipient receives email
- [ ] PDF opens from attachment

### 5.2 Performance Testing

```bash
# Test PDF generation time
php artisan tinker
>>> $info = \App\Models\AdminDaringInfo::first();
>>> $service = app(\App\Services\DaringInfoPdfService::class);
>>> $start = microtime(true);
>>> $pdf = $service->generatePdf($info, 'detailed');
>>> $end = microtime(true);
>>> echo "Generation time: " . ($end - $start) . " seconds";

# Expected: < 3 seconds for detailed PDF
```

**Optimization Tips:**
- Cache logo images in memory
- Use optimized PNG images (compressed)
- Minimize inline styles (use classes)
- Limit image resolution to 150 DPI
- Use font subsetting for smaller file size

### 5.3 Browser Compatibility

Test PDF download in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS/iOS)
- [ ] Mobile browsers

### 5.4 Error Handling Tests

```php
// Test missing logo files
// Test invalid daring info ID
// Test empty data fields
// Test very long text content
// Test special characters in title
// Test concurrent exports
```

---

## 📋 PART 6: DEPLOYMENT & MAINTENANCE

### 6.1 Pre-Deployment Checklist

- [ ] All logo files uploaded to `public/assets/logos/`
- [ ] Logo permissions set correctly (644)
- [ ] DomPDF package installed
- [ ] Config published and customized
- [ ] Storage link created (`php artisan storage:link`)
- [ ] Fonts directory writable
- [ ] PDF templates tested locally
- [ ] Email configuration verified
- [ ] Queue worker running (for scheduled exports)

### 6.2 Logo File Requirements

**Create these files:**

```bash
public/
└── assets/
    └── logos/
        ├── unpam-logo.png          # 200x200px, transparent BG
        ├── sasmita-logo.png        # 200x200px, transparent BG
        └── unpam-watermark.png     # 800x800px, 10% opacity
```

**Logo Specifications:**
- Format: PNG with alpha channel
- UNPAM Logo: Official university logo
- SASMITA Logo: System branding logo
- Watermark: Large, very transparent version
- Color mode: RGB
- Resolution: 72-150 DPI (web optimized)

### 6.3 Environment Variables

**Add to `.env`:**

```env
# PDF Export Settings
PDF_FONT_DIR="${storage_path}/fonts"
PDF_FONT_CACHE="${storage_path}/fonts"
PDF_DPI=96
PDF_ENABLE_REMOTE=true

# Email Settings (for export feature)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@unpam.ac.id
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@unpam.ac.id
MAIL_FROM_NAME="UNPAM SASMITA"
```

### 6.4 Deployment Commands

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
composer install --no-dev --optimize-autoloader

# 3. Run migrations (if scheduled exports enabled)
php artisan migrate --force

# 4. Clear caches
php artisan cache:clear
php artisan config:clear
php artisan view:clear

# 5. Optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 6. Create storage link (if not exists)
php artisan storage:link

# 7. Set permissions
chmod -R 755 storage
chmod -R 755 bootstrap/cache
chmod -R 755 public/assets

# 8. Restart queue worker (if using scheduled exports)
php artisan queue:restart
```

### 6.5 Monitoring & Logs

**Monitor these:**
- PDF generation errors: `storage/logs/laravel.log`
- Email sending failures: Check mail logs
- Queue job failures: `failed_jobs` table
- Storage usage: `storage/app/public/exports/`

**Cleanup Old Exports:**

```php
// Create scheduled task
// app/Console/Kernel.php

protected function schedule(Schedule $schedule)
{
    // Clean up exports older than 30 days
    $schedule->call(function () {
        Storage::disk('public')->deleteDirectory('exports/daring-info');
    })->monthly();
}
```

---

## 📋 PART 7: ADVANCED CUSTOMIZATIONS

### 7.1 Custom PDF Themes

**Create theme variants:**

```php
// app/Services/PdfThemeService.php

class PdfThemeService
{
    public function getTheme(string $themeName): array
    {
        return match($themeName) {
            'default' => [
                'primary_color' => '#4F46E5',
                'secondary_color' => '#7C3AED',
                'accent_color' => '#EC4899',
            ],
            'unpam_official' => [
                'primary_color' => '#003366',
                'secondary_color' => '#0066CC',
                'accent_color' => '#FF6600',
            ],
            'minimal' => [
                'primary_color' => '#1e293b',
                'secondary_color' => '#475569',
                'accent_color' => '#64748b',
            ],
            default => $this->getTheme('default'),
        };
    }
}
```

### 7.2 QR Code Integration

**Add QR code to PDF for verification:**

```bash
composer require simplesoftwareio/simple-qrcode
```

```php
// In PDF template
use SimpleSoftwareIO\QrCode\Facades\QrCode;

$qrCode = QrCode::size(150)
    ->format('png')
    ->generate(route('admin.notification-center.daring.preview', $daringInfo->id));

// In blade template
<img src="data:image/png;base64,{{ base64_encode($qrCode) }}" alt="QR Code">
```

### 7.3 Digital Signature

**Add digital signature to PDF:**

```php
// Using TCPDF for digital signatures
composer require tecnickcom/tcpdf

// Implementation in service
public function signPdf($pdfPath, $certificatePath, $privateKeyPath)
{
    $pdf = new \TCPDF();
    // Add signature logic
    return $pdf;
}
```

---

## 🎯 FINAL SUMMARY

### What We've Built:

1. **Detail Preview Page** ✅
   - Full information display
   - Status indicators
   - Action buttons (Edit, Publish, Export)
   - Mobile responsive
   - Dark mode support

2. **Export PDF - Summary** ✅
   - 1-2 pages compact format
   - Logo UNPAM & SASMITA
   - Essential information only
   - Quick generation

3. **Export PDF - Detailed** ✅
   - Professional multi-page layout
   - Cover page with logos
   - Watermark background
   - Complete information
   - Signature section
   - Advanced styling

4. **Batch Export** ✅
   - Multiple items in one PDF
   - Table of contents
   - Consistent formatting
   - Efficient generation

5. **Email Export** ✅
   - Send PDF via email
   - Custom message support
   - Professional email template

6. **Scheduled Export** ✅ (Optional)
   - Recurring exports
   - Email delivery
   - Flexible scheduling

### Key Features:

- 🎨 **Professional Design** with UNPAM & SASMITA branding
- 📱 **Mobile Responsive** preview and controls
- 🌙 **Dark Mode** compatible
- 🔒 **Secure** with proper authorization
- ⚡ **Performant** with optimized generation
- 📧 **Email Integration** for delivery
- 🔄 **Batch Processing** for multiple exports
- 📊 **Multiple Formats** (Summary, Detailed, Batch)

### Success Metrics:

- PDF generation time: < 3 seconds
- File size: < 2MB per document
- Email delivery: < 10 seconds
- Preview page load: < 1 second
- Mobile usability: 100% functional

---

## 📞 SUPPORT & TROUBLESHOOTING

### Common Issues:

**1. Logo not showing in PDF:**
```bash
# Check file exists
ls -la public/assets/logos/

# Check permissions
chmod 644 public/assets/logos/*.png

# Verify path in blade template
{{ public_path('assets/logos/unpam-logo.png') }}
```

**2. PDF generation timeout:**
```php
// Increase timeout in config/dompdf.php
'timeout' => 120, // seconds

// Or in controller
set_time_limit(120);
```

**3. Fonts not rendering:**
```bash
# Clear font cache
rm -rf storage/fonts/*

# Regenerate
php artisan config:clear
```

**4. Email not sending:**
```bash
# Test email configuration
php artisan tinker
>>> Mail::raw('Test', function($msg) { $msg->to('test@example.com')->subject('Test'); });

# Check queue
php artisan queue:work --tries=3
```

---

## 🚀 READY TO IMPLEMENT!

Prompt ini sudah sangat lengkap dan siap digunakan untuk implementasi fitur Detail Preview dan Export PDF yang sangat advanced dengan logo UNPAM dan SASMITA!

**Happy Coding! 🎉**

