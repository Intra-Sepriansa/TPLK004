import 'dart:convert';

import '../../../../core/storage/local_storage.dart';
import '../../../../core/storage/secure_storage.dart';
import '../../../../core/utils/constants.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_datasource.dart';
import '../models/login_request.dart';
import '../models/user_model.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remote;
  final SecureStorage secureStorage;
  final LocalStorage localStorage;

  AuthRepositoryImpl(
    this.remote,
    this.secureStorage,
    this.localStorage,
  );

  @override
  Future<(String token, UserEntity user)> login({
    required String nim,
    required String password,
  }) async {
    final request = LoginRequest(nim: nim, password: password);
    final result = await remote.login(request);
    await secureStorage.saveToken(result.$1);
    await _cacheUser(result.$2);
    return (result.$1, result.$2);
  }

  @override
  Future<void> logout() async {
    await secureStorage.deleteToken();
    await localStorage.remove(AppConstants.cachedUserKey);
  }

  @override
  Future<String?> getToken() => secureStorage.getToken();

  @override
  Future<UserEntity?> getCachedUser() async {
    final raw = await localStorage.getString(AppConstants.cachedUserKey);
    if (raw == null || raw.isEmpty) {
      return null;
    }
    final jsonMap = jsonDecode(raw) as Map<String, dynamic>;
    return UserModel.fromJson(jsonMap);
  }

  Future<void> _cacheUser(UserModel user) async {
    final payload = jsonEncode({
      'id': user.id,
      'name': user.name,
      'nim': user.nim,
    });
    await localStorage.setString(AppConstants.cachedUserKey, payload);
  }
}
