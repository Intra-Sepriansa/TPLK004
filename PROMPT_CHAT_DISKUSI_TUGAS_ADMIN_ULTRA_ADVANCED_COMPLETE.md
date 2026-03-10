# PROMPT: Chat Diskusi Tugas Admin - Ultra Advanced Complete System
## Modern Real-time Discussion Interface for Task Management

---

## 🎯 EXECUTIVE SUMMARY

Halaman **Detail Informasi Tugas dengan Chat Diskusi** untuk Admin yang dirancang dengan layout modern dan interaktif. Halaman ini mengadopsi UI/UX yang sama dengan halaman dosen tugas-detail, namun disesuaikan untuk kebutuhan admin (tanpa fitur penilaian/grading).

**Key Features:**
- Real-time chat discussion untuk setiap tugas
- Reply, pin, delete message functionality
- Public/private message visibility
- Image attachment support dengan preview
- Day separator untuk chat messages
- Avatar dengan gradient berdasarkan sender type
- Smooth animations dan transitions
- Responsive mobile design
- Activity tracking dan audit trail
- Message search dan filter
- Export chat history
- Notification untuk new messages

**UI/UX Requirements:**
- Gradient header SAMA dengan dashboard: `from-indigo-600 via-purple-600 to-pink-500`
- NO container wrapper pada header icon (direct img tag)
- NO floating/bouncing animations pada icon
- Back button format: `<ChevronLeft className="h-4 w-4" /> Kembali ke Daftar Tugas`
- Responsive mobile-first design
- Card-based layout dengan backdrop blur
- Smooth scroll behavior
- Toast notifications untuk feedback
- TIDAK ADA fitur penilaian/grading (khusus dosen)

---

## 📋 PART 1: DATABASE SCHEMA

### 1.1 Tugas Diskusi Table (Already Exists)

