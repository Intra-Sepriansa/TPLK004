import 'dart:async';
import 'dart:io';

import 'package:camera/camera.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';

import '../../../../core/di/injection.dart';
import '../../../../core/models/location_sample.dart';
import '../../../../core/services/fake_gps_detector.dart';
import '../../../../core/services/location_service.dart';
import '../../../attendance/domain/repositories/attendance_repository.dart';
import '../../domain/entities/scan_enums.dart';
import 'scan_state.dart';

final scanProvider =
    StateNotifierProvider.autoDispose<ScanNotifier, ScanAbsensiState>(
  (ref) => ScanNotifier(),
);

class ScanNotifier extends StateNotifier<ScanAbsensiState> {
  ScanNotifier() : super(const ScanAbsensiState());

  Timer? _countdownTimer;

  // ═══════════════════════════════════════════════
  // CONSENT & PERMISSIONS
  // ═══════════════════════════════════════════════

  void setConsent(bool accepted) {
    state = state.copyWith(consentAccepted: accepted);
  }

  Future<void> checkPermissions() async {
    final cameraStatus = await Permission.camera.status;
    final locationStatus = await Permission.location.status;
    state = state.copyWith(
      cameraPermissionGranted: cameraStatus.isGranted,
      locationPermissionGranted: locationStatus.isGranted,
    );
  }

  Future<bool> requestCameraPermission() async {
    final status = await Permission.camera.request();
    state = state.copyWith(cameraPermissionGranted: status.isGranted);
    return status.isGranted;
  }

  Future<bool> requestLocationPermission() async {
    final status = await Permission.location.request();
    state = state.copyWith(locationPermissionGranted: status.isGranted);
    return status.isGranted;
  }

  // ═══════════════════════════════════════════════
  // QR SCANNING
  // ═══════════════════════════════════════════════

  void startScanning() {
    state = state.copyWith(
      cameraPhase: CameraPhase.scanning,
      scanState: ScanState.scanning,
      errorMessage: () => null,
    );
  }

  void cancelScanning() {
    state = state.copyWith(
      cameraPhase: CameraPhase.idle,
      scanState: ScanState.idle,
    );
  }

  Future<void> onQrDetected(String qrValue) async {
    if (state.scanState == ScanState.success) return; // prevent duplicate

    state = state.copyWith(
      scanState: ScanState.success,
      currentToken: qrValue,
      qrTimestamp: () => DateTime.now(),
    );

    // If selfie required, flip to selfie mode
    if (state.selfieRequired) {
      state = state.copyWith(cameraPhase: CameraPhase.flipping);
      // After flip animation duration (600ms), switch to selfie
      await Future.delayed(const Duration(milliseconds: 700));
      if (!mounted) return;
      state = state.copyWith(
        cameraPhase: CameraPhase.selfie,
        selfieState: SelfieState.ready,
      );
    } else {
      // No selfie required → go to done and start location
      state = state.copyWith(cameraPhase: CameraPhase.done);
      _startLocationSync();
    }
  }

  void setManualToken(String token) {
    state = state.copyWith(manualToken: token);
  }

  Future<void> applyManualToken() async {
    final token = state.manualToken.trim();
    if (token.isEmpty) {
      state = state.copyWith(tokenError: () => 'Token tidak boleh kosong.');
      return;
    }

    state = state.copyWith(
      currentToken: token,
      tokenError: () => null,
      qrTimestamp: () => DateTime.now(),
    );

    if (state.selfieRequired) {
      state = state.copyWith(
        cameraPhase: CameraPhase.selfie,
        selfieState: SelfieState.ready,
      );
    } else {
      state = state.copyWith(cameraPhase: CameraPhase.done);
      _startLocationSync();
    }
  }

  // ═══════════════════════════════════════════════
  // CAMERA CONTROLS
  // ═══════════════════════════════════════════════

  void toggleFlash() {
    state = state.copyWith(flashEnabled: !state.flashEnabled);
  }

  void switchCamera() {
    state = state.copyWith(isFrontCamera: !state.isFrontCamera);
  }

  // ═══════════════════════════════════════════════
  // SELFIE
  // ═══════════════════════════════════════════════

