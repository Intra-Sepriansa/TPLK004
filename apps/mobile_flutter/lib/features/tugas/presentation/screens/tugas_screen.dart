import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/empty_state_widget.dart';
import '../../domain/entities/tugas_data.dart';
import '../providers/tugas_provider.dart';
import '../widgets/tugas_filter_widget.dart';
import '../widgets/tugas_header_widget.dart';
import '../widgets/tugas_list_widget.dart';
import '../widgets/tugas_stats_widget.dart';
import '../widgets/tugas_timeline_widget.dart';

class TugasScreen extends ConsumerStatefulWidget {
  const TugasScreen({super.key});

  @override
  ConsumerState<TugasScreen> createState() => _TugasScreenState();
}

class _TugasScreenState extends ConsumerState<TugasScreen> with TickerProviderStateMixin {
  late final TextEditingController _searchCtrl;

  @override
  void initState() {
    super.initState();
    _searchCtrl = TextEditingController();
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

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.background,
      body: state.isLoading && state.tugasData == null && state.kelompokData == null
          ? _buildShimmer(isDark)
          : state.errorMessage != null && state.tugasData == null && state.kelompokData == null
              ? _buildError(state.errorMessage!, isDark)
              : _buildContent(state, isDark),
    );
  }

  Widget _buildContent(TugasDashboardState state, bool isDark) {
    final tugasData = state.tugasData;
    final tugasList = _filterTugas(tugasData?.tugasList ?? [], state);
    if (_searchCtrl.text != state.searchQuery) {
      _searchCtrl.text = state.searchQuery;
      _searchCtrl.selection = TextSelection.collapsed(offset: _searchCtrl.text.length);
    }

    return RefreshIndicator(
      onRefresh: _refresh,
      color: AppColors.indigo600,
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          TugasHeader(
            onBack: () => context.pop(),
            title: 'Tugas',
            subtitle: 'Informasi Tugas Mandiri',
            badgeLeft: tugasData?.courses.length ?? 0,
            badgeRight: tugasData?.stats.total ?? 0,
          ),
          const SizedBox(height: 16),
          TugasStatsWidget(
            isKelompok: false,
            tugasStats: tugasData?.stats,
            kelompokStats: null,
          ),
          const SizedBox(height: 16),
          _buildTugasKelompokButton(state, isDark),
          const SizedBox(height: 16),
          TugasFilterWidget(
            isKelompok: false,
            courses: tugasData?.courses ?? const [],
            controller: _searchCtrl,
            searchQuery: state.searchQuery,
            selectedCourseId: state.courseId,
            statusFilter: state.statusFilter,
            onSearchChanged: (v) {
              _searchCtrl.text = v;
              ref.read(tugasProvider.notifier).setSearchQuery(v);
            },
            onCourseChanged: (v) => ref.read(tugasProvider.notifier).setCourseId(v),
            onStatusChanged: (v) => ref.read(tugasProvider.notifier).setStatusFilter(v),
          ),
          const SizedBox(height: 16),
          TugasTimelineWidget(items: tugasList),
          const SizedBox(height: 16),
          TugasListWidget(items: tugasList),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildTugasKelompokButton(TugasDashboardState state, bool isDark) {
    final assignments = state.kelompokData?.assignments ?? [];
    final activeCount = state.kelompokData?.stats.activeGroups ?? 0;

    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16),
      child: GestureDetector(
        onTap: () => context.push('/app/tugas-kelompok-dashboard'),
        child: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF6366F1).withOpacity(0.3),
                blurRadius: 20,
                offset: Offset(0, 10),
              ),
            ],
          ),
          child: Stack(
            children: [
              Positioned(
                right: -20,
                top: -20,
                child: Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white.withOpacity(0.1),
                  ),
                ),
              ),
              Positioned(
                left: -40,
                bottom: -40,
                child: Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white.withOpacity(0.1),
                  ),
                ),
              ),
              Padding(
                padding: EdgeInsets.all(20),
                child: Row(
                  children: [
                    Container(
                      padding: EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Icon(Icons.groups_rounded, color: Colors.white, size: 28),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Tugas Kelompok',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            assignments.isEmpty
                                ? 'Lihat semua tugas kelompok'
                                : '$activeCount tugas kelompok aktif',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.8),
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white,
                      ),
                      child: const Icon(
                        Icons.arrow_forward_ios_rounded,
                        color: Color(0xFF6366F1),
                        size: 14,
                      ),
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

  Widget _buildError(String message, bool isDark) {
    return EmptyStateWidget.noData(message: message, onRetry: _refresh);
  }

  List<TugasItem> _filterTugas(List<TugasItem> items, TugasDashboardState state) {
    return items.where((item) {
      final q = state.searchQuery.toLowerCase();
      if (q.isNotEmpty && !item.judul.toLowerCase().contains(q) && !item.course.nama.toLowerCase().contains(q)) {
        return false;
      }
      if (state.courseId != null && item.course.id != state.courseId) return false;
      switch (state.statusFilter) {
        case 'upcoming':
          return !item.isOverdue;
        case 'overdue':
          return item.isOverdue;
      }
      return true;
    }).toList();
  }

  Widget _buildShimmer(bool isDark) {
    return Shimmer.fromColors(
      baseColor: isDark ? const Color(0xFF1E293B) : Colors.grey[300]!,
      highlightColor: isDark ? const Color(0xFF334155) : Colors.grey[100]!,
      child: ListView(
        padding: EdgeInsets.all(16),
        children: [
          Container(height: 220, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24))),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: Container(height: 90, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18)))),
              const SizedBox(width: 12),
              Expanded(child: Container(height: 90, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18)))),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: Container(height: 90, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18)))),
              const SizedBox(width: 12),
              Expanded(child: Container(height: 90, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18)))),
            ],
          ),
          const SizedBox(height: 16),
          Container(height: 48, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24))),
          const SizedBox(height: 16),
          Container(height: 120, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20))),
          const SizedBox(height: 12),
          Container(height: 120, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20))),
        ],
      ),
    );
  }
}

