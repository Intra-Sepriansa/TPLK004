import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/empty_state_widget.dart';
import '../../domain/entities/tugas_data.dart';
import '../providers/tugas_provider.dart';
import '../widgets/tugas_header_widget.dart';

class TugasKelompokScreen extends ConsumerStatefulWidget {
  const TugasKelompokScreen({super.key});

  @override
  ConsumerState<TugasKelompokScreen> createState() => _TugasKelompokScreenState();
}

class _TugasKelompokScreenState extends ConsumerState<TugasKelompokScreen> {
  final TextEditingController _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(tugasProvider.notifier).loadDashboard());
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _refresh() async {
    await ref.read(tugasProvider.notifier).loadDashboard();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(tugasProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final kelompokData = state.kelompokData;
    if (state.isLoading && kelompokData == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (state.errorMessage != null && kelompokData == null) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(state.errorMessage!, style: TextStyle(color: Colors.red)),
              ElevatedButton(onPressed: _refresh, child: const Text('Coba Lagi')),
            ],
          ),
        ),
      );
    }

    final assignments = kelompokData?.assignments ?? [];
    
    // Filter logic
    final query = state.searchQuery.toLowerCase();
    var filtered = assignments;
    if (query.isNotEmpty) {
      filtered = filtered.where((e) => e.title.toLowerCase().contains(query)).toList();
    }
    if (state.groupStatusFilter != 'all') {
      filtered = filtered.where((e) => e.status == state.groupStatusFilter).toList();
    }

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
      body: RefreshIndicator(
        onRefresh: _refresh,
        color: AppColors.indigo600,
        child: ListView(
          padding: EdgeInsets.only(bottom: 40),
          children: [
            TugasHeader(
              onBack: () => context.pop(),
              title: 'Tugas Kelompok',
              subtitle: 'Dashboard Tugas Kelompok',
              badgeLeft: kelompokData?.stats.activeGroups ?? 0,
              badgeRight: kelompokData?.stats.total ?? 0,
            ),
            const SizedBox(height: 16),
            _buildStatsGrid(kelompokData?.stats, isDark),
            const SizedBox(height: 24),
            _buildFilterSection(state, isDark),
            const SizedBox(height: 16),
            if (filtered.isEmpty)
              SizedBox(
                height: 300,
                child: EmptyStateWidget.noData(message: 'Tidak ada tugas kelompok yang sesuai.'),
              )
            else
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 16),
                child: Column(
                  children: filtered.map((e) => _AssignmentCard(assignment: e, isDark: isDark)).toList(),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsGrid(TugasKelompokStats? stats, bool isDark) {
    if (stats == null) return const SizedBox.shrink();

    final statItems = [
      {
        'label': 'Total Tugas',
        'value': '${stats.total}',
        'sub': 'Semua tugas kelompok',
        'icon': Icons.assignment_rounded,
        'colors': [const Color(0xFF3B82F6), const Color(0xFF06B6D4)],
      },
      {
        'label': 'Sedang Berjalan',
        'value': '${stats.activeGroups}',
        'sub': 'Kelompok aktif',
        'icon': Icons.groups_rounded,
        'colors': [const Color(0xFF10B981), const Color(0xFF34D399)],
      },
      {
        'label': 'Selesai',
        'value': '${stats.completed}',
        'sub': 'Telah dinilai/submit',
        'icon': Icons.check_circle_outline_rounded,
        'colors': [const Color(0xFFF59E0B), const Color(0xFFFCD34D)],
      },
      {
        'label': 'Belum Gabung',
        'value': '${stats.notJoined}',
        'sub': 'Butuh perhatian',
        'icon': Icons.error_outline_rounded,
        'colors': [const Color(0xFFEF4444), const Color(0xFFFCA5A5)],
      },
    ];

    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16),
      child: GridView.builder(
        padding: EdgeInsets.zero,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 1.15,
        ),
        itemCount: statItems.length,
        itemBuilder: (context, i) {
          final item = statItems[i];
          final colors = item['colors'] as List<Color>;
          return _buildStatCard(
            label: item['label'] as String,
            value: item['value'] as String,
            sub: item['sub'] as String,
            icon: item['icon'] as IconData,
            colors: colors,
            isDark: isDark,
          );
        },
      ),
    );
  }

  Widget _buildStatCard({
    required String label,
    required String value,
    required String sub,
    required IconData icon,
    required List<Color> colors,
    required bool isDark,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withOpacity(0.05) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: isDark ? Colors.white.withOpacity(0.1) : Colors.black.withOpacity(0.05),
        ),
        boxShadow: [
          BoxShadow(
            color: colors[0].withOpacity(0.1),
            blurRadius: 16,
            offset: Offset(0, 8),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Stack(
          children: [
            // Background glow
            Positioned(
              right: -20,
              top: -20,
              child: Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: colors[0].withOpacity(0.15),
                ),
              ),
            ),
            Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: colors[0].withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(icon, color: colors[0], size: 20),
                  ),
                  const Spacer(),
                  Text(
                    value,
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    label,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.white70 : Colors.black54,
                    ),
                  ),
                  Text(
                    sub,
                    style: TextStyle(
                      fontSize: 10,
                      color: isDark ? Colors.white54 : Colors.black45,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterSection(TugasDashboardState state, bool isDark) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          TextField(
            controller: _searchCtrl,
            onChanged: (v) => ref.read(tugasProvider.notifier).setSearchQuery(v),
            decoration: InputDecoration(
              hintText: 'Cari tugas...',
              prefixIcon: const Icon(Icons.search),
              filled: true,
              fillColor: isDark ? Colors.white.withOpacity(0.05) : Colors.white,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide.none,
              ),
              contentPadding: EdgeInsets.symmetric(vertical: 0),
            ),
          ),
          const SizedBox(height: 12),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _filterChip('Semua', 'all', state.groupStatusFilter == 'all', isDark),
                _filterChip('Belum Gabung', 'not_joined', state.groupStatusFilter == 'not_joined', isDark),
                _filterChip('Sedang Berjalan', 'joined', state.groupStatusFilter == 'joined', isDark),
                _filterChip('Sudah Dikumpul', 'submitted', state.groupStatusFilter == 'submitted', isDark),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _filterChip(String label, String value, bool isSelected, bool isDark) {
    return Padding(
      padding: EdgeInsets.only(right: 8),
      child: GestureDetector(
        onTap: () => ref.read(tugasProvider.notifier).setGroupStatusFilter(value),
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.indigo600 : (isDark ? Colors.white.withOpacity(0.05) : Colors.white),
            borderRadius: BorderRadius.circular(999),
            border: Border.all(
              color: isSelected ? AppColors.indigo600 : (isDark ? Colors.white24 : Colors.black12),
            ),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: AppColors.indigo600.withOpacity(0.3),
                      blurRadius: 8,
                      offset: Offset(0, 4),
                    )
                  ]
                : null,
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: isSelected ? Colors.white : (isDark ? Colors.white70 : Colors.black54),
            ),
          ),
        ),
      ),
    );
  }
}

