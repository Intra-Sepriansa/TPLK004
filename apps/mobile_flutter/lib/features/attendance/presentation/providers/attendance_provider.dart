import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/di/injection.dart';
import '../../data/datasources/attendance_remote_datasource.dart';
import '../../domain/entities/active_session.dart';
import '../../domain/entities/attendance.dart';
import '../../domain/repositories/attendance_repository.dart';
import '../../domain/entities/attendance_stats.dart';
import '../../domain/entities/course.dart';
import '../../domain/usecases/get_attendance_history_usecase.dart';

class AttendanceHistoryState {
  final bool isLoading;
  final List<AttendanceEntity> items;
  final List<AttendanceEntity> allItems; // for analytics
  final int currentPage;
  final bool hasMore;
  final String? errorMessage;
  final AttendanceStatsEntity? stats;
  final List<CourseEntity> courses;
  final String searchQuery;
  final String statusFilter;
  final String courseFilter;
  final DateTime? selectedDate;
  final String viewMode;

  const AttendanceHistoryState({
    required this.isLoading,
    required this.items,
    this.allItems = const [],
    required this.currentPage,
    required this.hasMore,
    this.errorMessage,
    this.stats,
    this.courses = const [],
    this.searchQuery = '',
    this.statusFilter = 'all',
    this.courseFilter = 'all',
    this.selectedDate,
    this.viewMode = 'list',
  });

  List<AttendanceEntity> get filteredItems {
    var result = allItems.isNotEmpty ? allItems : items;
    if (searchQuery.isNotEmpty) {
      final q = searchQuery.toLowerCase();
      result = result
          .where((r) =>
              r.mataKuliah.toLowerCase().contains(q) ||
              r.date.toLowerCase().contains(q) ||
              r.status.toLowerCase().contains(q))
          .toList();
    }
    if (statusFilter != 'all') {
      result = result.where((r) => r.status == statusFilter).toList();
    }
    if (courseFilter != 'all') {
      result = result
          .where((r) => r.courseId?.toString() == courseFilter || r.mataKuliah.hashCode.toString() == courseFilter)
          .toList();
    }
    if (selectedDate != null) {
      final df = DateFormat('yyyy-MM-dd');
      final dateStr = df.format(selectedDate!);
      result = result.where((r) => r.date.startsWith(dateStr)).toList();
    }
    return result;
  }

  AttendanceHistoryState copyWith({
    bool? isLoading,
    List<AttendanceEntity>? items,
    List<AttendanceEntity>? allItems,
    int? currentPage,
    bool? hasMore,
    String? errorMessage,
    AttendanceStatsEntity? stats,
    List<CourseEntity>? courses,
    String? searchQuery,
    String? statusFilter,
    String? courseFilter,
    DateTime? selectedDate,
    bool clearSelectedDate = false,
    String? viewMode,
  }) {
    return AttendanceHistoryState(
      isLoading: isLoading ?? this.isLoading,
      items: items ?? this.items,
      allItems: allItems ?? this.allItems,
      currentPage: currentPage ?? this.currentPage,
      hasMore: hasMore ?? this.hasMore,
      errorMessage: errorMessage,
      stats: stats ?? this.stats,
      courses: courses ?? this.courses,
      searchQuery: searchQuery ?? this.searchQuery,
      statusFilter: statusFilter ?? this.statusFilter,
      courseFilter: courseFilter ?? this.courseFilter,
      selectedDate: clearSelectedDate ? null : (selectedDate ?? this.selectedDate),
      viewMode: viewMode ?? this.viewMode,
    );
  }
}

class AttendanceHistoryNotifier extends StateNotifier<AttendanceHistoryState> {
  AttendanceHistoryNotifier(this._useCase, this._remote)
      : super(const AttendanceHistoryState(
          isLoading: false,
          items: [],
          currentPage: 1,
          hasMore: true,
        ));

  final GetAttendanceHistoryUseCase _useCase;
  final AttendanceRemoteDataSource _remote;

  Future<void> loadInitial() async {
    state = state.copyWith(isLoading: true, errorMessage: null, currentPage: 1);
    try {
      final result = await _useCase(page: 1);
      final meta = result.$2;
      final lastPage = int.tryParse(meta['last_page']?.toString() ?? '') ?? 1;
      state = state.copyWith(
        isLoading: false,
        items: result.$1,
        currentPage: 1,
        hasMore: 1 < lastPage,
      );
      // Load analytics data in background
      _loadAnalytics();
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.toString());
    }
  }

  Future<void> _loadAnalytics() async {
    try {
      final allRecords = await _remote.fetchAllRecords();
      final stats = await _remote.fetchStats();
      final courseMap = <int, CourseEntity>{};
      for (final r in allRecords) {
        final cid = r.courseId ?? r.mataKuliah.hashCode;
        courseMap.putIfAbsent(cid, () => CourseEntity(id: cid, name: r.mataKuliah));
      }
      state = state.copyWith(
        allItems: allRecords,
        stats: stats,
        courses: courseMap.values.toList(),
      );
    } catch (_) {
      // Analytics are optional, don't fail
    }
  }

  Future<void> loadMore() async {
    if (state.isLoading || !state.hasMore) return;
    state = state.copyWith(isLoading: true, errorMessage: null);
    final nextPage = state.currentPage + 1;
    try {
      final result = await _useCase(page: nextPage);
      final meta = result.$2;
      final lastPage =
          int.tryParse(meta['last_page']?.toString() ?? '') ?? nextPage;
      state = state.copyWith(
        isLoading: false,
        items: [...state.items, ...result.$1],
        currentPage: nextPage,
        hasMore: nextPage < lastPage,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.toString());
    }
  }

  void setSearchQuery(String query) {
    state = state.copyWith(searchQuery: query);
  }

  void setStatusFilter(String filter) {
    state = state.copyWith(statusFilter: filter);
  }

  void setCourseFilter(String filter) {
    state = state.copyWith(courseFilter: filter);
  }

  void setSelectedDate(DateTime? date) {
    if (date == null) {
      state = state.copyWith(clearSelectedDate: true);
    } else {
      state = state.copyWith(selectedDate: date);
    }
  }

  void setViewMode(String mode) {
    state = state.copyWith(viewMode: mode);
  }
}

final attendanceHistoryProvider = StateNotifierProvider<
    AttendanceHistoryNotifier, AttendanceHistoryState>((ref) {
  return AttendanceHistoryNotifier(
    GetAttendanceHistoryUseCase(getIt()),
    getIt<AttendanceRemoteDataSource>(),
  );
});

final activeSessionsProvider = FutureProvider<List<ActiveSessionEntity>>((ref) async {
  final repository = getIt<AttendanceRepository>();
  return repository.fetchActiveSessions();
});
