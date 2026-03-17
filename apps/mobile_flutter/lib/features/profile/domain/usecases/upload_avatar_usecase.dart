import 'dart:io';
import '../../domain/repositories/profile_repository.dart';

class UploadAvatarUseCase {
  final ProfileRepository repository;

  UploadAvatarUseCase(this.repository);

  Future<void> call(File file) {
    return repository.uploadAvatar(file);
  }
}
