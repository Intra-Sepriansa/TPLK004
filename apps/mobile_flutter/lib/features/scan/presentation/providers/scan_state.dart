import 'dart:io';
import 'dart:math';
import '../../../../core/models/location_sample.dart';
import '../../../attendance/domain/entities/session_info.dart';
import '../../domain/entities/scan_enums.dart';

class ScanAbsensiState {
  // ═══ Flow states ═══
  final CameraPhase cameraPhase;
  final ScanState scanState;
  final SelfieState selfieState;
  final LocationState locationState;

  // ═══ Token / QR ═══
  final String currentToken;
  final String manualToken;
  final String? tokenError;

  // ═══ Selfie ═══
  final File? selfieFile;
  final String? selfiePreviewPath;
  final String? selfieError;
  final int? selfieCountdown;

  // ═══ Location ═══
  final List<LocationSample> locationSamples;
  final double? latitude;
  final double? longitude;
  final double? accuracy;
  final String locationMessage;

  // ═══ Geofence reference ═══
  final double geofenceLat;
  final double geofenceLng;
  final double geofenceRadiusM;
  final int requiredSampleCount;

  // ═══ Session ═══
  final SessionInfo? detectedSession;
  final int? manuallySelectedSessionId;
  final bool selfieRequired;

  // ═══ Permissions ═══
  final bool consentAccepted;
  final bool cameraPermissionGranted;
  final bool locationPermissionGranted;

  // ═══ UI / Submit ═══
  final bool isSubmitting;
  final bool submitSuccess;
  final bool isOfflineDraft;
  final String? errorMessage;
  final String? submitMessage;
  final bool flashEnabled;
  final bool isFrontCamera;

  // ═══ Gamification ═══
  final int xpGained;
  final int currentStreak;
  final int leaderboardPosition;
  final int totalPoints;

  // ═══ Timestamps ═══
  final DateTime? qrTimestamp;
  final DateTime? selfieTimestamp;
  final DateTime? locationTimestamp;
  final DateTime? submitTimestamp;

  const ScanAbsensiState({
    this.cameraPhase = CameraPhase.idle,
    this.scanState = ScanState.idle,
    this.selfieState = SelfieState.idle,
    this.locationState = LocationState.idle,
    this.currentToken = '',
    this.manualToken = '',
    this.tokenError,
    this.selfieFile,
    this.selfiePreviewPath,
    this.selfieError,
    this.selfieCountdown,
    this.locationSamples = const [],
    this.latitude,
    this.longitude,
    this.accuracy,
    this.locationMessage = '',
    this.geofenceLat = 0,
    this.geofenceLng = 0,
    this.geofenceRadiusM = 100,
    this.requiredSampleCount = 3,
    this.detectedSession,
    this.manuallySelectedSessionId,
    this.selfieRequired = true,
    this.consentAccepted = false,
    this.cameraPermissionGranted = false,
    this.locationPermissionGranted = false,
    this.isSubmitting = false,
    this.submitSuccess = false,
    this.isOfflineDraft = false,
    this.errorMessage,
    this.submitMessage,
    this.flashEnabled = false,
    this.isFrontCamera = false,
    this.xpGained = 0,
    this.currentStreak = 0,
    this.leaderboardPosition = 0,
    this.totalPoints = 0,
    this.qrTimestamp,
    this.selfieTimestamp,
    this.locationTimestamp,
    this.submitTimestamp,
  });

  // ═══ Computed getters ═══

  bool get tokenDone => currentToken.trim().isNotEmpty;

  bool get selfieDone => selfieRequired ? selfieFile != null : tokenDone;

  int get sampleCount => locationSamples.length;

  bool get samplesReady => sampleCount >= requiredSampleCount;

  double get accuracyThreshold => min(50.0, geofenceRadiusM);

  bool get accuracyOk =>
      accuracy != null && accuracy!.isFinite && accuracy! <= accuracyThreshold;

  double? get currentDistance {
    if (latitude == null || longitude == null) return null;
    const earthRadius = 6371000.0;
    final dLat = _toRad(geofenceLat - latitude!);
    final dLng = _toRad(geofenceLng - longitude!);
    final a = sin(dLat / 2) * sin(dLat / 2) +
        cos(_toRad(latitude!)) *
            cos(_toRad(geofenceLat)) *
            sin(dLng / 2) *
            sin(dLng / 2);
    final c = 2 * atan2(sqrt(a), sqrt(1 - a));
    return earthRadius * c;
  }

  bool get isInsideZone {
    final dist = currentDistance;
    return dist != null && dist <= geofenceRadiusM;
  }

  bool get locationDone =>
      samplesReady &&
      latitude != null &&
      longitude != null &&
      accuracyOk;

  bool get canSubmit =>
      consentAccepted &&
      tokenDone &&
      selfieDone &&
      locationDone &&
      !submitSuccess;

