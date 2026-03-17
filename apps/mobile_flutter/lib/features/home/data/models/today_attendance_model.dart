import '../../domain/entities/today_attendance.dart';

class TodayAttendanceModel extends TodayAttendanceEntity {
  const TodayAttendanceModel({
    required super.status,
    super.checkIn,
    super.checkOut,
    super.mataKuliah,
    super.dosen,
    super.room,
  });

  factory TodayAttendanceModel.fromJson(Map<String, dynamic> json) {
    final session = json['session'] as Map<String, dynamic>? ?? {};
    return TodayAttendanceModel(
      status: (json['status'] ?? 'unknown').toString(),
      checkIn: json['check_in']?.toString(),
      checkOut: json['check_out']?.toString(),
      mataKuliah: session['mata_kuliah']?.toString(),
      dosen: session['dosen']?.toString(),
      room: session['room']?.toString(),
    );
  }
}
