enum AchievementType { streak, perfect, early, consistent, champion, legend }

class AchievementEntity {
  final AchievementType type;
  final int? value;
  final bool unlocked;
  final String title;
  final String description;
  final String icon;

  const AchievementEntity({
    required this.type,
    this.value,
    required this.unlocked,
    required this.title,
    required this.description,
    required this.icon,
  });
}
