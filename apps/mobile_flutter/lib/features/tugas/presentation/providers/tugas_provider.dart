import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/di/injection.dart';
import '../../domain/entities/tugas_data.dart';
import '../../domain/repositories/tugas_repository.dart';

class TugasDashboardState {
  final bool isLoading;
  final String? errorMessage;
  final TugasDashboardData? tugasData;
  final TugasKelompokDashboardData? kelompokData;
  final String searchQuery;
  final int? courseId;
  final String statusFilter;
  final String groupStatusFilter;

  const TugasDashboardState({
    required this.isLoading,
    this.errorMessage,
    this.tugasData,
    this.kelompokData,
    this.searchQuery = '',
    this.courseId,
    this.statusFilter = 'all',
    this.groupStatusFilter = 'all',
  });

  TugasDashboardState copyWith({
    bool? isLoading,
    String? errorMessage,
    TugasDashboardData? tugasData,
    TugasKelompokDashboardData? kelompokData,
    String? searchQuery,
    int? courseId,
    String? statusFilter,
    String? groupStatusFilter,
  }) {
    return TugasDashboardState(
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
      tugasData: tugasData ?? this.tugasData,
      kelompokData: kelompokData ?? this.kelompokData,
      searchQuery: searchQuery ?? this.searchQuery,
      courseId: courseId ?? this.courseId,
      statusFilter: statusFilter ?? this.statusFilter,
      groupStatusFilter: groupStatusFilter ?? this.groupStatusFilter,
    );
  }
}

class TugasNotifier extends StateNotifier<TugasDashboardState> {
  TugasNotifier(this._repository) : super(const TugasDashboardState(isLoading: false));

  final TugasRepository _repository;

  Future<void> loadDashboard() async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final results = await Future.wait([
        _repository.getTugasDashboard(),
        _repository.getTugasKelompokDashboard(),
      ]);
      state = state.copyWith(
        isLoading: false,
        tugasData: results[0] as TugasDashboardData,
        kelompokData: results[1] as TugasKelompokDashboardData,
      );
    } catch (e) {
      if (kDebugMode) print('[TugasNotifier] Error: $e');
      state = state.copyWith(isLoading: false, errorMessage: e.toString());
    }
  }

  void setSearchQuery(String value) {
    state = state.copyWith(searchQuery: value);
  }

  void setCourseId(int? id) {
    state = state.copyWith(courseId: id);
  }

  void setStatusFilter(String value) {
    state = state.copyWith(statusFilter: value);
  }

  void setGroupStatusFilter(String value) {
    state = state.copyWith(groupStatusFilter: value);
  }
}

final tugasProvider = StateNotifierProvider<TugasNotifier, TugasDashboardState>((ref) {
  return TugasNotifier(getIt<TugasRepository>());
});

class TugasDetailState {
  final bool isLoading;
  final String? errorMessage;
  final TugasDetailData? data;
  final bool isSubmitting;
  final String? submitMessage;

  const TugasDetailState({
    required this.isLoading,
    this.errorMessage,
    this.data,
    this.isSubmitting = false,
    this.submitMessage,
  });

  TugasDetailState copyWith({
    bool? isLoading,
    String? errorMessage,
    TugasDetailData? data,
    bool? isSubmitting,
    String? submitMessage,
  }) {
    return TugasDetailState(
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
      data: data ?? this.data,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      submitMessage: submitMessage,
    );
  }
}

class TugasDetailNotifier extends StateNotifier<TugasDetailState> {
  TugasDetailNotifier(this._repository) : super(const TugasDetailState(isLoading: false));

  final TugasRepository _repository;

