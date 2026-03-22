import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';

import '../../../../core/theme/app_colors.dart';
import '../providers/home_provider.dart';
import '../widgets/activity_feed_widget.dart';
import '../widgets/attendance_distribution_chart.dart';
import '../widgets/attendance_rate_gauge.dart';
import '../widgets/hero_header_widget.dart';
import '../widgets/progress_section_widget.dart';
import '../widgets/stats_grid_widget.dart';
import '../widgets/upcoming_sessions_widget.dart';
import '../widgets/weekly_attendance_chart.dart';
import '../../../../shared/providers/navigation_provider.dart';

/// Redesigned home screen matching the web mahasiswa dashboard.
class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  void initState() {
    super.initState();
    // Load dashboard data on first build
    Future.microtask(() {
      ref.read(homeProvider.notifier).loadDashboard();
    });
  }

  Future<void> _onRefresh() async {
    await ref.read(homeProvider.notifier).loadDashboard();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(homeProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.background,
      body: state.isLoading && state.data == null
          ? _buildShimmerLoading(isDark)
          : state.errorMessage != null && state.data == null
              ? _buildError(state.errorMessage!, isDark)
              : state.data != null
                  ? _buildDashboard(state, isDark)
                  : _buildShimmerLoading(isDark),
    );
  }

  Widget _buildDashboard(HomeState state, bool isDark) {
    final data = state.data!;

    return RefreshIndicator(
      onRefresh: _onRefresh,
      color: AppColors.indigo600,
      child: ListView(
        padding: EdgeInsets.only(top: 0, bottom: 32),
        children: [
          // 1. Hero Header
          HeroHeaderWidget(
            data: data,
            onAbsen: () {
              ref.read(navIndexProvider.notifier).state = 1;
            },
            onRekapan: () {
              ref.read(navIndexProvider.notifier).state = 2;
            },
            onTugas: () {
              // Tugas does not have a dedicated tab in MainScaffold yet, 
              // but we can keep it for future use.
            },
            onRefresh: _onRefresh,
          ),

          const SizedBox(height: 8),

          // 2. Stats Grid
          StatsGridWidget(stats: data.stats),

          const SizedBox(height: 16),

          // Quick Menu — Uang Kas
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: GestureDetector(
              onTap: () => context.push('/app/kas'),
              child: Container(
                padding: EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF6366F1).withOpacity(0.35),
                      blurRadius: 16,
                      offset: Offset(0, 6),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Icon(
                        Icons.account_balance_wallet_rounded,
                        color: Colors.white,
                        size: 26,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Uang Kas',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Kelola pembayaran & keuangan kelas',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.8),
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.arrow_forward_rounded,
                        color: Colors.white,
                        size: 20,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          const SizedBox(height: 20),

          // Quick Menu — Informasi Tugas
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: GestureDetector(
              onTap: () => context.push('/app/tugas'),
              child: Container(
                padding: EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFF10B981), Color(0xFF14B8A6)],
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF10B981).withOpacity(0.35),
                      blurRadius: 16,
                      offset: Offset(0, 6),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Icon(
                        Icons.assignment_rounded,
                        color: Colors.white,
                        size: 26,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Informasi Tugas',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Tugas individu & kelompok',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.8),
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.arrow_forward_rounded,
                        color: Colors.white,
                        size: 20,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          const SizedBox(height: 20),

          // 3. Weekly Attendance Chart
          WeeklyAttendanceChart(data: data.chartData.weekly),

          const SizedBox(height: 20),

          // 4. Attendance Rate Gauge
          AttendanceRateGauge(stats: data.stats),

          const SizedBox(height: 20),

          // 5. Activity Feed
          ActivityFeedWidget(activities: data.recentActivity),

          const SizedBox(height: 20),

          // 6. Upcoming Sessions
          if (data.upcomingSessions.isNotEmpty) ...[
            UpcomingSessionsWidget(sessions: data.upcomingSessions),
            const SizedBox(height: 20),
          ],

          // 8. Distribution Chart
          AttendanceDistributionChart(data: data.chartData.distribution),

          const SizedBox(height: 20),

          // 10. Progress
          ProgressSectionWidget(stats: data.stats),
        ],
      ),
    );
  }

  Widget _buildShimmerLoading(bool isDark) {
    return Shimmer.fromColors(
      baseColor: isDark ? const Color(0xFF1E293B) : Colors.grey[300]!,
      highlightColor: isDark ? const Color(0xFF334155) : Colors.grey[100]!,
      child: ListView(
        padding: EdgeInsets.all(16),
        children: [
          // Hero placeholder
          Container(
            height: 220,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
            ),
          ),
          const SizedBox(height: 16),
          // Stats grid placeholder
          GridView.count(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 1.3,
            children: List.generate(
              4,
              (_) => Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          // Chart placeholder
          Container(
            height: 280,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
            ),
          ),
          const SizedBox(height: 16),
          // Activity & more
          ...List.generate(
            3,
            (_) => Padding(
              padding: EdgeInsets.only(bottom: 12),
              child: Container(
                height: 180,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildError(String message, bool isDark) {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: isDark ? AppColors.rose400 : AppColors.error,
            ),
            const SizedBox(height: 16),
            Text(
              'Gagal Memuat Dashboard',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: isDark ? Colors.white : AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              message,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: isDark ? Colors.white54 : AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _onRefresh,
              icon: const Icon(Icons.refresh),
              label: const Text('Coba Lagi'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.indigo600,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                padding: EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 12,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
