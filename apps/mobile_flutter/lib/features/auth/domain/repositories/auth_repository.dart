import '../entities/user.dart';

abstract class AuthRepository {
  Future<(String token, UserEntity user)> login({
    required String nim,
    required String password,
  });

  Future<void> logout();

  Future<String?> getToken();

  Future<UserEntity?> getCachedUser();
}
