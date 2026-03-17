import '../../domain/entities/achievement.dart';

class AchievementModel extends AchievementEntity {
  const AchievementModel({
    required super.type,
    super.value,
    required super.unlocked,
    required super.title,
    required super.description,
    required super.icon,
  });

  factory AchievementModel.fromJson(Map<String, dynamic> json) {
    return AchievementModel(
      type: _parseType((json['type'] ?? 'streak').toString()),
      value: json['value'] as int?,
      unlocked: (json['unlocked'] ?? false) as bool,
      title: (json['title'] ?? '').toString(),
      description: (json['description'] ?? '').toString(),
      icon: (json['icon'] ?? '🔥').toString(),
    );
  }

  static AchievementType _parseType(String type) {
    switch (type) {
      case 'perfect':
        return AchievementType.perfect;
      case 'early':
        return AchievementType.early;
      case 'consistent':
        return AchievementType.consistent;
      case 'champion':
        return AchievementType.champion;
      case 'legend':
        return AchievementType.legend;
      default:
        return AchievementType.streak;
    }
  }
}
