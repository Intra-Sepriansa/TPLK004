import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/di/injection.dart';
import '../../../home/data/datasources/home_remote_datasource.dart';
import '../../data/datasources/attendance_remote_datasource.dart';
import '../../domain/entities/attendance.dart';
import '../../domain/entities/attendance_stats.dart';

/// Rekapan & Evaluasi — matching web user/rekapan.tsx
class RekapanScreen extends StatefulWidget {
  const RekapanScreen({super.key});

  @override
  State<RekapanScreen> createState() => _RekapanScreenState();
}

class _RekapanScreenState extends State<RekapanScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _gradientController;
  late Timer _clockTimer;
  DateTime _currentTime = DateTime.now();

  String _userName = '';
  AttendanceStatsEntity? _stats;
  List<AttendanceEntity> _allRecords = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _gradientController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 5),
    )..repeat(reverse: true);
    _clockTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _currentTime = DateTime.now());
    });
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final homeDs = getIt<HomeRemoteDataSource>();
      final attendanceDs = getIt<AttendanceRemoteDataSource>();

      final profileFuture = homeDs.fetchFullDashboard();
      final statsFuture = attendanceDs.fetchStats();
      final recordsFuture = attendanceDs.fetchAllRecords();

      final profile = await profileFuture;
      final statsModel = await statsFuture;
      final recordModels = await recordsFuture;

      if (mounted) {
        setState(() {
          _userName = profile.profile.name;
          _stats = statsModel;
          _allRecords = recordModels.map((m) => m as AttendanceEntity).toList();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _gradientController.dispose();
    _clockTimer.cancel();
    super.dispose();
  }

  // ── Course summary data ──
  List<_CourseSummary> get _courseSummaries {
    final Map<String, _CourseSummary> map = {};
    for (final r in _allRecords) {
      final key = r.mataKuliah;
      final entry = map.putIfAbsent(key, () => _CourseSummary(name: key));
      entry.total++;
      final status = r.status.toLowerCase();
      if (status == 'present' || status == 'hadir') {
        entry.present++;
      } else if (status == 'late' || status == 'terlambat') {
        entry.late++;
      } else if (status == 'rejected' || status == 'ditolak') {
        entry.rejected++;
      }
    }
    return map.values.toList()..sort((a, b) => b.total.compareTo(a.total));
  }

  // ── Recent 10 records ──
  List<AttendanceEntity> get _recentRecords {
    final sorted = List<AttendanceEntity>.from(_allRecords)
      ..sort((a, b) => b.date.compareTo(a.date));
    return sorted.take(10).toList();
  }

  String _getInitials(String name) {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    return name.isNotEmpty ? name[0].toUpperCase() : '?';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: CustomScrollView(
          slivers: [
            // ═══ HEADER ═══
            SliverToBoxAdapter(child: _buildHeader()),

            // ═══ CONTENT ═══
            if (_isLoading)
              const SliverFillRemaining(
                child: Center(child: CircularProgressIndicator()),
              )
            else if (_error != null)
              SliverFillRemaining(
                child: Center(
                  child: Padding(
                    padding: EdgeInsets.all(32),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.error_outline, size: 48, color: AppColors.rose500),
                        const SizedBox(height: 12),
                        Text(_error!, textAlign: TextAlign.center),
                        const SizedBox(height: 12),
                        ElevatedButton(onPressed: _loadData, child: const Text('Coba Lagi')),
                      ],
                    ),
                  ),
                ),
              )
            else
              SliverPadding(
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    // ── Stat Cards ──
                    _buildStatCards(),
                    const SizedBox(height: 20),

                    // ── Evaluasi Kehadiran ──
                    _buildAttendanceEvaluation(),
                    const SizedBox(height: 20),

                    // ── Ringkasan per MK ──
                    _buildCourseSummary(),
                    const SizedBox(height: 20),

                    // ── Aktivitas Terakhir ──
                    _buildRecentActivity(),
                    const SizedBox(height: 80),
                  ]),
                ),
              ),
          ],
        ),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════
  // HEADER — Same as AbsensiHeaderWidget / Scan QR
  // ═══════════════════════════════════════════════════════
  Widget _buildHeader() {
    final timeStr = DateFormat.Hm().format(_currentTime);
    final dateStr = DateFormat('EEEE, d MMMM yyyy', 'id_ID').format(_currentTime);

    return Container(
      clipBehavior: Clip.antiAlias,
      width: double.infinity,
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
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Static Batik Pattern
          Positioned.fill(
            child: Opacity(
              opacity: 0.06,
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
          SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Top Row: Back + Avatar + Name + Clock
                  Row(
                    children: [
                      GestureDetector(
                        onTap: () => Navigator.pop(context),
                        child: const Padding(
                          padding: EdgeInsets.all(8.0),
                          child: Icon(Icons.arrow_back_rounded, color: Colors.white, size: 26),
                        ),
                      ),
                      const SizedBox(width: 14),
                      // Avatar
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white.withOpacity(0.2),
                          border: Border.all(color: Colors.white.withOpacity(0.3), width: 2),
                        ),
                        child: Center(
                          child: Text(
                            _getInitials(_userName),
                            style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      // Name
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Rekapan & Evaluasi',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.8),
                                fontSize: 11,
                                fontWeight: FontWeight.w500,
                                letterSpacing: 0.5,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              _userName.isNotEmpty ? _userName : 'Mahasiswa',
                              style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      // Clock
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.white.withOpacity(0.2)),
                        ),
                        child: Column(
                          children: [
                            Text(timeStr,
                                style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 2),
                            Text(dateStr,
                                style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 8)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Title + Description
                  const Text(
                    'Rekapan & Evaluasi',
                    style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Ringkasan kehadiran dan evaluasi performa akademik semester ini.',
                    style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 13, height: 1.5),
                  ),
                  const SizedBox(height: 16),
                  // Buttons
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _buildHeaderButton(
                        icon: Icons.refresh_rounded,
                        label: 'Refresh',
                        onTap: _loadData,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderButton({required IconData icon, required String label, required VoidCallback onTap}) {
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.white.withOpacity(0.3)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 16, color: Colors.white),
              const SizedBox(width: 6),
              Text(label, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white)),
            ],
          ),
        ),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════
  // STAT CARDS — 2x2 grid
  // ═══════════════════════════════════════════════════════
  Widget _buildStatCards() {
    final s = _stats;
    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      childAspectRatio: 1.15,
      children: [
        _StatCard(
          icon: Icons.check_circle_rounded,
          label: 'Hadir',
          value: '${s?.present ?? 0}',
          subtext: 'tepat waktu',
          gradient: const [Color(0xFF34D399), Color(0xFF0D9488)],
        ),
        _StatCard(
          icon: Icons.access_time_filled_rounded,
          label: 'Terlambat',
          value: '${s?.late ?? 0}',
          subtext: 'sesi',
          gradient: const [Color(0xFFFBBF24), Color(0xFFEA580C)],
        ),
        _StatCard(
          icon: Icons.cancel_rounded,
          label: 'Ditolak',
          value: '${s?.absent ?? 0}',
          subtext: 'sesi',
          gradient: const [Color(0xFFFB7185), Color(0xFFF43F5E)],
        ),
        _StatCard(
          icon: Icons.flag_rounded,
          label: 'Target',
          value: '75%',
          subtext: 'min. kehadiran',
          gradient: const [Color(0xFF8B5CF6), Color(0xFF6366F1)],
        ),
      ],
    );
  }

  // ═══════════════════════════════════════════════════════
  // ATTENDANCE EVALUATION — like web "Evaluasi Kehadiran" box
  // ═══════════════════════════════════════════════════════
  Widget _buildAttendanceEvaluation() {
    final s = _stats;
    final rate = s?.presentRate ?? 0;
    final total = s?.total ?? 0;
    final present = s?.present ?? 0;
    final late_ = s?.late ?? 0;
    final streak = s?.streak ?? 0;
    final longestStreak = s?.longestStreak ?? 0;

    final isHealthy = rate >= 75;  // ignore: unused_local_variable
    final statusText = rate >= 90
        ? 'Sangat Baik'
        : rate >= 75
            ? 'Baik'
            : rate >= 50
                ? 'Perlu Perhatian'
                : 'Kritis';
    final statusColor = rate >= 90
        ? AppColors.emerald500
        : rate >= 75
            ? AppColors.sky500
            : rate >= 50
                ? AppColors.amber500
                : AppColors.rose500;

    return _GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionHeader(
            icon: Icons.analytics_rounded,
            iconColor: AppColors.violet500,
            title: 'Evaluasi Kehadiran',
            subtitle: '$total sesi tercatat',
          ),
          const SizedBox(height: 20),

          // Main Rate Circle
          Center(
            child: Column(
              children: [
                Stack(
                  alignment: Alignment.center,
                  children: [
                    SizedBox(
                      width: 120,
                      height: 120,
                      child: CircularProgressIndicator(
                        value: rate / 100,
                        strokeWidth: 10,
                        backgroundColor: statusColor.withOpacity(0.1),
                        valueColor: AlwaysStoppedAnimation(statusColor),
                        strokeCap: StrokeCap.round,
                      ),
                    ),
                    Column(
                      children: [
                        Text(
                          '${rate.toStringAsFixed(1)}%',
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.w900,
                            color: statusColor,
                          ),
                        ),
                        Text(
                          statusText,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: statusColor,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  'Tingkat Kehadiran',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Quick Stats Row
          Row(
            children: [
              Expanded(
                child: _EvalMetric(
                  label: 'Total Hadir',
                  value: '$present',
                  icon: Icons.check_circle_rounded,
                  color: AppColors.emerald500,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _EvalMetric(
                  label: 'Terlambat',
                  value: '$late_',
                  icon: Icons.access_time_rounded,
                  color: AppColors.amber500,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _EvalMetric(
                  label: 'Streak',
                  value: '$streak',
                  icon: Icons.local_fire_department_rounded,
                  color: AppColors.rose500,
                ),
              ),
            ],
          ),

          if (longestStreak > 0) ...[
            const SizedBox(height: 12),
            Container(
              padding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.amber500.withOpacity(0.06),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.amber500.withOpacity(0.15)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.emoji_events_rounded, size: 18, color: AppColors.amber500),
                  const SizedBox(width: 10),
                  Text(
                    'Streak Terpanjang: $longestStreak hari berturut-turut',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════
  // COURSE SUMMARY — matching web "Ringkasan per Mata Kuliah"
  // ═══════════════════════════════════════════════════════
  Widget _buildCourseSummary() {
    final summaries = _courseSummaries;
    return _GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionHeader(
            icon: Icons.menu_book_rounded,
            iconColor: AppColors.violet500,
            title: 'Ringkasan per Mata Kuliah',
            subtitle: '${summaries.length} mata kuliah',
          ),
          const SizedBox(height: 16),
          if (summaries.isEmpty)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(20),
                child: Text('Belum ada data mata kuliah',
                    style: TextStyle(color: AppColors.textSecondary)),
              ),
            )
          else
            ...summaries.map((course) {
              final rate = course.total > 0
                  ? ((course.present + course.late) / course.total * 100)
                  : 0.0;
              final rateColor = rate >= 75
                  ? AppColors.emerald500
                  : rate >= 50
                      ? AppColors.amber500
                      : AppColors.rose500;

              return Container(
                margin: EdgeInsets.only(bottom: 12),
                padding: EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title + Rate Badge
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            course.name,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: rateColor.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '${rate.toStringAsFixed(0)}%',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              color: rateColor,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    // Progress Bar
                    ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: LinearProgressIndicator(
                        value: rate / 100,
                        minHeight: 8,
                        backgroundColor: AppColors.divider,
                        valueColor: AlwaysStoppedAnimation(rateColor),
                      ),
                    ),
                    const SizedBox(height: 10),
                    // Detail Counts
                    Row(
                      children: [
                        _CourseDetailChip(label: 'Hadir', count: course.present, color: AppColors.emerald500),
                        const SizedBox(width: 12),
                        _CourseDetailChip(label: 'Terlambat', count: course.late, color: AppColors.amber500),
                        const SizedBox(width: 12),
                        _CourseDetailChip(label: 'Ditolak', count: course.rejected, color: AppColors.rose500),
                      ],
                    ),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════
  // RECENT ACTIVITY — last 10 records
  // ═══════════════════════════════════════════════════════
  Widget _buildRecentActivity() {
    final recent = _recentRecords;
    return _GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionHeader(
            icon: Icons.access_time_rounded,
            iconColor: AppColors.sky500,
            title: 'Aktivitas Terakhir',
            subtitle: '${recent.length} terbaru',
          ),
          const SizedBox(height: 16),
          if (recent.isEmpty)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(20),
                child: Text('Belum ada aktivitas', 
                    style: TextStyle(color: AppColors.textSecondary)),
              ),
            )
          else
            ...recent.map((r) {
              final statusLabel = _getStatusLabel(r.status);
              final statusColor = _getStatusColor(r.status);
              final statusIcon = _getStatusIcon(r.status);

              String dateStr = r.date;
              try {
                final dt = DateTime.parse(r.date);
                dateStr = DateFormat('dd MMM yyyy', 'id_ID').format(dt);
              } catch (_) {}

              return Container(
                margin: EdgeInsets.only(bottom: 8),
                padding: EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(statusIcon, size: 20, color: statusColor),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            r.mataKuliah,
                            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '$dateStr • ${r.checkIn ?? '-'}',
                            style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        statusLabel,
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: statusColor),
                      ),
                    ),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }

  String _getStatusLabel(String status) {
    switch (status.toLowerCase()) {
      case 'present':
      case 'hadir':
        return 'Hadir';
      case 'late':
      case 'terlambat':
        return 'Terlambat';
      case 'rejected':
      case 'ditolak':
        return 'Ditolak';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'present':
      case 'hadir':
        return AppColors.emerald500;
      case 'late':
      case 'terlambat':
        return AppColors.amber500;
      case 'rejected':
      case 'ditolak':
        return AppColors.rose500;
      default:
        return AppColors.sky500;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'present':
      case 'hadir':
        return Icons.check_circle_rounded;
      case 'late':
      case 'terlambat':
        return Icons.access_time_filled_rounded;
      case 'rejected':
      case 'ditolak':
        return Icons.cancel_rounded;
      default:
        return Icons.hourglass_top_rounded;
    }
  }
}

// ═══════════════════════════════════════════════════════
// HELPER CLASSES
// ═══════════════════════════════════════════════════════

class _CourseSummary {
  final String name;
  int total = 0;
  int present = 0;
  int late = 0;
  int rejected = 0;

  _CourseSummary({required this.name});
}

// ═══════════════════════════════════════════════════════
// REUSABLE WIDGETS
// ═══════════════════════════════════════════════════════

class _GlassCard extends StatelessWidget {
  final Widget child;
  const _GlassCard({required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.8),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.3)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 20,
            offset: Offset(0, 8),
          )
        ],
      ),
      child: child,
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;

  const _SectionHeader({required this.icon, required this.iconColor, required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: iconColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: iconColor.withOpacity(0.2)),
          ),
          child: Icon(icon, size: 20, color: iconColor),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
              const SizedBox(height: 2),
              Text(subtitle, style: TextStyle(fontSize: 12, color: AppColors.textSecondary), maxLines: 1, overflow: TextOverflow.ellipsis),
            ],
          ),
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final String subtext;
  final List<Color> gradient;

  const _StatCard({required this.icon, required this.label, required this.value, required this.subtext, required this.gradient});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.8),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.3)),
        boxShadow: [
          BoxShadow(color: gradient[0].withOpacity(0.15), blurRadius: 16, offset: Offset(0, 6)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: EdgeInsets.all(8),
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: gradient),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, size: 20, color: Colors.white),
          ),
          const SizedBox(height: 8),
          Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: gradient[0])),
          Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
          Text(subtext, style: TextStyle(fontSize: 10, color: AppColors.textSecondary)),
        ],
      ),
    );
  }
}

class _EvalMetric extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _EvalMetric({required this.label, required this.value, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.06),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withOpacity(0.1)),
      ),
      child: Column(
        children: [
          Icon(icon, size: 22, color: color),
          const SizedBox(height: 6),
          Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: color)),
          const SizedBox(height: 2),
          Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
        ],
      ),
    );
  }
}

class _CourseDetailChip extends StatelessWidget {
  final String label;
  final int count;
  final Color color;

  const _CourseDetailChip({required this.label, required this.count, required this.color});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 4),
        Text('$label: $count', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
      ],
    );
  }
}
