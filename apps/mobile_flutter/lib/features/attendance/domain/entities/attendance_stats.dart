class AttendanceStatsEntity {
  final int present;
  final int absent;
  final int late;
  final int pending;
  final int total;
  final int streak;
  final int longestStreak;

  const AttendanceStatsEntity({
    required this.present,
    required this.absent,
    required this.late,
    required this.pending,
    required this.total,
    required this.streak,
    required this.longestStreak,
  });

  double get presentRate => total > 0 ? (present / total) * 100 : 0;
  double get absentRate => total > 0 ? (absent / total) * 100 : 0;
  double get lateRate => total > 0 ? (late / total) * 100 : 0;
  double get pendingRate => total > 0 ? (pending / total) * 100 : 0;
}
