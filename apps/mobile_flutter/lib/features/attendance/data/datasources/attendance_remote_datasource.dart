import 'dart:convert';
import 'package:dio/dio.dart';

import '../../../../core/api/api_endpoints.dart';
import '../../../../core/utils/constants.dart';
import '../models/active_session_model.dart';
import '../models/attendance_model.dart';
import '../models/attendance_result_model.dart';
import '../models/attendance_stats_model.dart';
import '../models/course_model.dart';
import '../models/qr_validation_result_model.dart';

class AttendanceRemoteDataSource {
  final Dio dio;

  AttendanceRemoteDataSource(this.dio);

  Future<(List<AttendanceModel> items, Map<String, dynamic> meta)> fetchHistory({
    int page = 1,
    String? search,
    String? status,
    String? courseId,
    String? startDate,
    String? endDate,
  }) async {
    final res = await dio.get(ApiEndpoints.attendanceHistory, queryParameters: {
      'page': page,
      'per_page': AppConstants.historyPageSize,
      if (search != null && search.isNotEmpty) 'search': search,
      if (status != null && status != 'all') 'status': status,
      if (courseId != null && courseId != 'all') 'course_id': courseId,
      if (startDate != null) 'start_date': startDate,
      if (endDate != null) 'end_date': endDate,
    });

    final data = res.data as Map<String, dynamic>;
    if (data['success'] != true) {
      throw Exception(data['message'] ?? 'Gagal memuat riwayat');
    }
    final list = (data['data'] as List<dynamic>? ?? [])
        .map((item) => AttendanceModel.fromJson(item as Map<String, dynamic>))
        .toList();
    final meta = (data['meta'] as Map<String, dynamic>? ?? {});
    return (list, meta);
  }

