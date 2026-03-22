import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/attendance_stats.dart';

class AttendanceStatsCard extends StatelessWidget {
  const AttendanceStatsCard({super.key, required this.stats});

  final AttendanceStatsEntity stats;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Stats Grid 2x2
        Row(
          children: [
            Expanded(child: _StatMiniCard(
              label: 'Hadir',
              count: stats.present,
              percentage: stats.presentRate,
              color: AppColors.emerald500,
              icon: Icons.check_circle,
            )),
            const SizedBox(width: 10),
            Expanded(child: _StatMiniCard(
              label: 'Tidak Hadir',
              count: stats.absent,
              percentage: stats.absentRate,
              color: AppColors.rose500,
              icon: Icons.cancel,
            )),
          ],
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(child: _StatMiniCard(
              label: 'Terlambat',
              count: stats.late,
              percentage: stats.lateRate,
              color: AppColors.amber500,
              icon: Icons.access_time,
            )),
            const SizedBox(width: 10),
            Expanded(child: _StatMiniCard(
              label: 'Pending',
              count: stats.pending,
              percentage: stats.pendingRate,
              color: AppColors.sky500,
              icon: Icons.info_outline,
            )),
          ],
        ),
        const SizedBox(height: 12),
        // Streak Card
        _StreakCard(streak: stats.streak, longestStreak: stats.longestStreak),
      ],
    );
  }
}

class _StatMiniCard extends StatelessWidget {
  const _StatMiniCard({
    required this.label,
    required this.count,
    required this.percentage,
    required this.color,
    required this.icon,
  });

  final String label;
  final int count;
  final double percentage;
  final Color color;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.5),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withOpacity(0.3)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, size: 18, color: color),
              ),
              const Spacer(),
              TweenAnimationBuilder<int>(
                tween: IntTween(begin: 0, end: count),
                duration: const Duration(milliseconds: 1200),
                builder: (_, val, __) => Text(
                  '$val',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                    color: color,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: TweenAnimationBuilder<double>(
              tween: Tween(begin: 0, end: percentage / 100),
              duration: const Duration(milliseconds: 1500),
              builder: (_, val, __) => LinearProgressIndicator(
                value: val,
                minHeight: 4,
                backgroundColor: color.withOpacity(0.1),
                valueColor: AlwaysStoppedAnimation(color),
              ),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            '${percentage.toStringAsFixed(1)}%',
            style: TextStyle(
              fontSize: 10,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

class _StreakCard extends StatelessWidget {
  const _StreakCard({required this.streak, required this.longestStreak});

  final int streak;
  final int longestStreak;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.orange600, AppColors.rose500],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppColors.orange600.withOpacity(0.3),
            blurRadius: 16,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: [
          const Text('🔥', style: TextStyle(fontSize: 32)),
          const SizedBox(width: 14),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Streak Kehadiran',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 4),
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  TweenAnimationBuilder<int>(
                    tween: IntTween(begin: 0, end: streak),
                    duration: const Duration(milliseconds: 1500),
                    builder: (_, val, __) => Text(
                      '$val',
                      style: TextStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const Padding(
                    padding: EdgeInsets.only(bottom: 6, left: 4),
                    child: Text(
                      'hari',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.white70,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const Spacer(),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                const Text(
                  'Terbaik',
                  style: TextStyle(fontSize: 10, color: Colors.white70),
                ),
                Text(
                  '$longestStreak',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
