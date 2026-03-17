import '../../domain/entities/attendance_result.dart';

class AttendanceResultModel extends AttendanceResult {
  const AttendanceResultModel({
    required super.attendanceId,
    required super.status,
    super.checkIn,
    super.message,
  });

  factory AttendanceResultModel.fromJson(Map<String, dynamic> json) {
    return AttendanceResultModel(
      attendanceId: (json['attendance_id'] as num).toInt(),
      status: json['status']?.toString() ?? 'present',
      checkIn: json['check_in']?.toString(),
      message: json['message']?.toString(),
    );
  }
}
