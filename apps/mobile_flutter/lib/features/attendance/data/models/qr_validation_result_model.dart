import '../../domain/entities/qr_validation_result.dart';
import 'session_info_model.dart';

class QrValidationResultModel extends QrValidationResult {
  const QrValidationResultModel({
    required super.sessionId,
    required super.requiresSelfie,
    required super.session,
    super.message,
  });

  factory QrValidationResultModel.fromJson(Map<String, dynamic> json) {
    return QrValidationResultModel(
      sessionId: (json['session_id'] as num).toInt(),
      requiresSelfie: json['requires_selfie'] == true,
      session: SessionInfoModel.fromJson(
        (json['session'] as Map<String, dynamic>? ?? const {}),
      ),
      message: json['message']?.toString(),
    );
  }
}
