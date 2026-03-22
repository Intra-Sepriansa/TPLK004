import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/attendance.dart';

/// AI Insights panel — client-side pattern analysis
class AiInsightsWidget extends StatelessWidget {
  const AiInsightsWidget({super.key, required this.records});

  final List<AttendanceEntity> records;

  List<_Insight> _compute() {
    final result = <_Insight>[];

    // 1. Pattern: late frequency by day
    final dayStats = <int, (int late, int total)>{};
    for (final r in records) {
      try {
        final dt = DateTime.parse(r.date);
        final day = dt.weekday;
        final prev = dayStats[day] ?? (0, 0);
        dayStats[day] = (
          prev.$1 + ((r.status == 'late' || r.status == 'terlambat') ? 1 : 0),
          prev.$2 + 1,
        );
      } catch (_) {}
    }
    final dayNames = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    for (final entry in dayStats.entries) {
      final lateRate = entry.value.$2 > 0 ? (entry.value.$1 / entry.value.$2) * 100 : 0.0;
      if (lateRate > 30 && entry.value.$2 >= 3) {
        result.add(_Insight(
          type: 'pattern',
          title: 'Sering Terlambat di Hari ${dayNames[entry.key]}',
          description: 'Terlambat ${entry.value.$1} dari ${entry.value.$2} kali (${lateRate.toStringAsFixed(0)}%).',
          confidence: lateRate.clamp(0, 95),
        ));
      }
    }

    // 2. Alert: low attendance rate
    final presentCount = records.where((r) => r.status == 'present' || r.status == 'hadir').length;
    final attendanceRate = records.isNotEmpty ? (presentCount / records.length) * 100 : 0.0;
    if (attendanceRate < 80 && attendanceRate > 60) {
      result.add(_Insight(
        type: 'alert',
        title: 'Risiko Tidak Memenuhi Syarat Kehadiran',
        description: 'Tingkat kehadiran ${attendanceRate.toStringAsFixed(1)}%.',
        confidence: 85,
      ));
    }

    // 3. Recommendation: best course
    final courseStats = <String, (int present, int total)>{};
    for (final r in records) {
      final prev = courseStats[r.mataKuliah] ?? (0, 0);
      courseStats[r.mataKuliah] = (
        prev.$1 + ((r.status == 'present' || r.status == 'hadir') ? 1 : 0),
        prev.$2 + 1,
      );
    }
    if (courseStats.isNotEmpty) {
      var best = courseStats.entries.first;
      var bestRate = 0.0;
      for (final e in courseStats.entries) {
        final rate = e.value.$2 > 0 ? (e.value.$1 / e.value.$2) * 100 : 0.0;
        if (rate > bestRate) { bestRate = rate; best = e; }
      }
      if (bestRate >= 90) {
        result.add(_Insight(
          type: 'recommendation',
          title: 'Performa Terbaik: ${best.key}',
          description: 'Kehadiran ${bestRate.toStringAsFixed(0)}% di mata kuliah ini.',
          confidence: 90,
        ));
      }
    }

    // 4. Prediction: recent streak
    final recent = records.length >= 7 ? records.sublist(records.length - 7) : records;
    final recentPresent = recent.where((r) => r.status == 'present' || r.status == 'hadir').length;
    if (recentPresent >= 5) {
      result.add(_Insight(
        type: 'prediction',
        title: 'Prediksi Streak',
        description: 'Performa bagus! Terus hadir untuk meningkatkan streak Anda.',
        confidence: 75,
      ));
    }

    return result;
  }

  @override
  Widget build(BuildContext context) {
    final insights = _compute();

    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.5),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.white.withOpacity(0.3)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 12)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: EdgeInsets.all(8),
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: [AppColors.violet500, AppColors.purple600]),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.auto_awesome, size: 20, color: Colors.white),
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('AI Insights', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                  Text('Powered by Machine Learning', style: TextStyle(fontSize: 10, color: AppColors.textSecondary)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 14),
          if (insights.isEmpty)
            Center(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: Column(
                  children: [
                    Icon(Icons.auto_awesome, size: 40, color: AppColors.textSecondary.withOpacity(0.3)),
                    const SizedBox(height: 8),
                    Text('Belum cukup data', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                  ],
                ),
              ),
            )
          else
            ...insights.map((insight) => _InsightCard(insight: insight)),
        ],
      ),
    );
  }
}

class _Insight {
  final String type;
  final String title;
  final String description;
  final double confidence;
  const _Insight({required this.type, required this.title, required this.description, required this.confidence});
}

class _InsightCard extends StatelessWidget {
  const _InsightCard({required this.insight});
  final _Insight insight;

  (Color, IconData) get _style {
    switch (insight.type) {
      case 'pattern': return (AppColors.sky500, Icons.trending_up);
      case 'prediction': return (AppColors.violet500, Icons.auto_awesome);
      case 'recommendation': return (AppColors.emerald500, Icons.star);
      case 'alert': return (AppColors.amber500, Icons.warning_amber);
      default: return (AppColors.textSecondary, Icons.info);
    }
  }

  @override
  Widget build(BuildContext context) {
    final (color, icon) = _style;

    return Container(
      margin: EdgeInsets.only(bottom: 10),
      padding: EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: color.withOpacity(0.06),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.15)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.6),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 18, color: color),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(insight.title, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                const SizedBox(height: 3),
                Text(insight.description, style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Expanded(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(3),
                        child: TweenAnimationBuilder<double>(
                          tween: Tween(begin: 0, end: insight.confidence / 100),
                          duration: const Duration(milliseconds: 1200),
                          builder: (_, val, __) => LinearProgressIndicator(
                            value: val,
                            minHeight: 4,
                            backgroundColor: color.withOpacity(0.1),
                            valueColor: AlwaysStoppedAnimation(color),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text('${insight.confidence.toStringAsFixed(0)}%', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
