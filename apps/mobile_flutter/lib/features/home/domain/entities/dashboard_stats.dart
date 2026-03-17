class DashboardStatsEntity {
  final int totalAttendance;
  final int totalSessions;
  final double attendanceRate;
  final int currentStreak;
  final int longestStreak;
  final double onTimeRate;
  final int thisWeekAttendance;
  final int thisWeekTotal;

  const DashboardStatsEntity({
    required this.totalAttendance,
    required this.totalSessions,
    required this.attendanceRate,
    required this.currentStreak,
    required this.longestStreak,
    required this.onTimeRate,
    required this.thisWeekAttendance,
    required this.thisWeekTotal,
  });
}
