import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/chart_data.dart';
import 'glassmorphic_card.dart';
import 'section_header.dart';

/// Weekly attendance chart using fl_chart BarChart.
class WeeklyAttendanceChart extends StatelessWidget {
  const WeeklyAttendanceChart({super.key, required this.data});

  final List<ChartDataPointEntity> data;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: GlassmorphicCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Expanded(
                  child: SectionHeader(
                    title: 'Kehadiran Mingguan',
                    subtitle: 'Statistik 7 hari terakhir',
                    icon: Icons.bar_chart_rounded,
                    gradientColors: const [
                      AppColors.emerald400,
                      AppColors.teal600,
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            // Legend
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                _legendDot(AppColors.chartGreen, 'Hadir'),
                const SizedBox(width: 12),
                _legendDot(AppColors.chartAmber, 'Terlambat'),
                const SizedBox(width: 12),
                _legendDot(AppColors.chartRed, 'Tidak Hadir'),
              ],
            ),
            const SizedBox(height: 20),
            // Chart
            SizedBox(
              height: 200,
              child: data.isEmpty
                  ? Center(
                      child: Text(
                        'Belum ada data',
                        style: TextStyle(
                          color: isDark ? Colors.white54 : AppColors.textSecondary,
                        ),
                      ),
                    )
                  : BarChart(
                      BarChartData(
                        alignment: BarChartAlignment.spaceAround,
                        maxY: _maxY(),
                        barTouchData: BarTouchData(
                          enabled: true,
                          touchTooltipData: BarTouchTooltipData(
                            tooltipRoundedRadius: 8,
                          ),
                        ),
                        titlesData: FlTitlesData(
                          show: true,
                          bottomTitles: AxisTitles(
                            sideTitles: SideTitles(
                              showTitles: true,
                              getTitlesWidget: (value, meta) {
                                final idx = value.toInt();
                                if (idx >= 0 && idx < data.length) {
                                  return Padding(
                                    padding: const EdgeInsets.only(top: 8),
                                    child: Text(
                                      data[idx].label,
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: isDark
                                            ? Colors.white54
                                            : AppColors.textSecondary,
                                      ),
                                    ),
                                  );
                                }
                                return const SizedBox.shrink();
                              },
                              reservedSize: 30,
                            ),
                          ),
                          leftTitles: const AxisTitles(
                            sideTitles: SideTitles(showTitles: false),
                          ),
                          topTitles: const AxisTitles(
                            sideTitles: SideTitles(showTitles: false),
                          ),
                          rightTitles: const AxisTitles(
                            sideTitles: SideTitles(showTitles: false),
                          ),
                        ),
                        gridData: const FlGridData(show: false),
                        borderData: FlBorderData(show: false),
                        barGroups: _barGroups(),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  double _maxY() {
    double max = 2;
    for (final d in data) {
      final total = (d.present + d.late + d.absent).toDouble();
      if (total > max) max = total;
    }
    return max + 1;
  }

  List<BarChartGroupData> _barGroups() {
    return data.asMap().entries.map((entry) {
      final i = entry.key;
      final d = entry.value;
      return BarChartGroupData(
        x: i,
        barRods: [
          BarChartRodData(
            toY: d.present.toDouble(),
            color: AppColors.chartGreen,
            width: 10,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
          ),
          BarChartRodData(
            toY: d.late.toDouble(),
            color: AppColors.chartAmber,
            width: 10,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
          ),
          BarChartRodData(
            toY: d.absent.toDouble(),
            color: AppColors.chartRed,
            width: 10,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
          ),
        ],
      );
    }).toList();
  }

  Widget _legendDot(Color color, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: const TextStyle(fontSize: 11, color: Color(0xFF6B7280)),
        ),
      ],
    );
  }
}
