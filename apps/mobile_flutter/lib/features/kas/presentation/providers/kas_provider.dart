import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/di/injection.dart';
import '../../domain/entities/kas_data.dart';
import '../../domain/repositories/kas_repository.dart';

class KasState {
  final bool isLoading;
  final KasDashboardData? data;
  final String? errorMessage;
  final bool isUploadingReceipt;
  final String? uploadMessage;

  const KasState({
    required this.isLoading,
    this.data,
    this.errorMessage,
    this.isUploadingReceipt = false,
    this.uploadMessage,
  });

  KasState copyWith({
    bool? isLoading,
    KasDashboardData? data,
    String? errorMessage,
    bool? isUploadingReceipt,
    String? uploadMessage,
  }) {
    return KasState(
      isLoading: isLoading ?? this.isLoading,
      data: data ?? this.data,
      errorMessage: errorMessage,
      isUploadingReceipt: isUploadingReceipt ?? this.isUploadingReceipt,
      uploadMessage: uploadMessage,
    );
  }
}

class KasNotifier extends StateNotifier<KasState> {
  KasNotifier(this._repository) : super(const KasState(isLoading: false));

  final KasRepository _repository;

  Future<void> loadDashboard() async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final result = await _repository.getDashboard();
      state = state.copyWith(isLoading: false, data: result);
    } catch (e) {
      if (kDebugMode) print('[KasNotifier] Error: $e');
      state = state.copyWith(isLoading: false, errorMessage: e.toString());
    }
  }

  Future<void> uploadReceipt({
    required int kasId,
    required String filePath,
  }) async {
    state = state.copyWith(isUploadingReceipt: true, uploadMessage: null);
    try {
      await _repository.uploadReceipt(kasId: kasId, filePath: filePath);
      state = state.copyWith(
        isUploadingReceipt: false,
        uploadMessage: 'Bukti pembayaran berhasil diunggah!',
      );
      // Reload dashboard to get updated data
      await loadDashboard();
    } catch (e) {
      if (kDebugMode) print('[KasNotifier] Upload Error: $e');
      state = state.copyWith(
        isUploadingReceipt: false,
        uploadMessage: 'Gagal mengunggah bukti: ${e.toString()}',
      );
    }
  }

  void resetStatus() {
    state = state.copyWith(uploadMessage: null);
  }
}

final kasProvider = StateNotifierProvider<KasNotifier, KasState>((ref) {
  return KasNotifier(getIt<KasRepository>());
});