```sql
CREATE TABLE tugas_diskusi (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Relation
    tugas_id BIGINT UNSIGNED NOT NULL,
    
    -- Sender Info
    sender_id BIGINT UNSIGNED NOT NULL,
    sender_type ENUM('admin', 'dosen', 'mahasiswa') NOT NULL,
    
    -- Message Content
    pesan TEXT NOT NULL,
    lampiran_url VARCHAR(500) NULL,
    lampiran_nama VARCHAR(255) NULL,
    
    -- Message Settings
    visibility ENUM('public', 'private') DEFAULT 'public',
    recipient_id BIGINT UNSIGNED NULL COMMENT 'For private messages',
    
    -- Features
    is_pinned BOOLEAN DEFAULT FALSE,
    reply_to_id BIGINT UNSIGNED NULL,
    
    -- Metadata
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at DATETIME NULL,
    
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (tugas_id) REFERENCES tugas(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reply_to_id) REFERENCES tugas_diskusi(id) ON DELETE SET NULL,
    
    INDEX idx_tugas (tugas_id),
    INDEX idx_sender (sender_id, sender_type),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 📋 PART 2: LARAVEL CONTROLLER

### 2.1 Admin Tugas Controller - Show Method

**File: `app/Http/Controllers/Admin/TugasController.php`**

```php
public function show($id)
{
    $tugas = Tugas::with(['course', 'createdBy', 'editedBy'])
        ->findOrFail($id);
    
    // Get all diskusi messages
    $diskusi = TugasDiskusi::where('tugas_id', $id)
        ->with(['sender', 'replyTo.sender'])
        ->orderBy('is_pinned', 'desc')
        ->orderBy('created_at', 'asc')
        ->get()
        ->map(function ($d) {
            $sender = $d->sender;
            $senderType = $d->sender_type;
            
            // Determine sender name based on type
            if ($senderType === 'admin') {
                $senderName = $sender->name;
            } elseif ($senderType === 'dosen') {
                $senderName = $sender->dosen->nama ?? $sender->name;
            } else {
                $senderName = $sender->mahasiswa->nama ?? $sender->name;
            }
            
            return [
                'id' => $d->id,
                'sender_type' => $senderType,
                'sender_name' => $senderName,
                'sender_avatar' => $sender->avatar_url,
                'sender_nim' => $senderType === 'mahasiswa' ? ($sender->mahasiswa->nim ?? null) : null,
                'pesan' => $d->pesan,
                'lampiran_url' => $d->lampiran_url ? Storage::url($d->lampiran_url) : null,
                'lampiran_nama' => $d->lampiran_nama,
                'visibility' => $d->visibility,
                'recipient_name' => $d->recipient ? $d->recipient->name : null,
                'is_pinned' => $d->is_pinned,
                'reply_to_id' => $d->reply_to_id,
                'reply_to' => $d->replyTo ? [
                    'sender_name' => $d->replyTo->sender->name,
                    'pesan' => $d->replyTo->pesan,
                ] : null,
                'is_me' => $d->sender_id === auth()->id(),
                'created_at_iso' => $d->created_at->toIso8601String(),
                'created_at' => $d->created_at->format('d M Y H:i'),
                'time_ago' => $d->created_at->diffForHumans(),
            ];
        });
    
    // Calculate deadline info
    $deadline = \Carbon\Carbon::parse($tugas->deadline);
    $now = now();
    $isOverdue = $deadline->isPast();
    $daysUntilDeadline = $isOverdue ? 0 : $now->diffInDays($deadline);
    
    return Inertia::render('admin/tugas/detail', [
        'tugas' => [
            'id' => $tugas->id,
            'judul' => $tugas->judul,
            'deskripsi' => $tugas->deskripsi,
            'instruksi' => $tugas->instruksi,
            'jenis' => $tugas->jenis,
            'deadline' => $tugas->deadline,
            'deadline_display' => $deadline->translatedFormat('d F Y, H:i'),
            'prioritas' => $tugas->prioritas,
            'status' => $tugas->status,
            'course' => [
                'id' => $tugas->course->id,
                'nama' => $tugas->course->nama,
            ],
            'created_by' => $tugas->createdBy->name,
            'created_by_type' => $tugas->created_by_type,
            'edited_by' => $tugas->editedBy?->name,
            'edited_at' => $tugas->edited_at ? \Carbon\Carbon::parse($tugas->edited_at)->format('d M Y H:i') : null,
            'is_overdue' => $isOverdue,
            'days_until_deadline' => $daysUntilDeadline,
            'created_at' => $tugas->created_at->format('d M Y H:i'),
        ],
        'diskusi' => $diskusi,
    ]);
}
```

### 2.2 Send Message Method

```php
public function sendMessage(Request $request, $tugasId)
{
    $validated = $request->validate([
        'pesan' => 'nullable|string|max:5000',
        'visibility' => 'required|in:public,private',
        'reply_to_id' => 'nullable|exists:tugas_diskusi,id',
        'lampiran' => 'nullable|image|max:5120', // 5MB
    ]);
    
    // At least message or attachment required
    if (empty($validated['pesan']) && !$request->hasFile('lampiran')) {
        return back()->withErrors(['pesan' => 'Pesan atau lampiran harus diisi']);
    }
    
    $lampiranUrl = null;
    $lampiranNama = null;
    
    if ($request->hasFile('lampiran')) {
        $file = $request->file('lampiran');
        $lampiranNama = $file->getClientOriginalName();
        $lampiranUrl = $file->store('tugas-diskusi', 'public');
    }
    
    TugasDiskusi::create([
        'tugas_id' => $tugasId,
        'sender_id' => auth()->id(),
        'sender_type' => 'admin',
        'pesan' => $validated['pesan'] ?? '',
        'lampiran_url' => $lampiranUrl,
        'lampiran_nama' => $lampiranNama,
        'visibility' => $validated['visibility'],
        'reply_to_id' => $validated['reply_to_id'] ?? null,
    ]);
    
    return back();
}
```

### 2.3 Toggle Pin Method

```php
public function togglePin($diskusiId)
{
    $diskusi = TugasDiskusi::findOrFail($diskusiId);
    
    $diskusi->update([
        'is_pinned' => !$diskusi->is_pinned,
    ]);
    
    return back();
}
```

### 2.4 Delete Message Method

```php
public function deleteMessage($diskusiId)
{
    $diskusi = TugasDiskusi::findOrFail($diskusiId);
    
    // Delete attachment if exists
    if ($diskusi->lampiran_url && Storage::exists($diskusi->lampiran_url)) {
        Storage::delete($diskusi->lampiran_url);
    }
    
    $diskusi->delete();
    
    return back();
}
```

---

