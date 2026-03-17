import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/attendance.dart';

/// Charts section: bar chart per course + mini line trend
class AttendanceChartWidget extends StatelessWidget {
  const AttendanceChartWidget({super.key, required this.records});

  final List<AttendanceEntity> records;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _CourseBarChart(records: records),
        const SizedBox(height: 12),
        _MonthlyTrendChart(records: records),
      ],
    );
  }
}

/// Horizontal bar chart per course (custom painted)
class _CourseBarChart extends StatelessWidget {
  const _CourseBarChart({required this.records});
  final List<AttendanceEntity> records;

  @override
  Widget build(BuildContext context) {
    // Group by course
    final courseData = <String, (int present, int late, int absent)>{};
    for (final r in records) {
      final prev = courseData[r.mataKuliah] ?? (0, 0, 0);
      courseData[r.mataKuliah] = (
        prev.$1 + ((r.status == 'present' || r.status == 'hadir') ? 1 : 0),
        prev.$2 + ((r.status == 'late' || r.status == 'terlambat') ? 1 : 0),
        prev.$3 + ((r.status == 'absent' || r.status == 'alpha') ? 1 : 0),
      );
    }

    if (courseData.isEmpty) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 12)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.indigo500.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(Icons.bar_chart, size: 20, color: AppColors.indigo500),
              ),
              const SizedBox(width: 10),
              const Text('Kehadiran per Mata Kuliah', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
            ],
          ),
          const SizedBox(height: 16),
          ...courseData.entries.map((entry) {
            final total = entry.value.$1 + entry.value.$2 + entry.value.$3;
            if (total == 0) return const SizedBox.shrink();
            final name = entry.key.length > 20 ? '${entry.key.substring(0, 18)}...' : entry.key;
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(name, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                  const SizedBox(height: 4),
                  SizedBox(
                    height: 14,
                    child: TweenAnimationBuilder<double>(
                      tween: Tween(begin: 0, end: 1),
                      duration: const Duration(milliseconds: 1200),
                      builder: (_, progress, __) => ClipRRect(
                        borderRadius: BorderRadius.circular(7),
                        child: Row(
                          children: [
                            if (entry.value.$1 > 0)
                              Expanded(
                                flex: (entry.value.$1 * progress).round().clamp(1, 999),
                                child: Container(color: AppColors.chartGreen),
                              ),
                            if (entry.value.$2 > 0)
                              Expanded(
                                flex: (entry.value.$2 * progress).round().clamp(1, 999),
                                child: Container(color: AppColors.chartAmber),
                              ),
                            if (entry.value.$3 > 0)
                              Expanded(
                                flex: (entry.value.$3 * progress).round().clamp(1, 999),
                                child: Container(color: AppColors.chartRed),
                              ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      _LegendDot(AppColors.chartGreen, '${entry.value.$1}'),
                      const SizedBox(width: 12),
                      _LegendDot(AppColors.chartAmber, '${entry.value.$2}'),
                      const SizedBox(width: 12),
                      _LegendDot(AppColors.chartRed, '${entry.value.$3}'),
                    ],
                  ),
                ],
              ),
            );
          }),
          const SizedBox(height: 8),
          // Legend
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _LegendLabel(AppColors.chartGreen, 'Hadir'),
              const SizedBox(width: 16),
              _LegendLabel(AppColors.chartAmber, 'Terlambat'),
              const SizedBox(width: 16),
              _LegendLabel(AppColors.chartRed, 'Tidak Hadir'),
            ],
          ),
        ],
      ),
    );
  }
}

class _LegendDot extends StatelessWidget {
  const _LegendDot(this.color, this.label);
  final Color color;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(width: 6, height: 6, decoration: BoxDecoration(shape: BoxShape.circle, color: color)),
        const SizedBox(width: 3),
        Text(label, style: TextStyle(fontSize: 10, color: AppColors.textSecondary)),
      ],
    );
  }
}

class _LegendLabel extends StatelessWidget {
  const _LegendLabel(this.color, this.label);
  final Color color;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 10, height: 10,
          decoration: BoxDecoration(borderRadius: BorderRadius.circular(2), color: color),
        ),
        const SizedBox(width: 4),
        Text(label, style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
      ],
    );
  }
}

/// Monthly trend "chart" — simplified bar view
class _MonthlyTrendChart extends StatelessWidget {
  const _MonthlyTrendChart({required this.records});
  final List<AttendanceEntity> records;

  @override
  Widget build(BuildContext context) {
    // Group by month (last 6)
    final monthData = <String, (int present, int late, int absent)>{};
    for (final r in records) {
      try {
        final dt = DateTime.parse(r.date);
        final key = DateFormat('MMM yy').format(dt);
        final prev = monthData[key] ?? (0, 0, 0);
        monthData[key] = (
          prev.$1 + ((r.status == 'present' || r.status == 'hadir') ? 1 : 0),
          prev.$2 + ((r.status == 'late' || r.status == 'terlambat') ? 1 : 0),
          prev.$3 + ((r.status == 'absent' || r.status == 'alpha') ? 1 : 0),
        );
      } catch (_) {}
    }

    if (monthData.isEmpty) return const SizedBox.shrink();

    // Last 6 months
    final entries = monthData.entries.toList();
    final last6 = entries.length > 6 ? entries.sublist(entries.length - 6) : entries;
    final maxVal = last6.fold<int>(0, (m, e) {
      final total = e.value.$1 + e.value.$2 + e.value.$3;
      return total > m ? total : m;
    });

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 12)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.emerald500.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(Icons.show_chart, size: 20, color: AppColors.emerald500),
              ),
              const SizedBox(width: 10),
              const Text('Tren Bulanan', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 120,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: last6.map((entry) {
                final totalH = maxVal > 0 ? ((entry.value.$1 + entry.value.$2 + entry.value.$3) / maxVal) * 100 : 0.0;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 3),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Text(
                          '${entry.value.$1 + entry.value.$2 + entry.value.$3}',
                          style: TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                        ),
                        const SizedBox(height: 4),
                        TweenAnimationBuilder<double>(
                          tween: Tween(begin: 0, end: totalH.clamp(4, 80)),
                          duration: const Duration(milliseconds: 1200),
                          builder: (_, val, __) => Container(
                            height: val,
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [AppColors.indigo500, AppColors.purple600],
                                begin: Alignment.bottomCenter,
                                end: Alignment.topCenter,
                              ),
                              borderRadius: BorderRadius.circular(6),
                            ),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          entry.key,
                          style: TextStyle(fontSize: 9, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}
