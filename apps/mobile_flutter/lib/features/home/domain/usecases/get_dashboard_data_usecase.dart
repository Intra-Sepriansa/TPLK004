import '../entities/dashboard_data.dart';
import '../repositories/home_repository.dart';

class GetDashboardDataUseCase {
  final HomeRepository repository;

  GetDashboardDataUseCase(this.repository);

  Future<DashboardDataEntity> call() => repository.fetchDashboard();
}
