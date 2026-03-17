import 'session_info.dart';

class QrValidationResult {
  final int sessionId;
  final bool requiresSelfie;
  final SessionInfo session;
  final String? message;

  const QrValidationResult({
    required this.sessionId,
    required this.requiresSelfie,
    required this.session,
    this.message,
  });
}
