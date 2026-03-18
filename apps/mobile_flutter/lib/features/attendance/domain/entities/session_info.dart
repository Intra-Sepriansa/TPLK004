class SessionInfo {
  final int id;
  final String? mataKuliah;
  final String? dosen;
  final String? room;
  final int? pertemuanKe;

  const SessionInfo({
    required this.id,
    this.mataKuliah,
    this.dosen,
    this.room,
    this.pertemuanKe,
  });
}
