import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/chart_data.dart';
import 'glassmorphic_card.dart';
import 'section_header.dart';

/// Donut/pie chart showing attendance distribution.
class AttendanceDistributionChart extends StatelessWidget {
  const AttendanceDistributionChart({super.key, required this.data});

  final List<DistributionDataEntity> data;

  Color _parseHex(String hex) {
    hex = hex.replaceAll('#', '');
    if (hex.length == 6) hex = 'FF$hex';
    return Color(int.parse(hex, radix: 16));
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final total = data.fold<int>(0, (sum, d) => sum + d.value);

    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16),
      child: GlassmorphicCard(
        child: Column(
          children: [
            SectionHeader(
              title: 'Distribusi Kehadiran',
              icon: Icons.donut_large_outlined,
              gradientColors: const [AppColors.indigo600, AppColors.sky500],
            ),
            const SizedBox(height: 20),
            if (total == 0)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 30),
                child: Text(
                  'Belum ada data',
                  style: TextStyle(color: AppColors.textSecondary),
                ),
              )
            else ...[
              SizedBox(
                height: 180,
                child: PieChart(
                  PieChartData(
                    centerSpaceRadius: 45,
                    sectionsSpace: 3,
                    sections: data.map((d) {
                      final pct = total > 0 ? (d.value / total) * 100 : 0;
                      return PieChartSectionData(
                        value: d.value.toDouble(),
                        color: _parseHex(d.color),
                        radius: 32,
                        title: '${pct.toStringAsFixed(0)}%',
                        titleStyle: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                        titlePositionPercentageOffset: 0.55,
                      );
                    }).toList(),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // Legend
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: data.map((d) {
                  return Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 10,
                        height: 10,
                        decoration: BoxDecoration(
                          color: _parseHex(d.color),
                          borderRadius: BorderRadius.circular(3),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '${d.label} (${d.value})',
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark
                              ? Colors.white70
                              : AppColors.textSecondary,
                        ),
                      ),
                    ],
                  );
                }).toList(),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
