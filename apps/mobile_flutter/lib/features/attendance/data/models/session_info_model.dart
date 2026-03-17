import '../../domain/entities/session_info.dart';

class SessionInfoModel extends SessionInfo {
  const SessionInfoModel({
    required super.id,
    super.mataKuliah,
    super.dosen,
    super.room,
  });

  factory SessionInfoModel.fromJson(Map<String, dynamic> json) {
    return SessionInfoModel(
      id: (json['id'] as num).toInt(),
      mataKuliah: json['mata_kuliah']?.toString(),
      dosen: json['dosen']?.toString(),
      room: json['room']?.toString(),
    );
  }
}
