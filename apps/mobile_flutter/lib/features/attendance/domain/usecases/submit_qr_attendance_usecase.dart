import '../entities/qr_validation_result.dart';
import '../repositories/attendance_repository.dart';

class SubmitQrAttendanceUseCase {
  final AttendanceRepository repository;

  SubmitQrAttendanceUseCase(this.repository);

  Future<QrValidationResult> call({
    required String qrData,
    required double latitude,
    required double longitude,
    required double accuracy,
    required List<Map<String, dynamic>> locationSamples,
  }) {
    return repository.submitQr(
      qrData: qrData,
      latitude: latitude,
      longitude: longitude,
      accuracy: accuracy,
      locationSamples: locationSamples,
    );
  }
}
