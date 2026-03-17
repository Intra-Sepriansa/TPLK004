import '../../domain/entities/attendance_stats.dart';

class AttendanceStatsModel extends AttendanceStatsEntity {
  const AttendanceStatsModel({
    required super.present,
    required super.absent,
    required super.late,
    required super.pending,
    required super.total,
    required super.streak,
    required super.longestStreak,
  });

  factory AttendanceStatsModel.fromJson(Map<String, dynamic> json) {
    return AttendanceStatsModel(
      present: (json['present'] ?? 0) as int,
      absent: (json['absent'] ?? 0) as int,
      late: (json['late'] ?? 0) as int,
      pending: (json['pending'] ?? 0) as int,
      total: (json['total'] ?? 0) as int,
      streak: (json['streak'] ?? 0) as int,
      longestStreak: (json['longest_streak'] ?? json['longestStreak'] ?? 0) as int,
    );
  }

  /// Build stats from a list of records client-side
  factory AttendanceStatsModel.fromRecords(List<dynamic> records) {
    int present = 0, absent = 0, late = 0, pending = 0;
    for (final r in records) {
      final status = (r is Map ? r['status'] : null)?.toString() ?? '';
      switch (status) {
        case 'present':
        case 'hadir':
          present++;
          break;
        case 'absent':
        case 'alpha':
          absent++;
          break;
        case 'late':
        case 'terlambat':
          late++;
          break;
        case 'pending':
          pending++;
          break;
      }
    }
    return AttendanceStatsModel(
      present: present,
      absent: absent,
      late: late,
      pending: pending,
      total: records.length,
      streak: 0,
      longestStreak: 0,
    );
  }
}
