import '../entities/tugas_data.dart';

abstract class TugasRepository {
  Future<TugasDashboardData> getTugasDashboard();
  Future<TugasDetailData> getTugasDetail(int id);
  Future<void> submitTugas({required int id, String? content, String? filePath});
  Future<void> sendTugasMessage({
    required int id,
    required String pesan,
    required String visibility,
    int? replyToId,
  });

  Future<TugasKelompokDashboardData> getTugasKelompokDashboard();
  Future<TugasKelompokDetailData> getTugasKelompokDetail(int id);
  Future<void> joinGroup({required int id, required int groupId});
  Future<void> sendGroupMessage({required int id, required String content});
  Future<void> uploadGroupFile({required int id, required String filePath});
  Future<void> submitGroupAssignment({required int id, String? notes});
  Future<void> inviteStudent({required int id, required int studentId});
  Future<void> respondInvitation({required int id, required int invitationId, required bool accept});
  Future<void> addGroupTask({
    required int id,
    required String title,
    String? description,
    required String priority,
    String? dueDate,
  });
}
