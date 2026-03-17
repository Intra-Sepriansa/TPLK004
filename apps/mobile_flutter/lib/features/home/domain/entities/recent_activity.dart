enum ActivityType { attendance, selfieApproved, selfieRejected, achievement }

enum ActivityStatus { success, warning, error }

class RecentActivityEntity {
  final int id;
  final ActivityType type;
  final String message;
  final String time;
  final ActivityStatus status;

  const RecentActivityEntity({
    required this.id,
    required this.type,
    required this.message,
    required this.time,
    required this.status,
  });
}
