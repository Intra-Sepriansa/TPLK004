import 'dart:math';
import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

/// Circular progress ring using CustomPainter — matches the web's ProgressRing SVG.
class ProgressRing extends StatelessWidget {
  final int current;
  final int total;
  final double size;
  final String label;

  const ProgressRing({
    super.key,
    required this.current,
    required this.total,
    this.size = 68,
    this.label = 'Flow',
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size + 8,
      height: size + 8,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.indigo600,
            AppColors.purple600,
            AppColors.pink500,
          ],
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.indigo600.withOpacity(0.3),
            blurRadius: 12,
          ),
        ],
      ),
      padding: const EdgeInsets.all(4),
      child: Stack(
        alignment: Alignment.center,
        children: [
          CustomPaint(
            size: Size(size, size),
            painter: _ProgressRingPainter(
              current: current,
              total: total,
            ),
          ),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              RichText(
                text: TextSpan(
                  style: const TextStyle(color: Colors.white),
                  children: [
                    TextSpan(
                      text: '$current',
                      style: TextStyle(
                        fontSize: size * 0.3,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    TextSpan(
                      text: '/$total',
                      style: TextStyle(
                        fontSize: size * 0.17,
                        fontWeight: FontWeight.w500,
                        color: Colors.white.withOpacity(0.65),
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                label.toUpperCase(),
                style: TextStyle(
                  fontSize: size * 0.1,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 2,
                  color: Colors.white.withOpacity(0.7),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ProgressRingPainter extends CustomPainter {
  final int current;
  final int total;

  _ProgressRingPainter({required this.current, required this.total});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width - 10) / 2;

    // Background track
    final bgPaint = Paint()
      ..color = Colors.white.withOpacity(0.18)
      ..strokeWidth = 6
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    canvas.drawCircle(center, radius, bgPaint);

    // Progress arc
    if (total > 0) {
      final progress = min(current, total) / total;
      final sweepAngle = 2 * pi * progress;

      final progressPaint = Paint()
        ..shader = const LinearGradient(
          colors: [Color(0xFF818CF8), Color(0xFFA855F7), Color(0xFFF472B6)],
        ).createShader(Rect.fromCircle(center: center, radius: radius))
        ..strokeWidth = 6
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round;

      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        -pi / 2,
        sweepAngle,
        false,
        progressPaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _ProgressRingPainter old) =>
      old.current != current || old.total != total;
}

/// Real-time progress tracker widget with step list
class ProgressTrackerWidget extends StatelessWidget {
  final int progressCount;
  final bool consentDone;
  final bool qrDone;
  final bool selfieDone;
  final bool locationDone;
  final bool selfieRequired;
  final bool isScanningActive;
  final bool isSelfieActive;
  final bool isLocationFetching;
  final DateTime? qrTimestamp;
  final DateTime? selfieTimestamp;
  final DateTime? locationTimestamp;

  const ProgressTrackerWidget({
    super.key,
    required this.progressCount,
    required this.consentDone,
    required this.qrDone,
    required this.selfieDone,
    required this.locationDone,
    required this.selfieRequired,
    this.isScanningActive = false,
    this.isSelfieActive = false,
    this.isLocationFetching = false,
    this.qrTimestamp,
    this.selfieTimestamp,
    this.locationTimestamp,
  });

  @override
  Widget build(BuildContext context) {
    final totalSteps = 4;
    final percent = progressCount / totalSteps;

    final steps = [
      _StepData(
        icon: Icons.shield_outlined,
        title: 'Persetujuan',
        completed: consentDone,
        active: !consentDone,
        timestamp: null,
      ),
      _StepData(
        icon: Icons.qr_code_rounded,
        title: 'QR Code',
        completed: qrDone,
        active: isScanningActive && !qrDone,
        timestamp: qrTimestamp,
      ),
      _StepData(
        icon: Icons.camera_alt_outlined,
        title: 'Selfie',
        completed: selfieDone,
        active: isSelfieActive && !selfieDone,
        timestamp: selfieTimestamp,
      ),
      _StepData(
        icon: Icons.location_on_outlined,
        title: 'Lokasi',
        completed: locationDone,
        active: isLocationFetching,
        timestamp: locationTimestamp,
      ),
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.black.withOpacity(0.05)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'PROGRESS ABSENSI',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 2,
                        color: Colors.grey[500],
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Langkah Verifikasi',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey[900],
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '$progressCount dari $totalSteps langkah selesai',
                      style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                    ),
                  ],
                ),
              ),
              ProgressRing(current: progressCount, total: totalSteps),
            ],
          ),
          const SizedBox(height: 16),
          // Progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Stack(
              children: [
                Container(height: 10, color: Colors.grey[200]),
                AnimatedContainer(
                  duration: const Duration(milliseconds: 500),
                  curve: Curves.easeOut,
                  height: 10,
                  width: MediaQuery.of(context).size.width * percent * 0.75,
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        AppColors.indigo600,
                        AppColors.purple600,
                        AppColors.pink500,
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${(percent * 100).round()}% selesai',
                style: TextStyle(fontSize: 11, color: Colors.grey[500]),
              ),
              Text(
                consentDone ? 'Consent aktif' : 'Consent belum aktif',
                style: TextStyle(fontSize: 11, color: Colors.grey[500]),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Step list
          ...steps.map((step) => _StepItem(data: step)),
        ],
      ),
    );
  }
}

class _StepData {
  final IconData icon;
  final String title;
  final bool completed;
  final bool active;
  final DateTime? timestamp;

  const _StepData({
    required this.icon,
    required this.title,
    required this.completed,
    this.active = false,
    this.timestamp,
  });
}

class _StepItem extends StatelessWidget {
  final _StepData data;

  const _StepItem({required this.data});

  @override
  Widget build(BuildContext context) {
    Color bgColor;
    Color iconBgColor;
    Color iconColor;

    if (data.completed) {
      bgColor = const Color(0xFFF0FDF4);
      iconBgColor = AppColors.emerald500;
      iconColor = Colors.white;
    } else if (data.active) {
      bgColor = const Color(0xFFEEF2FF);
      iconBgColor = AppColors.indigo600;
      iconColor = Colors.white;
    } else {
      bgColor = Colors.grey[50]!;
      iconBgColor = Colors.grey[200]!;
      iconColor = Colors.grey[600]!;
    }

    String subtitle;
    if (data.timestamp != null) {
      final t = data.timestamp!;
      subtitle = '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}';
    } else if (data.active) {
      subtitle = 'Sedang diproses';
    } else {
      subtitle = 'Menunggu giliran';
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: iconBgColor,
              ),
              child: data.completed
                  ? const Icon(Icons.check_circle, size: 18, color: Colors.white)
                  : data.active
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : Icon(data.icon, size: 18, color: iconColor),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    data.title,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Colors.grey[900],
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
