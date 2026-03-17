import '../entities/dashboard_data.dart';

abstract class HomeRepository {
  Future<DashboardDataEntity> fetchDashboard();
}
