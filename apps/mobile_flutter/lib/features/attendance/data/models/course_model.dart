import '../../domain/entities/course.dart';

class CourseModel extends CourseEntity {
  const CourseModel({required super.id, required super.name});

  factory CourseModel.fromJson(Map<String, dynamic> json) {
    return CourseModel(
      id: (json['id'] ?? 0) as int,
      name: (json['name'] ?? json['nama'] ?? '').toString(),
    );
  }
}
