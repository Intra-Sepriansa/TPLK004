import '../../domain/entities/profile.dart';

class ProfileModel extends ProfileEntity {
  const ProfileModel({
    required super.id,
    required super.nim,
    required super.name,
    super.email,
    super.phone,
    super.prodi,
    super.kelas,
    super.semester,
    super.jenisReguler,
    super.avatar,
    super.avatarUrl,
    super.lastActivityAt,
    super.createdAt,
  });

  factory ProfileModel.fromJson(Map<String, dynamic> json) {
    return ProfileModel(
      id: (json['id'] ?? 0) as int,
      nim: (json['nim'] ?? '').toString(),
      name: (json['name'] ?? json['nama'] ?? 'Mahasiswa').toString(),
      email: json['email']?.toString(),
      phone: json['phone']?.toString(),
      prodi: json['prodi']?.toString(),
      kelas: json['kelas']?.toString(),
      semester: json['semester'] is int
          ? json['semester'] as int
          : int.tryParse(json['semester']?.toString() ?? ''),
      jenisReguler: json['jenis_reguler']?.toString(),
      avatar: json['avatar']?.toString(),
      avatarUrl: json['avatar_url']?.toString(),
      lastActivityAt: json['last_activity_at']?.toString(),
      createdAt: json['created_at']?.toString(),
    );
  }
}