  int get progressCount {
    int count = 0;
    if (tokenDone) count++;
    if (selfieDone) count++;
    if (locationDone) count++;
    if (submitSuccess) count++;
    return count;
  }

  double get progressPercentage => progressCount / 4 * 100;

  static double _toRad(double deg) => deg * pi / 180;

  // ═══ copyWith ═══

  ScanAbsensiState copyWith({
    CameraPhase? cameraPhase,
    ScanState? scanState,
    SelfieState? selfieState,
    LocationState? locationState,
    String? currentToken,
    String? manualToken,
    String? Function()? tokenError,
    File? Function()? selfieFile,
    String? Function()? selfiePreviewPath,
    String? Function()? selfieError,
    int? Function()? selfieCountdown,
    List<LocationSample>? locationSamples,
    double? Function()? latitude,
    double? Function()? longitude,
    double? Function()? accuracy,
    String? locationMessage,
    double? geofenceLat,
    double? geofenceLng,
    double? geofenceRadiusM,
    int? requiredSampleCount,
    SessionInfo? Function()? detectedSession,
    int? Function()? manuallySelectedSessionId,
    bool? selfieRequired,
    bool? consentAccepted,
    bool? cameraPermissionGranted,
    bool? locationPermissionGranted,
    bool? isSubmitting,
    bool? submitSuccess,
    bool? isOfflineDraft,
    String? Function()? errorMessage,
    String? Function()? submitMessage,
    bool? flashEnabled,
    bool? isFrontCamera,
    int? xpGained,
    int? currentStreak,
    int? leaderboardPosition,
    int? totalPoints,
    DateTime? Function()? qrTimestamp,
    DateTime? Function()? selfieTimestamp,
    DateTime? Function()? locationTimestamp,
    DateTime? Function()? submitTimestamp,
  }) {
    return ScanAbsensiState(
      cameraPhase: cameraPhase ?? this.cameraPhase,
      scanState: scanState ?? this.scanState,
      selfieState: selfieState ?? this.selfieState,
      locationState: locationState ?? this.locationState,
      currentToken: currentToken ?? this.currentToken,
      manualToken: manualToken ?? this.manualToken,
      tokenError: tokenError != null ? tokenError() : this.tokenError,
      selfieFile: selfieFile != null ? selfieFile() : this.selfieFile,
      selfiePreviewPath: selfiePreviewPath != null ? selfiePreviewPath() : this.selfiePreviewPath,
      selfieError: selfieError != null ? selfieError() : this.selfieError,
      selfieCountdown: selfieCountdown != null ? selfieCountdown() : this.selfieCountdown,
      locationSamples: locationSamples ?? this.locationSamples,
      latitude: latitude != null ? latitude() : this.latitude,
      longitude: longitude != null ? longitude() : this.longitude,
      accuracy: accuracy != null ? accuracy() : this.accuracy,
      locationMessage: locationMessage ?? this.locationMessage,
      geofenceLat: geofenceLat ?? this.geofenceLat,
      geofenceLng: geofenceLng ?? this.geofenceLng,
      geofenceRadiusM: geofenceRadiusM ?? this.geofenceRadiusM,
      requiredSampleCount: requiredSampleCount ?? this.requiredSampleCount,
      detectedSession: detectedSession != null ? detectedSession() : this.detectedSession,
      manuallySelectedSessionId: manuallySelectedSessionId != null
          ? manuallySelectedSessionId()
          : this.manuallySelectedSessionId,
      selfieRequired: selfieRequired ?? this.selfieRequired,
      consentAccepted: consentAccepted ?? this.consentAccepted,
      cameraPermissionGranted: cameraPermissionGranted ?? this.cameraPermissionGranted,
      locationPermissionGranted: locationPermissionGranted ?? this.locationPermissionGranted,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      submitSuccess: submitSuccess ?? this.submitSuccess,
      isOfflineDraft: isOfflineDraft ?? this.isOfflineDraft,
      errorMessage: errorMessage != null ? errorMessage() : this.errorMessage,
      submitMessage: submitMessage != null ? submitMessage() : this.submitMessage,
      flashEnabled: flashEnabled ?? this.flashEnabled,
      isFrontCamera: isFrontCamera ?? this.isFrontCamera,
      xpGained: xpGained ?? this.xpGained,
      currentStreak: currentStreak ?? this.currentStreak,
      leaderboardPosition: leaderboardPosition ?? this.leaderboardPosition,
      totalPoints: totalPoints ?? this.totalPoints,
      qrTimestamp: qrTimestamp != null ? qrTimestamp() : this.qrTimestamp,
      selfieTimestamp: selfieTimestamp != null ? selfieTimestamp() : this.selfieTimestamp,
      locationTimestamp: locationTimestamp != null ? locationTimestamp() : this.locationTimestamp,
      submitTimestamp: submitTimestamp != null ? submitTimestamp() : this.submitTimestamp,
    );
  }
}