  Future<List<ActiveSessionModel>> fetchActiveSessions() async {
    final res = await dio.get(ApiEndpoints.attendanceActiveSessions);
    final data = res.data as Map<String, dynamic>;
    if (data['success'] != true) {
      throw Exception(data['message'] ?? 'Gagal memuat sesi aktif');
    }
    return (data['data'] as List<dynamic>? ?? [])
        .map((item) => ActiveSessionModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  /// Fetch all records (non-paginated) for client-side analytics
  Future<List<AttendanceModel>> fetchAllRecords() async {
    final res = await dio.get(ApiEndpoints.attendanceHistory, queryParameters: {
      'per_page': 999,
      'page': 1,
    });
    final data = res.data as Map<String, dynamic>;
    if (data['success'] != true) {
      throw Exception(data['message'] ?? 'Gagal memuat data');
    }
    return (data['data'] as List<dynamic>? ?? [])
        .map((item) => AttendanceModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  /// Fetch stats from dedicated endpoint (fallback to client-side computation)
  Future<AttendanceStatsModel> fetchStats() async {
    try {
      final res = await dio.get(ApiEndpoints.attendanceStats);
      final data = res.data as Map<String, dynamic>;
      if (data['success'] == true && data['data'] != null) {
        return AttendanceStatsModel.fromJson(data['data'] as Map<String, dynamic>);
      }
    } catch (_) {
      // Fallback: compute from all records
    }
    // Client-side fallback
    final allRecords = await fetchAllRecords();
    int present = 0, absent = 0, late = 0, pending = 0, streak = 0, longestStreak = 0, currentStreak = 0;
    // Sort by date desc for streak computation
    final sorted = List<AttendanceModel>.from(allRecords)
      ..sort((a, b) => b.date.compareTo(a.date));
    for (final r in sorted) {
      switch (r.status) {
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
    // Compute streak
    bool streakBroken = false;
    for (final r in sorted) {
      if (r.status == 'present' || r.status == 'hadir' || r.status == 'late' || r.status == 'terlambat') {
        if (!streakBroken) currentStreak++;
      } else {
        streakBroken = true;
      }
    }
    // Compute longest streak
    int tempStreak = 0;
    for (final r in sorted.reversed) {
      if (r.status == 'present' || r.status == 'hadir' || r.status == 'late' || r.status == 'terlambat') {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }
    streak = currentStreak;
    return AttendanceStatsModel(
      present: present,
      absent: absent,
      late: late,
      pending: pending,
      total: allRecords.length,
      streak: streak,
      longestStreak: longestStreak,
    );
  }

  /// Extract unique courses from records
  Future<List<CourseModel>> fetchCourses() async {
    final allRecords = await fetchAllRecords();
    final courseMap = <int, CourseModel>{};
    for (final r in allRecords) {
      final cid = r.courseId ?? r.mataKuliah.hashCode;
      courseMap.putIfAbsent(cid, () => CourseModel(id: cid, name: r.mataKuliah));
    }
    return courseMap.values.toList();
  }

  String _handleError(dynamic e, String defaultMsg) {
    if (e is DioException) {
      final data = e.response?.data;
      
      if (data is Map<String, dynamic> && data['message'] != null) {
        return data['message'].toString();
      } else if (data is String) {
        try {
          final parsed = jsonDecode(data);
          if (parsed is Map<String, dynamic> && parsed['message'] != null) {
            return parsed['message'].toString();
          }
        } catch (_) {}
      }
      
      if (e.response?.statusCode != null) {
         return '$defaultMsg (Error ${e.response?.statusCode})';
      }
      return defaultMsg;
    }
    return defaultMsg;
  }

  Future<QrValidationResultModel> submitQr({
    required String qrData,
    required double latitude,
    required double longitude,
    required double accuracy,
    required List<Map<String, dynamic>> locationSamples,
  }) async {
    try {
      final res = await dio.post(ApiEndpoints.submitQrAttendance, data: {
        'qr_data': qrData,
        'latitude': latitude,
        'longitude': longitude,
        'accuracy_m': accuracy,
        'location_samples': locationSamples,
        'timestamp': DateTime.now().toIso8601String(),
      });
      final data = res.data as Map<String, dynamic>;
      if (data['success'] != true) {
        throw Exception(data['message'] ?? 'Gagal submit QR');
      }
      final payload = data['data'] as Map<String, dynamic>? ?? {};
      return QrValidationResultModel.fromJson(payload);
    } catch (e) {
      throw _handleError(e, 'Gagal submit QR');
    }
  }

  Future<AttendanceResultModel> submitSelfie({
    required String filePath,
    required int sessionId,
    String? qrData,
    required double latitude,
    required double longitude,
    required double accuracy,
    required List<Map<String, dynamic>> locationSamples,
  }) async {
    final formMap = <String, dynamic>{
      'selfie': await MultipartFile.fromFile(filePath),
      'session_id': sessionId,
      if (qrData != null) 'qr_data': qrData,
      'latitude': latitude,
      'longitude': longitude,
      'accuracy_m': accuracy,
      'timestamp': DateTime.now().toIso8601String(),
    };

    for (var i = 0; i < locationSamples.length; i++) {
      final sample = locationSamples[i];
      formMap['location_samples[$i][latitude]'] = sample['latitude'];
      formMap['location_samples[$i][longitude]'] = sample['longitude'];
      formMap['location_samples[$i][accuracy_m]'] = sample['accuracy_m'];
      formMap['location_samples[$i][captured_at]'] = sample['captured_at'];
    }

    final formData = FormData.fromMap(formMap);
    try {
      final res = await dio.post(ApiEndpoints.submitSelfieAttendance, data: formData);
      final data = res.data as Map<String, dynamic>;
      if (data['success'] != true) {
        throw Exception(data['message'] ?? 'Gagal submit selfie');
      }
      final payload = data['data'] as Map<String, dynamic>? ?? {};
      return AttendanceResultModel.fromJson(payload);
    } catch (e) {
      throw _handleError(e, 'Gagal submit selfie');
    }
  }
}
