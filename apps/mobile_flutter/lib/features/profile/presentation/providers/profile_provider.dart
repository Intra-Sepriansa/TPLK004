import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/di/injection.dart';
import '../../domain/entities/profile.dart';
import '../../domain/usecases/get_profile_usecase.dart';
import '../../domain/usecases/update_profile_usecase.dart';
import '../../domain/usecases/upload_avatar_usecase.dart';
import '../../domain/usecases/change_password_usecase.dart';

class ProfileState {
  final bool isLoading;
  final bool isUpdating; // BARU
  final bool updateSuccess; // BARU
  final ProfileEntity? profile;
  final String? errorMessage;

  const ProfileState({
    required this.isLoading,
    this.isUpdating = false,
    this.updateSuccess = false,
    this.profile,
    this.errorMessage,
  });

  ProfileState copyWith({
    bool? isLoading,
    bool? isUpdating,
    bool? updateSuccess,
    ProfileEntity? profile,
    String? errorMessage,
  }) {
    return ProfileState(
      isLoading: isLoading ?? this.isLoading,
      isUpdating: isUpdating ?? this.isUpdating,
      updateSuccess: updateSuccess ?? this.updateSuccess,
      profile: profile ?? this.profile,
      errorMessage: errorMessage,
    );
  }
}

class ProfileNotifier extends StateNotifier<ProfileState> {
  ProfileNotifier(
    this._getProfileUseCase,
    this._updateProfileUseCase,
    this._uploadAvatarUseCase,
    this._changePasswordUseCase,
  ) : super(const ProfileState(isLoading: false));

  final GetProfileUseCase _getProfileUseCase;
  final UpdateProfileUseCase _updateProfileUseCase;
  final UploadAvatarUseCase _uploadAvatarUseCase;
  final ChangePasswordUseCase _changePasswordUseCase;

  Future<void> loadProfile() async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final profile = await _getProfileUseCase();
      state = state.copyWith(isLoading: false, profile: profile);
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.toString());
    }
  }

  Future<void> updateProfile({required String name}) async {
    state = state.copyWith(isUpdating: true, errorMessage: null, updateSuccess: false);
    try {
      await _updateProfileUseCase(name: name);
      await loadProfile();
      state = state.copyWith(isUpdating: false, updateSuccess: true);
    } catch (e) {
      state = state.copyWith(isUpdating: false, errorMessage: e.toString());
    }
  }

  Future<void> uploadAvatar(File file) async {
    state = state.copyWith(isUpdating: true, errorMessage: null, updateSuccess: false);
    try {
      await _uploadAvatarUseCase(file);
      await loadProfile();
      state = state.copyWith(isUpdating: false, updateSuccess: true);
    } catch (e) {
      state = state.copyWith(isUpdating: false, errorMessage: e.toString());
    }
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
    required String confirmPassword,
  }) async {
    state = state.copyWith(isUpdating: true, errorMessage: null, updateSuccess: false);
    try {
      await _changePasswordUseCase(
        currentPassword: currentPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      );
      state = state.copyWith(isUpdating: false, updateSuccess: true);
    } catch (e) {
      state = state.copyWith(isUpdating: false, errorMessage: e.toString());
    }
  }

  void resetStatus() {
    state = state.copyWith(updateSuccess: false, errorMessage: null);
  }
}

final profileProvider =
    StateNotifierProvider<ProfileNotifier, ProfileState>((ref) {
  return ProfileNotifier(
    GetProfileUseCase(getIt()),
    UpdateProfileUseCase(getIt()),
    UploadAvatarUseCase(getIt()),
    ChangePasswordUseCase(getIt()),
  );
});
