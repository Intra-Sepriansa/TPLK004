# PROMPT IMPLEMENTASI PENGATURAN MAHASISWA ADVANCED (7 HARI)

## 1. Tujuan Utama dan KPI Keberhasilan

### Tujuan
Menyelesaikan pengembangan Menu Pengaturan Mahasiswa agar seluruh fitur benar-benar berfungsi end-to-end (persist, apply, enforce, aman, dan teruji), bukan hanya berubah di UI.

### KPI Fungsional
- 100% kontrol pada halaman Pengaturan memiliki efek nyata pada sistem.
- 0 mismatch nilai tema antara UI, local storage, backend, dan class DOM.
- 0 endpoint no-op untuk area security (2FA/session/login history).
- 100% kontrak API settings konsisten untuk response normal dan error.
- 100% skenario acceptance test pass.

### KPI Kualitas
- Tidak ada silent failure pada save/reset/import/export.
- P95 response settings update < 500ms (lokal/dev baseline).
- Tidak ada regresi lintas role terkait theme.
- Semua perubahan penting tercatat dalam audit log.

---

## 2. Temuan Akar Masalah (Audit Kode Saat Ini)

## 2.1 Ringkasan Gap Kritis
| Area | Kondisi Saat Ini | Dampak |
|---|---|---|
| Theme system | Ada 3 implementasi berbeda: `hooks/useTheme.ts`, `contexts/theme-context.tsx`, `hooks/use-appearance.tsx` | Konflik state, mismatch `auto/system`, perilaku tidak konsisten |
| Theme endpoint | Alur update tema tersebar (`/api/settings/{category}` dan `/api/settings/theme` web route) | Risk mismatch persistence dan guard |
| Appearance sync | `ThemeToggle` mengubah tema langsung via hook, tidak controlled dari `AppearanceSettings` | Data `appearance.theme` bisa tidak sinkron dengan UI aktual |
| Session security | Listing sesi hanya filter `user_id` | Potensi bentrok ID lintas model/guard |
| 2FA | Tombol setup/kelola belum terhubung kuat ke flow runtime di security tab mahasiswa | UX terlihat hidup, fitur sebenarnya no-op/parsial |
| Clear cache | Endpoint membersihkan cache global (`cache/config/route/view`) untuk user biasa | Berisiko mengganggu seluruh sistem |
| General settings | Language/timezone/format tersimpan tapi belum dipakai konsisten sebagai formatter global | User merasa setting “tidak berlaku” |
| Privacy/notifications | Persist ada, enforcement lintas fitur belum menyeluruh | Setting tersimpan tetapi behavior sistem tidak berubah |

## 2.2 Mismatch Contract (Saat Ini vs Target)
| Contract | Saat Ini | Target |
|---|---|---|
| Theme enum | `light|dark|auto` (beberapa tempat), `light|dark|system` (tempat lain) | Satu standar final: `light|dark|system` |
| Data category | FE pakai `dataManagement`, backend internal pakai `data` | Support dua arah, canonical response `dataManagement` |
| Category update response | Berpotensi shape parsial | Wajib shape kategori final lengkap setelah merge defaults |
| Error response | Beragam format | Standar `success=false`, `message`, `details?`, `code?` |

---

## 3. Arsitektur Target (Decision Complete)

## 3.1 Prinsip Arsitektur
- Single source of truth untuk state settings per kategori.
- Single source of truth untuk theme runtime.
- API contract typed dan backward compatible.
- Optimistic UI dengan rollback saat gagal.
- Security-sensitive endpoint wajib ownership-safe.

## 3.2 Sumber Kebenaran per Domain
| Domain | Source of Truth |
|---|---|
| Settings persistence | `user_preferences` (via `PreferenceManagerService`) |
| Runtime theme DOM | `useTheme` final (satu implementasi) |
| Shared theme ke Inertia | `HandleInertiaRequests` |
| Settings type FE | `resources/js/types/settings.ts` |
| Settings API mapping FE | `resources/js/lib/settings-api.ts` |

