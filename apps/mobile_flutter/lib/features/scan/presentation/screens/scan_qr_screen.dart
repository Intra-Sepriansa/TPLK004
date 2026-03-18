import 'dart:io';

import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:path_provider/path_provider.dart';

import '../../../../core/di/injection.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../home/data/datasources/home_remote_datasource.dart';
import '../../../../shared/providers/navigation_provider.dart';
import '../../domain/entities/scan_enums.dart';
import '../providers/scan_notifier.dart';
import '../widgets/absensi_header_widget.dart';
import '../widgets/active_sessions_list_widget.dart';
import '../widgets/location_status_card.dart';
import '../widgets/progress_tracker_widget.dart';
import '../widgets/sticky_submit_footer.dart';
import '../widgets/success_celebration_overlay.dart';
import '../widgets/unified_camera_card.dart';

class ScanQrScreen extends ConsumerStatefulWidget {
  const ScanQrScreen({super.key});

  @override
  ConsumerState<ScanQrScreen> createState() => _ScanQrScreenState();
}

class _ScanQrScreenState extends ConsumerState<ScanQrScreen> {
  MobileScannerController? _mobileScannerController;
  CameraController? _selfieCameraController;
  bool _isSelfieReady = false;
  bool _isCapturing = false;
  String _studentName = 'Mahasiswa';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(scanProvider.notifier).checkPermissions();
    });
    _loadUserName();
  }

  Future<void> _loadUserName() async {
    try {
      final homeDs = getIt<HomeRemoteDataSource>();
      final data = await homeDs.fetchFullDashboard();
      if (mounted) {
        setState(() => _studentName = data.profile.name);
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _mobileScannerController?.dispose();
    _selfieCameraController?.dispose();
    super.dispose();
  }

  // ═══════════════════════════════════════
  // SCANNER LIFECYCLE
  // ═══════════════════════════════════════

  void _initMobileScanner() {
    _mobileScannerController?.dispose();
    _mobileScannerController = MobileScannerController(
      detectionSpeed: DetectionSpeed.normal,
      facing: CameraFacing.back,
      torchEnabled: false,
    );

    _mobileScannerController!.barcodes.listen((capture) {
      final barcodes = capture.barcodes;
      if (barcodes.isNotEmpty) {
        final value = barcodes.first.rawValue;
        if (value != null && value.isNotEmpty) {
          _onQrDetected(value);
        }
      }
    });
  }

  void _onQrDetected(String value) {
    final state = ref.read(scanProvider);
    if (state.scanState == ScanState.success) return;

    // Stop scanner
    _mobileScannerController?.stop();

    ref.read(scanProvider.notifier).onQrDetected(value);

    // If selfie is required, init selfie camera after flip animation
    if (state.selfieRequired) {
      Future.delayed(const Duration(milliseconds: 700), () {
        if (mounted) _initSelfieCamera();
      });
    }
  }

  // ═══════════════════════════════════════
  // SELFIE CAMERA
  // ═══════════════════════════════════════

  Future<void> _initSelfieCamera() async {
    try {
      final cameras = await availableCameras();
      final front = cameras.firstWhere(
        (c) => c.lensDirection == CameraLensDirection.front,
        orElse: () => cameras.first,
      );

      _selfieCameraController = CameraController(
        front,
        ResolutionPreset.medium,
        enableAudio: false,
      );

      await _selfieCameraController!.initialize();
      if (mounted) {
        setState(() => _isSelfieReady = true);
      }
    } catch (e) {
      debugPrint('Selfie camera init error: $e');
    }
  }

  Future<void> _captureSelfie() async {
    if (_selfieCameraController == null || !_isSelfieReady || _isCapturing) {
      debugPrint('Selfie capture blocked');
      return;
    }
    _isCapturing = true;

    try {
      final xf = await _selfieCameraController!.takePicture();
      debugPrint('Picture taken: ${xf.path}');

      final dir = await getTemporaryDirectory();
      final path = '${dir.path}/selfie_${DateTime.now().millisecondsSinceEpoch}.jpg';
      final file = File(xf.path);
      final copied = await file.copy(path);

      if (mounted) {
        final notifier = ref.read(scanProvider.notifier);
        notifier.onSelfieCaptured(copied, path);
        debugPrint('Selfie saved successfully');
        _selfieCameraController?.dispose();
        _selfieCameraController = null;
        setState(() => _isSelfieReady = false);
      }
    } catch (e) {
      debugPrint('Selfie capture error: $e');
    } finally {
      _isCapturing = false;
    }
  }

  // ═══════════════════════════════════════
  // ACTION HANDLERS
  // ═══════════════════════════════════════

  void _handleStartScanning() async {
    final notifier = ref.read(scanProvider.notifier);

    // Request camera permission if not granted
    final state = ref.read(scanProvider);
    if (!state.cameraPermissionGranted) {
      final granted = await notifier.requestCameraPermission();
      if (!granted) return;
    }

    _initMobileScanner();
    notifier.startScanning();
  }

  void _handleCancelScanning() {
    _mobileScannerController?.stop();
    ref.read(scanProvider.notifier).cancelScanning();
  }

  void _handleToggleFlash() {
    ref.read(scanProvider.notifier).toggleFlash();
    _mobileScannerController?.toggleTorch();
  }

  void _handleSwitchCamera() {
    ref.read(scanProvider.notifier).switchCamera();
    _mobileScannerController?.switchCamera();
  }

  void _handleRetryFlow() {
    _mobileScannerController?.dispose();
    _mobileScannerController = null;
    _selfieCameraController?.dispose();
    _selfieCameraController = null;
    setState(() {
      _isSelfieReady = false;
    });
    ref.read(scanProvider.notifier).retryFlow();
  }

  void _handleRetakeSelfie() {
    ref.read(scanProvider.notifier).retakeSelfie();
    _initSelfieCamera();
  }

  // ═══════════════════════════════════════
  // BUILD
  // ═══════════════════════════════════════

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(scanProvider);
    final notifier = ref.read(scanProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          // Main scrollable content
          CustomScrollView(
            slivers: [
              // Header
              SliverToBoxAdapter(
                child: AbsensiHeaderWidget(
                  scanState: state,
                  studentName: _studentName,
                  onBack: () => Navigator.of(context).pop(),
                  onRefresh: () {
                    notifier.checkPermissions();
                    notifier.resetFlow();
                  },
                  onHistory: () {
                    ref.read(navIndexProvider.notifier).state = 2; // Index for Riwayat
                  },
                  onConsentChanged: notifier.setConsent,
                ),
              ),
              // Progress Tracker
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                  child: ProgressTrackerWidget(
                    progressCount: state.progressCount,
                    consentDone: state.consentAccepted,
                    qrDone: state.tokenDone,
                    selfieDone: state.selfieDone,
                    locationDone: state.locationDone,
                    selfieRequired: state.selfieRequired,
                    isScanningActive: state.cameraPhase == CameraPhase.scanning,
                    isSelfieActive: state.cameraPhase == CameraPhase.selfie,
                    isLocationFetching: state.locationState == LocationState.fetching,
                    qrTimestamp: state.qrTimestamp,
                    selfieTimestamp: state.selfieTimestamp,
                    locationTimestamp: state.locationTimestamp,
                  ),
                ),
              ),
              // Active Sessions List
              const SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.fromLTRB(16, 16, 16, 0),
                  child: ActiveSessionsListWidget(),
                ),
              ),

              // Unified Camera Card
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                  child: UnifiedCameraCard(
                    scanState: state,
                    scannerController: _mobileScannerController,
                    selfieController: _selfieCameraController,
                    onStartScanning: _handleStartScanning,
                    onCancelScanning: _handleCancelScanning,
                    onToggleFlash: _handleToggleFlash,
                    onSwitchCamera: _handleSwitchCamera,
                    onRetryFlow: _handleRetryFlow,
                    onStartSelfieCountdown: _captureSelfie,
                    onRetakeSelfie: _handleRetakeSelfie,
                    onManualTokenChanged: notifier.setManualToken,
                    onApplyManualToken: () => notifier.applyManualToken(),
                  ),
                ),
              ),
              // Location Status Card
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                  child: LocationStatusCard(
                    locationState: state.locationState,
                    sampleCount: state.sampleCount,
                    requiredSamples: state.requiredSampleCount,
                    accuracy: state.accuracy,
                    locationMessage: state.locationMessage,
                    latitude: state.latitude,
                    longitude: state.longitude,
                    permissionGranted: state.locationPermissionGranted,
                    onFetchLocation: () => notifier.retryLocation(),
                  ),
                ),
              ),
              // Error message
              if (state.errorMessage != null)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.rose500.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.rose500.withOpacity(0.2)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.error_outline, color: AppColors.rose500, size: 20),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              state.errorMessage!,
                              style: const TextStyle(fontSize: 13, color: AppColors.rose500),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              // Bottom spacing for sticky footer
              const SliverToBoxAdapter(
                child: SizedBox(height: 160),
              ),
            ],
          ),
          // Sticky Submit Footer
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: StickySubmitFooter(
              tokenDone: state.tokenDone,
              selfieDone: state.selfieDone,
              locationDone: state.locationDone,
              submitSuccess: state.submitSuccess,
              consentAccepted: state.consentAccepted,
              canSubmit: state.canSubmit,
              isSubmitting: state.isSubmitting,
              submitMessage: state.submitMessage,
              progressCount: state.progressCount,
              onSubmit: () => notifier.submitAttendance(),
              onStartNewSession: () {
                notifier.resetFlow();
                _handleRetryFlow();
              },
            ),
          ),
          // Success Celebration Overlay
          if (state.submitSuccess)
            SuccessCelebrationOverlay(
              xpGained: state.xpGained > 0 ? state.xpGained : 25,
              currentStreak: state.currentStreak,
              message: state.submitMessage ?? 'Data kehadiran Anda telah tercatat.',
              onDismiss: () {
                // Don't dismiss - keep showing until new session
              },
            ),
        ],
      ),
    );
  }
}
