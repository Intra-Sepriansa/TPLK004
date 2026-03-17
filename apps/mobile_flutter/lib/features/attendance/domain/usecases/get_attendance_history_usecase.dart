import '../entities/attendance.dart';
import '../repositories/attendance_repository.dart';

class GetAttendanceHistoryUseCase {
  final AttendanceRepository repository;

  GetAttendanceHistoryUseCase(this.repository);

  Future<(List<AttendanceEntity> items, Map<String, dynamic> meta)> call({
    int page = 1,
    String? search,
    String? startDate,
    String? endDate,
  }) {
    return repository.fetchHistory(
      page: page,
      search: search,
      startDate: startDate,
      endDate: endDate,
    );
  }
}