## 3.3 Strategi Konsolidasi Theme
- Pertahankan satu hook tema final: `resources/js/hooks/useTheme.ts`.
- `contexts/theme-context.tsx` dan `hooks/use-appearance.tsx` didepresiasi bertahap.
- Konversi legacy:
  - incoming `auto` -> normalize ke `system`.
  - saat simpan ke backend, simpan `system`.
  - jika backend masih mengirim `auto`, map ke `system` di normalizer FE.

---

## 4. Perubahan API, Interface, dan Type (Wajib)

## 4.1 Type Frontend Final
File target: `resources/js/types/settings.ts`

### Theme
- Final enum: `theme: 'light' | 'dark' | 'system'`.
- Hapus penggunaan `auto` pada type final (legacy hanya di mapper).

### Tambahan field yang harus support jika backend tersedia
- `appearance.highContrast?: boolean`
- `privacy.showLastSeen?: boolean`
- `privacy.shareActivity?: boolean`
- `privacy.allowSearchByNim?: boolean`
- `dataManagement.dataRetention?: number`

## 4.2 API Endpoint Contract

### GET `/api/settings`
Response sukses:
```json
{
  "success": true,
  "data": {
    "general": {"language":"id","timezone":"Asia/Jakarta","dateFormat":"DD/MM/YYYY","timeFormat":"24h","startOfWeek":"monday"},
    "notifications": {...},
    "appearance": {"theme":"system","fontSize":"medium","compactMode":false,"animations":true,"sidebarCollapsed":false},
    "privacy": {...},
    "security": {"twoFactorEnabled":false,"sessionTimeout":60,"loginNotifications":true},
    "dataManagement": {"autoBackup":true,"backupFrequency":"weekly","cacheEnabled":true,"offlineMode":false}
  }
}
```

### PATCH `/api/settings/{category}`
- Category valid: `general|notifications|appearance|privacy|security|dataManagement|data`.
- Jika `dataManagement`, backend mapping ke `data`.

Response sukses kategori (wajib konsisten):
```json
{
  "success": true,
  "message": "Settings for appearance updated successfully",
  "data": {
    "appearance": {
      "theme": "system",
      "fontSize": "medium",
      "compactMode": false,
      "animations": true,
      "sidebarCollapsed": false
    }
  }
}
```

### GET `/api/settings/sessions`
- Wajib hanya menampilkan sesi milik user aktif (model/guard aman).

### POST `/api/settings/sessions/{sessionId}/terminate`
- Tidak boleh terminate sesi current.
- Ownership check wajib.

### GET `/api/settings/login-history`
- Data login milik user aktif, status success/failed valid.

### GET `/api/settings/export`
- Payload versioned.

### POST `/api/settings/import`
- Validasi `version` + `settings`.
- Tolak payload invalid dengan error detail.

### POST `/api/settings/clear-cache`
- Scope aman untuk user biasa (jangan clear global app cache).

## 4.3 Error Contract Standar
```json
{
  "success": false,
  "message": "Gagal menyimpan pengaturan",
  "details": {"field":"error reason"},
  "code": "SETTINGS_VALIDATION_FAILED"
}
```

---

## 5. Task Breakdown Harian (7 Hari Sprint)

## Hari 1 — Baseline Audit Final + Contract Freeze
### Target
Membekukan kontrak data FE-BE agar implementasi berikutnya tidak berubah-ubah.

### Pekerjaan
- Finalisasi `settings.ts` dan mapping compatibility `auto->system`.
- Rapikan normalizer di `settings-api.ts` untuk `data` vs `dataManagement`.
- Buat matriks mismatch final di issue tracker/dokumen ini.

### Output
- Contract schema v1.0 final.
- Tidak ada ambiguity enum theme/category.

## Hari 2 — Theme Unification Total
### Target
Satu sistem tema final, update instan, persist konsisten.

### Pekerjaan
- Jadikan `useTheme.ts` sebagai implementasi tunggal.
- Refactor `ThemeToggle` menjadi controlled component (`value`, `onChange`).
- Integrasi `appearance-settings.tsx` dengan state kategori.
- Pastikan save tema lewat category appearance API.
- Deprecate pemakaian `theme-context.tsx` dan `use-appearance.tsx` pada flow settings.

