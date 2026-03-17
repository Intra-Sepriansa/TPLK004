import '../../domain/entities/tugas_data.dart';
import '../../domain/repositories/tugas_repository.dart';
import '../datasources/tugas_remote_datasource.dart';

class TugasRepositoryImpl implements TugasRepository {
  final TugasRemoteDataSource remote;

  TugasRepositoryImpl(this.remote);

  @override
  Future<TugasDashboardData> getTugasDashboard() => remote.fetchTugasDashboard();

  @override
  Future<TugasDetailData> getTugasDetail(int id) => remote.fetchTugasDetail(id);

  @override
  Future<void> submitTugas({required int id, String? content, String? filePath}) {
    return remote.submitTugas(id: id, content: content, filePath: filePath);
  }

  @override
  Future<void> sendTugasMessage({
    required int id,
    required String pesan,
    required String visibility,
    int? replyToId,
  }) {
    return remote.sendTugasMessage(
      id: id,
      pesan: pesan,
      visibility: visibility,
      replyToId: replyToId,
    );
  }

  @override
  Future<TugasKelompokDashboardData> getTugasKelompokDashboard() => remote.fetchTugasKelompokDashboard();

  @override
  Future<TugasKelompokDetailData> getTugasKelompokDetail(int id) => remote.fetchTugasKelompokDetail(id);

  @override
  Future<void> joinGroup({required int id, required int groupId}) => remote.joinGroup(id: id, groupId: groupId);

  @override
  Future<void> sendGroupMessage({required int id, required String content}) => remote.sendGroupMessage(id: id, content: content);

  @override
  Future<void> uploadGroupFile({required int id, required String filePath}) => remote.uploadGroupFile(id: id, filePath: filePath);

  @override
  Future<void> submitGroupAssignment({required int id, String? notes}) => remote.submitGroupAssignment(id: id, notes: notes);

  @override
  Future<void> inviteStudent({required int id, required int studentId}) => remote.inviteStudent(id: id, studentId: studentId);

  @override
  Future<void> respondInvitation({required int id, required int invitationId, required bool accept}) {
    return remote.respondInvitation(id: id, invitationId: invitationId, accept: accept);
  }

  @override
  Future<void> addGroupTask({
    required int id,
    required String title,
    String? description,
    required String priority,
    String? dueDate,
  }) {
    return remote.addGroupTask(id: id, title: title, description: description, priority: priority, dueDate: dueDate);
  }
}
