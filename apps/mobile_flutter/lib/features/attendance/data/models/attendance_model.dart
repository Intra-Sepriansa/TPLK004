import '../../domain/entities/attendance.dart';

class AttendanceModel extends AttendanceEntity {
  const AttendanceModel({
    required super.id,
    required super.date,
    required super.mataKuliah,
    super.courseId,
    super.meetingNumber,
    required super.status,
    super.checkIn,
    super.checkOut,
    super.distance,
    super.selfieUrl,
    super.selfieStatus,
    super.note,
    super.latitude,
    super.longitude,
  });

  factory AttendanceModel.fromJson(Map<String, dynamic> json) {
    return AttendanceModel(
      id: (json['id'] ?? 0) as int,
      date: (json['date'] ?? json['tanggal'] ?? '').toString(),
      mataKuliah: (json['mata_kuliah'] ?? json['mataKuliah'] ?? json['course'] ?? '').toString(),
      courseId: json['course_id'] as int? ?? json['courseId'] as int?,
      meetingNumber: json['meeting_number'] as int? ?? json['meetingNumber'] as int?,
      status: (json['status'] ?? '').toString(),
      checkIn: json['check_in']?.toString() ?? json['checkIn']?.toString() ?? json['check_in_time']?.toString(),
      checkOut: json['check_out']?.toString() ?? json['checkOut']?.toString(),
      distance: (json['distance'] as num?)?.toDouble(),
      selfieUrl: json['selfie_url']?.toString() ?? json['selfieUrl']?.toString(),
      selfieStatus: json['selfie_status']?.toString() ?? json['selfieStatus']?.toString(),
      note: json['note']?.toString() ?? json['catatan']?.toString(),
      latitude: (json['latitude'] as num?)?.toDouble() ?? (json['location'] is Map ? (json['location']['lat'] as num?)?.toDouble() : null),
      longitude: (json['longitude'] as num?)?.toDouble() ?? (json['location'] is Map ? (json['location']['lng'] as num?)?.toDouble() : null),
    );
  }
}