### Output
- Perubahan tema langsung apply ke DOM.
- Reload tetap mempertahankan tema yang sama.

## Hari 3 — General Settings Enforcement
### Target
Language/timezone/date/time benar-benar berdampak ke UI.

### Pekerjaan
- Bridge language setting ke i18n runtime.
- Buat formatter global berbasis preference user.
- Terapkan formatter di halaman mahasiswa prioritas tinggi.

### Output
- Pergantian language/timezone/date/time terlihat nyata.

## Hari 4 — Notifications + Privacy Enforcement
### Target
Preference mengubah behavior sistem, bukan hanya data.

### Pekerjaan
- Pastikan nested update notifikasi aman.
- Integrasi preference ke pipeline notif (email/push/in-app).
- Enforce privacy untuk visibilitas profil/status/activity.

### Output
- Hasil notif/visibilitas sesuai pengaturan user.

## Hari 5 — Security Real Enforcement
### Target
2FA/session/login history benar-benar operasional dan aman.

### Pekerjaan
- Sambungkan aksi 2FA ke flow nyata.
- Session ownership hardening.
- Hindari terminate current session.
- Validasi dan tampilkan login history reliable.

### Output
- Security tab actionable tanpa no-op.

## Hari 6 — Data Management Hardening
### Target
Export/import/clear cache aman, robust, dan terukur.

### Pekerjaan
- Implement payload versioning import/export.
- Tambah rollback pada import gagal.
- Scope clear-cache untuk user biasa.
- Definisikan status offline mode (full/partial).

### Output
- Tidak ada operasi data-management yang merusak global app.

## Hari 7 — Hardening, Testing, Release Notes
### Target
Stabilisasi untuk release.

### Pekerjaan
- Jalankan unit + integration + e2e prioritas settings.
- Perbaiki regresi terakhir.
- Buat changelog teknis dan rollout plan.

### Output
- Build siap release dengan test pass.

---

## 6. Checklist Implementasi Per-File

## Frontend
| File | Tugas Utama | Acceptance |
|---|---|---|
| `resources/js/pages/student/settings.tsx` | wiring save/reset/import/export, loading per section, optimistic update + rollback, error handling granular | semua aksi menampilkan feedback jelas, tidak ada silent failure |
| `resources/js/components/settings/ThemeToggle.tsx` | ubah jadi controlled (`value/onChange`) tanpa side-effect langsung | theme source hanya dari parent state |
| `resources/js/components/settings/appearance-settings.tsx` | integrasi theme ke `onUpdate`, sinkron API | value UI = value backend |
| `resources/js/components/settings/general-settings.tsx` | validasi opsi sesuai backend | tidak ada invalid enum terkirim |
| `resources/js/components/settings/notification-settings.tsx` | merge nested update aman | toggle 1 field tidak merusak field lain |
| `resources/js/components/settings/privacy-settings.tsx` | support field tambahan jika backend ada | fallback aman untuk field optional |
| `resources/js/components/settings/security-settings.tsx` | 2FA action real, terminate session aman + UX jelas | tombol tidak no-op, ownership aman |
| `resources/js/components/settings/data-management-settings.tsx` | import/export guard, clear cache confirm, status error/success jelas | import invalid tertolak dengan pesan jelas |
| `resources/js/lib/settings-api.ts` | normalizer robust, category mapping, error surface standar | response lintas kategori konsisten |
| `resources/js/hooks/useTheme.ts` | satu source final runtime theme + persistence strategy | tidak ada mismatch `auto/system` |
| `resources/js/contexts/theme-context.tsx` | deprecate/merge agar tidak konflik | tidak dipakai dalam flow settings baru |
| `resources/js/hooks/use-appearance.tsx` | deprecate/merge agar tidak konflik | tidak override class theme dari source utama |

