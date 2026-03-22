import 'dart:async';
import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/error_state.dart';
import '../../../../core/widgets/loading_state.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../domain/entities/profile.dart';
import '../providers/profile_provider.dart';

// ═══════════════════════════════════════════════════════════════════════
// PROFILE SCREEN — SUPER ADVANCE REDESIGN
// Matches web user/profile.tsx with glassmorphic, animated, premium UI
// ═══════════════════════════════════════════════════════════════════════

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});
  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _headerCtrl;
  int _activeTab = 0; // 0=Overview 1=Edit 2=Keamanan
  final _nameCtrl = TextEditingController();
  final _curPwdCtrl = TextEditingController();
  final _newPwdCtrl = TextEditingController();
  final _confirmPwdCtrl = TextEditingController();
  bool _showCurPwd = false, _showNewPwd = false, _showConfirmPwd = false;
  String _timeString = '';
  String _dateString = '';
  late Timer _clockTimer;

  @override
  void initState() {
    super.initState();
    _headerCtrl = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 5),
    )..repeat(reverse: true);

    _updateClock();
    _clockTimer = Timer.periodic(const Duration(seconds: 1), (_) => _updateClock());

    Future.microtask(() {
      ref.read(profileProvider.notifier).loadProfile().then((_) {
        final p = ref.read(profileProvider).profile;
        if (p != null) _nameCtrl.text = p.name;
      });
    });
  }

  void _updateClock() {
    if (!mounted) return;
    final now = DateTime.now();
    setState(() {
      _timeString = DateFormat('HH:mm').format(now);
      _dateString = DateFormat('EEEE, d MMMM yyyy', 'id_ID').format(now);
    });
  }

  @override
  void dispose() {
    _headerCtrl.dispose();
    _clockTimer.cancel();
    _nameCtrl.dispose();
    _curPwdCtrl.dispose();
    _newPwdCtrl.dispose();
    _confirmPwdCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickAvatar() async {
    final img = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      maxWidth: 512,
      maxHeight: 512,
      imageQuality: 85,
    );
    if (img == null) return;
    await ref.read(profileProvider.notifier).uploadAvatar(File(img.path));
    if (mounted) {
      final s = ref.read(profileProvider);
      if (s.updateSuccess) {
        _snack('Foto profil berhasil diperbarui ✅');
      } else if (s.errorMessage != null) {
        _snack(s.errorMessage!, isError: true);
      }
    }
  }

  void _snack(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: isError ? AppColors.error : AppColors.emerald500,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ));
  }

  // ═══════════════════════════════════════════════════════
  // BUILD
  // ═══════════════════════════════════════════════════════
  @override
  Widget build(BuildContext context) {
    final state = ref.watch(profileProvider);

    // Listen for success/error from update operations
    ref.listen<ProfileState>(profileProvider, (prev, next) {
      if (next.updateSuccess && !(prev?.updateSuccess ?? false)) {
        Future.microtask(() {
          if (mounted) ref.read(profileProvider.notifier).resetStatus();
        });
      }
    });

    if (state.isLoading && state.profile == null) {
      return const LoadingState(message: 'Memuat profil...');
    }
    if (state.errorMessage != null && state.profile == null) {
      return ErrorState(
        message: state.errorMessage!,
        onRetry: () => ref.read(profileProvider.notifier).loadProfile(),
      );
    }
    final profile = state.profile;
    if (profile == null) {
      return const Scaffold(body: Center(child: Text('Profil tidak ditemukan')));
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          // ── HEADER ──
          SliverToBoxAdapter(child: _buildHeader(profile!)),
          // ── BODY ──
          SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                children: [
                  _buildHeroCard(profile, state),
                  const SizedBox(height: 16),
                  _buildStatsGrid(),
                  const SizedBox(height: 24),
                  _buildTabBar(),
                  const SizedBox(height: 16),
                  AnimatedSwitcher(
                    duration: const Duration(milliseconds: 300),
                    switchInCurve: Curves.easeOut,
                    switchOutCurve: Curves.easeIn,
                    child: _activeTab == 0
                        ? _buildOverviewTab(profile!, key: const ValueKey(0))
                        : _activeTab == 1
                            ? _buildEditTab(profile!, state, key: const ValueKey(1))
                            : _buildSecurityTab(state, key: const ValueKey(2)),
                  ),
                  const SizedBox(height: 20),
                  _buildLogoutButton(),
                  const SizedBox(height: 80),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════
  Widget _buildHeader(ProfileEntity profile) {
    return Container(
      clipBehavior: Clip.antiAlias,
      padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.primaryDark,
            AppColors.primary,
            AppColors.primaryLight,
          ],
        ),
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(28),
          bottomRight: Radius.circular(28),
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.3),
            blurRadius: 20,
            offset: Offset(0, 8),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Batik pattern overlay
          Positioned.fill(
            child: Opacity(
              opacity: 0.08,
              child: Transform.scale(
                scale: 1.1,
                child: Image.asset(
                  'assets/images/batik_pattern.png',
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                ),
              ),
            ),
          ),
              // Content
              Padding(
                padding: EdgeInsets.fromLTRB(20, 12, 20, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Row 1: back + title + clock
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Profil Saya',
                                style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                            Text(profile.name,
                                style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 12)),
                          ],
                        ),
                        _glassClock(),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Date
                    Text(_dateString,
                        style: TextStyle(color: Colors.white.withOpacity(0.75), fontSize: 12)),
                    const SizedBox(height: 8),
                    // NIM badge removed per request
                ],
              ),
            ),
          ],
        ),
      );
  }

  Widget _glassButton(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.15),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.white.withOpacity(0.2)),
        ),
        child: Icon(icon, color: Colors.white, size: 20),
      ),
    );
  }

  Widget _glassClock() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.15),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.2)),
      ),
      child: Text(_timeString,
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
    );
  }

  Widget _nimBadge(String nim) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.2)),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Container(width: 8, height: 8,
            decoration: BoxDecoration(color: Colors.greenAccent, shape: BoxShape.circle)),
        const SizedBox(width: 8),
        Text('NIM: $nim',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13)),
      ]),
    );
  }

  Widget _actionChip(IconData icon, String label, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.2),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withOpacity(0.3)),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, color: Colors.white, size: 14),
          const SizedBox(width: 6),
          Text(label,
              style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
        ]),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════
  // 2. HERO PROFILE CARD
  // ═══════════════════════════════════════════════════════
  Widget _buildHeroCard(ProfileEntity profile, ProfileState state) {
    return Container(
      margin: EdgeInsets.only(top: 20),
      padding: EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 24, offset: Offset(0, 8)),
        ],
      ),
      child: Column(children: [
        // Avatar + verified badge
        Stack(children: [
          Container(
            padding: EdgeInsets.all(4),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(colors: [AppColors.violet500, AppColors.pink500]),
              boxShadow: [
                BoxShadow(color: AppColors.violet500.withOpacity(0.3), blurRadius: 16, offset: Offset(0, 6)),
              ],
            ),
            child: CircleAvatar(
              radius: 50,
              backgroundColor: Colors.grey[200],
              backgroundImage: profile.avatar != null
                  ? CachedNetworkImageProvider(profile.avatar!)
                  : null,
              child: profile.avatar == null
                  ? Text(profile.name.isNotEmpty ? profile.name[0] : 'M',
                      style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: AppColors.violet500))
                  : null,
            ),
          ),
          Positioned(
            bottom: 2, right: 2,
            child: Container(
              padding: EdgeInsets.all(3),
              decoration: BoxDecoration(color: Colors.white, shape: BoxShape.circle),
              child: const Icon(Icons.verified_rounded, color: AppColors.emerald500, size: 22),
            ),
          ),
        ]),
        const SizedBox(height: 16),
        // Name
        Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          Flexible(
            child: Text(profile.name,
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, letterSpacing: -0.5),
                textAlign: TextAlign.center),
          ),
          const SizedBox(width: 6),
          const Text('✨', style: TextStyle(fontSize: 18)),
        ]),
        const SizedBox(height: 4),
        Text('@${profile.nim}',
            style: TextStyle(fontSize: 14, color: Colors.grey[600], fontWeight: FontWeight.w500)),
        const SizedBox(height: 12),
        // Active badge
        Container(
          padding: EdgeInsets.symmetric(horizontal: 14, vertical: 6),
          decoration: BoxDecoration(
            color: AppColors.emerald500.withOpacity(0.1),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            Container(width: 7, height: 7,
                decoration: BoxDecoration(color: AppColors.emerald500, shape: BoxShape.circle)),
            const SizedBox(width: 8),
            const Text('Mahasiswa Aktif',
                style: TextStyle(color: AppColors.emerald500, fontSize: 12, fontWeight: FontWeight.bold)),
          ]),
        ),
        const SizedBox(height: 20),
        // Info chips
        Wrap(alignment: WrapAlignment.center, spacing: 8, runSpacing: 8, children: [
          _infoChip(Icons.mail_outline_rounded, profile.email ?? '-'),
          _infoChip(Icons.badge_outlined, profile.nim),
          _infoChip(Icons.check_circle_outline_rounded, 'Terverifikasi'),
        ]),
        const SizedBox(height: 24),
        // Buttons
        Row(children: [
          Expanded(
            child: _gradientButton('Edit Profil', Icons.edit_rounded, () => setState(() => _activeTab = 1)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: OutlinedButton.icon(
              onPressed: _pickAvatar,
              icon: Icon(Icons.camera_alt_outlined, size: 16, color: Colors.grey[700]),
              label: Text('Ganti Foto',
                  style: TextStyle(color: Colors.grey[800], fontWeight: FontWeight.bold, fontSize: 13)),
              style: OutlinedButton.styleFrom(
                padding: EdgeInsets.symmetric(vertical: 14),
                side: BorderSide(color: Colors.grey[300]!),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
            ),
          ),
        ]),
        if (state.isUpdating) ...[
          const SizedBox(height: 16),
          const LinearProgressIndicator(borderRadius: BorderRadius.all(Radius.circular(4))),
        ],
      ]),
    );
  }

  Widget _infoChip(IconData icon, String label) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(12)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 14, color: Colors.grey[600]),
        const SizedBox(width: 6),
        Flexible(
          child: Text(label,
              style: TextStyle(fontSize: 11, color: Colors.grey[700], fontWeight: FontWeight.w500),
              overflow: TextOverflow.ellipsis),
        ),
      ]),
    );
  }

  Widget _gradientButton(String label, IconData icon, VoidCallback onTap) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [AppColors.violet500, AppColors.indigo600]),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: AppColors.violet500.withOpacity(0.3), blurRadius: 12, offset: Offset(0, 6)),
        ],
      ),
      child: ElevatedButton.icon(
        onPressed: onTap,
        icon: Icon(icon, size: 16, color: Colors.white),
        label: Text(label,
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          shadowColor: Colors.transparent,
          padding: EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════
  // 3. STATS GRID
  // ═══════════════════════════════════════════════════════
  Widget _buildStatsGrid() {
    return Row(children: [
      Expanded(child: _statCard('Total\nKehadiran', '—', Icons.check_circle_rounded,
          AppColors.emerald500, AppColors.teal600)),
      const SizedBox(width: 10),
      Expanded(child: _statCard('Rata-rata\nHadir', '—', Icons.trending_up_rounded,
          AppColors.sky400, AppColors.sky500)),
      const SizedBox(width: 10),
      Expanded(child: _statCard('Streak\nSaat Ini', '—', Icons.local_fire_department_rounded,
          AppColors.amber400, AppColors.amber600)),
    ]);
  }

  Widget _statCard(String label, String value, IconData icon, Color c1, Color c2) {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 12, offset: Offset(0, 4)),
        ],
      ),
      child: Column(children: [
        Container(
          padding: EdgeInsets.all(10),
          decoration: BoxDecoration(
            gradient: LinearGradient(colors: [c1, c2]),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Icon(icon, color: Colors.white, size: 22),
        ),
        const SizedBox(height: 10),
        Text(value,
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text(label,
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 10, color: Colors.grey[500], fontWeight: FontWeight.w600,
                letterSpacing: 0.3)),
      ]),
    );
  }

  // ═══════════════════════════════════════════════════════
  // 4. TAB BAR
  // ═══════════════════════════════════════════════════════
  Widget _buildTabBar() {
    final tabs = [
      (Icons.person_outline_rounded, 'Overview'),
      (Icons.edit_note_rounded, 'Edit'),
      (Icons.lock_outline_rounded, 'Keamanan'),
    ];
    return Container(
      padding: EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: List.generate(tabs.length, (i) {
          final active = _activeTab == i;
          return Expanded(
            child: GestureDetector(
              onTap: () => setState(() => _activeTab = i),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                padding: EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  gradient: active
                      ? LinearGradient(colors: [AppColors.violet500, AppColors.purple600])
                      : null,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: active
                      ? [BoxShadow(color: AppColors.violet500.withOpacity(0.3),
                            blurRadius: 8, offset: Offset(0, 4))]
                      : null,
                ),
                child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Icon(tabs[i].$1, size: 16, color: active ? Colors.white : Colors.grey[600]),
                  const SizedBox(width: 6),
                  Text(tabs[i].$2,
                      style: TextStyle(
                        fontSize: 12, fontWeight: FontWeight.bold,
                        color: active ? Colors.white : Colors.grey[600],
                      )),
                ]),
              ),
            ),
          );
        }),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════
  // 5A. OVERVIEW TAB
  // ═══════════════════════════════════════════════════════
  Widget _buildOverviewTab(ProfileEntity p, {Key? key}) {
    return Column(key: key, children: [
      // Personal info
      _glassCard(
        icon: Icons.person_rounded,
        iconGradient: [AppColors.sky400, AppColors.sky500],
        title: 'Informasi Personal',
        subtitle: 'Data profil mahasiswa',
        child: Column(children: [
          _infoRow(Icons.person_outline_rounded, 'Nama Lengkap', p.name),
          _infoRow(Icons.badge_outlined, 'NIM', p.nim),
          _infoRow(Icons.email_outlined, 'Email', p.email ?? 'Belum diatur'),
          _infoRow(Icons.phone_outlined, 'Telepon', p.phone ?? 'Belum diatur'),
          _infoRow(Icons.school_outlined, 'Program Studi', p.prodi ?? 'Belum diatur'),
          _infoRow(Icons.class_outlined, 'Kelas', p.kelas ?? 'Belum diatur'),
          _infoRow(Icons.calendar_today_rounded, 'Semester', p.semester?.toString() ?? '-'),
          _infoRow(Icons.schedule_rounded, 'Jenis', p.jenisReguler ?? 'Reguler'),
        ]),
      ),
      const SizedBox(height: 16),
      // Academic stats
      _glassCard(
        icon: Icons.analytics_rounded,
        iconGradient: [AppColors.emerald400, AppColors.emerald500],
        title: 'Statistik Akademik',
        subtitle: 'Ringkasan kehadiran',
        child: Column(children: [
          _metricRow('Total Kehadiran', '—', AppColors.emerald500),
          _metricRow('Persentase Hadir', '—', AppColors.sky500),
          _metricRow('Streak Saat Ini', '—', AppColors.amber500),
          _metricRow('Tepat Waktu', '—', AppColors.violet500),
          const SizedBox(height: 12),
          // Profile completeness
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Text('Kelengkapan Profil',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.grey[700])),
              Text(_profileCompleteness(p),
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.violet500)),
            ]),
            const SizedBox(height: 6),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: _profileCompletenessValue(p),
                backgroundColor: Colors.grey[200],
                valueColor: const AlwaysStoppedAnimation(AppColors.violet500),
                minHeight: 6,
              ),
            ),
          ]),
        ]),
      ),
      const SizedBox(height: 16),
      // Account status
      _glassCard(
        icon: Icons.shield_outlined,
        iconGradient: [AppColors.indigo500, AppColors.indigo600],
        title: 'Status Akun',
        subtitle: 'Keamanan & aktivitas',
        child: Column(children: [
          _statusRow('Akun Terverifikasi', 'Aktif', AppColors.emerald500),
          const SizedBox(height: 8),
          _statusRow('Password', 'Ubah →', AppColors.amber500, onTap: () => setState(() => _activeTab = 2)),
          const SizedBox(height: 8),
          _statusRow('Aktivitas Terakhir',
              p.lastActivityAt != null ? _formatRelativeTime(p.lastActivityAt!) : 'Baru saja',
              Colors.grey[600]!),
        ]),
      ),
    ]);
  }

  String _profileCompleteness(ProfileEntity p) {
    int filled = 0, total = 7;
    if (p.name.isNotEmpty) filled++;
    if (p.email != null && p.email!.isNotEmpty) filled++;
    if (p.phone != null && p.phone!.isNotEmpty) filled++;
    if (p.prodi != null && p.prodi!.isNotEmpty) filled++;
    if (p.kelas != null && p.kelas!.isNotEmpty) filled++;
    if (p.semester != null) filled++;
    if (p.avatar != null && p.avatar!.isNotEmpty) filled++;
    return '${(filled / total * 100).round()}%';
  }

  double _profileCompletenessValue(ProfileEntity p) {
    int filled = 0, total = 7;
    if (p.name.isNotEmpty) filled++;
    if (p.email != null && p.email!.isNotEmpty) filled++;
    if (p.phone != null && p.phone!.isNotEmpty) filled++;
    if (p.prodi != null && p.prodi!.isNotEmpty) filled++;
    if (p.kelas != null && p.kelas!.isNotEmpty) filled++;
    if (p.semester != null) filled++;
    if (p.avatar != null && p.avatar!.isNotEmpty) filled++;
    return filled / total;
  }

  String _formatRelativeTime(String isoDate) {
    try {
      final dt = DateTime.parse(isoDate);
      final diff = DateTime.now().difference(dt);
      if (diff.inMinutes < 1) return 'Baru saja';
      if (diff.inMinutes < 60) return '${diff.inMinutes} menit lalu';
      if (diff.inHours < 24) return '${diff.inHours} jam lalu';
      if (diff.inDays < 7) return '${diff.inDays} hari lalu';
      return DateFormat('dd MMM yyyy', 'id_ID').format(dt);
    } catch (_) {
      return isoDate;
    }
  }

  // ═══════════════════════════════════════════════════════
  // 5B. EDIT PROFILE TAB
  // ═══════════════════════════════════════════════════════
  Widget _buildEditTab(ProfileEntity profile, ProfileState state, {Key? key}) {
    return Column(key: key, children: [
      _glassCard(
        icon: Icons.edit_rounded,
        iconGradient: [AppColors.violet500, AppColors.purple600],
        title: 'Edit Profil',
        subtitle: 'Perbarui informasi profil mahasiswa',
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Avatar section
          Container(
            padding: EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.grey[200]!),
            ),
            child: Row(children: [
              CircleAvatar(
                radius: 30,
                backgroundColor: Colors.grey[200],
                backgroundImage: profile.avatar != null
                    ? CachedNetworkImageProvider(profile.avatar!)
                    : null,
                child: profile.avatar == null
                    ? Text(profile.name[0],
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.violet500))
                    : null,
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Foto Profil',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 2),
                  Text('JPG/PNG maksimal 2MB',
                      style: TextStyle(fontSize: 11, color: Colors.grey[500])),
                  const SizedBox(height: 8),
                  SizedBox(
                    height: 32,
                    child: OutlinedButton.icon(
                      onPressed: _pickAvatar,
                      icon: const Icon(Icons.upload_rounded, size: 14),
                      label: const Text('Pilih Foto', style: TextStyle(fontSize: 11)),
                      style: OutlinedButton.styleFrom(
                        padding: EdgeInsets.symmetric(horizontal: 12),
                        side: BorderSide(color: Colors.grey[300]!),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
                ]),
              ),
            ]),
          ),
          const SizedBox(height: 20),
          // Name field (editable)
          _formField(
            label: 'NAMA LENGKAP',
            icon: Icons.person_outline_rounded,
            controller: _nameCtrl,
            enabled: true,
          ),
          const SizedBox(height: 16),
          // NIM (read-only)
          _formField(label: 'NIM', icon: Icons.badge_outlined,
              value: profile.nim, enabled: false),
          const SizedBox(height: 16),
          // Email (read-only)
          _formField(label: 'EMAIL', icon: Icons.email_outlined,
              value: profile.email ?? 'Belum diatur', enabled: false,
              hint: 'Email dikelola oleh sistem autentikasi.'),
          const SizedBox(height: 16),
          // Prodi (read-only)
          _formField(label: 'PROGRAM STUDI', icon: Icons.school_outlined,
              value: profile.prodi ?? 'Belum diatur', enabled: false),
          const SizedBox(height: 24),
          // Buttons
          Container(
            padding: EdgeInsets.only(top: 16),
            decoration: BoxDecoration(
              border: Border(top: BorderSide(color: Colors.grey[200]!)),
            ),
            child: Row(children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    _nameCtrl.text = profile.name;
                  },
                  icon: Icon(Icons.close_rounded, size: 16, color: Colors.grey[700]),
                  label: Text('Batal',
                      style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.bold)),
                  style: OutlinedButton.styleFrom(
                    padding: EdgeInsets.symmetric(vertical: 14),
                    side: BorderSide(color: Colors.grey[300]!),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _gradientButton(
                  state.isUpdating ? 'Menyimpan...' : 'Simpan',
                  Icons.save_rounded,
                  state.isUpdating ? () {} : () async {
                    if (_nameCtrl.text.trim().isEmpty) {
                      _snack('Nama tidak boleh kosong', isError: true);
                      return;
                    }
                    await ref.read(profileProvider.notifier).updateProfile(name: _nameCtrl.text.trim());
                    if (mounted) {
                      final s = ref.read(profileProvider);
                      if (s.updateSuccess) _snack('Profil berhasil diperbarui ✅');
                      if (s.errorMessage != null) _snack(s.errorMessage!, isError: true);
                    }
                  },
                ),
              ),
            ]),
          ),
        ]),
      ),
    ]);
  }

  Widget _formField({
    required String label,
    required IconData icon,
    TextEditingController? controller,
    String? value,
    bool enabled = true,
    String? hint,
  }) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label,
          style: TextStyle(
            fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey[500],
            letterSpacing: 1.2,
          )),
      const SizedBox(height: 6),
      TextField(
        controller: controller,
        enabled: enabled,
        decoration: InputDecoration(
          hintText: value,
          prefixIcon: Icon(icon, size: 18, color: Colors.grey[400]),
          filled: true,
          fillColor: enabled ? Colors.white : Colors.grey[100],
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide(color: Colors.grey[200]!),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide(color: Colors.grey[200]!),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: AppColors.violet500, width: 2),
          ),
          disabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide(color: Colors.grey[200]!),
          ),
          contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
        style: TextStyle(
          fontSize: 14, fontWeight: FontWeight.w500,
          color: enabled ? AppColors.textPrimary : Colors.grey[500],
        ),
      ),
      if (hint != null) ...[
        const SizedBox(height: 4),
        Text(hint, style: TextStyle(fontSize: 11, color: Colors.grey[400])),
      ],
    ]);
  }

  // ═══════════════════════════════════════════════════════
  // 5C. SECURITY TAB
  // ═══════════════════════════════════════════════════════
  Widget _buildSecurityTab(ProfileState state, {Key? key}) {
    return Column(key: key, children: [
      // Change password form
      _glassCard(
        icon: Icons.shield_rounded,
        iconGradient: [AppColors.rose400, AppColors.rose500],
        title: 'Keamanan Akun',
        subtitle: 'Ubah password untuk menjaga keamanan akun',
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          _passwordField('PASSWORD SAAT INI', _curPwdCtrl, _showCurPwd,
              () => setState(() => _showCurPwd = !_showCurPwd)),
          const SizedBox(height: 16),
          _passwordField('PASSWORD BARU', _newPwdCtrl, _showNewPwd,
              () => setState(() => _showNewPwd = !_showNewPwd)),
          // Password strength
          if (_newPwdCtrl.text.isNotEmpty) ...[
            const SizedBox(height: 12),
            _passwordStrengthIndicator(_newPwdCtrl.text),
          ],
          const SizedBox(height: 16),
          _passwordField('KONFIRMASI PASSWORD BARU', _confirmPwdCtrl, _showConfirmPwd,
              () => setState(() => _showConfirmPwd = !_showConfirmPwd)),
          const SizedBox(height: 24),
          Container(
            padding: EdgeInsets.only(top: 16),
            decoration: BoxDecoration(
              border: Border(top: BorderSide(color: Colors.grey[200]!)),
            ),
            child: Row(children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    _curPwdCtrl.clear();
                    _newPwdCtrl.clear();
                    _confirmPwdCtrl.clear();
                  },
                  icon: Icon(Icons.close_rounded, size: 16, color: Colors.grey[700]),
                  label: Text('Batal',
                      style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.bold)),
                  style: OutlinedButton.styleFrom(
                    padding: EdgeInsets.symmetric(vertical: 14),
                    side: BorderSide(color: Colors.grey[300]!),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(colors: [AppColors.rose400, AppColors.rose500]),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(color: AppColors.rose500.withOpacity(0.3),
                          blurRadius: 12, offset: Offset(0, 6)),
                    ],
                  ),
                  child: ElevatedButton.icon(
                    onPressed: state.isUpdating ? null : _handleChangePassword,
                    icon: const Icon(Icons.shield_rounded, size: 16, color: Colors.white),
                    label: Text(
                      state.isUpdating ? 'Menyimpan...' : 'Ubah Password',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      padding: EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                  ),
                ),
              ),
            ]),
          ),
        ]),
      ),
      const SizedBox(height: 16),
      // Tips keamanan
      _glassCard(
        icon: Icons.tips_and_updates_rounded,
        iconGradient: [AppColors.amber400, AppColors.orange600],
        title: 'Tips Keamanan',
        subtitle: 'Praktik terbaik untuk menjaga akun',
        child: Column(children: [
          _tipRow('Gunakan minimal 8 karakter dengan kombinasi huruf besar, kecil, dan angka.'),
          _tipRow('Jangan gunakan password yang sama dengan aplikasi lain.'),
          _tipRow('Simpan password di password manager, bukan catatan terbuka.'),
          _tipRow('Ubah password secara berkala jika merasa akun pernah diakses pihak lain.'),
        ]),
      ),
      const SizedBox(height: 16),
      // Summary
      _glassCard(
        icon: Icons.verified_user_rounded,
        iconGradient: [AppColors.indigo500, AppColors.purple600],
        title: 'Ringkasan Keamanan',
        subtitle: 'Status keamanan akun saat ini',
        child: Column(children: [
          _securitySummaryRow('Verifikasi Akun', 'Aktif', AppColors.emerald500),
          const SizedBox(height: 8),
          _securitySummaryRow('Update Password', 'Disarankan rutin', Colors.grey[500]!),
          const SizedBox(height: 8),
          _securitySummaryRow('Aktivitas Terakhir', 'Baru-baru ini', Colors.grey[500]!),
        ]),
      ),
    ]);
  }

  void _handleChangePassword() async {
    if (_curPwdCtrl.text.isEmpty || _newPwdCtrl.text.isEmpty || _confirmPwdCtrl.text.isEmpty) {
      _snack('Semua field harus diisi', isError: true);
      return;
    }
    if (_newPwdCtrl.text.length < 8) {
      _snack('Password baru minimal 8 karakter', isError: true);
      return;
    }
    if (_newPwdCtrl.text != _confirmPwdCtrl.text) {
      _snack('Konfirmasi password tidak cocok', isError: true);
      return;
    }
    await ref.read(profileProvider.notifier).changePassword(
      currentPassword: _curPwdCtrl.text,
      newPassword: _newPwdCtrl.text,
      confirmPassword: _confirmPwdCtrl.text,
    );
    if (mounted) {
      final s = ref.read(profileProvider);
      if (s.updateSuccess) {
        _snack('Password berhasil diubah ✅');
        _curPwdCtrl.clear();
        _newPwdCtrl.clear();
        _confirmPwdCtrl.clear();
      } else if (s.errorMessage != null) {
        _snack(s.errorMessage!, isError: true);
      }
    }
  }

  Future<void> _handleLogout() async {
    await ref.read(authProvider.notifier).logout();
    if (mounted) {
      context.go('/welcome');
    }
  }

  Widget _buildLogoutButton() {
    return SizedBox(
      width: double.infinity,
      height: 52,
      child: OutlinedButton.icon(
        onPressed: _handleLogout,
        icon: const Icon(Icons.logout_rounded, size: 18),
        label: const Text('Logout'),
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.error,
          side: BorderSide(color: AppColors.error.withOpacity(0.4)),
          backgroundColor: Colors.white,
          textStyle: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
      ),
    );
  }

  Widget _passwordField(String label, TextEditingController ctrl, bool show, VoidCallback toggle) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label,
          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey[500],
              letterSpacing: 1.2)),
      const SizedBox(height: 6),
      TextField(
        controller: ctrl,
        obscureText: !show,
        onChanged: (_) => setState(() {}), // refresh strength indicator
        decoration: InputDecoration(
          prefixIcon: Icon(Icons.key_rounded, size: 18, color: Colors.grey[400]),
          suffixIcon: IconButton(
            icon: Icon(show ? Icons.visibility_off_rounded : Icons.visibility_rounded,
                size: 18, color: Colors.grey[400]),
            onPressed: toggle,
          ),
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide(color: Colors.grey[200]!),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide(color: Colors.grey[200]!),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: AppColors.violet500, width: 2),
          ),
          contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          hintText: '••••••••',
          hintStyle: TextStyle(color: Colors.grey[300]),
        ),
        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
      ),
    ]);
  }

  Widget _passwordStrengthIndicator(String pwd) {
    int score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.contains(RegExp(r'[A-Z]'))) score++;
    if (pwd.contains(RegExp(r'[a-z]'))) score++;
    if (pwd.contains(RegExp(r'[0-9]'))) score++;
    if (pwd.contains(RegExp(r'[!@#\$%\^&\*]'))) score++;

    final labels = ['Sangat Lemah', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'];
    final colors = [AppColors.error, AppColors.rose500, AppColors.amber500, AppColors.sky500, AppColors.emerald500];
    final idx = (score - 1).clamp(0, 4);

    return Container(
      padding: EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.sky400.withOpacity(0.08),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.sky400.withOpacity(0.2)),
      ),
      child: Column(children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text('Kekuatan Password',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Colors.blue[700])),
          Text(labels[idx],
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: colors[idx])),
        ]),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: score / 5,
            backgroundColor: Colors.grey[200],
            valueColor: AlwaysStoppedAnimation(colors[idx]),
            minHeight: 6,
          ),
        ),
      ]),
    );
  }

  Widget _tipRow(String text) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8),
      child: Container(
        padding: EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.grey[50],
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Icon(Icons.check_circle_rounded, size: 16, color: AppColors.emerald500),
          const SizedBox(width: 10),
          Expanded(
            child: Text(text,
                style: TextStyle(fontSize: 13, color: Colors.grey[700])),
          ),
        ]),
      ),
    );
  }

  Widget _securitySummaryRow(String label, String value, Color valueColor) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: valueColor == AppColors.emerald500
            ? AppColors.emerald500.withOpacity(0.08)
            : Colors.grey[50],
        borderRadius: BorderRadius.circular(16),
        border: valueColor == AppColors.emerald500
            ? Border.all(color: AppColors.emerald500.withOpacity(0.2))
            : null,
      ),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text(label,
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600,
                color: valueColor == AppColors.emerald500 ? AppColors.emerald500 : Colors.grey[700])),
        Container(
          padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: valueColor == AppColors.emerald500 ? AppColors.emerald500 : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Text(value,
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold,
                  color: valueColor == AppColors.emerald500 ? Colors.white : Colors.grey[500])),
        ),
      ]),
    );
  }

  // ═══════════════════════════════════════════════════════
  // REUSABLE WIDGETS
  // ═══════════════════════════════════════════════════════
  Widget _glassCard({
    required IconData icon,
    required List<Color> iconGradient,
    required String title,
    required String subtitle,
    required Widget child,
  }) {
    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 16, offset: Offset(0, 4)),
        ],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        // Header
        Row(children: [
          Container(
            padding: EdgeInsets.all(10),
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: iconGradient),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, size: 18, color: Colors.white),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(title,
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
              Text(subtitle,
                  style: TextStyle(fontSize: 11, color: Colors.grey[500])),
            ]),
          ),
        ]),
        const SizedBox(height: 20),
        child,
      ]),
    );
  }

  Widget _infoRow(IconData icon, String label, String value) {
    return Padding(
      padding: EdgeInsets.only(bottom: 12),
      child: Row(children: [
        Container(
          padding: EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.grey[100],
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, size: 16, color: Colors.grey[600]),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(label,
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600,
                    color: Colors.grey[500], letterSpacing: 0.5)),
            const SizedBox(height: 2),
            Text(value,
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
          ]),
        ),
      ]),
    );
  }

  Widget _metricRow(String label, String value, Color color) {
    return Padding(
      padding: EdgeInsets.only(bottom: 10),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Row(children: [
          Container(
            width: 10, height: 10,
            decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(3)),
          ),
          const SizedBox(width: 10),
          Text(label,
              style: TextStyle(fontSize: 13, color: Colors.grey[700], fontWeight: FontWeight.w500)),
        ]),
        Text(value,
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
      ]),
    );
  }

  Widget _statusRow(String label, String value, Color valueColor, {VoidCallback? onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: valueColor == AppColors.emerald500
              ? AppColors.emerald500.withOpacity(0.08)
              : Colors.grey[50],
          borderRadius: BorderRadius.circular(14),
          border: valueColor == AppColors.emerald500
              ? Border.all(color: AppColors.emerald500.withOpacity(0.2))
              : null,
        ),
        child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text(label,
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600,
                  color: valueColor == AppColors.emerald500 ? AppColors.emerald500 : Colors.grey[700])),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: valueColor == AppColors.emerald500 ? AppColors.emerald500 : AppColors.amber500,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(value,
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white)),
          ),
        ]),
      ),
    );
  }
}
