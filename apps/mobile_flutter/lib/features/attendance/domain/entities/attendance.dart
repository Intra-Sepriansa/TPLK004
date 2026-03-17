class AttendanceEntity {
  final int id;
  final String date;
  final String mataKuliah;
  final int? courseId;
  final int? meetingNumber;
  final String status; // 'present', 'absent', 'late', 'pending', 'rejected'
  final String? checkIn;
  final String? checkOut;
  final double? distance;
  final String? selfieUrl;
  final String? selfieStatus; // 'approved', 'pending', 'rejected'
  final String? note;
  final double? latitude;
  final double? longitude;

  const AttendanceEntity({
    required this.id,
    required this.date,
    required this.mataKuliah,
    this.courseId,
    this.meetingNumber,
    required this.status,
    this.checkIn,
    this.checkOut,
    this.distance,
    this.selfieUrl,
    this.selfieStatus,
    this.note,
    this.latitude,
    this.longitude,
  });
}
