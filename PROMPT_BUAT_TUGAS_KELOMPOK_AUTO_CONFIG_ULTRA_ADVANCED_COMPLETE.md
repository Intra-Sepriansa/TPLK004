# PROMPT: BUAT TUGAS KELOMPOK - AUTO KONFIGURASI & MONITORING ULTRA ADVANCED COMPLETE

## 🎯 OVERVIEW
Fitur pembuatan tugas kelompok dengan sistem konfigurasi otomatis pembagian kelompok berdasarkan jumlah mahasiswa dan jumlah anggota per kelompok, dilengkapi monitoring progres real-time, manajemen anggota kelompok, dan fitur force assign untuk mahasiswa yang belum masuk kelompok.

## 📋 FITUR UTAMA

### 1. AUTO KONFIGURASI KELOMPOK
- Input total mahasiswa (misal: 35 mahasiswa)
- Input jumlah anggota per kelompok (misal: 3-4 orang)
- Sistem otomatis menghitung jumlah kelompok yang akan terbentuk
- Validasi agar tidak ada kelompok yang melebihi batas maksimal
- Preview pembagian kelompok sebelum finalisasi

### 2. MONITORING PROGRES KELOMPOK
- Dashboard monitoring semua kelompok
- Status progres per kelompok (belum mulai, sedang dikerjakan, selesai)
- List anggota per kelompok
- Identifikasi mahasiswa yang belum masuk kelompok
- Filter dan search kelompok

### 3. FORCE ASSIGN MAHASISWA
- Fitur paksa masukkan mahasiswa ke kelompok tertentu
- Untuk situasi mendesak atau mahasiswa terlambat
- Validasi kapasitas kelompok sebelum force assign
- Notifikasi otomatis ke mahasiswa yang di-assign

### 4. MANAJEMEN ANGGOTA KELOMPOK
- Pindah anggota antar kelompok
- Hapus anggota dari kelompok
- Swap anggota antar kelompok
- History perubahan anggota kelompok

## 🗂️ STRUKTUR DATABASE


```sql
-- Table: group_assignments (tugas kelompok)
CREATE TABLE group_assignments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    mata_kuliah_id BIGINT NOT NULL,
    dosen_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline DATETIME NOT NULL,
    max_members_per_group INT NOT NULL DEFAULT 4,
    min_members_per_group INT NOT NULL DEFAULT 3,
    total_students INT NOT NULL,
    total_groups INT NOT NULL,
    auto_config JSON, -- {totalStudents, membersPerGroup, calculatedGroups}
    status ENUM('draft', 'active', 'closed') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mata_kuliah_id) REFERENCES mata_kuliah(id) ON DELETE CASCADE,
    FOREIGN KEY (dosen_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: groups (kelompok)
CREATE TABLE groups (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    group_assignment_id BIGINT NOT NULL,
    group_number INT NOT NULL,
    group_name VARCHAR(100),
    leader_id BIGINT,
    current_members INT DEFAULT 0,
    max_members INT NOT NULL,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    status ENUM('empty', 'incomplete', 'full', 'submitted') DEFAULT 'empty',
    submission_file VARCHAR(255),
    submitted_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (group_assignment_id) REFERENCES group_assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_group_number (group_assignment_id, group_number)
);

-- Table: group_members (anggota kelompok)
CREATE TABLE group_members (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    group_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    is_leader BOOLEAN DEFAULT FALSE,
    join_method ENUM('auto', 'manual', 'force_assigned') DEFAULT 'manual',
    assigned_by BIGINT, -- admin yang force assign
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_student_per_assignment (group_id, student_id)
);

-- Table: group_member_history (history perubahan anggota)
CREATE TABLE group_member_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    group_assignment_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    from_group_id BIGINT,
    to_group_id BIGINT,
    action ENUM('added', 'removed', 'moved', 'force_assigned') NOT NULL,
    performed_by BIGINT NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_assignment_id) REFERENCES group_assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (from_group_id) REFERENCES groups(id) ON DELETE SET NULL,
    FOREIGN KEY (to_group_id) REFERENCES groups(id) ON DELETE SET NULL,
    FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: unassigned_students (mahasiswa belum masuk kelompok)
CREATE VIEW unassigned_students AS
SELECT 
    ga.id as group_assignment_id,
    u.id as student_id,
    u.name as student_name,
    u.nim as student_nim
FROM group_assignments ga
CROSS JOIN users u
LEFT JOIN group_members gm ON gm.student_id = u.id 
    AND gm.group_id IN (SELECT id FROM groups WHERE group_assignment_id = ga.id)
WHERE u.role = 'mahasiswa' 
    AND u.mata_kuliah_id = ga.mata_kuliah_id
    AND gm.id IS NULL;
```

## 🎨 UI/UX DESIGN

### A. HALAMAN BUAT TUGAS KELOMPOK (Admin/Dosen)


```tsx
// Page: /admin/tugas-kelompok/create

interface CreateGroupAssignmentPage {
  sections: [
    {
      title: "Informasi Tugas",
      fields: [
        { label: "Judul Tugas", type: "text", required: true },
        { label: "Deskripsi", type: "textarea", required: true },
        { label: "Mata Kuliah", type: "select", required: true },
        { label: "Deadline", type: "datetime", required: true }
      ]
    },
    {
      title: "Konfigurasi Kelompok Otomatis",
      description: "Sistem akan menghitung jumlah kelompok berdasarkan total mahasiswa",
      fields: [
        {
          label: "Total Mahasiswa",
          type: "number",
          value: "auto-detected from mata_kuliah",
          readonly: true,
          info: "Terdeteksi dari jumlah mahasiswa di mata kuliah"
        },
        {
          label: "Jumlah Anggota per Kelompok",
          type: "range-slider",
          min: 2,
          max: 10,
          defaultMin: 3,
          defaultMax: 4,
          info: "Tentukan minimal dan maksimal anggota per kelompok"
        },
        {
          label: "Jumlah Kelompok (Otomatis)",
          type: "calculated",
          formula: "Math.ceil(totalStudents / maxMembersPerGroup)",
          display: "readonly-badge",
          example: "35 mahasiswa ÷ 4 anggota = 9 kelompok"
        }
      ],
      preview: {
        component: "GroupConfigPreview",
        shows: [
          "Total kelompok yang akan dibuat",
          "Estimasi anggota per kelompok",
          "Kemungkinan kelompok yang kurang anggota",
          "Sisa mahasiswa yang perlu di-assign manual"
        ]
      }
    },
    {
      title: "Preview Pembagian Kelompok",
      component: "GroupDistributionPreview",
      displays: [
        {
          type: "table",
          columns: ["Kelompok", "Kapasitas", "Status", "Estimasi Anggota"],
          rows: "generated based on calculation",
          example: [
            { group: "Kelompok 1", capacity: "0/4", status: "Kosong", estimate: "4 mahasiswa" },
            { group: "Kelompok 2", capacity: "0/4", status: "Kosong", estimate: "4 mahasiswa" },
            { group: "Kelompok 9", capacity: "0/4", status: "Kosong", estimate: "3 mahasiswa (sisa)" }
          ]
        },
        {
          type: "alert",
          variant: "info",
          message: "Kelompok 9 kemungkinan hanya berisi 3 anggota (sisa pembagian)"
        }
      ]
    }
  ],
  actions: [
    {
      label: "Simpan sebagai Draft",
      action: "save-draft",
      variant: "secondary"
    },
    {
      label: "Buat & Aktifkan Tugas",
      action: "create-and-activate",
      variant: "primary",
      confirms: "Yakin membuat tugas kelompok dengan konfigurasi ini?"
    }
  ]
}
```

### B. HALAMAN MONITORING KELOMPOK (Admin)

