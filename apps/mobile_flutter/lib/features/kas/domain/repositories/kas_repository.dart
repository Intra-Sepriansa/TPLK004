import '../entities/kas_data.dart';

abstract class KasRepository {
  Future<KasDashboardData> getDashboard();
  Future<Map<String, dynamic>> uploadReceipt({
    required int kasId,
    required String filePath,
  });
}