class _AssignmentCard extends StatelessWidget {
  const _AssignmentCard({required this.assignment, required this.isDark});

  final TugasKelompokAssignment assignment;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    Color statusColor;
    String statusLabel;
    IconData statusIcon;

    switch (assignment.status) {
      case 'not_joined':
        statusColor = const Color(0xFFF59E0B);
        statusLabel = 'Belum Bergabung';
        statusIcon = Icons.error_outline_rounded;
        break;
      case 'joined':
        statusColor = const Color(0xFF10B981);
        statusLabel = 'Sedang Berjalan';
        statusIcon = Icons.groups_rounded;
        break;
      case 'submitted':
        statusColor = const Color(0xFF3B82F6);
        statusLabel = 'Sudah Dikumpulkan';
        statusIcon = Icons.check_circle_outline_rounded;
        break;
      default:
        statusColor = Colors.grey;
        statusLabel = assignment.status;
        statusIcon = Icons.info_outline_rounded;
    }

    Color formationColor;
    switch (assignment.formationMode) {
      case 'self-form':
        formationColor = const Color(0xFF0EA5E9);
        break;
      case 'random':
        formationColor = const Color(0xFF8B5CF6);
        break;
      case 'manual':
        formationColor = const Color(0xFFF59E0B);
        break;
      default:
        formationColor = Colors.grey;
    }

    final double progress = assignment.myGroup?.progress ?? 0.0;
    
