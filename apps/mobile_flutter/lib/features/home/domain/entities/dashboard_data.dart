import '../../../attendance/domain/entities/attendance.dart';
import '../../../profile/domain/entities/profile.dart';
import 'achievement.dart';
import 'chart_data.dart';
import 'dashboard_stats.dart';
import 'recent_activity.dart';
import 'today_attendance.dart';
import 'upcoming_session.dart';

class DashboardDataEntity {
  final ProfileEntity profile;
  final TodayAttendanceEntity? todayAttendance;
  final List<AttendanceEntity> recentAttendances;
  final DashboardStatsEntity stats;
  final List<UpcomingSessionEntity> upcomingSessions;
  final List<RecentActivityEntity> recentActivity;
  final List<AchievementEntity> achievements;
  final int unreadNotifications;
  final ChartDataEntity chartData;

  const DashboardDataEntity({
    required this.profile,
    required this.todayAttendance,
    required this.recentAttendances,
    required this.stats,
    required this.upcomingSessions,
    required this.recentActivity,
    required this.achievements,
    required this.unreadNotifications,
    required this.chartData,
  });
}
