class TodayAttendanceEntity {
  final String status;
  final String? checkIn;
  final String? checkOut;
  final String? mataKuliah;
  final String? dosen;
  final String? room;

  const TodayAttendanceEntity({
    required this.status,
    this.checkIn,
    this.checkOut,
    this.mataKuliah,
    this.dosen,
    this.room,
  });
}
