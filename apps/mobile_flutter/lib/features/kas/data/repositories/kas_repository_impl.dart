import '../../domain/entities/kas_data.dart';
import '../../domain/repositories/kas_repository.dart';
import '../datasources/kas_remote_datasource.dart';

class KasRepositoryImpl implements KasRepository {
  final KasRemoteDataSource _dataSource;

  KasRepositoryImpl(this._dataSource);

  @override
  Future<KasDashboardData> getDashboard() => _dataSource.fetchDashboard();

  @override
  Future<Map<String, dynamic>> uploadReceipt({
    required int kasId,
    required String filePath,
  }) =>
      _dataSource.uploadReceipt(kasId: kasId, filePath: filePath);
}
