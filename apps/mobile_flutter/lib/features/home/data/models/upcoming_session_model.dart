import '../../domain/entities/upcoming_session.dart';

class UpcomingSessionModel extends UpcomingSessionEntity {
  const UpcomingSessionModel({
    required super.id,
    required super.title,
    required super.courseName,
    required super.meetingNumber,
    required super.startAt,
    required super.endAt,
  });

  factory UpcomingSessionModel.fromJson(Map<String, dynamic> json) {
    return UpcomingSessionModel(
      id: (json['id'] ?? 0) as int,
      title: (json['title'] ?? '').toString(),
      courseName: (json['course_name'] ?? '').toString(),
      meetingNumber: (json['meeting_number'] ?? 0) as int,
      startAt: DateTime.parse(json['start_at'].toString()),
      endAt: DateTime.parse(json['end_at'].toString()),
    );
  }
}
