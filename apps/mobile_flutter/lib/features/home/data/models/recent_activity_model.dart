import '../../domain/entities/recent_activity.dart';

class RecentActivityModel extends RecentActivityEntity {
  const RecentActivityModel({
    required super.id,
    required super.type,
    required super.message,
    required super.time,
    required super.status,
  });

  factory RecentActivityModel.fromJson(Map<String, dynamic> json) {
    final typeStr = (json['type'] ?? 'attendance').toString();
    final statusStr = (json['status'] ?? 'success').toString();

    return RecentActivityModel(
      id: (json['id'] ?? 0) as int,
      type: _parseType(typeStr),
      message: (json['message'] ?? '').toString(),
      time: (json['time'] ?? '').toString(),
      status: _parseStatus(statusStr),
    );
  }

  static ActivityType _parseType(String type) {
    switch (type) {
      case 'selfie_approved':
        return ActivityType.selfieApproved;
      case 'selfie_rejected':
        return ActivityType.selfieRejected;
      case 'achievement':
        return ActivityType.achievement;
      default:
        return ActivityType.attendance;
    }
  }

  static ActivityStatus _parseStatus(String status) {
    switch (status) {
      case 'warning':
        return ActivityStatus.warning;
      case 'error':
        return ActivityStatus.error;
      default:
        return ActivityStatus.success;
    }
  }
}