    String deadlineInfo;
    if (assignment.isOverdue) {
      deadlineInfo = 'Deadline terlewat';
    } else if (assignment.daysUntilDeadline != null) {
      if (assignment.daysUntilDeadline == 0) {
        deadlineInfo = 'Deadline hari ini';
      } else if (assignment.daysUntilDeadline == 1) {
        deadlineInfo = 'Deadline besok';
      } else if (assignment.daysUntilDeadline! < 0) {
        deadlineInfo = 'Deadline terlewat';
      } else {
        deadlineInfo = '${assignment.daysUntilDeadline} hari lagi';
      }
    } else {
      deadlineInfo = assignment.submissionDeadlineDisplay ?? '-';
    }

    return GestureDetector(
      onTap: () => context.push('/app/tugas-kelompok/${assignment.id}'),
      child: Container(
        margin: EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: isDark ? Colors.white.withOpacity(0.03) : Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isDark ? Colors.white.withOpacity(0.08) : Colors.black.withOpacity(0.05),
          ),
          boxShadow: [
            BoxShadow(
              color: (isDark ? Colors.black : const Color(0xFF4F46E5)).withOpacity(0.05),
              blurRadius: 20,
              offset: Offset(0, 10),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(24),
          child: Stack(
            children: [
              // Glassmorphic blur reflection
              Positioned(
                right: -40,
                top: -40,
                child: Container(
                  width: 150,
                  height: 150,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: statusColor.withOpacity(0.1),
                  ),
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 50, sigmaY: 50),
                    child: Container(color: Colors.transparent),
                  ),
                ),
              ),
              
              Padding(
                padding: EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                assignment.title,
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                assignment.course.nama,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: isDark ? Colors.white60 : Colors.black54,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: statusColor.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: statusColor.withOpacity(0.3)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(statusIcon, color: statusColor, size: 12),
                              const SizedBox(width: 4),
                              Text(
                                statusLabel,
                                style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        )
                      ],
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [formationColor, formationColor.withOpacity(0.8)],
                            ),
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(
                            assignment.formationMode.toUpperCase(),
                            style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ),
                        if (assignment.isLocked)
                          Container(
                            padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: isDark ? Colors.white12 : Colors.black12,
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.lock_rounded, size: 12, color: isDark ? Colors.white70 : Colors.black54),
                                const SizedBox(width: 4),
                                Text(
                                  'LOCKED',
                                  style: TextStyle(
                                    color: isDark ? Colors.white70 : Colors.black54,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            padding: EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: isDark ? Colors.white.withOpacity(0.05) : Colors.black.withOpacity(0.02),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'KELOMPOK',
                                  style: TextStyle(
                                    fontSize: 10,
                                    letterSpacing: 1,
                                    color: isDark ? Colors.white54 : Colors.black45,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  '${assignment.totalGroups ?? 0} slot',
                                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Container(
                            padding: EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: isDark ? Colors.white.withOpacity(0.05) : Colors.black.withOpacity(0.02),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'DEADLINE',
                                  style: TextStyle(
                                    fontSize: 10,
                                    letterSpacing: 1,
                                    color: isDark ? Colors.white54 : Colors.black45,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  deadlineInfo,
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: assignment.isOverdue ? Colors.red : null,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (assignment.myGroup != null) ...[
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Progress Kelompok',
                            style: TextStyle(fontSize: 12, color: isDark ? Colors.white60 : Colors.black54),
                          ),
                          Text(
                            '${progress.round()}%',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(999),
                        child: LinearProgressIndicator(
                          value: progress / 100,
                          backgroundColor: isDark ? Colors.white12 : Colors.black12,
                          valueColor: AlwaysStoppedAnimation<Color>(AppColors.indigo500),
                          minHeight: 6,
                        ),
                      ),
                    ],
                    const SizedBox(height: 16),
                    const Divider(height: 1),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Container(
                          width: 28,
                          height: 28,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [Color(0xFF818CF8), Color(0xFFC084FC)],
                            ),
                            shape: BoxShape.circle,
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            (assignment.dosen?.nama ?? '?').substring(0, 1).toUpperCase(),
                            style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            assignment.dosen?.nama ?? 'Dosen',
                            style: TextStyle(fontSize: 12, color: isDark ? Colors.white70 : Colors.black87),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Text(
                          assignment.status == 'not_joined' && assignment.canJoin
                              ? 'Pilih Kelompok'
                              : 'Lihat Detail',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: AppColors.indigo600,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Icon(Icons.arrow_forward_rounded, size: 14, color: AppColors.indigo600),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
