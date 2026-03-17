import 'package:equatable/equatable.dart';

class ActiveSessionEntity extends Equatable {
  final int id;
  final String courseName;
  final int meetingNumber;
  final String title;
  final String startAt;
  final String endAt;
  final String dosenName;
  final String? attendanceStatus;
  final String? attendanceLabel;
  final bool alreadySubmitted;

  const ActiveSessionEntity({
    required this.id,
    required this.courseName,
    required this.meetingNumber,
    required this.title,
    required this.startAt,
    required this.endAt,
    required this.dosenName,
    this.attendanceStatus,
    this.attendanceLabel,
    required this.alreadySubmitted,
  });

  @override
  List<Object?> get props => [
        id,
        courseName,
        meetingNumber,
        title,
        startAt,
        endAt,
        dosenName,
        attendanceStatus,
        attendanceLabel,
        alreadySubmitted,
      ];
}
