import '../../domain/entities/chart_data.dart';

class ChartDataPointModel extends ChartDataPointEntity {
  const ChartDataPointModel({
    required super.label,
    super.present,
    super.late,
    super.absent,
  });

  factory ChartDataPointModel.fromJson(Map<String, dynamic> json) {
    return ChartDataPointModel(
      label: (json['label'] ?? '').toString(),
      present: (json['present'] ?? 0) as int,
      late: (json['late'] ?? 0) as int,
      absent: (json['absent'] ?? 0) as int,
    );
  }
}

class DistributionDataModel extends DistributionDataEntity {
  const DistributionDataModel({
    required super.label,
    required super.value,
    required super.color,
  });

  factory DistributionDataModel.fromJson(Map<String, dynamic> json) {
    return DistributionDataModel(
      label: (json['label'] ?? '').toString(),
      value: (json['value'] ?? 0) as int,
      color: (json['color'] ?? '#000000').toString(),
    );
  }
}

class ChartDataModel extends ChartDataEntity {
  const ChartDataModel({
    required super.weekly,
    required super.monthly,
    required super.daily,
    required super.distribution,
  });

  factory ChartDataModel.fromJson(Map<String, dynamic> json) {
    return ChartDataModel(
      weekly: (json['weekly'] as List<dynamic>? ?? [])
          .map((e) => ChartDataPointModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      monthly: (json['monthly'] as List<dynamic>? ?? [])
          .map((e) => ChartDataPointModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      daily: (json['daily'] as List<dynamic>? ?? [])
          .map((e) => ChartDataPointModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      distribution: (json['distribution'] as List<dynamic>? ?? [])
          .map((e) => DistributionDataModel.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}
