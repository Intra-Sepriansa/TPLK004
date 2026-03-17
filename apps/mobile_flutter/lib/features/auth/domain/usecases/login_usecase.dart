import '../entities/user.dart';
import '../repositories/auth_repository.dart';

class LoginUseCase {
  final AuthRepository repository;

  LoginUseCase(this.repository);

  Future<(String token, UserEntity user)> call({
    required String nim,
    required String password,
  }) {
    return repository.login(nim: nim, password: password);
  }
}
