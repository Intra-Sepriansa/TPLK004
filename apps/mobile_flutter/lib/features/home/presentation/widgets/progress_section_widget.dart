import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/dashboard_stats.dart';
import 'glassmorphic_card.dart';
import 'section_header.dart';

/// Progress section with animated progress bars for attendance and punctuality.
class ProgressSectionWidget extends StatelessWidget {
  const ProgressSectionWidget({super.key, required this.stats});

  final DashboardStatsEntity stats;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: GlassmorphicCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SectionHeader(
              title: 'Progress',
              subtitle: 'Target semester ini',
              icon: Icons.trending_up_outlined,
              gradientColors: const [AppColors.emerald400, AppColors.teal600],
            ),
            const SizedBox(height: 20),
            _buildProgressBar(
              context,
              'Kehadiran Keseluruhan',
              stats.attendanceRate,
              AppColors.emerald500,
              'Minimal 75% untuk memenuhi syarat',
              isDark,
            ),
            const SizedBox(height: 16),
            _buildProgressBar(
              context,
              'Ketepatan Waktu',
              stats.onTimeRate,
              AppColors.sky500,
              'Datang tepat waktu atau lebih awal',
              isDark,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressBar(
    BuildContext context,
    String label,
    double value,
    Color color,
    String note,
    bool isDark,
  ) {
    final clampedValue = value.clamp(0, 100);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: isDark ? Colors.white : AppColors.textPrimary,
              ),
            ),
            Text(
              '${clampedValue.toStringAsFixed(1)}%',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: color,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        TweenAnimationBuilder<double>(
          tween: Tween(begin: 0, end: clampedValue / 100),
          duration: const Duration(milliseconds: 1200),
          curve: Curves.easeOutCubic,
          builder: (context, animValue, child) {
            return ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(
                value: animValue,
                minHeight: 10,
                backgroundColor: isDark
                    ? Colors.white.withValues(alpha: 0.08)
                    : const Color(0xFFE5E7EB),
                valueColor: AlwaysStoppedAnimation(color),
              ),
            );
          },
        ),
        const SizedBox(height: 4),
        Text(
          note,
          style: const TextStyle(
            fontSize: 11,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }
}
