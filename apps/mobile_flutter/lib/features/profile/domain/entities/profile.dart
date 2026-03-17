class ProfileEntity {
  final int id;
  final String nim;
  final String name;
  final String? email;
  final String? phone;
  final String? prodi;
  final String? kelas;
  final int? semester;
  final String? jenisReguler;
  final String? avatar;
  final String? avatarUrl;
  final String? lastActivityAt;
  final String? createdAt;

  const ProfileEntity({
    required this.id,
    required this.nim,
    required this.name,
    this.email,
    this.phone,
    this.prodi,
    this.kelas,
    this.semester,
    this.jenisReguler,
    this.avatar,
    this.avatarUrl,
    this.lastActivityAt,
    this.createdAt,
  });
}
