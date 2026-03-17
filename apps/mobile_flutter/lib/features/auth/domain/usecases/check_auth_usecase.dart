import '../entities/user.dart';
import '../repositories/auth_repository.dart';

class CheckAuthUseCase {
  final AuthRepository repository;

  CheckAuthUseCase(this.repository);

  Future<(String? token, UserEntity? user)> call() async {
    final token = await repository.getToken();
    final user = await repository.getCachedUser();
    return (token, user);
  }
}
