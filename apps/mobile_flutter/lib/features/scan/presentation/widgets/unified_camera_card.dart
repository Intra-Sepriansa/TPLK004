import 'dart:io';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/scan_enums.dart';
import '../providers/scan_state.dart';
import 'scan_frame_overlay.dart';

/// Master camera card that switches between phase views.
class UnifiedCameraCard extends StatelessWidget {
  final ScanAbsensiState scanState;
  final MobileScannerController? scannerController;
  final VoidCallback onStartScanning;
  final VoidCallback onCancelScanning;
  final VoidCallback onToggleFlash;
  final VoidCallback onSwitchCamera;
  final VoidCallback onRetryFlow;
  final VoidCallback onStartSelfieCountdown;
  final VoidCallback onRetakeSelfie;
  final ValueChanged<String> onManualTokenChanged;
  final VoidCallback onApplyManualToken;

  const UnifiedCameraCard({
    super.key,
    required this.scanState,
    this.scannerController,
    required this.onStartScanning,
    required this.onCancelScanning,
    required this.onToggleFlash,
    required this.onSwitchCamera,
    required this.onRetryFlow,
    required this.onStartSelfieCountdown,
    required this.onRetakeSelfie,
    required this.onManualTokenChanged,
    required this.onApplyManualToken,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.black.withOpacity(0.05)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'UNIFIED CAMERA FLOW',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 2,
                              color: AppColors.sky500,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            _phaseTitle,
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.grey[900],
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _phaseDescription,
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                              height: 1.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                    _buildPhaseBadge(scanState.cameraPhase),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          // Camera viewport
          ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF0A0A0A),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.3),
                    blurRadius: 30,
                    offset: const Offset(0, 15),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: AspectRatio(
                  aspectRatio: 4 / 5,
                  child: _buildPhaseView(context),
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          // Status panel + manual token
          _StatusPanel(scanState: scanState),
          _ManualTokenSection(
            manualToken: scanState.manualToken,
            tokenError: scanState.tokenError,
            onChanged: onManualTokenChanged,
            onApply: onApplyManualToken,
            selfieRequired: scanState.selfieRequired,
          ),
          const SizedBox(height: 12),
        ],
      ),
    );
  }

  String get _phaseTitle {
    switch (scanState.cameraPhase) {
      case CameraPhase.idle:
        return 'Siap untuk absen?';
      case CameraPhase.scanning:
        return 'Scanning QR Code';
      case CameraPhase.flipping:
        return 'QR Berhasil';
      case CameraPhase.selfie:
        return 'Verifikasi Selfie';
      case CameraPhase.done:
        return 'Kamera Selesai';
    }
  }

  String get _phaseDescription {
    switch (scanState.cameraPhase) {
      case CameraPhase.idle:
        return 'Mulai dari scan QR di kartu ini. Jika sesi memerlukan selfie, sistem akan berpindah kamera otomatis.';
      case CameraPhase.scanning:
        return 'Arahkan kamera ke QR code yang ditampilkan dosen.';
      case CameraPhase.flipping:
        return 'Menyiapkan kamera depan untuk verifikasi selfie...';
      case CameraPhase.selfie:
        return 'Posisikan wajah di tengah frame lalu tekan tombol capture.';
      case CameraPhase.done:
        return 'Semua tangkapan kamera selesai. Lokasi sedang diambil otomatis.';
    }
  }

  Widget _buildPhaseView(BuildContext context) {
    switch (scanState.cameraPhase) {
      case CameraPhase.idle:
        return _IdleView(
          consentAccepted: scanState.consentAccepted,
          hasToken: scanState.tokenDone,
          onStartScanning: onStartScanning,
          onRetryFlow: onRetryFlow,
        );
      case CameraPhase.scanning:
        return _ScanningView(
          controller: scannerController,
          flashEnabled: scanState.flashEnabled,
          isFrontCamera: scanState.isFrontCamera,
          onToggleFlash: onToggleFlash,
          onSwitchCamera: onSwitchCamera,
          onCancel: onCancelScanning,
        );
      case CameraPhase.flipping:
        return const _FlippingView();
      case CameraPhase.selfie:
        return _SelfieView(
          countdown: scanState.selfieCountdown,
          onCapture: onStartSelfieCountdown,
          onRetryFlow: onRetryFlow,
        );
      case CameraPhase.done:
        return _DoneView(
          previewPath: scanState.selfiePreviewPath,
          tokenDone: scanState.tokenDone,
          selfieDone: scanState.selfieDone,
          locationDone: scanState.locationDone,
          locationFetching: scanState.locationState == LocationState.fetching,
          locationMessage: scanState.locationMessage,
          selfieRequired: scanState.selfieRequired,
          onRetakeSelfie: onRetakeSelfie,
          onRetryFlow: onRetryFlow,
        );
    }
  }

  Widget _buildPhaseBadge(CameraPhase phase) {
    Color bgColor;
    Color textColor;
    String label;

    switch (phase) {
      case CameraPhase.idle:
        bgColor = AppColors.sky500.withOpacity(0.15);
        textColor = AppColors.sky500;
        label = 'STANDBY';
        break;
      case CameraPhase.scanning:
        bgColor = AppColors.emerald500.withOpacity(0.15);
        textColor = AppColors.emerald500;
        label = 'SCANNING';
        break;
      case CameraPhase.flipping:
        bgColor = AppColors.amber500.withOpacity(0.15);
        textColor = AppColors.amber500;
        label = 'SWITCHING';
        break;
      case CameraPhase.selfie:
        bgColor = AppColors.indigo500.withOpacity(0.15);
        textColor = AppColors.indigo500;
        label = 'SELFIE';
        break;
      case CameraPhase.done:
        bgColor = Colors.grey[200]!;
        textColor = Colors.grey[700]!;
        label = 'DONE';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(50),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          letterSpacing: 1,
          color: textColor,
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════
// IDLE VIEW
// ═══════════════════════════════════════

class _IdleView extends StatelessWidget {
  final bool consentAccepted;
  final bool hasToken;
  final VoidCallback onStartScanning;
  final VoidCallback onRetryFlow;

  const _IdleView({
    required this.consentAccepted,
    required this.hasToken,
    required this.onStartScanning,
    required this.onRetryFlow,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: RadialGradient(
          center: Alignment(0.7, -0.3),
          radius: 1.2,
          colors: [
            Color(0x4038BDF8),
            Colors.transparent,
          ],
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            left: -30,
            bottom: -20,
            child: Container(
              width: 200,
              height: 200,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.emerald500.withOpacity(0.15),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          AppColors.sky500.withOpacity(0.25),
                          AppColors.emerald400.withOpacity(0.25),
                        ],
                      ),
                    ),
                    child: const Icon(
                      Icons.camera_alt_rounded,
                      size: 36,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'SIAP MEMULAI',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 2.5,
                      color: AppColors.sky400.withOpacity(0.8),
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Siap untuk absen?',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Mulai dari scan QR di kartu ini.\nJika sesi memerlukan selfie, kamera akan berpindah otomatis.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.white.withOpacity(0.7),
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Chip badges
                  Wrap(
                    spacing: 6,
                    children: [
                      _InfoChip(label: '1 kartu kamera'),
                      _InfoChip(label: 'QR lalu selfie'),
                      _InfoChip(label: 'Lokasi otomatis'),
                    ],
                  ),
                  const SizedBox(height: 20),
                  // Start button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: consentAccepted ? onStartScanning : null,
                      icon: const Icon(Icons.qr_code_scanner_rounded, size: 20),
                      label: const Text('Mulai Scan QR'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: Colors.grey[900],
                        disabledBackgroundColor: Colors.white.withOpacity(0.3),
                        disabledForegroundColor: Colors.white.withOpacity(0.5),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(50),
                        ),
                        elevation: 8,
                      ),
                    ),
                  ),
                  if (hasToken) ...[
                    const SizedBox(height: 10),
                    TextButton.icon(
                      onPressed: onRetryFlow,
                      icon: const Icon(Icons.refresh_rounded, size: 16, color: Colors.white70),
                      label: const Text('Mulai Ulang', style: TextStyle(color: Colors.white70)),
                    ),
                  ],
                  if (!consentAccepted)
                    Padding(
                      padding: const EdgeInsets.only(top: 10),
                      child: Text(
                        'Aktifkan persetujuan kamera dan lokasi di bagian atas sebelum memulai.',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 11, color: Colors.amber[300]),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final String label;
  const _InfoChip({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(50),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
        color: Colors.white.withOpacity(0.08),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w500,
          color: Colors.white.withOpacity(0.7),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════
// SCANNING VIEW
// ═══════════════════════════════════════

class _ScanningView extends StatelessWidget {
  final MobileScannerController? controller;
  final bool flashEnabled;
  final bool isFrontCamera;
  final VoidCallback onToggleFlash;
  final VoidCallback onSwitchCamera;
  final VoidCallback onCancel;

  const _ScanningView({
    this.controller,
    required this.flashEnabled,
    required this.isFrontCamera,
    required this.onToggleFlash,
    required this.onSwitchCamera,
    required this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        // Camera preview
        if (controller != null)
          MobileScanner(
            controller: controller!,
            onDetect: (_) {},
          ),
        // Scan frame overlay
        const Center(child: ScanFrameOverlay(frameSize: 250)),
        // Camera label
        Positioned(
          top: 12,
          left: 12,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.35),
              borderRadius: BorderRadius.circular(50),
              border: Border.all(color: Colors.white.withOpacity(0.1)),
            ),
            child: Text(
              isFrontCamera ? 'Kamera depan aktif' : 'Kamera belakang aktif',
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
          ),
        ),
        // Bottom toolbar
        Positioned(
          bottom: 16,
          left: 0,
          right: 0,
          child: Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.35),
                borderRadius: BorderRadius.circular(50),
                border: Border.all(color: Colors.white.withOpacity(0.1)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _ToolbarButton(
                    icon: flashEnabled ? Icons.flash_on_rounded : Icons.flash_off_rounded,
                    onTap: onToggleFlash,
                  ),
                  const SizedBox(width: 4),
                  _ToolbarButton(
                    icon: Icons.cameraswitch_rounded,
                    onTap: onSwitchCamera,
                  ),
                  const SizedBox(width: 4),
                  _ToolbarButton(
                    icon: Icons.close_rounded,
                    onTap: onCancel,
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _ToolbarButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;

  const _ToolbarButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white.withOpacity(0.05),
      shape: const CircleBorder(side: BorderSide(color: Color(0x1AFFFFFF))),
      child: InkWell(
        onTap: onTap,
        customBorder: const CircleBorder(),
        child: Container(
          width: 40,
          height: 40,
          alignment: Alignment.center,
          child: Icon(icon, size: 20, color: Colors.white),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════
// FLIPPING VIEW (3D flip animation)
// ═══════════════════════════════════════

class _FlippingView extends StatefulWidget {
  const _FlippingView();

  @override
  State<_FlippingView> createState() => _FlippingViewState();
}

class _FlippingViewState extends State<_FlippingView>
    with SingleTickerProviderStateMixin {
  late AnimationController _flipController;

  @override
  void initState() {
    super.initState();
    _flipController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    )..forward();
  }

  @override
  void dispose() {
    _flipController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _flipController,
      builder: (context, _) {
        final angle = _flipController.value * pi;
        final isFront = angle <= pi / 2;

        return Transform(
          alignment: Alignment.center,
          transform: Matrix4.rotationY(angle),
          child: isFront
              ? _buildFrontCard()
              : Transform(
                  alignment: Alignment.center,
                  transform: Matrix4.rotationY(pi),
                  child: _buildBackCard(),
                ),
        );
      },
    );
  }

  Widget _buildFrontCard() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.emerald500.withOpacity(0.2),
            AppColors.sky400.withOpacity(0.1),
          ],
        ),
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: AppColors.emerald400.withOpacity(0.25)),
      ),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.emerald500.withOpacity(0.2),
              ),
              child: const Icon(Icons.check_circle, size: 40, color: AppColors.emerald400),
            ),
            const SizedBox(height: 16),
            const Text(
              'QR Berhasil',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 8),
            Text(
              'Menyiapkan kamera depan\nuntuk verifikasi selfie.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: Colors.white.withOpacity(0.7)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBackCard() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.sky500.withOpacity(0.2),
            AppColors.amber500.withOpacity(0.1),
          ],
        ),
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: AppColors.sky400.withOpacity(0.25)),
      ),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.sky500.withOpacity(0.2),
              ),
              child: const Icon(Icons.camera_alt, size: 40, color: AppColors.sky400),
            ),
            const SizedBox(height: 16),
            const Text(
              'Mode Selfie',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 8),
            Text(
              'Jaga wajah tetap di tengah\nuntuk pengambilan foto.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: Colors.white.withOpacity(0.7)),
            ),
          ],
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════
// SELFIE VIEW
// ═══════════════════════════════════════

