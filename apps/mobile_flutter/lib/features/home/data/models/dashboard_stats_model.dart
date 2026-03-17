import '../../domain/entities/dashboard_stats.dart';

class DashboardStatsModel extends DashboardStatsEntity {
  const DashboardStatsModel({
    required super.totalAttendance,
    required super.totalSessions,
    required super.attendanceRate,
    required super.currentStreak,
    required super.longestStreak,
    required super.onTimeRate,
    required super.thisWeekAttendance,
    required super.thisWeekTotal,
  });

  factory DashboardStatsModel.fromJson(Map<String, dynamic> json) {
    return DashboardStatsModel(
      totalAttendance: (json['totalAttendance'] ?? 0) as int,
      totalSessions: (json['totalSessions'] ?? 0) as int,
      attendanceRate: (json['attendanceRate'] ?? 0).toDouble(),
      currentStreak: (json['currentStreak'] ?? 0) as int,
      longestStreak: (json['longestStreak'] ?? 0) as int,
      onTimeRate: (json['onTimeRate'] ?? 0).toDouble(),
      thisWeekAttendance: (json['thisWeekAttendance'] ?? 0) as int,
      thisWeekTotal: (json['thisWeekTotal'] ?? 0) as int,
    );
  }
}
