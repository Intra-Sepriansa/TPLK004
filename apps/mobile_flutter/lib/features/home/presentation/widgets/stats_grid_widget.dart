import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/dashboard_stats.dart';
import 'animated_counter.dart';

/// Stat config for each card.
class _StatConfig {
  final String title;
  final num Function(DashboardStatsEntity) getValue;
  final String suffix;
  final String Function(DashboardStatsEntity) getNote;
  final List<Color> gradient;
  final IconData icon;

  const _StatConfig({
    required this.title,
    required this.getValue,
    this.suffix = '',
    required this.getNote,
    required this.gradient,
    required this.icon,
  });
}

/// 2x2 stats grid matching the web dashboard stat cards.
class StatsGridWidget extends StatelessWidget {
  const StatsGridWidget({super.key, required this.stats});

  final DashboardStatsEntity stats;

  static final _configs = [
    _StatConfig(
      title: 'Total Kehadiran',
      getValue: (s) => s.totalAttendance,
      getNote: (s) => 'dari ${s.totalSessions} sesi',
      gradient: [AppColors.emerald400, AppColors.teal600],
      icon: Icons.check_circle_outline,
    ),
    _StatConfig(
      title: 'Persentase',
      getValue: (s) => s.attendanceRate,
      suffix: '%',
      getNote: (_) => 'Target: 85%',
      gradient: [AppColors.sky400, AppColors.indigo600],
      icon: Icons.pie_chart_outline,
    ),
    _StatConfig(
      title: 'Streak',
      getValue: (s) => s.currentStreak,
      getNote: (s) => 'Terbaik: ${s.longestStreak} hari',
      gradient: [AppColors.amber400, AppColors.orange600],
      icon: Icons.local_fire_department_outlined,
    ),
    _StatConfig(
      title: 'Tepat Waktu',
      getValue: (s) => s.onTimeRate,
      suffix: '%',
      getNote: (s) => '${s.thisWeekAttendance}/${s.thisWeekTotal} minggu ini',
      gradient: [AppColors.rose400, AppColors.rose500],
      icon: Icons.schedule_outlined,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: GridView.count(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        childAspectRatio: 1.3,
        children: _configs.map((c) => _buildCard(context, c)).toList(),
      ),
    );
  }

  Widget _buildCard(BuildContext context, _StatConfig config) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final value = config.getValue(stats);
    final note = config.getNote(stats);

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        boxShadow: [
          BoxShadow(
            color: config.gradient.first.withValues(alpha: 0.2),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
        border: Border.all(
          color: isDark
              ? Colors.white.withValues(alpha: 0.05)
              : config.gradient.first.withValues(alpha: 0.15),
        ),
      ),
      child: Stack(
        children: [
          // Gradient glow circle
          Positioned(
            top: -30,
            right: -30,
            child: Container(
              width: 90,
              height: 90,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    config.gradient.first.withValues(alpha: 0.2),
                    config.gradient.first.withValues(alpha: 0),
                  ],
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(colors: config.gradient),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(config.icon, color: Colors.white, size: 18),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        config.title,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: isDark
                              ? Colors.white70
                              : AppColors.textSecondary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const Spacer(),
                AnimatedCounter(
                  value: value,
                  suffix: config.suffix,
                  style: TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.w700,
                    color: isDark ? Colors.white : AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  note,
                  style: TextStyle(
                    fontSize: 11,
                    color: isDark
                        ? Colors.white54
                        : AppColors.textSecondary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
