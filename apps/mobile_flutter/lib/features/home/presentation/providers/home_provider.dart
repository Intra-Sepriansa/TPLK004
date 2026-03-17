import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/di/injection.dart';
import '../../domain/entities/dashboard_data.dart';
import '../../domain/usecases/get_dashboard_data_usecase.dart';

class HomeState {
  final bool isLoading;
  final DashboardDataEntity? data;
  final String? errorMessage;

  const HomeState({
    required this.isLoading,
    this.data,
    this.errorMessage,
  });

  HomeState copyWith({
    bool? isLoading,
    DashboardDataEntity? data,
    String? errorMessage,
  }) {
    return HomeState(
      isLoading: isLoading ?? this.isLoading,
      data: data ?? this.data,
      errorMessage: errorMessage,
    );
  }
}

class HomeNotifier extends StateNotifier<HomeState> {
  HomeNotifier(this._useCase) : super(const HomeState(isLoading: false));

  final GetDashboardDataUseCase _useCase;

  Future<void> loadDashboard() async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final result = await _useCase();
      state = state.copyWith(isLoading: false, data: result);
    } catch (e) {
      if (kDebugMode) print('[HomeNotifier] Error: $e');
      state = state.copyWith(isLoading: false, errorMessage: e.toString());
    }
  }
}

final homeProvider = StateNotifierProvider<HomeNotifier, HomeState>((ref) {
  return HomeNotifier(GetDashboardDataUseCase(getIt()));
});
