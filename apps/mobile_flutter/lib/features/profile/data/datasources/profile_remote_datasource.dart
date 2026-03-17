import 'dart:io';
import 'package:dio/dio.dart';

import '../../../../core/api/api_endpoints.dart';
import '../models/profile_model.dart';

class ProfileRemoteDataSource {
  final Dio dio;

  ProfileRemoteDataSource(this.dio);

  Future<ProfileModel> fetchProfile() async {
    final res = await dio.get(ApiEndpoints.profile);
    final data = res.data as Map<String, dynamic>;
    if (data['success'] != true) {
      throw Exception(data['message'] ?? 'Gagal memuat profil');
    }
    return ProfileModel.fromJson((data['data'] ?? {}) as Map<String, dynamic>);
  }

  Future<void> updateProfile({required String name}) async {
    final res = await dio.post(
      ApiEndpoints.profile,
      data: {'name': name}, // Matches backend $request->name
    );
    final data = res.data as Map<String, dynamic>;
    if (data['success'] != true) {
      throw Exception(data['message'] ?? 'Gagal memperbarui profil');
    }
  }

  Future<void> uploadAvatar(File file) async {
    final fileName = file.path.split('/').last;
    final formData = FormData.fromMap({
      'avatar': await MultipartFile.fromFile(file.path, filename: fileName),
    });

    final res = await dio.post(
      '${ApiEndpoints.profile}/avatar',
      data: formData,
    );
    final data = res.data as Map<String, dynamic>;
    if (data['success'] != true) {
      throw Exception(data['message'] ?? 'Gagal mengunggah foto profil');
    }
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
    required String confirmPassword,
  }) async {
    final res = await dio.patch(
      '${ApiEndpoints.profile}/password',
      data: {
        'current_password': currentPassword,
        'password': newPassword,
        'password_confirmation': confirmPassword,
      },
    );
    final data = res.data as Map<String, dynamic>;
    if (data['success'] != true) {
      throw Exception(data['message'] ?? 'Gagal mengubah kata sandi');
    }
  }
}