## Backend
| File | Tugas Utama | Acceptance |
|---|---|---|
| `app/Http/Controllers/Api/SettingsController.php` | validation, transform, category mapping, session security, clear-cache scoped | contract API stabil dan aman |
| `app/Services/PreferenceManagerService.php` | validasi field baru, merge defaults aman, flatten validasi konsisten | update kategori tidak drop key |
| `app/Models/UserPreference.php` | sinkronkan defaults dengan type FE final | get settings selalu lengkap |
| `app/Http/Middleware/HandleInertiaRequests.php` | shared props theme final konsisten | themePreference akurat untuk guard mahasiswa |
| `routes/api.php` | endpoint settings final konsisten middleware/guard | semua endpoint settings via jalur API utama |
| `routes/settings.php` | rapikan endpoint tema agar tidak konflik | satu kontrak tema final |

---

## 7. Test Cases dan Acceptance Criteria

## 7.1 Functional Acceptance
1. Theme berubah instan, reload tetap, tanpa mismatch `auto/system`.
2. Bahasa/timezone/date/time format berubah dan tampak nyata di UI.
3. Notifikasi menghormati channel preference.
4. Privacy membatasi visibilitas profil/activity sesuai setting.
5. 2FA action tidak no-op dan status sinkron.
6. Terminate session gagal untuk current session, berhasil untuk sesi lain milik user.
7. Login history menampilkan data valid sesuai user.
8. Export/import versioned; invalid payload ditolak dengan detail.
9. Clear-cache tidak destruktif global untuk user biasa.
10. Semua error API tampil sebagai pesan user-friendly.

## 7.2 Unit Tests
- Normalizer `auto -> system`.
- Normalizer `data` <-> `dataManagement`.
- Merge nested update kategori.
- Validator import schema/version.

## 7.3 Integration Tests (Backend)
- `GET /api/settings` shape konsisten.
- `PATCH /api/settings/{category}` untuk semua kategori.
- Session ownership/terminate safety.
- Login history limit dan status mapping.
- Export/import success & failure path.
- Scoped clear-cache behavior.

## 7.4 E2E Tests (Frontend)
- Flow ubah tema -> save -> refresh.
- Flow ubah bahasa/timezone/date format -> efek tampilan.
- Flow terminate sesi dari daftar.
- Flow import file invalid -> toast error.
- Flow reset default -> semua kategori kembali baseline.

---

## 8. Rollout, Monitoring, dan Mitigasi Risiko

## 8.1 Rollout Strategy
- Phase rollout internal (dev/staging) lalu production.
- Feature flag opsional untuk enforce privacy/security jika dibutuhkan.

## 8.2 Monitoring
- Tambah event analytics:
  - `settings_category_updated`
  - `settings_reset_clicked`
  - `settings_import_success`
  - `settings_import_failed`
  - `settings_session_terminated`
- Tambah audit log untuk perubahan security/privacy/theme.

## 8.3 Risiko dan Mitigasi
| Risiko | Mitigasi |
|---|---|
| Regresi lintas role untuk theme | test smoke admin/dosen/mahasiswa setelah unifikasi theme |
| Data settings lama tidak kompatibel | compatibility mapper + fallback defaults |
| Import payload lama | version-aware parser + migration mapper |
| Session query false-positive lintas model | validasi ownership by identity context guard/type |

---

## 9. Definition of Done (DoD)

Implementasi dianggap selesai jika:
1. Semua kontrol settings mahasiswa punya efek runtime nyata.
2. Tidak ada konflik sistem tema atau mismatch enum.
3. Kontrak API settings konsisten untuk success/error.
4. Endpoint security sensitif aman terhadap akses tidak sah.
5. Unit/integration/e2e test prioritas lulus.
6. Tidak ada bug blocker/critical pada regression checklist.
7. Changelog teknis dan dokumentasi rollout tersedia.

---

## 10. Asumsi dan Default yang Digunakan
1. Lokasi file dokumen di root repo.
2. Timeline implementasi: 7 hari sprint.
3. Bahasa dokumen: Indonesia teknis.
4. Scope utama: Menu Pengaturan Mahasiswa, namun konflik lintas sistem tema dibersihkan agar tidak regresi role lain.
5. Dokumen ini adalah blueprint implementasi decision-complete untuk dieksekusi bertahap.