  Future<void> loadDetail(int id) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final result = await _repository.getTugasDetail(id);
      state = state.copyWith(isLoading: false, data: result);
    } catch (e) {
      if (kDebugMode) print('[TugasDetailNotifier] Error: $e');
      state = state.copyWith(isLoading: false, errorMessage: e.toString());
    }
  }

  Future<void> submitTugas({required int id, String? content, String? filePath}) async {
    state = state.copyWith(isSubmitting: true, submitMessage: null);
    try {
      await _repository.submitTugas(id: id, content: content, filePath: filePath);
      state = state.copyWith(isSubmitting: false, submitMessage: 'Tugas berhasil dikirim.');
      await loadDetail(id);
    } catch (e) {
      if (kDebugMode) print('[TugasDetailNotifier] Submit Error: $e');
      state = state.copyWith(isSubmitting: false, submitMessage: 'Gagal submit: ${e.toString()}');
    }
  }

  Future<void> sendMessage({
    required int id,
    required String pesan,
    required String visibility,
    int? replyToId,
  }) async {
    try {
      await _repository.sendTugasMessage(
        id: id,
        pesan: pesan,
        visibility: visibility,
        replyToId: replyToId,
      );
      await loadDetail(id);
    } catch (e) {
      if (kDebugMode) print('[TugasDetailNotifier] Message Error: $e');
    }
  }

  void resetStatus() {
    state = state.copyWith(submitMessage: null);
  }
}

final tugasDetailProvider = StateNotifierProvider<TugasDetailNotifier, TugasDetailState>((ref) {
  return TugasDetailNotifier(getIt<TugasRepository>());
});

class TugasKelompokDetailState {
  final bool isLoading;
  final String? errorMessage;
  final TugasKelompokDetailData? data;
  final bool isBusy;
  final String? actionMessage;

  const TugasKelompokDetailState({
    required this.isLoading,
    this.errorMessage,
    this.data,
    this.isBusy = false,
    this.actionMessage,
  });

  TugasKelompokDetailState copyWith({
    bool? isLoading,
    String? errorMessage,
    TugasKelompokDetailData? data,
    bool? isBusy,
    String? actionMessage,
  }) {
    return TugasKelompokDetailState(
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
      data: data ?? this.data,
      isBusy: isBusy ?? this.isBusy,
      actionMessage: actionMessage,
    );
  }
}

class TugasKelompokDetailNotifier extends StateNotifier<TugasKelompokDetailState> {
  TugasKelompokDetailNotifier(this._repository) : super(const TugasKelompokDetailState(isLoading: false));

  final TugasRepository _repository;

  Future<void> loadDetail(int id) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final result = await _repository.getTugasKelompokDetail(id);
      state = state.copyWith(isLoading: false, data: result);
    } catch (e) {
      if (kDebugMode) print('[TugasKelompokDetailNotifier] Error: $e');
      state = state.copyWith(isLoading: false, errorMessage: e.toString());
    }
  }

  Future<void> joinGroup(int id, int groupId) async {
    await _action(() => _repository.joinGroup(id: id, groupId: groupId), id);
  }

  Future<void> sendMessage(int id, String content) async {
    await _action(() => _repository.sendGroupMessage(id: id, content: content), id, reload: true);
  }

  Future<void> uploadFile(int id, String filePath) async {
    await _action(() => _repository.uploadGroupFile(id: id, filePath: filePath), id);
  }

  Future<void> submitAssignment(int id, {String? notes}) async {
    await _action(() => _repository.submitGroupAssignment(id: id, notes: notes), id);
  }

  Future<void> inviteStudent(int id, int studentId) async {
    await _action(() => _repository.inviteStudent(id: id, studentId: studentId), id);
  }

  Future<void> respondInvitation(int id, int invitationId, bool accept) async {
    await _action(() => _repository.respondInvitation(id: id, invitationId: invitationId, accept: accept), id);
  }

  Future<void> addTask(int id, {required String title, String? description, required String priority, String? dueDate}) async {
    await _action(
      () => _repository.addGroupTask(
        id: id,
        title: title,
        description: description,
        priority: priority,
        dueDate: dueDate,
      ),
      id,
    );
  }

  Future<void> _action(Future<void> Function() action, int id, {bool reload = true}) async {
    state = state.copyWith(isBusy: true, actionMessage: null);
    try {
      await action();
      state = state.copyWith(isBusy: false, actionMessage: 'Berhasil');
      if (reload) await loadDetail(id);
    } catch (e) {
      if (kDebugMode) print('[TugasKelompokDetailNotifier] Action Error: $e');
      state = state.copyWith(isBusy: false, actionMessage: e.toString());
    }
  }

  void resetStatus() {
    state = state.copyWith(actionMessage: null);
  }
}

final tugasKelompokDetailProvider = StateNotifierProvider<TugasKelompokDetailNotifier, TugasKelompokDetailState>((ref) {
  return TugasKelompokDetailNotifier(getIt<TugasRepository>());
});
