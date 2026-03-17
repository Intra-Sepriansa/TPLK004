import 'package:dio/dio.dart';

import '../../../../core/api/api_endpoints.dart';
import '../models/login_request.dart';
import '../models/user_model.dart';

class AuthRemoteDataSource {
  final Dio dio;

  AuthRemoteDataSource(this.dio);

  Future<(String token, UserModel user)> login(LoginRequest request) async {
    final res = await dio.post(ApiEndpoints.login, data: request.toJson());
    final data = res.data as Map<String, dynamic>;
    if (data['success'] != true) {
      throw Exception(data['message'] ?? 'Login gagal');
    }
    final token = data['token']?.toString() ??
        (data['data']?['token']?.toString() ?? '');
    final userJson = data['user'] ?? data['data']?['user'] ?? {};
    final user = UserModel.fromJson(userJson as Map<String, dynamic>);
    return (token, user);
  }
}