```tsx
// Page: /admin/tugas-kelompok/{id}/monitoring

interface GroupMonitoringPage {
  header: {
    title: "Monitoring Tugas Kelompok",
    subtitle: "Judul Tugas - Mata Kuliah",
    stats: [
      {
        label: "Total Kelompok",
        value: "10 kelompok",
        icon: "Users"
      },
      {
        label: "Mahasiswa Terdaftar",
        value: "32/35",
        icon: "UserCheck",
        color: "warning"
      },
      {
        label: "Belum Masuk Kelompok",
        value: "3 mahasiswa",
        icon: "UserX",
        color: "danger",
        clickable: true,
        action: "show-unassigned-modal"
      },
      {
        label: "Progres Rata-rata",
        value: "45%",
        icon: "TrendingUp"
      }
    ]
  },
  
  filters: {
    search: "Cari kelompok atau mahasiswa...",
    statusFilter: ["Semua", "Kosong", "Tidak Lengkap", "Penuh", "Sudah Submit"],
    sortBy: ["Nomor Kelompok", "Jumlah Anggota", "Progres", "Status"]
  },

  groupList: {
    type: "grid",
    itemsPerRow: 3,
    card: {
      component: "GroupMonitoringCard",
      structure: {
        header: {
          title: "Kelompok {number}",
          badge: "status-badge",
          actions: [
            { icon: "Edit", tooltip: "Edit Kelompok", action: "edit-group" },
            { icon: "UserPlus", tooltip: "Tambah Anggota", action: "add-member" }
          ]
        },
        body: {
          capacity: {
            display: "progress-bar",
            label: "Anggota: 3/4",
            percentage: 75,
            color: "success"
          },
          members: {
            type: "avatar-list",
            maxShow: 4,
            items: [
              { name: "Ahmad (Ketua)", avatar: "url", badge: "crown" },
              { name: "Budi", avatar: "url" },
              { name: "Citra", avatar: "url" }
            ],
            actions: [
              { icon: "Eye", tooltip: "Lihat Detail", action: "view-members" },
              { icon: "Shuffle", tooltip: "Pindah Anggota", action: "move-member" }
            ]
          },
          progress: {
            label: "Progres Pengerjaan",
            percentage: 60,
            display: "circular-progress",
            color: "primary"
          },
          submission: {
            status: "Belum Submit",
            icon: "Clock",
            color: "muted"
          }
        },
        footer: {
          actions: [
            { label: "Detail", variant: "outline", action: "view-detail" },
            { label: "Kelola Anggota", variant: "primary", action: "manage-members" }
          ]
        }
      }
    }
  },

  unassignedStudentsModal: {
    trigger: "click on 'Belum Masuk Kelompok' stat",
    title: "Mahasiswa Belum Masuk Kelompok",
    subtitle: "3 mahasiswa belum terdaftar di kelompok manapun",
    content: {
      type: "table",
      columns: ["NIM", "Nama", "Status", "Aksi"],
      rows: [
        {
          nim: "2021010001",
          name: "Dewi Sartika",
          status: { badge: "Belum Terdaftar", color: "danger" },
          actions: [
            {
              label: "Force Assign",
              icon: "UserPlus",
              variant: "primary",
              action: "open-force-assign-modal"
            }
          ]
        }
      ]
    },
    bulkActions: {
      label: "Aksi Massal",
      options: [
        { label: "Force Assign ke Kelompok Kosong", action: "bulk-force-assign-empty" },
        { label: "Distribusi Otomatis", action: "auto-distribute" }
      ]
    }
  }
}
```

### C. MODAL FORCE ASSIGN MAHASISWA


```tsx
// Modal: Force Assign Student to Group

interface ForceAssignModal {
  title: "Force Assign Mahasiswa ke Kelompok",
  subtitle: "Masukkan mahasiswa ke kelompok secara paksa (untuk situasi mendesak)",
  
  studentInfo: {
    display: "card",
    fields: [
      { label: "NIM", value: "2021010001" },
      { label: "Nama", value: "Dewi Sartika" },
      { label: "Status", value: "Belum masuk kelompok", badge: "danger" }
    ]
  },

  groupSelection: {
    label: "Pilih Kelompok Tujuan",
    type: "select-with-preview",
    options: [
      {
        value: 1,
        label: "Kelompok 1",
        preview: {
          capacity: "3/4",
          status: "Tersedia 1 slot",
          members: ["Ahmad (Ketua)", "Budi", "Citra"],
          color: "success"
        }
      },
      {
        value: 2,
        label: "Kelompok 2",
        preview: {
          capacity: "4/4",
          status: "Penuh",
          members: ["Eko", "Fitri", "Gita", "Hadi"],
          color: "danger",
          disabled: true
        }
      },
      {
        value: 3,
        label: "Kelompok 3",
        preview: {
          capacity: "2/4",
          status: "Tersedia 2 slot",
          members: ["Indra", "Joko"],
          color: "success"
        }
      }
    ],
    filter: {
      showOnlyAvailable: true,
      sortBy: "most-available-slots"
    }
  },

  reason: {
    label: "Alasan Force Assign (Opsional)",
    type: "textarea",
    placeholder: "Contoh: Mahasiswa terlambat mendaftar karena sakit",
    maxLength: 500
  },

  notification: {
    label: "Kirim Notifikasi",
    type: "checkbox",
    defaultChecked: true,
    description: "Mahasiswa akan menerima notifikasi bahwa mereka telah ditambahkan ke kelompok"
  },

  warnings: [
    {
      type: "info",
      message: "Mahasiswa akan langsung masuk ke kelompok tanpa perlu persetujuan"
    },
    {
      type: "warning",
      message: "Pastikan kelompok yang dipilih masih memiliki slot tersedia",
      condition: "if selected group is nearly full"
    }
  ],

  actions: [
    { label: "Batal", variant: "outline", action: "close" },
    { 
      label: "Force Assign Sekarang", 
      variant: "primary", 
      icon: "UserPlus",
      action: "force-assign",
      confirms: "Yakin memasukkan mahasiswa ini ke kelompok yang dipilih?"
    }
  ]
}
```

### D. HALAMAN DETAIL KELOMPOK & KELOLA ANGGOTA

```tsx
// Page: /admin/tugas-kelompok/{assignmentId}/kelompok/{groupId}

interface GroupDetailPage {
  header: {
    breadcrumb: ["Tugas Kelompok", "Monitoring", "Kelompok 1"],
    title: "Kelompok 1",
    subtitle: "Tugas: Analisis Sistem Informasi",
    badges: [
      { label: "3/4 Anggota", color: "warning" },
      { label: "Progres 60%", color: "primary" }
    ]
  },

  tabs: [
    {
      id: "members",
      label: "Anggota Kelompok",
      icon: "Users",
      content: {
        component: "MemberManagement",
        structure: {
          stats: {
            current: 3,
            max: 4,
            available: 1,
            display: "progress-bar"
          },
          
          memberList: {
            type: "table",
            columns: ["Mahasiswa", "Role", "Bergabung", "Metode", "Aksi"],
            rows: [
              {
                student: {
                  avatar: "url",
                  name: "Ahmad Fauzi",
                  nim: "2021010001",
                  badge: "Ketua"
                },
                role: { badge: "Leader", icon: "Crown", color: "gold" },
                joinedAt: "10 Mar 2026, 14:30",
                method: { badge: "Manual", color: "primary" },
                actions: [
                  { 
                    icon: "ArrowRight", 
                    tooltip: "Pindah ke Kelompok Lain",
                    action: "move-to-other-group",
                    modal: "MoveStudentModal"
                  },
                  { 
                    icon: "Trash", 
                    tooltip: "Keluarkan dari Kelompok",
                    action: "remove-from-group",
                    confirms: "Yakin mengeluarkan mahasiswa ini?",
                    color: "danger"
                  }
                ]
              },
              {
                student: {
                  avatar: "url",
                  name: "Budi Santoso",
                  nim: "2021010002"
                },
                role: { badge: "Member", color: "default" },
                joinedAt: "10 Mar 2026, 15:00",
                method: { badge: "Manual", color: "primary" },
                actions: [
                  { 
                    icon: "Crown", 
                    tooltip: "Jadikan Ketua",
                    action: "make-leader"
                  },
                  { 
                    icon: "ArrowRight", 
                    tooltip: "Pindah ke Kelompok Lain",
                    action: "move-to-other-group"
                  },
                  { 
                    icon: "Trash", 
                    tooltip: "Keluarkan dari Kelompok",
                    action: "remove-from-group",
                    color: "danger"
                  }
                ]
              },
              {
                student: {
                  avatar: "url",
                  name: "Citra Dewi",
                  nim: "2021010003"
                },
                role: { badge: "Member", color: "default" },
                joinedAt: "11 Mar 2026, 09:15",
                method: { badge: "Force Assigned", color: "warning", icon: "AlertCircle" },
                actions: "same as above"
              }
            ]
          },

          addMemberSection: {
            title: "Tambah Anggota Baru",
            button: {
              label: "Tambah Anggota",
              icon: "UserPlus",
              variant: "outline",
              action: "open-add-member-modal",
              disabled: "if group is full"
            },
            info: "Slot tersedia: 1/4"
          },

          bulkActions: {
            label: "Aksi Massal",
            options: [
              { label: "Pindahkan Semua ke Kelompok Lain", action: "bulk-move" },
              { label: "Kosongkan Kelompok", action: "clear-group", confirms: true }
            ]
          }
        }
      }
    },
    {
      id: "progress",
      label: "Progres Pengerjaan",
      icon: "TrendingUp",
      content: {
        component: "GroupProgress",
        displays: [
          {
            type: "circular-progress",
            percentage: 60,
            label: "Progres Keseluruhan"
          },
          {
            type: "timeline",
            items: [
              { date: "10 Mar 2026", event: "Kelompok dibentuk", status: "completed" },
              { date: "11 Mar 2026", event: "Anggota lengkap", status: "completed" },
              { date: "12 Mar 2026", event: "Mulai pengerjaan", status: "in-progress" },
              { date: "20 Mar 2026", event: "Deadline submission", status: "upcoming" }
            ]
          }
        ]
      }
    },
    {
      id: "history",
      label: "Riwayat Perubahan",
      icon: "History",
      content: {
        component: "GroupHistory",
        type: "timeline",
        items: [
          {
            timestamp: "11 Mar 2026, 09:15",
            action: "Force Assigned",
            description: "Citra Dewi ditambahkan ke kelompok oleh Admin",
            performer: "Admin Sistem",
            icon: "UserPlus",
            color: "warning"
          },
          {
            timestamp: "10 Mar 2026, 15:00",
            action: "Member Joined",
            description: "Budi Santoso bergabung ke kelompok",
            performer: "Budi Santoso",
            icon: "UserCheck",
            color: "success"
          }
        ]
      }
    }
  ]
}
```

