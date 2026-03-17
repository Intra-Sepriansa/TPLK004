import 'package:dio/dio.dart';

import '../../../../core/api/api_endpoints.dart';
import '../../../profile/data/models/profile_model.dart';
import '../models/achievement_model.dart';
import '../models/chart_data_model.dart';
import '../models/dashboard_stats_model.dart';
import '../models/recent_activity_model.dart';
import '../models/today_attendance_model.dart';
import '../models/upcoming_session_model.dart';
import '../../domain/entities/dashboard_data.dart';

class HomeRemoteDataSource {
  final Dio dio;

  HomeRemoteDataSource(this.dio);

  /// Fetch the full dashboard in a single API call.
  Future<DashboardDataEntity> fetchFullDashboard() async {
    final res = await dio.get(ApiEndpoints.dashboard);
    final data = res.data as Map<String, dynamic>;
    if (data['success'] != true) {
      throw Exception(data['message'] ?? 'Gagal memuat dashboard');
    }
    final d = (data['data'] ?? {}) as Map<String, dynamic>;

    final profile =
        ProfileModel.fromJson((d['profile'] ?? {}) as Map<String, dynamic>);

    final statsJson = (d['stats'] ?? {}) as Map<String, dynamic>;
    final stats = DashboardStatsModel.fromJson(statsJson);

    TodayAttendanceModel? todayAttendance;
    if (d['todayAttendance'] != null) {
      todayAttendance = TodayAttendanceModel.fromJson(
          d['todayAttendance'] as Map<String, dynamic>);
    }

    final upcomingSessions = (d['upcomingSessions'] as List<dynamic>? ?? [])
        .map((e) => UpcomingSessionModel.fromJson(e as Map<String, dynamic>))
        .toList();

    final recentActivity = (d['recentActivity'] as List<dynamic>? ?? [])
        .map((e) => RecentActivityModel.fromJson(e as Map<String, dynamic>))
        .toList();

    final achievements = (d['achievements'] as List<dynamic>? ?? [])
        .map((e) => AchievementModel.fromJson(e as Map<String, dynamic>))
        .toList();

    final unread = (d['unreadNotifications'] ?? 0) as int;

    final chartData = ChartDataModel.fromJson(
        (d['chartData'] ?? {}) as Map<String, dynamic>);

    return DashboardDataEntity(
      profile: profile,
      todayAttendance: todayAttendance,
      recentAttendances: const [],
      stats: stats,
      upcomingSessions: upcomingSessions,
      recentActivity: recentActivity,
      achievements: achievements,
      unreadNotifications: unread,
      chartData: chartData,
    );
  }

  // Legacy methods kept for backward compatibility
  Future<ProfileModel> fetchProfile() async {
    final res = await dio.get(ApiEndpoints.profile);
    final data = res.data as Map<String, dynamic>;
    if (data['success'] != true) {
      throw Exception(data['message'] ?? 'Gagal memuat profil');
    }
    return ProfileModel.fromJson(
        (data['data'] ?? {}) as Map<String, dynamic>);
  }
}
