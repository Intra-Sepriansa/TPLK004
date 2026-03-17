import '../entities/active_session.dart';
import '../entities/attendance.dart';
import '../entities/attendance_result.dart';
import '../entities/qr_validation_result.dart';

abstract class AttendanceRepository {
  Future<(List<AttendanceEntity> items, Map<String, dynamic> meta)> fetchHistory({
    int page,
    String? search,
    String? startDate,
    String? endDate,
  });

  Future<List<ActiveSessionEntity>> fetchActiveSessions();

  Future<QrValidationResult> submitQr({
    required String qrData,
    required double latitude,
    required double longitude,
    required double accuracy,
    required List<Map<String, dynamic>> locationSamples,
  });

  Future<AttendanceResult> submitSelfie({
    required String filePath,
    required int sessionId,
    String? qrData,
    required double latitude,
    required double longitude,
    required double accuracy,
    required List<Map<String, dynamic>> locationSamples,
  });
}