### E. MODAL PINDAH ANGGOTA KELOMPOK


```tsx
// Modal: Move Student to Another Group

interface MoveStudentModal {
  title: "Pindahkan Anggota ke Kelompok Lain",
  
  currentInfo: {
    label: "Mahasiswa yang akan dipindah",
    display: "card",
    data: {
      name: "Budi Santoso",
      nim: "2021010002",
      currentGroup: "Kelompok 1",
      role: "Member"
    }
  },

  targetGroupSelection: {
    label: "Pilih Kelompok Tujuan",
    type: "radio-cards",
    options: [
      {
        id: 2,
        label: "Kelompok 2",
        capacity: "2/4",
        status: "Tersedia 2 slot",
        members: ["Eko", "Fitri"],
        color: "success",
        recommended: true,
        badge: "Direkomendasikan"
      },
      {
        id: 3,
        label: "Kelompok 3",
        capacity: "3/4",
        status: "Tersedia 1 slot",
        members: ["Indra", "Joko", "Kiki"],
        color: "success"
      },
      {
        id: 4,
        label: "Kelompok 4",
        capacity: "4/4",
        status: "Penuh",
        members: ["Lina", "Maya", "Nina", "Oki"],
        color: "danger",
        disabled: true
      }
    ],
    filter: {
      showOnlyAvailable: true,
      sortBy: "most-available-slots"
    }
  },

  swapOption: {
    label: "Atau Tukar dengan Anggota Lain",
    type: "toggle",
    description: "Tukar posisi dengan anggota dari kelompok lain",
    whenEnabled: {
      selectStudent: {
        label: "Pilih mahasiswa untuk ditukar",
        type: "select",
        options: "students from other groups",
        preview: {
          shows: "student info and their current group"
        }
      },
      result: {
        display: "swap-preview",
        shows: [
          "Budi Santoso: Kelompok 1 → Kelompok 2",
          "Eko Prasetyo: Kelompok 2 → Kelompok 1"
        ]
      }
    }
  },

  reason: {
    label: "Alasan Pemindahan (Opsional)",
    type: "textarea",
    placeholder: "Contoh: Penyesuaian komposisi kelompok"
  },

  notifications: {
    label: "Notifikasi",
    options: [
      { 
        label: "Notifikasi mahasiswa yang dipindah", 
        checked: true 
      },
      { 
        label: "Notifikasi anggota kelompok asal", 
        checked: true 
      },
      { 
        label: "Notifikasi anggota kelompok tujuan", 
        checked: true 
      }
    ]
  },

  actions: [
    { label: "Batal", variant: "outline", action: "close" },
    { 
      label: "Pindahkan Sekarang", 
      variant: "primary",
      icon: "ArrowRight",
      action: "move-student",
      confirms: "Yakin memindahkan mahasiswa ini ke kelompok yang dipilih?"
    }
  ]
}
```

## 🔧 BACKEND IMPLEMENTATION

