import 'dart:io';
import '../../domain/entities/profile.dart';
import '../../domain/repositories/profile_repository.dart';
import '../datasources/profile_remote_datasource.dart';

class ProfileRepositoryImpl implements ProfileRepository {
  final ProfileRemoteDataSource remote;

  ProfileRepositoryImpl(this.remote);

  @override
  Future<ProfileEntity> fetchProfile() => remote.fetchProfile();

  @override
  Future<void> updateProfile({required String name}) =>
      remote.updateProfile(name: name);

  @override
  Future<void> uploadAvatar(File file) => remote.uploadAvatar(file);

  @override
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
    required String confirmPassword,
  }) =>
      remote.changePassword(
        currentPassword: currentPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      );
}
