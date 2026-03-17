class AttendanceResult {
  final int attendanceId;
  final String status;
  final String? checkIn;
  final String? message;

  const AttendanceResult({
    required this.attendanceId,
    required this.status,
    this.checkIn,
    this.message,
  });
}
