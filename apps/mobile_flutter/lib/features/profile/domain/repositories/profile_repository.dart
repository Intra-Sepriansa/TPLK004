import 'dart:io';
import '../entities/profile.dart';

abstract class ProfileRepository {
  Future<ProfileEntity> fetchProfile();
  Future<void> updateProfile({required String name});
  Future<void> uploadAvatar(File file);
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
    required String confirmPassword,
  });
}
