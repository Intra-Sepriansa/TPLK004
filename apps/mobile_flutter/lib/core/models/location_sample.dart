class LocationSample {
  final double latitude;
  final double longitude;
  final double accuracyM;
  final DateTime capturedAt;

  const LocationSample({
    required this.latitude,
    required this.longitude,
    required this.accuracyM,
    required this.capturedAt,
  });

  Map<String, dynamic> toJson() {
    return {
      'latitude': latitude,
      'longitude': longitude,
      'accuracy_m': accuracyM,
      'captured_at': capturedAt.toIso8601String(),
    };
  }
}
