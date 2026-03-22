import 'dart:async';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/dashboard_data.dart';

/// Hero header widget matching the web dashboard's animated gradient hero.
class HeroHeaderWidget extends StatefulWidget {
  const HeroHeaderWidget({
    super.key,
    required this.data,
    this.onAbsen,
    this.onRekapan,
    this.onTugas,
    this.onRefresh,
  });

  final DashboardDataEntity data;
  final VoidCallback? onAbsen;
  final VoidCallback? onRekapan;
  final VoidCallback? onTugas;
  final VoidCallback? onRefresh;

  @override
  State<HeroHeaderWidget> createState() => _HeroHeaderWidgetState();
}

class _HeroHeaderWidgetState extends State<HeroHeaderWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _gradientController;
  late Timer _clockTimer;
  DateTime _currentTime = DateTime.now();

  @override
  void initState() {
    super.initState();
    _gradientController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 5),
    )..repeat(reverse: true);
    _clockTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _currentTime = DateTime.now());
    });
  }

  @override
  void dispose() {
    _gradientController.dispose();
    _clockTimer.cancel();
    super.dispose();
  }

  String _getInitials(String name) {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : '?';
  }

  @override
  Widget build(BuildContext context) {
    final profile = widget.data.profile;
    final stats = widget.data.stats;
    final timeStr = DateFormat.Hm().format(_currentTime);
    final dateStr = DateFormat('EEEE, d MMMM yyyy', 'id_ID').format(_currentTime);

    return Container(
      clipBehavior: Clip.antiAlias,
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.primaryDark,
            AppColors.primary,
            AppColors.primaryLight,
          ],
        ),
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(28),
          bottomRight: Radius.circular(28),
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.3),
            blurRadius: 20,
            offset: Offset(0, 8),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Static Batik Background
          Positioned.fill(
            child: Opacity(
              opacity: 0.06,
              child: Transform.scale(
                scale: 1.1,
                child: Image.asset(
                  'assets/images/batik_pattern.png',
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                ),
              ),
            ),
          ),

              // Content  
              SafeArea(
                bottom: false,
                child: Padding(
                  padding: EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Avatar + Welcome + Clock
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Avatar
                          Container(
                            width: 56,
                            height: 56,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: Colors.white.withOpacity(0.2),
                              border: Border.all(
                                color: Colors.white.withOpacity(0.4),
                                width: 2,
                              ),
                            ),
                            child: profile.avatar != null
                                ? ClipOval(
                                    child: Image.network(
                                      profile.avatar!,
                                      fit: BoxFit.cover,
                                      errorBuilder: (_, __, ___) => Center(
                                        child: Text(
                                          _getInitials(profile.name),
                                          style: TextStyle(
                                            color: Colors.white,
                                            fontWeight: FontWeight.w700,
                                            fontSize: 22,
                                          ),
                                        ),
                                      ),
                                    ),
                                  )
                                : Center(
                                    child: Text(
                                      _getInitials(profile.name),
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.w700,
                                        fontSize: 22,
                                      ),
                                    ),
                                  ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Selamat datang kembali,',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: Colors.white.withOpacity(0.8),
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  profile.name,
                                  style: TextStyle(
                                    fontSize: 22,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                          // Clock
                          Container(
                            padding: EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: Colors.white.withOpacity(0.2),
                              ),
                            ),
                            child: Column(
                              children: [
                                Text(
                                  timeStr,
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        dateStr,
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.white.withOpacity(0.7),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Pantau kehadiran, capaian, dan progress studi Anda.',
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.white.withOpacity(0.7),
                        ),
                      ),
                      // Streak badge
                      if (stats.currentStreak > 0) ...[
                        const SizedBox(height: 12),
                        Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Text('🔥', style: TextStyle(fontSize: 16)),
                              const SizedBox(width: 6),
                              Text(
                                '${stats.currentStreak} hari streak',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
    }

  Widget _buildButton(
    String label,
    IconData icon, {
    bool filled = false,
    VoidCallback? onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: filled ? Colors.white : Colors.white.withOpacity(0.15),
            borderRadius: BorderRadius.circular(12),
            border: filled
                ? null
                : Border.all(color: Colors.white.withOpacity(0.3)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: 16,
                color: filled ? AppColors.indigo600 : Colors.white,
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: filled ? AppColors.indigo600 : Colors.white,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
