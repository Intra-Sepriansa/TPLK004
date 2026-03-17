import '../../domain/entities/active_session.dart';

class ActiveSessionModel extends ActiveSessionEntity {
  const ActiveSessionModel({
    required super.id,
    required super.courseName,
    required super.meetingNumber,
    required super.title,
    required super.startAt,
    required super.endAt,
    required super.dosenName,
    super.attendanceStatus,
    super.attendanceLabel,
    required super.alreadySubmitted,
  });

  factory ActiveSessionModel.fromJson(Map<String, dynamic> json) {
    return ActiveSessionModel(
      id: json['id'] as int,
      courseName: json['courseName'] as String,
      meetingNumber: json['meetingNumber'] as int,
      title: json['title'] as String,
      startAt: json['startAt'] as String,
      endAt: json['endAt'] as String,
      dosenName: json['dosenName'] as String,
      attendanceStatus: json['attendanceStatus'] as String?,
      attendanceLabel: json['attendanceLabel'] as String?,
      alreadySubmitted: json['alreadySubmitted'] as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'courseName': courseName,
      'meetingNumber': meetingNumber,
      'title': title,
      'startAt': startAt,
      'endAt': endAt,
      'dosenName': dosenName,
      'attendanceStatus': attendanceStatus,
      'attendanceLabel': attendanceLabel,
      'alreadySubmitted': alreadySubmitted,
    };
  }
}
