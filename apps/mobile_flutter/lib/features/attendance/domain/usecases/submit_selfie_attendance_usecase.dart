import '../entities/attendance_result.dart';
import '../repositories/attendance_repository.dart';

class SubmitSelfieAttendanceUseCase {
  final AttendanceRepository repository;

  SubmitSelfieAttendanceUseCase(this.repository);

  Future<AttendanceResult> call({
    required String filePath,
    required int sessionId,
    String? qrData,
    required double latitude,
    required double longitude,
    required double accuracy,
    required List<Map<String, dynamic>> locationSamples,
  }) {
    return repository.submitSelfie(
      filePath: filePath,
      sessionId: sessionId,
      qrData: qrData,
      latitude: latitude,
      longitude: longitude,
      accuracy: accuracy,
      locationSamples: locationSamples,
    );
  }
}
