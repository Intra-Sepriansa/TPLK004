import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/attendance.dart';

/// Comparison panel: week/month/semester performance comparison
class ComparisonPanelWidget extends StatefulWidget {
  const ComparisonPanelWidget({super.key, required this.records});

  final List<AttendanceEntity> records;

  @override
  State<ComparisonPanelWidget> createState() => _ComparisonPanelWidgetState();
}

class _ComparisonPanelWidgetState extends State<ComparisonPanelWidget> {
  String _period = 'month';

  List<_ComparisonMetric> _compute() {
    final now = DateTime.now();
    DateTime currentStart, previousStart, previousEnd;

    if (_period == 'week') {
      currentStart = now.subtract(const Duration(days: 7));
      previousStart = currentStart.subtract(const Duration(days: 7));
      previousEnd = currentStart;
    } else if (_period == 'month') {
      currentStart = DateTime(now.year, now.month, 1);
      previousStart = DateTime(now.year, now.month - 1, 1);
      previousEnd = DateTime(now.year, now.month, 0);
    } else {
      // semester
      final isSem2 = now.month >= 7;
      currentStart = isSem2
          ? DateTime(now.year, 7, 1)
          : DateTime(now.year, 1, 1);
      previousStart = isSem2
          ? DateTime(now.year, 1, 1)
          : DateTime(now.year - 1, 7, 1);
      previousEnd = isSem2
          ? DateTime(now.year, 6, 30)
          : DateTime(now.year - 1, 12, 31);
    }

    List<AttendanceEntity> _filter(DateTime start, DateTime end) {
      return widget.records.where((r) {
        try {
          final dt = DateTime.parse(r.date);
          return dt.isAfter(start.subtract(const Duration(days: 1))) && dt.isBefore(end.add(const Duration(days: 1)));
        } catch (_) {
          return false;
        }
      }).toList();
    }

    final current = _filter(currentStart, now);
    final previous = _filter(previousStart, previousEnd);

    final cp = current.where((r) => r.status == 'present' || r.status == 'hadir').length;
    final pp = previous.where((r) => r.status == 'present' || r.status == 'hadir').length;
    final cr = current.isNotEmpty ? (cp / current.length) * 100 : 0.0;
    final pr = previous.isNotEmpty ? (pp / previous.length) * 100 : 0.0;

    return [
      _ComparisonMetric(
        label: 'Total Kehadiran',
        current: cp.toDouble(),
        previous: pp.toDouble(),
        isPercentage: false,
      ),
      _ComparisonMetric(
        label: 'Tingkat Kehadiran',
        current: cr,
        previous: pr,
        isPercentage: true,
      ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    final data = _compute();

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
                  color: AppColors.sky500.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.sky500.withValues(alpha: 0.2)),
                ),
                child: Icon(Icons.bar_chart, size: 20, color: AppColors.sky500),
              ),
              const SizedBox(width: 10),
              const Text('Perbandingan Performa', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
            ],
          ),
          const SizedBox(height: 14),
          // Period toggle
          Row(
            children: [
              _PeriodBtn('Minggu', 'week'),
              const SizedBox(width: 6),
              _PeriodBtn('Bulan', 'month'),
              const SizedBox(width: 6),
              _PeriodBtn('Semester', 'semester'),
            ],
          ),
          const SizedBox(height: 14),
          ...data.map((m) => _MetricCard(metric: m)),
        ],
      ),
    );
  }

  Widget _PeriodBtn(String label, String value) {
    final selected = _period == value;
    return InkWell(
      onTap: () => setState(() => _period = value),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          gradient: selected ? const LinearGradient(colors: [AppColors.sky500, AppColors.primary]) : null,
          color: selected ? null : Colors.white.withValues(alpha: 0.4),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: selected ? Colors.white : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}

class _ComparisonMetric {
  final String label;
  final double current;
  final double previous;
  final bool isPercentage;

  _ComparisonMetric({required this.label, required this.current, required this.previous, required this.isPercentage});

  double get change => current - previous;
  double get changePercent => previous > 0 ? ((current - previous) / previous) * 100 : 0;
  bool get isPositive => change >= 0;
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({required this.metric});
  final _ComparisonMetric metric;

  @override
  Widget build(BuildContext context) {
    final maxVal = [metric.current, metric.previous, 1.0].reduce((a, b) => a > b ? a : b);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(metric.label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
          const SizedBox(height: 8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    metric.isPercentage
                        ? '${metric.current.toStringAsFixed(1)}%'
                        : metric.current.toStringAsFixed(0),
                    style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                  ),
                  Text(
                    'Sebelumnya: ${metric.isPercentage ? '${metric.previous.toStringAsFixed(1)}%' : metric.previous.toStringAsFixed(0)}',
                    style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: (metric.isPositive ? AppColors.emerald500 : AppColors.rose500).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '${metric.isPositive ? '↑' : '↓'} ${metric.changePercent.abs().toStringAsFixed(1)}%',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: metric.isPositive ? AppColors.emerald500 : AppColors.rose500,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Progress bars
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(3),
                      child: TweenAnimationBuilder<double>(
                        tween: Tween(begin: 0, end: metric.previous / maxVal),
                        duration: const Duration(milliseconds: 1200),
                        builder: (_, val, __) => LinearProgressIndicator(
                          value: val,
                          minHeight: 6,
                          backgroundColor: Colors.grey.withValues(alpha: 0.1),
                          valueColor: AlwaysStoppedAnimation(Colors.grey.withValues(alpha: 0.4)),
                        ),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text('Previous', style: TextStyle(fontSize: 9, color: AppColors.textSecondary)),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(3),
                      child: TweenAnimationBuilder<double>(
                        tween: Tween(begin: 0, end: metric.current / maxVal),
                        duration: const Duration(milliseconds: 1200),
                        builder: (_, val, __) => LinearProgressIndicator(
                          value: val,
                          minHeight: 6,
                          backgroundColor: Colors.grey.withValues(alpha: 0.1),
                          valueColor: AlwaysStoppedAnimation(
                            metric.isPositive ? AppColors.emerald500 : AppColors.rose500,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text('Current', style: TextStyle(fontSize: 9, color: AppColors.textSecondary)),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
