import 'dart:math';
import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

/// Full-screen overlay with confetti burst and success card.
class SuccessCelebrationOverlay extends StatefulWidget {
  final String title;
  final String message;
  final int xpGained;
  final int currentStreak;
  final VoidCallback onDismiss;

  const SuccessCelebrationOverlay({
    super.key,
    this.title = 'Absensi Berhasil!',
    this.message = 'Data kehadiran Anda telah tercatat.',
    this.xpGained = 25,
    this.currentStreak = 0,
    required this.onDismiss,
  });

  @override
  State<SuccessCelebrationOverlay> createState() =>
      _SuccessCelebrationOverlayState();
}

class _SuccessCelebrationOverlayState extends State<SuccessCelebrationOverlay>
    with TickerProviderStateMixin {
  late AnimationController _confettiController;
  late AnimationController _fadeController;
  final Random _random = Random();
  late List<_ConfettiParticle> _particles;

  @override
  void initState() {
    super.initState();

    _confettiController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..forward();

    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    )..forward();

    // Generate 16 particles
    _particles = List.generate(16, (_) {
      final angle = _random.nextDouble() * 2 * pi;
      final speed = 80 + _random.nextDouble() * 200;
      return _ConfettiParticle(
        dx: cos(angle) * speed,
        dy: sin(angle) * speed - 60,
        color: _confettiColors[_random.nextInt(_confettiColors.length)],
        size: 6 + _random.nextDouble() * 8,
      );
    });

    // Auto-dismiss
    Future.delayed(const Duration(milliseconds: 2600), () {
      if (mounted) widget.onDismiss();
    });
  }

  static const _confettiColors = [
    Color(0xFF10B981),
    Color(0xFF0EA5E9),
    Color(0xFFF59E0B),
    Color(0xFFF43F5E),
    Color(0xFF8B5CF6),
    Color(0xFF06B6D4),
    Color(0xFFEC4899),
    Color(0xFF34D399),
  ];

  @override
  void dispose() {
    _confettiController.dispose();
    _fadeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;

    return FadeTransition(
      opacity: _fadeController,
      child: GestureDetector(
        onTap: widget.onDismiss,
        child: Container(
          width: double.infinity,
          height: double.infinity,
          color: Colors.black.withOpacity(0.45),
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Confetti particles
              ..._particles.map((p) {
                return AnimatedBuilder(
                  animation: _confettiController,
                  builder: (context, _) {
                    final t = _confettiController.value;
                    final x = screenSize.width / 2 + p.dx * t;
                    final y = screenSize.height / 2 + (p.dy * t + 200 * t * t);
                    return Positioned(
                      left: x,
                      top: y,
                      child: Opacity(
                        opacity: (1 - t).clamp(0, 1),
                        child: Container(
                          width: p.size,
                          height: p.size,
                          decoration: BoxDecoration(
                            color: p.color,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    );
                  },
                );
              }),
              // Success card
              TweenAnimationBuilder<double>(
                tween: Tween(begin: 0.8, end: 1.0),
                duration: const Duration(milliseconds: 500),
                curve: Curves.elasticOut,
                builder: (context, scale, child) {
                  return Transform.scale(scale: scale, child: child);
                },
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 32),
                  padding: const EdgeInsets.all(32),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.95),
                    borderRadius: BorderRadius.circular(32),
                    border: Border.all(color: Colors.white.withOpacity(0.3)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.15),
                        blurRadius: 50,
                        offset: const Offset(0, 20),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Success icon
                      Container(
                        width: 96,
                        height: 96,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              AppColors.emerald500.withOpacity(0.15),
                              AppColors.sky500.withOpacity(0.15),
                            ],
                          ),
                        ),
                        child: const Icon(
                          Icons.check_circle_rounded,
                          size: 56,
                          color: AppColors.emerald500,
                        ),
                      ),
                      const SizedBox(height: 20),
                      Text(
                        widget.title,
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey[900],
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        widget.message,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[600],
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 20),
                      // Gamification row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _GameChip(
                            icon: Icons.bolt,
                            label: 'XP Earned',
                            value: '+${widget.xpGained}',
                            color: AppColors.amber500,
                          ),
                          const SizedBox(width: 12),
                          if (widget.currentStreak > 0)
                            _GameChip(
                              icon: Icons.local_fire_department_rounded,
                              label: 'Day Streak',
                              value: '${widget.currentStreak}',
                              color: AppColors.rose500,
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ConfettiParticle {
  final double dx;
  final double dy;
  final Color color;
  final double size;

  _ConfettiParticle({
    required this.dx,
    required this.dy,
    required this.color,
    required this.size,
  });
}

class _GameChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _GameChip({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(50),
        border: Border.all(color: color.withOpacity(0.15)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18, color: color),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                label,
                style: TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: Colors.grey[500]),
              ),
              Text(
                value,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
