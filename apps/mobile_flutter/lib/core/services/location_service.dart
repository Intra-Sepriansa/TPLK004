import 'dart:async';
import 'dart:math';

import 'package:geolocator/geolocator.dart';

import '../models/location_sample.dart';

class LocationService {
  Future<LocationPermission> ensurePermission() async {
    final enabled = await Geolocator.isLocationServiceEnabled();
    if (!enabled) {
      return LocationPermission.unableToDetermine;
    }

    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    return permission;
  }

  Future<Position> getCurrentPosition({Duration timeout = const Duration(seconds: 20)}) async {
    return Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.best,
    ).timeout(timeout);
  }

  Future<List<LocationSample>> collectSamples({
    int count = 3,
    Duration interval = const Duration(seconds: 2),
    Duration timeout = const Duration(seconds: 20),
  }) async {
    final samples = <LocationSample>[];
    final start = DateTime.now();

    for (var i = 0; i < count; i++) {
      final now = DateTime.now();
      if (now.difference(start) > timeout) {
        break;
      }

      final position = await getCurrentPosition(timeout: timeout);
      samples.add(LocationSample(
        latitude: position.latitude,
        longitude: position.longitude,
        accuracyM: position.accuracy,
        capturedAt: position.timestamp ?? DateTime.now(),
      ));

      if (i < count - 1) {
        await Future.delayed(interval);
      }
    }

    return samples;
  }

  double distanceMeters(
    double lat1,
    double lon1,
    double lat2,
    double lon2,
  ) {
    const radius = 6371000.0;
    final dLat = _toRadians(lat2 - lat1);
    final dLon = _toRadians(lon2 - lon1);
    final a = sin(dLat / 2) * sin(dLat / 2) +
        cos(_toRadians(lat1)) * cos(_toRadians(lat2)) *
            sin(dLon / 2) * sin(dLon / 2);
    final c = 2 * atan2(sqrt(a), sqrt(1 - a));
    return radius * c;
  }

  double _toRadians(double value) => value * (pi / 180);
}
