import 'dart:math';
import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

/// Animated scan frame with 4 corner brackets and a moving scan line.
class ScanFrameOverlay extends StatefulWidget {
  final double frameSize;

  const ScanFrameOverlay({super.key, this.frameSize = 250});

  @override
  State<ScanFrameOverlay> createState() => _ScanFrameOverlayState();
}

class _ScanFrameOverlayState extends State<ScanFrameOverlay>
    with SingleTickerProviderStateMixin {
  late AnimationController _scanLineController;

  @override
  void initState() {
    super.initState();
    _scanLineController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2200),
    )..repeat();
  }

  @override
  void dispose() {
    _scanLineController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = widget.frameSize;
    const cornerLength = 48.0;
    const cornerRadius = 22.0;
    const strokeWidth = 4.0;
    const cornerColor = AppColors.emerald400;

    return Stack(
      alignment: Alignment.center,
      children: [
        // Dark vignette overlay
        Positioned.fill(
          child: Container(
            decoration: const BoxDecoration(
              gradient: RadialGradient(
                center: Alignment.center,
                radius: 0.6,
                colors: [
                  Colors.transparent,
                  Color(0x6B000000),
                ],
              ),
            ),
          ),
        ),
        // Frame container
        SizedBox(
          width: size,
          height: size,
          child: Stack(
            children: [
              // Top-left corner
              Positioned(
                top: 0,
                left: 0,
                child: _CornerBracket(
                  length: cornerLength,
                  radius: cornerRadius,
                  strokeWidth: strokeWidth,
                  color: cornerColor,
                  corner: _Corner.topLeft,
                ),
              ),
              // Top-right corner
              Positioned(
                top: 0,
                right: 0,
                child: _CornerBracket(
                  length: cornerLength,
                  radius: cornerRadius,
                  strokeWidth: strokeWidth,
                  color: cornerColor,
                  corner: _Corner.topRight,
                ),
              ),
              // Bottom-left corner
              Positioned(
                bottom: 0,
                left: 0,
                child: _CornerBracket(
                  length: cornerLength,
                  radius: cornerRadius,
                  strokeWidth: strokeWidth,
                  color: cornerColor,
                  corner: _Corner.bottomLeft,
                ),
              ),
              // Bottom-right corner
              Positioned(
                bottom: 0,
                right: 0,
                child: _CornerBracket(
                  length: cornerLength,
                  radius: cornerRadius,
                  strokeWidth: strokeWidth,
                  color: cornerColor,
                  corner: _Corner.bottomRight,
                ),
              ),
              // Animated scan line
              AnimatedBuilder(
                animation: _scanLineController,
                builder: (context, _) {
                  final y = _scanLineController.value * size;
                  return Positioned(
                    left: 0,
                    right: 0,
                    top: y,
                    child: Container(
                      height: 3,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(2),
                        gradient: const LinearGradient(
                          colors: [
                            Colors.transparent,
                            AppColors.emerald400,
                            Colors.transparent,
                          ],
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.emerald400.withOpacity(0.8),
                            blurRadius: 24,
                            spreadRadius: 4,
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
        // QR icon at center
        Icon(
          Icons.qr_code_rounded,
          size: 28,
          color: AppColors.emerald400.withOpacity(0.5),
        ),
      ],
    );
  }
}

enum _Corner { topLeft, topRight, bottomLeft, bottomRight }

class _CornerBracket extends StatelessWidget {
  final double length;
  final double radius;
  final double strokeWidth;
  final Color color;
  final _Corner corner;

  const _CornerBracket({
    required this.length,
    required this.radius,
    required this.strokeWidth,
    required this.color,
    required this.corner,
  });

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size(length, length),
      painter: _CornerPainter(
        radius: radius,
        strokeWidth: strokeWidth,
        color: color,
        corner: corner,
      ),
    );
  }
}

class _CornerPainter extends CustomPainter {
  final double radius;
  final double strokeWidth;
  final Color color;
  final _Corner corner;

  _CornerPainter({
    required this.radius,
    required this.strokeWidth,
    required this.color,
    required this.corner,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final path = Path();

    switch (corner) {
      case _Corner.topLeft:
        path.moveTo(0, size.height);
        path.lineTo(0, radius);
        path.quadraticBezierTo(0, 0, radius, 0);
        path.lineTo(size.width, 0);
        break;
      case _Corner.topRight:
        path.moveTo(0, 0);
        path.lineTo(size.width - radius, 0);
        path.quadraticBezierTo(size.width, 0, size.width, radius);
        path.lineTo(size.width, size.height);
        break;
      case _Corner.bottomLeft:
        path.moveTo(0, 0);
        path.lineTo(0, size.height - radius);
        path.quadraticBezierTo(0, size.height, radius, size.height);
        path.lineTo(size.width, size.height);
        break;
      case _Corner.bottomRight:
        path.moveTo(size.width, 0);
        path.lineTo(size.width, size.height - radius);
        path.quadraticBezierTo(size.width, size.height, size.width - radius, size.height);
        path.lineTo(0, size.height);
        break;
    }

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _CornerPainter old) =>
      old.color != color || old.strokeWidth != strokeWidth;
}
