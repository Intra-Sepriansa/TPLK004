import '../../domain/entities/user.dart';

class UserModel extends UserEntity {
  UserModel({required super.id, required super.name, required super.nim});

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
        id: (json['id'] ?? 0) as int,
        name: (json['name'] ?? json['nama'] ?? 'Mahasiswa').toString(),
        nim: (json['nim'] ?? '').toString(),
      );
}
