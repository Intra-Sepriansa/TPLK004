import '../../domain/entities/dashboard_data.dart';
import '../../domain/repositories/home_repository.dart';
import '../datasources/home_remote_datasource.dart';

class HomeRepositoryImpl implements HomeRepository {
  final HomeRemoteDataSource remote;

  HomeRepositoryImpl(this.remote);

  @override
  Future<DashboardDataEntity> fetchDashboard() async {
    return remote.fetchFullDashboard();
  }
}
