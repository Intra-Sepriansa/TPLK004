import 'dart:math';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';

class AttendanceSuccessScreen extends StatefulWidget {
  final String? courseName;
  final String? dosenName;
  final int? meetingNumber;
  final DateTime? checkInTime;
  final String? location;

  const AttendanceSuccessScreen({
    super.key,
    this.courseName,
    this.dosenName,
    this.meetingNumber,
    this.checkInTime,
    this.location,
  });

  @override
  State<AttendanceSuccessScreen> createState() => _AttendanceSuccessScreenState();
}

class _AttendanceSuccessScreenState extends State<AttendanceSuccessScreen>
    with TickerProviderStateMixin {
  late final AnimationController _fadeController;
  late final AnimationController _slideController;
  late final AnimationController _scaleController;
  late final AnimationController _confettiController;

  late final Animation<double> _fadeAnim;
  late final Animation<Offset> _slideAnim;
  late final Animation<double> _scaleAnim;
  late final Animation<double> _confettiAnim;

  @override
  void initState() {
    super.initState();

    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _slideController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
    _scaleController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _confettiController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    );

    _fadeAnim = CurvedAnimation(parent: _fadeController, curve: Curves.easeOut);
    _slideAnim = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _slideController, curve: Curves.easeOutBack));
    _scaleAnim = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _scaleController, curve: Curves.elasticOut),
    );
    _confettiAnim = CurvedAnimation(parent: _confettiController, curve: Curves.easeOut);

    // Sequence animations
    _fadeController.forward();
    Future.delayed(const Duration(milliseconds: 200), () {
      if (mounted) _slideController.forward();
    });
    Future.delayed(const Duration(milliseconds: 400), () {
      if (mounted) _scaleController.forward();
    });
    Future.delayed(const Duration(milliseconds: 300), () {
      if (mounted) _confettiController.forward();
    });
  }

  @override
  void dispose() {
    _fadeController.dispose();
    _slideController.dispose();
    _scaleController.dispose();
    _confettiController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final now = widget.checkInTime ?? DateTime.now();
    final dayFormat = DateFormat('EEEE, d MMMM yyyy', 'id_ID');
    final timeFormat = DateFormat('HH:mm', 'id_ID');

    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          // Confetti particles
          AnimatedBuilder(
            animation: _confettiAnim,
            builder: (context, child) {
              return CustomPaint(
                size: MediaQuery.of(context).size,
                painter: _ConfettiPainter(progress: _confettiAnim.value),
              );
            },
          ),

          // Main content
          SafeArea(
            child: FadeTransition(
              opacity: _fadeAnim,
              child: SlideTransition(
                position: _slideAnim,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    children: [
                      const SizedBox(height: 24),

                      // UNPAM Logo
                      _buildLogo(),
                      const SizedBox(height: 24),

                      // Title
                      ScaleTransition(
                        scale: _scaleAnim,
                        child: const Text(
                          'Absensi Berhasil!',
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textPrimary,
                            letterSpacing: -0.5,
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Checkmark icon
                      ScaleTransition(
                        scale: _scaleAnim,
                        child: Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [
                                AppColors.emerald400,
                                AppColors.emerald500,
                              ],
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.emerald500.withOpacity(0.3),
                                blurRadius: 20,
                                offset: const Offset(0, 8),
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.check_rounded,
                            color: Colors.white,
                            size: 36,
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Check-in Details Card
                      _buildDetailsCard(dayFormat.format(now), timeFormat.format(now)),
                      const SizedBox(height: 24),

                      // Student Illustration
                      _buildStudentIllustration(),
                      const SizedBox(height: 32),

                      // OKE Button
                      _buildOkeButton(),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWaveBackground() {
    return Positioned.fill(
      child: CustomPaint(
        painter: _WavePainter(),
      ),
    );
  }

  Widget _buildLogo() {
    return Container(
      width: 80,
      height: 80,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipOval(
        child: Image.asset(
          'assets/images/app-logo.png',
          fit: BoxFit.cover,
        ),
      ),
    );
  }

  Widget _buildDetailsCard(String formattedDate, String formattedTime) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.emerald500.withOpacity(0.06),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: AppColors.emerald500.withOpacity(0.15),
        ),
      ),
      child: Column(
        children: [
          // BERHASIL CHECK IN header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.emerald500.withOpacity(0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.verified_rounded, color: AppColors.emerald500, size: 18),
                const SizedBox(width: 8),
                Text(
                  'BERHASIL CHECK IN',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    color: AppColors.emerald500,
                    letterSpacing: 1.5,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Course name
          if (widget.courseName != null) ...[
            Text(
              widget.courseName!,
              style: const TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
          ],

          // Details rows
          _buildDetailRow(
            Icons.calendar_today_rounded,
            formattedDate,
            AppColors.primary,
          ),
          const SizedBox(height: 12),
          _buildDetailRow(
            Icons.access_time_rounded,
            '$formattedTime WIB',
            AppColors.emerald500,
          ),
          if (widget.dosenName != null) ...[
            const SizedBox(height: 12),
            _buildDetailRow(
              Icons.person_rounded,
              widget.dosenName!,
              AppColors.violet500,
            ),
          ],
          if (widget.meetingNumber != null) ...[
            const SizedBox(height: 12),
            _buildDetailRow(
              Icons.book_rounded,
              'Pertemuan ${widget.meetingNumber}',
              AppColors.amber500,
            ),
          ],
          if (widget.location != null) ...[
            const SizedBox(height: 12),
            _buildDetailRow(
              Icons.location_on_rounded,
              widget.location!,
              AppColors.rose500,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String text, Color color) {
    return Row(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 16, color: color),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
              height: 1.4,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStudentIllustration() {
    return SizedBox(
      height: 220,
      child: Image.asset(
        'assets/images/student_celebration.png',
        fit: BoxFit.contain,
      ),
    );
  }

  Widget _buildOkeButton() {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton(
        onPressed: () => Navigator.of(context).pop(),
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF0D7C5F),
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          elevation: 4,
          shadowColor: const Color(0xFF0D7C5F).withOpacity(0.3),
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.navigate_next_rounded, size: 22),
            SizedBox(width: 8),
            Text(
              'OKE',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                letterSpacing: 1,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════
// WAVE BACKGROUND PAINTER
// ═══════════════════════════════════════════════

class _WavePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    // Top-left teal wave
    final paint1 = Paint()
      ..color = const Color(0xFF0D7C5F).withOpacity(0.08)
      ..style = PaintingStyle.fill;

    final path1 = Path();
    path1.moveTo(0, 0);
    path1.lineTo(0, size.height * 0.25);
    path1.quadraticBezierTo(
      size.width * 0.3, size.height * 0.18,
      size.width * 0.5, size.height * 0.22,
    );
    path1.quadraticBezierTo(
      size.width * 0.7, size.height * 0.26,
      size.width, size.height * 0.15,
    );
    path1.lineTo(size.width, 0);
    path1.close();
    canvas.drawPath(path1, paint1);

    // Bottom-right dark teal wave
    final paint2 = Paint()
      ..color = const Color(0xFF1A3A4A).withOpacity(0.06)
      ..style = PaintingStyle.fill;

    final path2 = Path();
    path2.moveTo(size.width, size.height);
    path2.lineTo(size.width, size.height * 0.75);
    path2.quadraticBezierTo(
      size.width * 0.7, size.height * 0.82,
      size.width * 0.4, size.height * 0.78,
    );
    path2.quadraticBezierTo(
      size.width * 0.15, size.height * 0.74,
      0, size.height * 0.85,
    );
    path2.lineTo(0, size.height);
    path2.close();
    canvas.drawPath(path2, paint2);

    // Middle accent wave
    final paint3 = Paint()
      ..color = const Color(0xFF10B981).withOpacity(0.04)
      ..style = PaintingStyle.fill;

    final path3 = Path();
    path3.moveTo(0, size.height * 0.55);
    path3.quadraticBezierTo(
      size.width * 0.25, size.height * 0.50,
      size.width * 0.5, size.height * 0.53,
    );
    path3.quadraticBezierTo(
      size.width * 0.75, size.height * 0.56,
      size.width, size.height * 0.48,
    );
    path3.lineTo(size.width, size.height * 0.60);
    path3.quadraticBezierTo(
      size.width * 0.75, size.height * 0.66,
      size.width * 0.5, size.height * 0.63,
    );
    path3.quadraticBezierTo(
      size.width * 0.25, size.height * 0.60,
      0, size.height * 0.65,
    );
    path3.close();
    canvas.drawPath(path3, paint3);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ═══════════════════════════════════════════════
// CONFETTI PAINTER
// ═══════════════════════════════════════════════

class _ConfettiPainter extends CustomPainter {
  final double progress;
  final Random _random = Random(42);

  _ConfettiPainter({required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final colors = [
      const Color(0xFF10B981),
      const Color(0xFF2196F3),
      const Color(0xFFF59E0B),
      const Color(0xFFEC4899),
      const Color(0xFF8B5CF6),
      const Color(0xFFEF4444),
    ];

    for (int i = 0; i < 40; i++) {
      final x = _random.nextDouble() * size.width;
      final startY = -20.0 + _random.nextDouble() * size.height * 0.3;
      final endY = startY + size.height * 0.6 + _random.nextDouble() * size.height * 0.3;
      final y = startY + (endY - startY) * progress;

      final opacity = (1.0 - progress * 0.7).clamp(0.0, 1.0);
      final color = colors[i % colors.length].withOpacity(opacity * 0.6);
      final paint = Paint()..color = color;

      final isCircle = _random.nextBool();
      if (isCircle) {
        canvas.drawCircle(Offset(x, y), 2 + _random.nextDouble() * 3, paint);
      } else {
        final rect = Rect.fromCenter(
          center: Offset(x, y),
          width: 4 + _random.nextDouble() * 4,
          height: 4 + _random.nextDouble() * 4,
        );
        canvas.save();
        canvas.translate(rect.center.dx, rect.center.dy);
        canvas.rotate(_random.nextDouble() * pi * 2 * progress);
        canvas.translate(-rect.center.dx, -rect.center.dy);
        canvas.drawRRect(
          RRect.fromRectAndRadius(rect, const Radius.circular(1)),
          paint,
        );
        canvas.restore();
      }
    }

    // Sparkle stars
    for (int i = 0; i < 12; i++) {
      final x = _random.nextDouble() * size.width;
      final y = _random.nextDouble() * size.height * 0.5;
      final sparkleProgress = ((progress * 2 - i * 0.1) % 1.0).clamp(0.0, 1.0);
      final sparkleOpacity = (sin(sparkleProgress * pi) * 0.8).clamp(0.0, 1.0);

      final starPaint = Paint()
        ..color = const Color(0xFFFFD700).withOpacity(sparkleOpacity);
      _drawStar(canvas, Offset(x, y), 3 + _random.nextDouble() * 4, starPaint);
    }
  }

  void _drawStar(Canvas canvas, Offset center, double size, Paint paint) {
    final path = Path();
    for (int i = 0; i < 4; i++) {
      final angle = i * pi / 2;
      final outerX = center.dx + cos(angle) * size;
      final outerY = center.dy + sin(angle) * size;
      final innerX = center.dx + cos(angle + pi / 4) * size * 0.3;
      final innerY = center.dy + sin(angle + pi / 4) * size * 0.3;

      if (i == 0) {
        path.moveTo(outerX, outerY);
      } else {
        path.lineTo(outerX, outerY);
      }
      path.lineTo(innerX, innerY);
    }
    path.close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _ConfettiPainter oldDelegate) =>
      oldDelegate.progress != progress;
}
