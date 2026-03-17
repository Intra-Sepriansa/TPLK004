import 'dart:math';

import 'package:geolocator/geolocator.dart';

import '../models/location_sample.dart';
import 'location_service.dart';

class FakeGpsDetectorResult {
  final bool detected;
  final String? reason;

  const FakeGpsDetectorResult({
    required this.detected,
    this.reason,
  });

  factory FakeGpsDetectorResult.clean() => const FakeGpsDetectorResult(detected: false);
  factory FakeGpsDetectorResult.flagged(String reason) =>
      FakeGpsDetectorResult(detected: true, reason: reason);
}

class FakeGpsDetector {
  FakeGpsDetector(this._locationService);

  final LocationService _locationService;

  FakeGpsDetectorResult evaluateSamples(List<LocationSample> samples) {
    if (samples.length < 2) {
      return FakeGpsDetectorResult.clean();
    }

    final oldest = samples.first.capturedAt;
    final newest = samples.last.capturedAt;
    final spanSeconds = newest.difference(oldest).inSeconds;
    if (spanSeconds > 30) {
      return FakeGpsDetectorResult.flagged('Sampel lokasi terlalu lama, ulangi GPS.');
    }

    for (var i = 1; i < samples.length; i++) {
      final prev = samples[i - 1];
      final curr = samples[i];
      final seconds = max(1, curr.capturedAt.difference(prev.capturedAt).inSeconds);
      final distance = _locationService.distanceMeters(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude,
      );
      final speed = distance / seconds;
      if (speed > 35) {
        return FakeGpsDetectorResult.flagged('Perpindahan lokasi tidak wajar.');
      }
      if (distance > 150 && seconds < 5) {
        return FakeGpsDetectorResult.flagged('Lonjakan lokasi terdeteksi.');
      }
    }

    return FakeGpsDetectorResult.clean();
  }

  FakeGpsDetectorResult evaluatePosition(Position position) {
    final isMocked = position.isMocked;
    if (isMocked == true) {
      return FakeGpsDetectorResult.flagged('Mock location terdeteksi.');
    }

    if (position.accuracy < 1) {
      return FakeGpsDetectorResult.flagged('Akurasi lokasi tidak wajar.');
    }

    return FakeGpsDetectorResult.clean();
  }
}
