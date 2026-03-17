import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/attendance.dart';

/// Gamification widget: achievements grid
class GamificationWidget extends StatelessWidget {
  const GamificationWidget({
    super.key,
    required this.records,
    required this.streak,
  });

  final List<AttendanceEntity> records;
  final int streak;

  List<_Achievement> _compute() {
    final result = <_Achievement>[];

    if (streak >= 7) {
      result.add(const _Achievement(title: 'Week Warrior', description: '7 hari streak', icon: Icons.local_fire_department, unlocked: true));
    }
    if (streak >= 30) {
      result.add(const _Achievement(title: 'Month Master', description: '30 hari streak', icon: Icons.trending_up, unlocked: true));
    }

    final earlyCount = records.where((r) {
      if (r.checkIn == null) return false;
      try {
        final parts = r.checkIn!.split(':');
        return int.parse(parts[0]) < 8;
      } catch (_) {
        return false;
      }
    }).length;
    if (earlyCount >= 10) {
      result.add(const _Achievement(title: 'Early Bird', description: '10x datang pagi', icon: Icons.access_time, unlocked: true));
    }

    final presentRate = records.isNotEmpty
        ? (records.where((r) => r.status == 'present' || r.status == 'hadir').length / records.length) * 100
        : 0.0;
    if (presentRate >= 90) {
      result.add(const _Achievement(title: 'Honor Student', description: '90%+ kehadiran', icon: Icons.star, unlocked: true));
    }

    if (records.length >= 50) {
      result.add(const _Achievement(title: 'Veteran', description: '50+ sesi tercatat', icon: Icons.emoji_events, unlocked: true));
    }

    if (result.isEmpty) {
      result.add(const _Achievement(title: 'Getting Started', description: 'Terus tingkatkan!', icon: Icons.auto_awesome, unlocked: false));
    }

    return result;
  }

  @override
  Widget build(BuildContext context) {
    final achievements = _compute();

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
                  gradient: const LinearGradient(colors: [AppColors.amber500, AppColors.orange600]),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.emoji_events, size: 20, color: Colors.white),
              ),
              const SizedBox(width: 10),
              const Text('Achievements', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
            ],
          ),
          const SizedBox(height: 14),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
            childAspectRatio: 1.3,
            children: achievements.map((a) => _AchievementCard(achievement: a)).toList(),
          ),
        ],
      ),
    );
  }
}

class _Achievement {
  final String title;
  final String description;
  final IconData icon;
  final bool unlocked;
  const _Achievement({required this.title, required this.description, required this.icon, required this.unlocked});
}

class _AchievementCard extends StatelessWidget {
  const _AchievementCard({required this.achievement});
  final _Achievement achievement;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: achievement.unlocked
            ? AppColors.amber500.withValues(alpha: 0.08)
            : Colors.grey.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: achievement.unlocked
              ? AppColors.amber500.withValues(alpha: 0.2)
              : Colors.grey.withValues(alpha: 0.1),
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            achievement.icon,
            size: 32,
            color: achievement.unlocked ? AppColors.amber500 : Colors.grey,
          ),
          const SizedBox(height: 6),
          Text(
            achievement.title,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: achievement.unlocked ? AppColors.textPrimary : AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 2),
          Text(
            achievement.description,
            style: TextStyle(fontSize: 10, color: AppColors.textSecondary),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