class _SelfieView extends StatelessWidget {
  final int? countdown;
  final VoidCallback onCapture;
  final VoidCallback onRetryFlow;

  const _SelfieView({
    this.countdown,
    required this.onCapture,
    required this.onRetryFlow,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF0A0A0A),
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Placeholder for camera preview (will be overlaid by actual CameraPreview)
          const Center(
            child: Text(
              'Camera Preview',
              style: TextStyle(color: Colors.white38, fontSize: 14),
            ),
          ),
          // Face guide overlay (dashed ellipse)
          Center(
            child: CustomPaint(
              size: const Size(220, 280),
              painter: _FaceGuidePainter(),
            ),
          ),
          // Countdown
          if (countdown != null)
            Center(
              child: TweenAnimationBuilder<double>(
                key: ValueKey(countdown),
                tween: Tween(begin: 0.75, end: 1.0),
                duration: const Duration(milliseconds: 300),
                builder: (context, scale, child) {
                  return Transform.scale(scale: scale, child: child);
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 20),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.35),
                    borderRadius: BorderRadius.circular(50),
                    border: Border.all(color: Colors.white.withOpacity(0.2)),
                  ),
                  child: Text(
                    '$countdown',
                    style: const TextStyle(
                      fontSize: 64,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ),
          // Scan ulang button
          Positioned(
            top: 12,
            left: 12,
            child: Material(
              color: Colors.black.withOpacity(0.35),
              borderRadius: BorderRadius.circular(50),
              child: InkWell(
                onTap: onRetryFlow,
                borderRadius: BorderRadius.circular(50),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.refresh_rounded, size: 16, color: Colors.white),
                      SizedBox(width: 6),
                      Text('Scan Ulang', style: TextStyle(color: Colors.white, fontSize: 12)),
                    ],
                  ),
                ),
              ),
            ),
          ),
          // Bottom capture button
          Positioned(
            bottom: 16,
            left: 0,
            right: 0,
            child: Center(
              child: Material(
                color: Colors.white.withOpacity(0.1),
                shape: const CircleBorder(side: BorderSide(color: Color(0x33FFFFFF), width: 2)),
                child: InkWell(
                  onTap: countdown == null ? onCapture : null,
                  customBorder: const CircleBorder(),
                  child: Container(
                    width: 56,
                    height: 56,
                    alignment: Alignment.center,
                    child: const Icon(Icons.camera_alt, size: 24, color: Colors.white),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FaceGuidePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.85)
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;

    // Dashed ellipse rendering

    final cx = size.width / 2;
    final cy = size.height / 2;
    final rx = size.width / 2 - 4;
    final ry = size.height / 2 - 4;

    // Draw dashed ellipse
    for (double angle = 0; angle < 2 * pi; angle += 0.1) {
      final x1 = cx + rx * cos(angle);
      final y1 = cy + ry * sin(angle);
      final x2 = cx + rx * cos(angle + 0.05);
      final y2 = cy + ry * sin(angle + 0.05);

      if ((angle ~/ 0.15) % 2 == 0) {
        canvas.drawLine(Offset(x1, y1), Offset(x2, y2), paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ═══════════════════════════════════════
// DONE VIEW
// ═══════════════════════════════════════

class _DoneView extends StatelessWidget {
  final String? previewPath;
  final bool tokenDone;
  final bool selfieDone;
  final bool locationDone;
  final bool locationFetching;
  final String locationMessage;
  final bool selfieRequired;
  final VoidCallback onRetakeSelfie;
  final VoidCallback onRetryFlow;

  const _DoneView({
    this.previewPath,
    required this.tokenDone,
    required this.selfieDone,
    required this.locationDone,
    required this.locationFetching,
    required this.locationMessage,
    required this.selfieRequired,
    required this.onRetakeSelfie,
    required this.onRetryFlow,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Center(
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.08),
            borderRadius: BorderRadius.circular(26),
            border: Border.all(color: Colors.white.withOpacity(0.1)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  // Preview thumbnail
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: previewPath != null
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(18),
                            child: Image.file(
                              File(previewPath!),
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => const Icon(
                                Icons.qr_code_rounded,
                                color: Colors.white38,
                                size: 28,
                              ),
                            ),
                          )
                        : const Icon(Icons.qr_code_rounded, color: Colors.white38, size: 28),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'CAMERA SUMMARY',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 2,
                            color: Colors.white.withOpacity(0.6),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          previewPath != null ? 'Selfie tersimpan' : 'Token siap diproses',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          locationFetching
                              ? 'Lokasi sedang diambil otomatis.'
                              : locationMessage.isNotEmpty
                                  ? locationMessage
                                  : 'Lanjutkan ke pengiriman absensi.',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.white.withOpacity(0.7),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              // Completion items
              _CompletionItem(done: tokenDone, label: 'QR atau token manual terverifikasi'),
              const SizedBox(height: 8),
              _CompletionItem(
                done: selfieDone,
                label: selfieRequired ? 'Selfie berhasil disimpan' : 'Selfie tidak diwajibkan',
              ),
              const SizedBox(height: 8),
              _CompletionItem(
                done: locationDone,
                loading: locationFetching,
                label: locationDone ? 'Lokasi sudah tervalidasi' : 'Menunggu verifikasi lokasi',
              ),
              const SizedBox(height: 20),
              // Action buttons
              Row(
                children: [
                  if (selfieRequired)
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: onRetakeSelfie,
                        icon: const Icon(Icons.camera_alt, size: 16),
                        label: const Text('Foto Ulang'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.white,
                          side: BorderSide(color: Colors.white.withOpacity(0.15)),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(50),
                          ),
                        ),
                      ),
                    ),
                  if (selfieRequired) const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: onRetryFlow,
                      icon: const Icon(Icons.refresh_rounded, size: 16),
                      label: const Text('Ulang Flow'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: BorderSide(color: Colors.white.withOpacity(0.15)),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(50),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CompletionItem extends StatelessWidget {
  final bool done;
  final bool loading;
  final String label;

  const _CompletionItem({
    required this.done,
    this.loading = false,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    Color iconBgColor;
    Color iconColor;
    Widget iconWidget;

    if (done) {
      iconBgColor = AppColors.emerald500.withOpacity(0.2);
      iconColor = AppColors.emerald400;
      iconWidget = Icon(Icons.check_circle, size: 16, color: iconColor);
    } else if (loading) {
      iconBgColor = AppColors.sky500.withOpacity(0.2);
      iconColor = AppColors.sky400;
      iconWidget = SizedBox(
        width: 16,
        height: 16,
        child: CircularProgressIndicator(strokeWidth: 2, color: iconColor),
      );
    } else {
      iconBgColor = Colors.white.withOpacity(0.1);
      iconColor = Colors.white.withOpacity(0.7);
      iconWidget = Icon(Icons.access_time, size: 16, color: iconColor);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.15),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(shape: BoxShape.circle, color: iconBgColor),
            child: Center(child: iconWidget),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 13,
                color: Colors.white.withOpacity(0.88),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════
// STATUS PANEL
// ═══════════════════════════════════════

class _StatusPanel extends StatelessWidget {
  final ScanAbsensiState scanState;

  const _StatusPanel({required this.scanState});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.grey[50],
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.grey[200]!),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'STATUS',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                letterSpacing: 2,
                color: Colors.grey[500],
              ),
            ),
            const SizedBox(height: 12),
            _StatusRow(
              icon: Icons.shield_outlined,
              label: 'Persetujuan',
              value: scanState.consentAccepted ? 'Sudah aktif' : 'Belum aktif',
              tone: scanState.consentAccepted ? _Tone.success : _Tone.neutral,
            ),
            const SizedBox(height: 8),
            _StatusRow(
              icon: Icons.qr_code_rounded,
              label: 'Token',
              value: scanState.tokenDone
                  ? scanState.currentToken
                  : scanState.scanState == ScanState.scanning
                      ? 'Sedang scan QR'
                      : 'Belum ada token',
              tone: scanState.tokenDone
                  ? _Tone.success
                  : scanState.scanState == ScanState.error
                      ? _Tone.error
                      : _Tone.neutral,
            ),
            const SizedBox(height: 8),
            _StatusRow(
              icon: Icons.camera_alt_outlined,
              label: 'Selfie',
              value: scanState.selfieRequired
                  ? scanState.selfieFile != null
                      ? 'Tersimpan'
                      : scanState.selfieState == SelfieState.capturing
                          ? 'Sedang mengambil foto'
                          : scanState.selfieState == SelfieState.ready
                              ? 'Kamera siap'
                              : 'Belum ada foto'
                  : 'Tidak wajib',
              tone: scanState.selfieRequired
                  ? scanState.selfieFile != null
                      ? _Tone.success
                      : scanState.selfieState == SelfieState.error
                          ? _Tone.error
                          : _Tone.neutral
                  : _Tone.success,
            ),
          ],
        ),
      ),
    );
  }
}

enum _Tone { neutral, success, error }

class _StatusRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final _Tone tone;

  const _StatusRow({
    required this.icon,
    required this.label,
    required this.value,
    required this.tone,
  });

  @override
  Widget build(BuildContext context) {
    Color iconColor;
    Color bgColor;

    switch (tone) {
      case _Tone.success:
        iconColor = AppColors.emerald500;
        bgColor = AppColors.emerald500.withOpacity(0.12);
        break;
      case _Tone.error:
        iconColor = AppColors.rose500;
        bgColor = AppColors.rose500.withOpacity(0.12);
        break;
      case _Tone.neutral:
        iconColor = Colors.grey[600]!;
        bgColor = Colors.grey[200]!.withOpacity(0.5);
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[200]!.withOpacity(0.8)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              color: bgColor,
            ),
            child: Icon(icon, size: 16, color: iconColor),
          ),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label.toUpperCase(),
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 1.5,
                  color: Colors.grey[500],
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey[900],
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════
// MANUAL TOKEN SECTION
// ═══════════════════════════════════════

class _ManualTokenSection extends StatefulWidget {
  final String manualToken;
  final String? tokenError;
  final ValueChanged<String> onChanged;
  final VoidCallback onApply;
  final bool selfieRequired;

  const _ManualTokenSection({
    required this.manualToken,
    this.tokenError,
    required this.onChanged,
    required this.onApply,
    required this.selfieRequired,
  });

  @override
  State<_ManualTokenSection> createState() => _ManualTokenSectionState();
}

class _ManualTokenSectionState extends State<_ManualTokenSection> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.grey[50],
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.grey[200]!),
        ),
        child: Column(
          children: [
            InkWell(
              onTap: () => setState(() => _expanded = !_expanded),
              borderRadius: BorderRadius.circular(20),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        'Input token manual',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: Colors.grey[900],
                        ),
                      ),
                    ),
                    Icon(
                      _expanded ? Icons.expand_less : Icons.expand_more,
                      color: Colors.grey[500],
                    ),
                  ],
                ),
              ),
            ),
            if (_expanded) ...[
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Token absensi',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: Colors.grey[700],
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      onChanged: widget.onChanged,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 16,
                        letterSpacing: 3,
                      ),
                      textCapitalization: TextCapitalization.characters,
                      decoration: InputDecoration(
                        hintText: 'UNPAM-7A8B...',
                        hintStyle: TextStyle(color: Colors.grey[400]),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: BorderSide(color: Colors.grey[300]!),
                        ),
                        contentPadding:
                            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Gunakan fallback ini jika QR di layar dosen sulit dibaca.',
                      style: TextStyle(fontSize: 11, color: Colors.grey[500], height: 1.5),
                    ),
                    if (widget.tokenError != null) ...[
                      const SizedBox(height: 8),
                      Text(
                        widget.tokenError!,
                        style: const TextStyle(fontSize: 12, color: Colors.red),
                      ),
                    ],
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: widget.onApply,
                        icon: const Icon(Icons.send_rounded, size: 16),
                        label: Text(
                          widget.selfieRequired
                              ? 'Gunakan token & lanjut selfie'
                              : 'Gunakan token manual',
                        ),
                        style: ElevatedButton.styleFrom(
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(50),
                          ),
                          backgroundColor: Colors.transparent,
                          shadowColor: Colors.transparent,
                        ).copyWith(
                          backgroundColor: WidgetStateProperty.all(Colors.transparent),
                          foregroundColor: WidgetStateProperty.all(Colors.white),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
