
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/dashboard_stats.dart';
import 'glassmorphic_card.dart';
import 'section_header.dart';

/// Radial gauge showing attendance rate percentage.
class AttendanceRateGauge extends StatelessWidget {
  const AttendanceRateGauge({super.key, required this.stats});

  final DashboardStatsEntity stats;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final rate = stats.attendanceRate.clamp(0.0, 100.0);
    final isGood = rate >= 75;
    final gaugeColor = isGood ? AppColors.emerald500 : AppColors.amber500;

    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16),
      child: GlassmorphicCard(
        child: Column(
          children: [
            SectionHeader(
              title: 'Tingkat Kehadiran',
              subtitle: 'Persentase keseluruhan',
              icon: Icons.speed_outlined,
              gradientColors: [
                isGood ? AppColors.emerald400 : AppColors.amber400,
                isGood ? AppColors.teal600 : AppColors.orange600,
              ],
            ),
            const SizedBox(height: 20),
            SizedBox(
              height: 160,
              width: 160,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  PieChart(
                    PieChartData(
                      startDegreeOffset: 180,
                      sectionsSpace: 0,
                      centerSpaceRadius: 55,
                      sections: [
                        PieChartSectionData(
                          value: rate,
                          color: gaugeColor,
                          radius: 18,
                          showTitle: false,
                        ),
                        PieChartSectionData(
                          value: (100.0 - rate).clamp(0.0, 100.0),
                          color: isDark
                              ? Colors.white.withOpacity(0.1)
                              : const Color(0xFFE5E7EB),
                          radius: 12,
                          showTitle: false,
                        ),
                      ],
                    ),
                  ),
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        '${rate.toStringAsFixed(1)}%',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w700,
                          color: isDark ? Colors.white : AppColors.textPrimary,
                        ),
                      ),
                      Text(
                        isGood ? '✨ Luar biasa!' : 'Perlu ditingkatkan',
                        style: TextStyle(
                          fontSize: 12,
                          color: gaugeColor,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // Mini stats row
            Row(
              children: [
                Expanded(
                  child: _miniStat(
                    'Tepat Waktu',
                    '${stats.onTimeRate.toStringAsFixed(1)}%',
                    Icons.schedule_outlined,
                    isDark,
                  ),
                ),
                Container(
                  width: 1,
                  height: 40,
                  color: isDark
                      ? Colors.white.withOpacity(0.1)
                      : const Color(0xFFE5E7EB),
                ),
                Expanded(
                  child: _miniStat(
                    'Streak',
                    '${stats.currentStreak}',
                    Icons.local_fire_department_outlined,
                    isDark,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _miniStat(String label, String value, IconData icon, bool isDark) {
    return Column(
      children: [
        Icon(icon, size: 16, color: AppColors.textSecondary),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: isDark ? Colors.white : AppColors.textPrimary,
          ),
        ),
        Text(
          label,
          style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
        ),
      ],
    );
  }
}
