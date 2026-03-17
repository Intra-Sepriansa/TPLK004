class ChartDataPointEntity {
  final String label;
  final int present;
  final int late;
  final int absent;

  const ChartDataPointEntity({
    required this.label,
    this.present = 0,
    this.late = 0,
    this.absent = 0,
  });

  int get total => present + late + absent;
}

class DistributionDataEntity {
  final String label;
  final int value;
  final String color;

  const DistributionDataEntity({
    required this.label,
    required this.value,
    required this.color,
  });
}

class ChartDataEntity {
  final List<ChartDataPointEntity> weekly;
  final List<ChartDataPointEntity> monthly;
  final List<ChartDataPointEntity> daily;
  final List<DistributionDataEntity> distribution;

  const ChartDataEntity({
    required this.weekly,
    required this.monthly,
    required this.daily,
    required this.distribution,
  });
}
