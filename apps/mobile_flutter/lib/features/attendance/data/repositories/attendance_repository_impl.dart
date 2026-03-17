import '../../domain/entities/active_session.dart';
import '../../domain/entities/attendance.dart';
import '../../domain/entities/attendance_result.dart';
import '../../domain/entities/qr_validation_result.dart';
import '../../domain/repositories/attendance_repository.dart';
import '../datasources/attendance_remote_datasource.dart';

class AttendanceRepositoryImpl implements AttendanceRepository {
  final AttendanceRemoteDataSource remote;

  AttendanceRepositoryImpl(this.remote);

  @override
  Future<(List<AttendanceEntity> items, Map<String, dynamic> meta)> fetchHistory({
    int page = 1,
    String? search,
    String? startDate,
    String? endDate,
  }) {
    return remote.fetchHistory(
      page: page,
      search: search,
      startDate: startDate,
      endDate: endDate,
    );
  }

  @override
  Future<List<ActiveSessionEntity>> fetchActiveSessions() {
    return remote.fetchActiveSessions();
  }

  @override
  Future<QrValidationResult> submitQr({
    required String qrData,
    required double latitude,
    required double longitude,
    required double accuracy,
    required List<Map<String, dynamic>> locationSamples,
  }) {
    return remote.submitQr(
      qrData: qrData,
      latitude: latitude,
      longitude: longitude,
      accuracy: accuracy,
      locationSamples: locationSamples,
    );
  }

  @override
  Future<AttendanceResult> submitSelfie({
    required String filePath,
    required int sessionId,
    String? qrData,
    required double latitude,
    required double longitude,
    required double accuracy,
    required List<Map<String, dynamic>> locationSamples,
  }) {
    return remote.submitSelfie(
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
