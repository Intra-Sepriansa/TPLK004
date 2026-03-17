class UpcomingSessionEntity {
  final int id;
  final String title;
  final String courseName;
  final int meetingNumber;
  final DateTime startAt;
  final DateTime endAt;

  const UpcomingSessionEntity({
    required this.id,
    required this.title,
    required this.courseName,
    required this.meetingNumber,
    required this.startAt,
    required this.endAt,
  });
}