### A. Controller: GroupAssignmentController.php

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GroupAssignment;
use App\Models\Group;
use App\Models\GroupMember;
use App\Models\User;
use App\Models\MataKuliah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class GroupAssignmentController extends Controller
{
    /**
     * Create new group assignment with auto configuration
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'mata_kuliah_id' => 'required|exists:mata_kuliah,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'deadline' => 'required|date|after:now',
            'min_members_per_group' => 'required|integer|min:2|max:10',
            'max_members_per_group' => 'required|integer|min:2|max:10|gte:min_members_per_group',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            // Get total students in mata kuliah
            $totalStudents = User::where('role', 'mahasiswa')
                ->where('mata_kuliah_id', $request->mata_kuliah_id)
                ->count();

            // Calculate total groups needed
            $totalGroups = (int) ceil($totalStudents / $request->max_members_per_group);

            // Create group assignment
            $groupAssignment = GroupAssignment::create([
                'mata_kuliah_id' => $request->mata_kuliah_id,
                'dosen_id' => auth()->id(),
                'title' => $request->title,
                'description' => $request->description,
                'deadline' => $request->deadline,
                'min_members_per_group' => $request->min_members_per_group,
                'max_members_per_group' => $request->max_members_per_group,
                'total_students' => $totalStudents,
                'total_groups' => $totalGroups,
                'auto_config' => json_encode([
                    'totalStudents' => $totalStudents,
                    'minMembers' => $request->min_members_per_group,
                    'maxMembers' => $request->max_members_per_group,
                    'calculatedGroups' => $totalGroups,
                    'estimatedLastGroupMembers' => $totalStudents % $request->max_members_per_group ?: $request->max_members_per_group
                ]),
                'status' => $request->activate ? 'active' : 'draft'
            ]);

            // Auto create groups
            for ($i = 1; $i <= $totalGroups; $i++) {
                Group::create([
                    'group_assignment_id' => $groupAssignment->id,
                    'group_number' => $i,
                    'group_name' => "Kelompok {$i}",
                    'max_members' => $request->max_members_per_group,
                    'current_members' => 0,
                    'status' => 'empty'
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Tugas kelompok berhasil dibuat',
                'data' => $groupAssignment->load('groups')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat tugas kelompok: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get monitoring data for group assignment
     */
    public function monitoring($id)
    {
        $groupAssignment = GroupAssignment::with([
            'groups.members.student',
            'groups.leader',
            'mataKuliah'
        ])->findOrFail($id);

        // Get unassigned students
        $assignedStudentIds = GroupMember::whereHas('group', function($q) use ($id) {
            $q->where('group_assignment_id', $id);
        })->pluck('student_id');

        $unassignedStudents = User::where('role', 'mahasiswa')
            ->where('mata_kuliah_id', $groupAssignment->mata_kuliah_id)
            ->whereNotIn('id', $assignedStudentIds)
            ->get();

        // Calculate statistics
        $stats = [
            'total_groups' => $groupAssignment->groups->count(),
            'total_students' => $groupAssignment->total_students,
            'assigned_students' => $assignedStudentIds->count(),
            'unassigned_students' => $unassignedStudents->count(),
            'average_progress' => $groupAssignment->groups->avg('progress_percentage'),
            'groups_by_status' => [
                'empty' => $groupAssignment->groups->where('status', 'empty')->count(),
                'incomplete' => $groupAssignment->groups->where('status', 'incomplete')->count(),
                'full' => $groupAssignment->groups->where('status', 'full')->count(),
                'submitted' => $groupAssignment->groups->where('status', 'submitted')->count(),
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'assignment' => $groupAssignment,
                'groups' => $groupAssignment->groups,
                'unassigned_students' => $unassignedStudents,
                'stats' => $stats
            ]
        ]);
    }

    /**
     * Force assign student to group
     */
    public function forceAssignStudent(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:users,id',
            'group_id' => 'required|exists:groups,id',
            'reason' => 'nullable|string|max:500',
            'send_notification' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $group = Group::with('groupAssignment')->findOrFail($request->group_id);
            
            // Check if group is full
            if ($group->current_members >= $group->max_members) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kelompok sudah penuh'
                ], 400);
            }

            // Check if student already in a group for this assignment
            $existingMember = GroupMember::whereHas('group', function($q) use ($group) {
                $q->where('group_assignment_id', $group->group_assignment_id);
            })->where('student_id', $request->student_id)->first();

            if ($existingMember) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mahasiswa sudah terdaftar di kelompok lain'
                ], 400);
            }

            // Add student to group
            $groupMember = GroupMember::create([
                'group_id' => $request->group_id,
                'student_id' => $request->student_id,
                'is_leader' => false,
                'join_method' => 'force_assigned',
                'assigned_by' => auth()->id()
            ]);

            // Update group member count and status
            $group->increment('current_members');
            $group->update([
                'status' => $group->current_members >= $group->max_members ? 'full' : 
                           ($group->current_members > 0 ? 'incomplete' : 'empty')
            ]);

            // Log history
            DB::table('group_member_history')->insert([
                'group_assignment_id' => $group->group_assignment_id,
                'student_id' => $request->student_id,
                'to_group_id' => $request->group_id,
                'action' => 'force_assigned',
                'performed_by' => auth()->id(),
                'reason' => $request->reason,
                'created_at' => now()
            ]);

            // Send notification if requested
            if ($request->send_notification) {
                $student = User::find($request->student_id);
                // TODO: Implement notification logic
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Mahasiswa berhasil ditambahkan ke kelompok',
                'data' => $groupMember->load('student', 'group')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan mahasiswa: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Move student to another group
     */
    public function moveStudent(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:users,id',
            'from_group_id' => 'required|exists:groups,id',
            'to_group_id' => 'required|exists:groups,id|different:from_group_id',
            'reason' => 'nullable|string|max:500',
            'notify_student' => 'boolean',
            'notify_source_group' => 'boolean',
            'notify_target_group' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $fromGroup = Group::findOrFail($request->from_group_id);
            $toGroup = Group::findOrFail($request->to_group_id);

            // Validate groups are from same assignment
            if ($fromGroup->group_assignment_id !== $toGroup->group_assignment_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kelompok harus dari tugas yang sama'
                ], 400);
            }

            // Check if target group is full
            if ($toGroup->current_members >= $toGroup->max_members) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kelompok tujuan sudah penuh'
                ], 400);
            }

            // Find and update group member
            $groupMember = GroupMember::where('group_id', $request->from_group_id)
                ->where('student_id', $request->student_id)
                ->firstOrFail();

            $wasLeader = $groupMember->is_leader;

            // Move to new group
            $groupMember->update([
                'group_id' => $request->to_group_id,
                'is_leader' => false, // Reset leader status
                'join_method' => 'force_assigned'
            ]);

            // Update group member counts
            $fromGroup->decrement('current_members');
            $toGroup->increment('current_members');

            // Update group statuses
            $fromGroup->update([
                'status' => $fromGroup->current_members == 0 ? 'empty' : 
                           ($fromGroup->current_members >= $fromGroup->max_members ? 'full' : 'incomplete'),
                'leader_id' => $wasLeader ? null : $fromGroup->leader_id
            ]);

            $toGroup->update([
                'status' => $toGroup->current_members >= $toGroup->max_members ? 'full' : 'incomplete'
            ]);

            // Log history
            DB::table('group_member_history')->insert([
                'group_assignment_id' => $fromGroup->group_assignment_id,
                'student_id' => $request->student_id,
                'from_group_id' => $request->from_group_id,
                'to_group_id' => $request->to_group_id,
                'action' => 'moved',
                'performed_by' => auth()->id(),
                'reason' => $request->reason,
                'created_at' => now()
            ]);

            // Send notifications
            // TODO: Implement notification logic based on request flags

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Mahasiswa berhasil dipindahkan',
                'data' => [
                    'member' => $groupMember->load('student', 'group'),
                    'from_group' => $fromGroup->fresh(),
                    'to_group' => $toGroup->fresh()
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memindahkan mahasiswa: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove student from group
     */
    public function removeStudent(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:users,id',
            'group_id' => 'required|exists:groups,id',
            'reason' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $group = Group::findOrFail($request->group_id);
            
            $groupMember = GroupMember::where('group_id', $request->group_id)
                ->where('student_id', $request->student_id)
                ->firstOrFail();

            $wasLeader = $groupMember->is_leader;

            // Remove member
            $groupMember->delete();

            // Update group
            $group->decrement('current_members');
            $group->update([
                'status' => $group->current_members == 0 ? 'empty' : 
                           ($group->current_members >= $group->max_members ? 'full' : 'incomplete'),
                'leader_id' => $wasLeader ? null : $group->leader_id
            ]);

            // Log history
            DB::table('group_member_history')->insert([
                'group_assignment_id' => $group->group_assignment_id,
                'student_id' => $request->student_id,
                'from_group_id' => $request->group_id,
                'action' => 'removed',
                'performed_by' => auth()->id(),
                'reason' => $request->reason,
                'created_at' => now()
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Mahasiswa berhasil dikeluarkan dari kelompok',
                'data' => $group->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengeluarkan mahasiswa: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Auto distribute unassigned students
     */
    public function autoDistribute($assignmentId)
    {
        DB::beginTransaction();
        try {
            $groupAssignment = GroupAssignment::with('groups')->findOrFail($assignmentId);

            // Get unassigned students
            $assignedStudentIds = GroupMember::whereHas('group', function($q) use ($assignmentId) {
                $q->where('group_assignment_id', $assignmentId);
            })->pluck('student_id');

            $unassignedStudents = User::where('role', 'mahasiswa')
                ->where('mata_kuliah_id', $groupAssignment->mata_kuliah_id)
                ->whereNotIn('id', $assignedStudentIds)
                ->get();

            if ($unassignedStudents->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada mahasiswa yang perlu didistribusikan'
                ], 400);
            }

            // Get groups with available slots, sorted by least members
            $availableGroups = $groupAssignment->groups()
                ->where('current_members', '<', DB::raw('max_members'))
                ->orderBy('current_members', 'asc')
                ->get();

            if ($availableGroups->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Semua kelompok sudah penuh'
                ], 400);
            }

            $distributed = 0;
            $groupIndex = 0;

            foreach ($unassignedStudents as $student) {
                $group = $availableGroups[$groupIndex];

                // Add student to group
                GroupMember::create([
                    'group_id' => $group->id,
                    'student_id' => $student->id,
                    'is_leader' => false,
                    'join_method' => 'auto',
                    'assigned_by' => auth()->id()
                ]);

                // Update group
                $group->increment('current_members');
                $group->update([
                    'status' => $group->current_members >= $group->max_members ? 'full' : 'incomplete'
                ]);

                // Log history
                DB::table('group_member_history')->insert([
                    'group_assignment_id' => $groupAssignment->id,
                    'student_id' => $student->id,
                    'to_group_id' => $group->id,
                    'action' => 'added',
                    'performed_by' => auth()->id(),
                    'reason' => 'Auto distribution',
                    'created_at' => now()
                ]);

                $distributed++;

                // Move to next group if current is full
                if ($group->fresh()->current_members >= $group->max_members) {
                    $groupIndex++;
                    if ($groupIndex >= $availableGroups->count()) {
                        break; // No more available groups
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "{$distributed} mahasiswa berhasil didistribusikan",
                'data' => [
                    'distributed_count' => $distributed,
                    'remaining_unassigned' => $unassignedStudents->count() - $distributed
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mendistribusikan mahasiswa: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get group detail with members and history
     */
    public function groupDetail($groupId)
    {
        $group = Group::with([
            'members.student',
            'leader',
            'groupAssignment'
        ])->findOrFail($groupId);

        // Get history
        $history = DB::table('group_member_history')
            ->where('group_assignment_id', $group->group_assignment_id)
            ->where(function($q) use ($groupId) {
                $q->where('from_group_id', $groupId)
                  ->orWhere('to_group_id', $groupId);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'group' => $group,
                'history' => $history
            ]
        ]);
    }
}
```

### B. Model: GroupAssignment.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GroupAssignment extends Model
{
    protected $fillable = [
        'mata_kuliah_id',
        'dosen_id',
        'title',
        'description',
        'deadline',
        'max_members_per_group',
        'min_members_per_group',
        'total_students',
        'total_groups',
        'auto_config',
        'status'
    ];

    protected $casts = [
        'auto_config' => 'array',
        'deadline' => 'datetime'
    ];

    public function mataKuliah()
    {
        return $this->belongsTo(MataKuliah::class);
    }

    public function dosen()
    {
        return $this->belongsTo(User::class, 'dosen_id');
    }

    public function groups()
    {
        return $this->hasMany(Group::class);
    }

    public function getUnassignedStudentsAttribute()
    {
        $assignedStudentIds = GroupMember::whereHas('group', function($q) {
            $q->where('group_assignment_id', $this->id);
        })->pluck('student_id');

        return User::where('role', 'mahasiswa')
            ->where('mata_kuliah_id', $this->mata_kuliah_id)
            ->whereNotIn('id', $assignedStudentIds)
            ->get();
    }
}
```

### C. Model: Group.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    protected $fillable = [
        'group_assignment_id',
        'group_number',
        'group_name',
        'leader_id',
        'current_members',
        'max_members',
        'progress_percentage',
        'status',
        'submission_file',
        'submitted_at'
    ];

    protected $casts = [
        'progress_percentage' => 'decimal:2',
        'submitted_at' => 'datetime'
    ];

    public function groupAssignment()
    {
        return $this->belongsTo(GroupAssignment::class);
    }

    public function leader()
    {
        return $this->belongsTo(User::class, 'leader_id');
    }

    public function members()
    {
        return $this->hasMany(GroupMember::class);
    }

    public function getAvailableSlotsAttribute()
    {
        return $this->max_members - $this->current_members;
    }

    public function getIsFullAttribute()
    {
        return $this->current_members >= $this->max_members;
    }
}
```

### D. Model: GroupMember.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GroupMember extends Model
{
    protected $fillable = [
        'group_id',
        'student_id',
        'is_leader',
        'join_method',
        'assigned_by',
        'joined_at'
    ];

    protected $casts = [
        'is_leader' => 'boolean',
        'joined_at' => 'datetime'
    ];

    public function group()
    {
        return $this->belongsTo(Group::class);
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
}
```

## 🛣️ API ROUTES

```php
// routes/api.php

Route::middleware(['auth:sanctum', 'role:admin,dosen'])->group(function () {
    // Group Assignment Management
    Route::prefix('admin/group-assignments')->group(function () {
        Route::post('/', [GroupAssignmentController::class, 'store']);
        Route::get('/{id}/monitoring', [GroupAssignmentController::class, 'monitoring']);
        Route::post('/force-assign', [GroupAssignmentController::class, 'forceAssignStudent']);
        Route::post('/move-student', [GroupAssignmentController::class, 'moveStudent']);
        Route::post('/remove-student', [GroupAssignmentController::class, 'removeStudent']);
        Route::post('/{id}/auto-distribute', [GroupAssignmentController::class, 'autoDistribute']);
        Route::get('/groups/{groupId}', [GroupAssignmentController::class, 'groupDetail']);
    });
});
```


## 🎨 FRONTEND IMPLEMENTATION (React/TypeScript)

### A. Page: CreateGroupAssignment.tsx

```tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input, Select, Textarea, Slider, Alert, Badge } from '@/components/ui';
import { api } from '@/lib/api';

interface GroupConfig {
  totalStudents: number;
  minMembers: number;
  maxMembers: number;
  calculatedGroups: number;
  estimatedLastGroupMembers: number;
}

export default function CreateGroupAssignment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mataKuliahList, setMataKuliahList] = useState([]);
  
  const [formData, setFormData] = useState({
    mata_kuliah_id: '',
    title: '',
    description: '',
    deadline: '',
    min_members_per_group: 3,
    max_members_per_group: 4,
  });

  const [groupConfig, setGroupConfig] = useState<GroupConfig | null>(null);

  // Fetch mata kuliah list
  useEffect(() => {
    fetchMataKuliah();
  }, []);

  // Calculate group configuration when mata kuliah or members change
  useEffect(() => {
    if (formData.mata_kuliah_id) {
      calculateGroupConfig();
    }
  }, [formData.mata_kuliah_id, formData.max_members_per_group]);

  const fetchMataKuliah = async () => {
    try {
      const response = await api.get('/admin/mata-kuliah');
      setMataKuliahList(response.data.data);
    } catch (error) {
      console.error('Failed to fetch mata kuliah:', error);
    }
  };

  const calculateGroupConfig = async () => {
    try {
      const response = await api.get(`/admin/mata-kuliah/${formData.mata_kuliah_id}/students/count`);
      const totalStudents = response.data.count;
      
      const calculatedGroups = Math.ceil(totalStudents / formData.max_members_per_group);
      const estimatedLastGroupMembers = totalStudents % formData.max_members_per_group || formData.max_members_per_group;

      setGroupConfig({
        totalStudents,
        minMembers: formData.min_members_per_group,
        maxMembers: formData.max_members_per_group,
        calculatedGroups,
        estimatedLastGroupMembers
      });
    } catch (error) {
      console.error('Failed to calculate group config:', error);
    }
  };

  const handleSubmit = async (activate: boolean = false) => {
    setLoading(true);
    try {
      const response = await api.post('/admin/group-assignments', {
        ...formData,
        activate
      });

      if (response.data.success) {
        navigate(`/admin/tugas-kelompok/${response.data.data.id}/monitoring`);
      }
    } catch (error) {
      console.error('Failed to create group assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Buat Tugas Kelompok</h1>
          <p className="text-gray-600">Konfigurasi otomatis pembagian kelompok</p>
        </div>
      </div>

      {/* Informasi Tugas */}
      <Card>
        <Card.Header>
          <h2 className="text-lg font-semibold">Informasi Tugas</h2>
        </Card.Header>
        <Card.Body className="space-y-4">
          <Input
            label="Judul Tugas"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Contoh: Analisis Sistem Informasi"
          />

          <Textarea
            label="Deskripsi"
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Jelaskan detail tugas kelompok..."
            rows={4}
          />

          <Select
            label="Mata Kuliah"
            required
            value={formData.mata_kuliah_id}
            onChange={(e) => setFormData({ ...formData, mata_kuliah_id: e.target.value })}
          >
            <option value="">Pilih Mata Kuliah</option>
            {mataKuliahList.map((mk: any) => (
              <option key={mk.id} value={mk.id}>
                {mk.name} ({mk.students_count} mahasiswa)
              </option>
            ))}
          </Select>

          <Input
            label="Deadline"
            type="datetime-local"
            required
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          />
        </Card.Body>
      </Card>

      {/* Konfigurasi Kelompok Otomatis */}
      <Card>
        <Card.Header>
          <h2 className="text-lg font-semibold">Konfigurasi Kelompok Otomatis</h2>
          <p className="text-sm text-gray-600">
            Sistem akan menghitung jumlah kelompok berdasarkan total mahasiswa
          </p>
        </Card.Header>
        <Card.Body className="space-y-6">
          {groupConfig && (
            <Alert variant="info">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Total Mahasiswa:</span>
                <Badge variant="primary">{groupConfig.totalStudents} mahasiswa</Badge>
              </div>
            </Alert>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Jumlah Anggota per Kelompok
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Slider
                  min={2}
                  max={10}
                  value={[formData.min_members_per_group, formData.max_members_per_group]}
                  onChange={(values) => setFormData({
                    ...formData,
                    min_members_per_group: values[0],
                    max_members_per_group: values[1]
                  })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Badge>{formData.min_members_per_group}</Badge>
                <span>-</span>
                <Badge>{formData.max_members_per_group}</Badge>
                <span className="text-sm text-gray-600">anggota</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Minimal {formData.min_members_per_group} dan maksimal {formData.max_members_per_group} anggota per kelompok
            </p>
          </div>

          {groupConfig && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-blue-900">Jumlah Kelompok (Otomatis)</span>
                <Badge variant="primary" size="lg">
                  {groupConfig.calculatedGroups} kelompok
                </Badge>
              </div>
              <p className="text-sm text-blue-700">
                {groupConfig.totalStudents} mahasiswa ÷ {groupConfig.maxMembers} anggota = {groupConfig.calculatedGroups} kelompok
              </p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Preview Pembagian Kelompok */}
      {groupConfig && (
        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold">Preview Pembagian Kelompok</h2>
          </Card.Header>
          <Card.Body>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Kelompok</th>
                    <th className="text-left py-2">Kapasitas</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Estimasi Anggota</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: groupConfig.calculatedGroups }, (_, i) => {
                    const isLastGroup = i === groupConfig.calculatedGroups - 1;
                    const estimatedMembers = isLastGroup 
                      ? groupConfig.estimatedLastGroupMembers 
                      : groupConfig.maxMembers;

                    return (
                      <tr key={i} className="border-b">
                        <td className="py-2">Kelompok {i + 1}</td>
                        <td className="py-2">0/{groupConfig.maxMembers}</td>
                        <td className="py-2">
                          <Badge variant="secondary">Kosong</Badge>
                        </td>
                        <td className="py-2">
                          {estimatedMembers} mahasiswa
                          {isLastGroup && estimatedMembers < groupConfig.maxMembers && (
                            <span className="text-xs text-gray-500 ml-2">(sisa)</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {groupConfig.estimatedLastGroupMembers < groupConfig.minMembers && (
              <Alert variant="warning" className="mt-4">
                Kelompok {groupConfig.calculatedGroups} kemungkinan hanya berisi {groupConfig.estimatedLastGroupMembers} anggota (kurang dari minimal)
              </Alert>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => navigate('/admin/tugas-kelompok')}
        >
          Batal
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleSubmit(false)}
          disabled={loading || !formData.mata_kuliah_id}
        >
          Simpan sebagai Draft
        </Button>
        <Button
          variant="primary"
          onClick={() => handleSubmit(true)}
          disabled={loading || !formData.mata_kuliah_id}
        >
          Buat & Aktifkan Tugas
        </Button>
      </div>
    </div>
  );
}
```

### B. Page: GroupMonitoring.tsx

```tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button, Input, Select, Badge, Modal, Alert } from '@/components/ui';
import { Users, UserCheck, UserX, TrendingUp, UserPlus, Eye, Edit } from 'lucide-react';
import { api } from '@/lib/api';

interface MonitoringData {
  assignment: any;
  groups: any[];
  unassigned_students: any[];
  stats: any;
}

export default function GroupMonitoring() {
  const { id } = useParams();
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUnassignedModal, setShowUnassignedModal] = useState(false);

  useEffect(() => {
    fetchMonitoringData();
  }, [id]);

  const fetchMonitoringData = async () => {
    try {
      const response = await api.get(`/admin/group-assignments/${id}/monitoring`);
      setData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoDistribute = async () => {
    if (!confirm('Yakin mendistribusikan mahasiswa secara otomatis?')) return;

    try {
      const response = await api.post(`/admin/group-assignments/${id}/auto-distribute`);
      if (response.data.success) {
        alert(response.data.message);
        fetchMonitoringData();
      }
    } catch (error) {
      console.error('Failed to auto distribute:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Data not found</div>;

  const filteredGroups = data.groups.filter(group => {
    const matchesSearch = group.group_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || group.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Monitoring Tugas Kelompok</h1>
        <p className="text-gray-600">{data.assignment.title} - {data.assignment.mata_kuliah.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <Card.Body className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Kelompok</p>
              <p className="text-2xl font-bold">{data.stats.total_groups}</p>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Mahasiswa Terdaftar</p>
              <p className="text-2xl font-bold">
                {data.stats.assigned_students}/{data.stats.total_students}
              </p>
            </div>
          </Card.Body>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setShowUnassignedModal(true)}
        >
          <Card.Body className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Belum Masuk Kelompok</p>
              <p className="text-2xl font-bold text-red-600">
                {data.stats.unassigned_students}
              </p>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Progres Rata-rata</p>
              <p className="text-2xl font-bold">{data.stats.average_progress.toFixed(0)}%</p>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <Card.Body className="flex gap-4">
          <Input
            placeholder="Cari kelompok atau mahasiswa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="empty">Kosong</option>
            <option value="incomplete">Tidak Lengkap</option>
            <option value="full">Penuh</option>
            <option value="submitted">Sudah Submit</option>
          </Select>
        </Card.Body>
      </Card>

      {/* Group List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredGroups.map((group) => (
          <GroupCard key={group.id} group={group} onRefresh={fetchMonitoringData} />
        ))}
      </div>

      {/* Unassigned Students Modal */}
      <UnassignedStudentsModal
        open={showUnassignedModal}
        onClose={() => setShowUnassignedModal(false)}
        students={data.unassigned_students}
        groups={data.groups}
        onRefresh={fetchMonitoringData}
        onAutoDistribute={handleAutoDistribute}
      />
    </div>
  );
}

// Group Card Component
function GroupCard({ group, onRefresh }: any) {
  const getStatusColor = (status: string) => {
    const colors = {
      empty: 'secondary',
      incomplete: 'warning',
      full: 'success',
      submitted: 'primary'
    };
    return colors[status] || 'secondary';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      empty: 'Kosong',
      incomplete: 'Tidak Lengkap',
      full: 'Penuh',
      submitted: 'Sudah Submit'
    };
    return labels[status] || status;
  };

  return (
    <Card>
      <Card.Header className="flex items-center justify-between">
        <h3 className="font-semibold">{group.group_name}</h3>
        <Badge variant={getStatusColor(group.status)}>
          {getStatusLabel(group.status)}
        </Badge>
      </Card.Header>
      <Card.Body className="space-y-4">
        {/* Capacity */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Anggota</span>
            <span>{group.current_members}/{group.max_members}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(group.current_members / group.max_members) * 100}%` }}
            />
          </div>
        </div>

        {/* Members */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Anggota:</p>
          {group.members.length > 0 ? (
            <div className="space-y-1">
              {group.members.slice(0, 3).map((member: any) => (
                <div key={member.id} className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 bg-gray-300 rounded-full" />
                  <span>{member.student.name}</span>
                  {member.is_leader && <Badge size="sm">Ketua</Badge>}
                </div>
              ))}
              {group.members.length > 3 && (
                <p className="text-xs text-gray-500">+{group.members.length - 3} lainnya</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Belum ada anggota</p>
          )}
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Progres</span>
            <span>{group.progress_percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${group.progress_percentage}%` }}
            />
          </div>
        </div>
      </Card.Body>
      <Card.Footer className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => window.location.href = `/admin/tugas-kelompok/${group.group_assignment_id}/kelompok/${group.id}`}
        >
          <Eye className="w-4 h-4 mr-1" />
          Detail
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
        >
          <Edit className="w-4 h-4 mr-1" />
          Kelola
        </Button>
      </Card.Footer>
    </Card>
  );
}

// Unassigned Students Modal Component
function UnassignedStudentsModal({ open, onClose, students, groups, onRefresh, onAutoDistribute }: any) {
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showForceAssignModal, setShowForceAssignModal] = useState(false);

  return (
    <>
      <Modal open={open} onClose={onClose} size="lg">
        <Modal.Header>
          <h2 className="text-xl font-bold">Mahasiswa Belum Masuk Kelompok</h2>
          <p className="text-sm text-gray-600">{students.length} mahasiswa belum terdaftar di kelompok manapun</p>
        </Modal.Header>
        <Modal.Body>
          {students.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">NIM</th>
                      <th className="text-left py-2">Nama</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-right py-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student: any) => (
                      <tr key={student.id} className="border-b">
                        <td className="py-2">{student.nim}</td>
                        <td className="py-2">{student.name}</td>
                        <td className="py-2">
                          <Badge variant="danger">Belum Terdaftar</Badge>
                        </td>
                        <td className="py-2 text-right">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowForceAssignModal(true);
                            }}
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Force Assign
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  onClick={onAutoDistribute}
                >
                  Distribusi Otomatis Semua
                </Button>
              </div>
            </div>
          ) : (
            <Alert variant="success">
              Semua mahasiswa sudah terdaftar di kelompok
            </Alert>
          )}
        </Modal.Body>
      </Modal>

      {selectedStudent && (
        <ForceAssignModal
          open={showForceAssignModal}
          onClose={() => {
            setShowForceAssignModal(false);
            setSelectedStudent(null);
          }}
          student={selectedStudent}
          groups={groups}
          onSuccess={() => {
            onRefresh();
            onClose();
          }}
        />
      )}
    </>
  );
}

// Force Assign Modal Component
function ForceAssignModal({ open, onClose, student, groups, onSuccess }: any) {
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [reason, setReason] = useState('');
  const [sendNotification, setSendNotification] = useState(true);
  const [loading, setLoading] = useState(false);

  const availableGroups = groups.filter((g: any) => g.current_members < g.max_members);

  const handleSubmit = async () => {
    if (!selectedGroupId) {
      alert('Pilih kelompok tujuan');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/admin/group-assignments/force-assign', {
        student_id: student.id,
        group_id: selectedGroupId,
        reason,
        send_notification: sendNotification
      });

      if (response.data.success) {
        alert(response.data.message);
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Failed to force assign:', error);
      alert('Gagal menambahkan mahasiswa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Header>
        <h2 className="text-xl font-bold">Force Assign Mahasiswa ke Kelompok</h2>
        <p className="text-sm text-gray-600">Masukkan mahasiswa ke kelompok secara paksa</p>
      </Modal.Header>
      <Modal.Body className="space-y-4">
        <Card>
          <Card.Body>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">NIM:</div>
              <div className="font-medium">{student.nim}</div>
              <div className="text-gray-600">Nama:</div>
              <div className="font-medium">{student.name}</div>
              <div className="text-gray-600">Status:</div>
              <div><Badge variant="danger">Belum masuk kelompok</Badge></div>
            </div>
          </Card.Body>
        </Card>

        <Select
          label="Pilih Kelompok Tujuan"
          value={selectedGroupId}
          onChange={(e) => setSelectedGroupId(e.target.value)}
          required
        >
          <option value="">Pilih kelompok...</option>
          {availableGroups.map((group: any) => (
            <option key={group.id} value={group.id}>
              {group.group_name} ({group.current_members}/{group.max_members}) - 
              Tersedia {group.max_members - group.current_members} slot
            </option>
          ))}
        </Select>

        <Textarea
          label="Alasan Force Assign (Opsional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Contoh: Mahasiswa terlambat mendaftar karena sakit"
          rows={3}
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={sendNotification}
            onChange={(e) => setSendNotification(e.target.checked)}
          />
          <span className="text-sm">Kirim notifikasi ke mahasiswa</span>
        </label>

        <Alert variant="info">
          Mahasiswa akan langsung masuk ke kelompok tanpa perlu persetujuan
        </Alert>
      </Modal.Body>
      <Modal.Footer className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Batal
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={loading || !selectedGroupId}
        >
          <UserPlus className="w-4 h-4 mr-1" />
          Force Assign Sekarang
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
```


## 📱 RESPONSIVE DESIGN

### Mobile View Considerations

```tsx
// Mobile-optimized components

// Stats Grid - Stack on mobile
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Stats cards */}
</div>

// Group Cards - Single column on mobile
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Group cards */}
</div>

// Table - Horizontal scroll on mobile
<div className="overflow-x-auto">
  <table className="min-w-full">
    {/* Table content */}
  </table>
</div>

// Modal - Full screen on mobile
<Modal className="w-full md:max-w-2xl">
  {/* Modal content */}
</Modal>
```

## 🔔 NOTIFICATION SYSTEM

### Notification Templates

```typescript
// notifications/GroupAssignmentNotifications.ts

export const GroupAssignmentNotifications = {
  forceAssigned: (studentName: string, groupName: string) => ({
    title: 'Ditambahkan ke Kelompok',
    message: `Halo ${studentName}, Anda telah ditambahkan ke ${groupName} oleh admin.`,
    type: 'info',
    action: {
      label: 'Lihat Kelompok',
      url: '/mahasiswa/tugas-kelompok'
    }
  }),

  movedToGroup: (studentName: string, fromGroup: string, toGroup: string) => ({
    title: 'Dipindahkan Kelompok',
    message: `Halo ${studentName}, Anda telah dipindahkan dari ${fromGroup} ke ${toGroup}.`,
    type: 'warning',
    action: {
      label: 'Lihat Kelompok Baru',
      url: '/mahasiswa/tugas-kelompok'
    }
  }),

  removedFromGroup: (studentName: string, groupName: string) => ({
    title: 'Dikeluarkan dari Kelompok',
    message: `Halo ${studentName}, Anda telah dikeluarkan dari ${groupName}.`,
    type: 'danger',
    action: {
      label: 'Lihat Status',
      url: '/mahasiswa/tugas-kelompok'
    }
  }),

  newMemberJoined: (groupName: string, memberName: string) => ({
    title: 'Anggota Baru Bergabung',
    message: `${memberName} telah bergabung ke ${groupName}.`,
    type: 'success',
    action: {
      label: 'Lihat Kelompok',
      url: '/mahasiswa/tugas-kelompok'
    }
  })
};
```

## 🧪 TESTING SCENARIOS

### Unit Tests

```typescript
// tests/GroupAssignment.test.ts

describe('Group Assignment Auto Configuration', () => {
  test('should calculate correct number of groups', () => {
    const totalStudents = 35;
    const maxMembersPerGroup = 4;
    const expectedGroups = Math.ceil(totalStudents / maxMembersPerGroup); // 9
    
    expect(calculateGroups(totalStudents, maxMembersPerGroup)).toBe(expectedGroups);
  });

  test('should handle edge case with exact division', () => {
    const totalStudents = 40;
    const maxMembersPerGroup = 4;
    const expectedGroups = 10;
    
    expect(calculateGroups(totalStudents, maxMembersPerGroup)).toBe(expectedGroups);
  });

  test('should prevent force assign to full group', async () => {
    const fullGroup = { id: 1, current_members: 4, max_members: 4 };
    
    await expect(
      forceAssignStudent(studentId, fullGroup.id)
    ).rejects.toThrow('Kelompok sudah penuh');
  });

  test('should prevent duplicate assignment', async () => {
    const student = { id: 1, name: 'Test Student' };
    const group1 = { id: 1, group_assignment_id: 1 };
    const group2 = { id: 2, group_assignment_id: 1 };
    
    await forceAssignStudent(student.id, group1.id);
    
    await expect(
      forceAssignStudent(student.id, group2.id)
    ).rejects.toThrow('Mahasiswa sudah terdaftar di kelompok lain');
  });
});

describe('Auto Distribution', () => {
  test('should distribute students evenly', async () => {
    const unassignedStudents = 10;
    const availableGroups = [
      { id: 1, current_members: 2, max_members: 4 },
      { id: 2, current_members: 1, max_members: 4 },
      { id: 3, current_members: 0, max_members: 4 }
    ];
    
    const result = await autoDistribute(assignmentId);
    
    expect(result.distributed_count).toBe(10);
    expect(result.remaining_unassigned).toBe(0);
  });

  test('should stop when all groups are full', async () => {
    const unassignedStudents = 20;
    const availableGroups = [
      { id: 1, current_members: 3, max_members: 4 }, // 1 slot
      { id: 2, current_members: 3, max_members: 4 }  // 1 slot
    ];
    
    const result = await autoDistribute(assignmentId);
    
    expect(result.distributed_count).toBe(2);
    expect(result.remaining_unassigned).toBe(18);
  });
});
```

### Integration Tests

```typescript
// tests/integration/GroupManagement.test.ts

describe('Group Management Integration', () => {
  test('complete workflow: create assignment -> force assign -> move student', async () => {
    // 1. Create group assignment
    const assignment = await createGroupAssignment({
      mata_kuliah_id: 1,
      title: 'Test Assignment',
      max_members_per_group: 4
    });
    
    expect(assignment.groups).toHaveLength(9); // 35 students / 4 = 9 groups
    
    // 2. Force assign student
    const student = await getUnassignedStudent(assignment.id);
    const group1 = assignment.groups[0];
    
    await forceAssignStudent(student.id, group1.id);
    
    const updatedGroup1 = await getGroup(group1.id);
    expect(updatedGroup1.current_members).toBe(1);
    
    // 3. Move student to another group
    const group2 = assignment.groups[1];
    
    await moveStudent(student.id, group1.id, group2.id);
    
    const finalGroup1 = await getGroup(group1.id);
    const finalGroup2 = await getGroup(group2.id);
    
    expect(finalGroup1.current_members).toBe(0);
    expect(finalGroup2.current_members).toBe(1);
  });
});
```

## 📊 ANALYTICS & REPORTING

### Admin Dashboard Metrics

```typescript
// Analytics data structure

interface GroupAssignmentAnalytics {
  assignment_id: number;
  metrics: {
    total_groups: number;
    total_students: number;
    assignment_rate: number; // percentage of students assigned
    completion_rate: number; // percentage of groups submitted
    average_group_size: number;
    average_progress: number;
    time_to_full_assignment: number; // hours
  };
  distribution: {
    by_status: {
      empty: number;
      incomplete: number;
      full: number;
      submitted: number;
    };
    by_join_method: {
      manual: number;
      auto: number;
      force_assigned: number;
    };
  };
  timeline: {
    date: string;
    assigned_students: number;
    submitted_groups: number;
  }[];
}
```

### Export Reports

```php
// Controller method for exporting reports

public function exportReport($assignmentId, $format = 'pdf')
{
    $assignment = GroupAssignment::with(['groups.members.student'])->findOrFail($assignmentId);
    
    $data = [
        'assignment' => $assignment,
        'stats' => $this->calculateStats($assignment),
        'groups' => $assignment->groups,
        'unassigned' => $assignment->unassigned_students
    ];
    
    if ($format === 'pdf') {
        return PDF::loadView('reports.group-assignment', $data)->download('group-assignment-report.pdf');
    } elseif ($format === 'excel') {
        return Excel::download(new GroupAssignmentExport($data), 'group-assignment-report.xlsx');
    }
}
```

## 🔐 SECURITY & PERMISSIONS

### Role-Based Access Control

```php
// Middleware: CheckGroupAssignmentPermission.php

public function handle($request, Closure $next)
{
    $user = auth()->user();
    $assignmentId = $request->route('id');
    
    // Admin can access all
    if ($user->role === 'admin') {
        return $next($request);
    }
    
    // Dosen can only access their own assignments
    if ($user->role === 'dosen') {
        $assignment = GroupAssignment::find($assignmentId);
        
        if ($assignment && $assignment->dosen_id === $user->id) {
            return $next($request);
        }
    }
    
    return response()->json(['error' => 'Unauthorized'], 403);
}
```

### Validation Rules

```php
// Validation for critical operations

protected $rules = [
    'force_assign' => [
        'student_id' => 'required|exists:users,id|role:mahasiswa',
        'group_id' => 'required|exists:groups,id',
        'reason' => 'nullable|string|max:500'
    ],
    'move_student' => [
        'student_id' => 'required|exists:users,id',
        'from_group_id' => 'required|exists:groups,id',
        'to_group_id' => 'required|exists:groups,id|different:from_group_id',
        'reason' => 'nullable|string|max:500'
    ]
];
```

## 🚀 PERFORMANCE OPTIMIZATION

### Database Indexing

```sql
-- Add indexes for better query performance

CREATE INDEX idx_group_members_student ON group_members(student_id);
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_groups_assignment ON groups(group_assignment_id);
CREATE INDEX idx_groups_status ON groups(status);
CREATE INDEX idx_group_assignments_mata_kuliah ON group_assignments(mata_kuliah_id);
CREATE INDEX idx_group_member_history_assignment ON group_member_history(group_assignment_id);
```

### Caching Strategy

```php
// Cache frequently accessed data

use Illuminate\Support\Facades\Cache;

public function monitoring($id)
{
    $cacheKey = "group_assignment_monitoring_{$id}";
    
    return Cache::remember($cacheKey, 300, function () use ($id) {
        return $this->getMonitoringData($id);
    });
}

// Clear cache on updates
public function forceAssignStudent(Request $request)
{
    // ... assignment logic ...
    
    Cache::forget("group_assignment_monitoring_{$group->group_assignment_id}");
    
    return response()->json(['success' => true]);
}
```

### Eager Loading

```php
// Prevent N+1 queries

$groupAssignment = GroupAssignment::with([
    'groups' => function($query) {
        $query->with(['members.student', 'leader']);
    },
    'mataKuliah',
    'dosen'
])->findOrFail($id);
```

## 📝 DOCUMENTATION

### API Documentation (OpenAPI/Swagger)

```yaml
/api/admin/group-assignments:
  post:
    summary: Create new group assignment with auto configuration
    tags:
      - Group Assignments
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required:
              - mata_kuliah_id
              - title
              - description
              - deadline
              - max_members_per_group
            properties:
              mata_kuliah_id:
                type: integer
              title:
                type: string
              description:
                type: string
              deadline:
                type: string
                format: date-time
              min_members_per_group:
                type: integer
                minimum: 2
                maximum: 10
              max_members_per_group:
                type: integer
                minimum: 2
                maximum: 10
              activate:
                type: boolean
    responses:
      201:
        description: Group assignment created successfully
      422:
        description: Validation error

/api/admin/group-assignments/{id}/monitoring:
  get:
    summary: Get monitoring data for group assignment
    tags:
      - Group Assignments
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: integer
    responses:
      200:
        description: Monitoring data retrieved successfully

/api/admin/group-assignments/force-assign:
  post:
    summary: Force assign student to group
    tags:
      - Group Assignments
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required:
              - student_id
              - group_id
            properties:
              student_id:
                type: integer
              group_id:
                type: integer
              reason:
                type: string
              send_notification:
                type: boolean
    responses:
      200:
        description: Student assigned successfully
      400:
        description: Group is full or student already assigned
```

## 🎓 USER GUIDE

### Admin Guide: Membuat Tugas Kelompok

1. Buka menu "Tugas Kelompok" → "Buat Tugas Baru"
2. Isi informasi tugas (judul, deskripsi, mata kuliah, deadline)
3. Atur konfigurasi kelompok:
   - Sistem akan otomatis mendeteksi jumlah mahasiswa
   - Tentukan jumlah anggota per kelompok (min-max)
   - Sistem akan menghitung jumlah kelompok yang akan dibuat
4. Review preview pembagian kelompok
5. Klik "Buat & Aktifkan Tugas"

### Admin Guide: Monitoring & Manajemen Kelompok

1. Buka halaman monitoring tugas kelompok
2. Lihat statistik:
   - Total kelompok
   - Mahasiswa yang sudah/belum terdaftar
   - Progres rata-rata
3. Untuk mahasiswa yang belum masuk kelompok:
   - Klik pada stat "Belum Masuk Kelompok"
   - Pilih mahasiswa
   - Klik "Force Assign"
   - Pilih kelompok tujuan
   - Konfirmasi
4. Untuk memindahkan anggota:
   - Buka detail kelompok
   - Pilih anggota yang akan dipindah
   - Klik "Pindah ke Kelompok Lain"
   - Pilih kelompok tujuan
   - Konfirmasi

## ✅ CHECKLIST IMPLEMENTASI

### Backend
- [ ] Create database migrations
- [ ] Create models (GroupAssignment, Group, GroupMember)
- [ ] Implement GroupAssignmentController
- [ ] Add API routes
- [ ] Add validation rules
- [ ] Implement notification system
- [ ] Add database indexes
- [ ] Implement caching
- [ ] Write unit tests
- [ ] Write integration tests

### Frontend
- [ ] Create CreateGroupAssignment page
- [ ] Create GroupMonitoring page
- [ ] Create GroupDetail page
- [ ] Implement ForceAssignModal
- [ ] Implement MoveStudentModal
- [ ] Implement UnassignedStudentsModal
- [ ] Add responsive design
- [ ] Add loading states
- [ ] Add error handling
- [ ] Write component tests

### Testing
- [ ] Test auto configuration calculation
- [ ] Test force assign functionality
- [ ] Test move student functionality
- [ ] Test auto distribution
- [ ] Test edge cases (full groups, duplicate assignments)
- [ ] Test notifications
- [ ] Test permissions
- [ ] Performance testing

### Documentation
- [ ] API documentation
- [ ] User guide for admin
- [ ] Developer documentation
- [ ] Deployment guide

## 🎉 KESIMPULAN

Fitur ini menyediakan sistem lengkap untuk:
- ✅ Auto konfigurasi pembagian kelompok berdasarkan jumlah mahasiswa
- ✅ Monitoring real-time progres dan anggota kelompok
- ✅ Force assign mahasiswa ke kelompok (untuk situasi mendesak)
- ✅ Manajemen anggota kelompok (pindah, hapus, swap)
- ✅ History tracking semua perubahan
- ✅ Notifikasi otomatis
- ✅ Dashboard analytics
- ✅ Export reports

Sistem ini dirancang untuk memudahkan admin/dosen dalam mengelola tugas kelompok dengan efisien, terutama dalam situasi mendesak dimana mahasiswa perlu segera dimasukkan ke kelompok tertentu.