  void startSelfieCountdown() {
    if (state.selfieCountdown != null) return;

    int count = 3;
    state = state.copyWith(selfieCountdown: () => count);

    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      count--;
      if (count <= 0) {
        timer.cancel();
        _countdownTimer = null;
        state = state.copyWith(
          selfieCountdown: () => null,
          selfieState: SelfieState.capturing,
        );
      } else {
        state = state.copyWith(selfieCountdown: () => count);
      }
    });
  }

  void onSelfieCaptured(File file, String previewPath) {
    state = state.copyWith(
      selfieFile: () => file,
      selfiePreviewPath: () => previewPath,
      selfieState: SelfieState.captured,
      selfieTimestamp: () => DateTime.now(),
      cameraPhase: CameraPhase.done,
    );
    _startLocationSync();
  }

  void retakeSelfie() {
    state = state.copyWith(
      selfieFile: () => null,
      selfiePreviewPath: () => null,
      selfieState: SelfieState.ready,
      cameraPhase: CameraPhase.selfie,
      selfieTimestamp: () => null,
    );
  }

  // ═══════════════════════════════════════════════
  // LOCATION
  // ═══════════════════════════════════════════════

  Future<void> _startLocationSync() async {
    state = state.copyWith(
      locationState: LocationState.fetching,
      locationMessage: 'Mengambil lokasi GPS...',
    );

    try {
      final locationService = getIt<LocationService>();
      final fakeGpsDetector = getIt<FakeGpsDetector>();

      final permission = await locationService.ensurePermission();
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        state = state.copyWith(
          locationState: LocationState.error,
          locationMessage: 'Izin lokasi ditolak. Aktifkan GPS di pengaturan.',
          locationPermissionGranted: false,
        );
        return;
      }

      state = state.copyWith(locationPermissionGranted: true);

      final samples = await locationService.collectSamples();
      if (samples.isEmpty) {
        state = state.copyWith(
          locationState: LocationState.error,
          locationMessage: 'Gagal mendapatkan sampel lokasi.',
        );
        return;
      }

      final fakeSamples = fakeGpsDetector.evaluateSamples(samples);
      if (fakeSamples.detected) {
        state = state.copyWith(
          locationState: LocationState.error,
          locationMessage: fakeSamples.reason ?? 'Lokasi tidak valid.',
        );
        return;
      }

      final best = samples.reduce((a, b) => a.accuracyM <= b.accuracyM ? a : b);

      state = state.copyWith(
        locationSamples: samples,
        latitude: () => best.latitude,
        longitude: () => best.longitude,
        accuracy: () => best.accuracyM,
        locationTimestamp: () => DateTime.now(),
      );

      // Check geofence
      if (state.isInsideZone && state.accuracyOk) {
        state = state.copyWith(
          locationState: LocationState.success,
          locationMessage: 'Lokasi tervalidasi — dalam radius absensi.',
        );
      } else if (!state.isInsideZone) {
        final dist = state.currentDistance?.round() ?? 0;
        state = state.copyWith(
          locationState: LocationState.error,
          locationMessage:
              'Di luar radius absensi (${dist}m dari pusat zona, radius ${state.geofenceRadiusM.round()}m).',
        );
      } else {
        state = state.copyWith(
          locationState: LocationState.error,
          locationMessage:
              'Akurasi GPS belum memadai (${state.accuracy?.round()}m, target ≤${state.accuracyThreshold.round()}m).',
        );
      }
    } catch (e) {
      state = state.copyWith(
        locationState: LocationState.error,
        locationMessage: 'Error lokasi: $e',
      );
    }
  }

  Future<void> retryLocation() async {
    await _startLocationSync();
  }

  // ═══════════════════════════════════════════════
  // SUBMIT
  // ═══════════════════════════════════════════════

  Future<void> submitAttendance() async {
    if (!state.canSubmit) return;

    state = state.copyWith(
      isSubmitting: true,
      errorMessage: () => null,
    );

    try {
      final repo = getIt<AttendanceRepository>();

      if (state.selfieRequired && state.selfieFile != null) {
        // Compress selfie first
        final dir = await getTemporaryDirectory();
        final target =
            '${dir.path}/selfie_${DateTime.now().millisecondsSinceEpoch}.jpg';
        final compressed = await FlutterImageCompress.compressAndGetFile(
          state.selfieFile!.path,
          target,
          quality: 85,
        );
        final filePath = compressed?.path ?? state.selfieFile!.path;

        final result = await repo.submitSelfie(
          filePath: filePath,
          sessionId: state.detectedSession?.id ?? state.manuallySelectedSessionId ?? 0,
          qrData: state.currentToken,
          latitude: state.latitude!,
          longitude: state.longitude!,
          accuracy: state.accuracy!,
          locationSamples: state.locationSamples.map((s) => s.toJson()).toList(),
        );

        state = state.copyWith(
          submitSuccess: true,
          submitMessage: () => result.message ?? 'Absensi berhasil!',
          submitTimestamp: () => DateTime.now(),
          isSubmitting: false,
        );
      } else {
        // QR-only flow (no selfie)
        final result = await repo.submitQr(
          qrData: state.currentToken,
          latitude: state.latitude!,
          longitude: state.longitude!,
          accuracy: state.accuracy!,
          locationSamples: state.locationSamples.map((s) => s.toJson()).toList(),
        );

        state = state.copyWith(
          submitSuccess: true,
          selfieRequired: result.requiresSelfie,
          submitMessage: () => result.message ?? 'Absensi berhasil!',
          submitTimestamp: () => DateTime.now(),
          isSubmitting: false,
        );

        // If server says selfie is needed, go to selfie
        if (result.requiresSelfie) {
          state = state.copyWith(
            submitSuccess: false,
            cameraPhase: CameraPhase.selfie,
            selfieState: SelfieState.ready,
            selfieRequired: true,
            detectedSession: () => result.session,
            submitMessage: () => null,
          );
        }
      }
    } catch (e) {
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: () => 'Gagal mengirim absensi: $e',
      );
    }
  }

  // ═══════════════════════════════════════════════
  // RESET
  // ═══════════════════════════════════════════════

  void resetFlow() {
    _countdownTimer?.cancel();
    _countdownTimer = null;
    state = ScanAbsensiState(
      consentAccepted: state.consentAccepted,
      cameraPermissionGranted: state.cameraPermissionGranted,
      locationPermissionGranted: state.locationPermissionGranted,
      geofenceLat: state.geofenceLat,
      geofenceLng: state.geofenceLng,
      geofenceRadiusM: state.geofenceRadiusM,
      requiredSampleCount: state.requiredSampleCount,
    );
  }

  void retryFlow() {
    state = state.copyWith(
      cameraPhase: CameraPhase.idle,
      scanState: ScanState.idle,
      selfieState: SelfieState.idle,
      currentToken: '',
      selfieFile: () => null,
      selfiePreviewPath: () => null,
      selfieCountdown: () => null,
      errorMessage: () => null,
      tokenError: () => null,
      selfieError: () => null,
      qrTimestamp: () => null,
      selfieTimestamp: () => null,
    );
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    super.dispose();
  }
}
