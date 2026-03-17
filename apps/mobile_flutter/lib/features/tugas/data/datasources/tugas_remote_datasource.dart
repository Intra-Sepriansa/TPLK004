import 'package:dio/dio.dart';

import '../../../../core/api/api_endpoints.dart';
import '../../domain/entities/tugas_data.dart';

class TugasRemoteDataSource {
  final Dio dio;

  TugasRemoteDataSource(this.dio);

  Future<TugasDashboardData> fetchTugasDashboard() async {
    final res = await dio.post(ApiEndpoints.tugasDashboard);
    final data = res.data as Map<String, dynamic>;
    if (data['success'] != true) {
      throw Exception(data['message'] ?? 'Gagal memuat tugas');
    }
    final d = (data['data'] ?? {}) as Map<String, dynamic>;
    return TugasDashboardData(
      tugasList: _parseTugasList(d['tugasList'] as List? ?? []),
      courses: _parseCourses(d['courses'] as List? ?? []),
      stats: _parseTugasStats(d['stats'] as Map<String, dynamic>? ?? {}),
    );
  }

  Future<TugasDetailData> fetchTugasDetail(int id) async {
    final res = await dio.get('${ApiEndpoints.tugasDetail}/$id');
    final data = res.data as Map<String, dynamic>;
    if (data['success'] != true) {
      throw Exception(data['message'] ?? 'Gagal memuat detail tugas');
    }
    final d = (data['data'] ?? {}) as Map<String, dynamic>;
    return TugasDetailData(
      tugas: _parseTugasDetail(d['tugas'] as Map<String, dynamic>? ?? {}),
      diskusi: _parseDiskusi(d['diskusi'] as List? ?? []),
      submission: d['submission'] == null
          ? null
          : _parseSubmission(d['submission'] as Map<String, dynamic>),
    );
  }

  Future<void> submitTugas({required int id, String? content, String? filePath}) async {
    final formData = FormData.fromMap({
      if (content != null) 'content': content,
      if (filePath != null) 'file': await MultipartFile.fromFile(filePath),
    });
    final res = await dio.post('${ApiEndpoints.tugasSubmit}/$id/submit', data: formData);
    final data = res.data as Map<String, dynamic>;
    if (data['success'] != true) {
      throw Exception(data['message'] ?? 'Gagal submit tugas');
    }
  }

  Future<void> sendTugasMessage({
    required int id,
    required String pesan,
    required String visibility,
    int? replyToId,
  }) async {
    final res = await dio.post('${ApiEndpoints.tugasSubmit}/$id/message', data: {
      'pesan': pesan,
      'visibility': visibility,
      if (replyToId != null) 'reply_to_id': replyToId,
    });
    final data = res.data as Map<String, dynamic>;
    if (data['success'] != true) {
      throw Exception(data['message'] ?? 'Gagal mengirim pesan');
    }
  }

  Future<TugasKelompokDashboardData> fetchTugasKelompokDashboard() async {
    final res = await dio.post(ApiEndpoints.tugasKelompokDashboard);
    final data = res.data as Map<String, dynamic>;
    if (data['success'] != true) {
      throw Exception(data['message'] ?? 'Gagal memuat tugas kelompok');
    }
    final d = (data['data'] ?? {}) as Map<String, dynamic>;
    return TugasKelompokDashboardData(
      assignments: _parseAssignments(d['assignments'] as List? ?? []),
      stats: _parseTugasKelompokStats(d['stats'] as Map<String, dynamic>? ?? {}),
    );
  }

  Future<TugasKelompokDetailData> fetchTugasKelompokDetail(int id) async {
    final res = await dio.get('${ApiEndpoints.tugasKelompokDetail}/$id');
    final data = res.data as Map<String, dynamic>;
    if (data['success'] != true) {
      throw Exception(data['message'] ?? 'Gagal memuat detail kelompok');
    }
    final d = (data['data'] ?? {}) as Map<String, dynamic>;
    return TugasKelompokDetailData(
      assignment: _parseAssignment(d['assignment'] as Map<String, dynamic>? ?? {}),
      myGroup: d['myGroup'] == null ? null : _parseGroup(d['myGroup'] as Map<String, dynamic>),
      allGroups: _parseAvailableGroups(d['allGroups'] as List? ?? []),
      messages: _parseGroupMessages(d['messages'] as List? ?? []),
      hasSubmitted: (d['hasSubmitted'] ?? false) as bool,
      myGrade: (d['myGrade'] as num?)?.toDouble(),
      selfFormConfig: d['selfFormConfig'],
      leaderTools: d['leaderTools'],
      pendingInvitations: _parseInvitations(d['pendingInvitations'] as List? ?? []),
      sentInvitations: _parseSentInvitations(d['sentInvitations'] as List? ?? []),
      stats: _parseTugasKelompokStats(d['stats'] as Map<String, dynamic>? ?? {}),
      activityLogs: _parseActivityLogs(d['activityLogs'] as List? ?? []),
    );
  }

  Future<void> joinGroup({required int id, required int groupId}) async {
    final res = await dio.post('${ApiEndpoints.tugasKelompokDetail}/$id/join', data: {
      'group_id': groupId,
    });
    final data = res.data as Map<String, dynamic>;
    if (data['success'] != true) {
      throw Exception(data['message'] ?? 'Gagal bergabung grup');
    }
  }

  Future<void> sendGroupMessage({required int id, required String content}) async {
    final res = await dio.post('${ApiEndpoints.tugasKelompokDetail}/$id/message', data: {
      'content': content,
    });
    final data = res.data as Map<String, dynamic>;
    if (data['success'] != true) {
      throw Exception(data['message'] ?? 'Gagal mengirim pesan');
    }
  }

  Future<void> uploadGroupFile({required int id, required String filePath}) async {
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(filePath),
    });
    final res = await dio.post('${ApiEndpoints.tugasKelompokDetail}/$id/upload', data: formData);
    final data = res.data as Map<String, dynamic>;
    if (data['success'] != true) {
      throw Exception(data['message'] ?? 'Gagal upload file');
    }
  }

  Future<void> submitGroupAssignment({required int id, String? notes}) async {
    final res = await dio.post('${ApiEndpoints.tugasKelompokDetail}/$id/submit', data: {
      if (notes != null) 'notes': notes,
    });
    final data = res.data as Map<String, dynamic>;
    if (data['success'] != true) {
      throw Exception(data['message'] ?? 'Gagal submit assignment');
    }
  }

  Future<void> inviteStudent({required int id, required int studentId}) async {
    final res = await dio.post('${ApiEndpoints.tugasKelompokDetail}/$id/invite', data: {
      'student_id': studentId,
    });
    final data = res.data as Map<String, dynamic>;
    if (data['success'] != true) {
      throw Exception(data['message'] ?? 'Gagal mengundang mahasiswa');
    }
  }

  Future<void> respondInvitation({required int id, required int invitationId, required bool accept}) async {
    final action = accept ? 'accept' : 'decline';
    final res = await dio.post('${ApiEndpoints.tugasKelompokDetail}/$id/invitation/$invitationId/$action');
    final data = res.data as Map<String, dynamic>;
    if (data['success'] != true) {
      throw Exception(data['message'] ?? 'Gagal merespons undangan');
    }
  }

  Future<void> addGroupTask({
    required int id,
    required String title,
    String? description,
    required String priority,
    String? dueDate,
  }) async {
    final res = await dio.post('${ApiEndpoints.tugasKelompokDetail}/$id/task', data: {
      'title': title,
      if (description != null) 'description': description,
      'priority': priority,
      if (dueDate != null) 'due_date': dueDate,
    });
    final data = res.data as Map<String, dynamic>;
    if (data['success'] != true) {
      throw Exception(data['message'] ?? 'Gagal menambah tugas');
    }
  }

  // ── Parsers ──

  List<TugasCourse> _parseCourses(List list) {
    return list.map((e) {
      final m = e as Map<String, dynamic>;
      return TugasCourse(
        id: (m['id'] ?? 0) as int,
        nama: (m['nama'] ?? '') as String,
        dosen: m['dosen'] as String?,
      );
    }).toList();
  }

  TugasStats _parseTugasStats(Map<String, dynamic> json) {
    return TugasStats(
      total: (json['total'] ?? 0) as int,
      upcoming: (json['upcoming'] ?? 0) as int,
      overdue: (json['overdue'] ?? 0) as int,
      unread: (json['unread'] ?? 0) as int,
    );
  }

  List<TugasItem> _parseTugasList(List list) {
    return list.map((e) {
      final m = e as Map<String, dynamic>;
      return TugasItem(
        id: (m['id'] ?? 0) as int,
        judul: (m['judul'] ?? '') as String,
        deskripsi: (m['deskripsi'] ?? '') as String,
        jenis: (m['jenis'] ?? '') as String,
        deadline: (m['deadline'] ?? '') as String,
        deadlineDisplay: (m['deadline_display'] ?? '') as String,
        prioritas: (m['prioritas'] ?? '') as String,
        course: _parseCourse(m['course'] as Map<String, dynamic>? ?? {}),
        createdBy: (m['created_by'] ?? '') as String,
        isOverdue: (m['is_overdue'] ?? false) as bool,
        daysUntilDeadline: (m['days_until_deadline'] ?? 0) as int,
        isRead: (m['is_read'] ?? false) as bool,
        diskusiCount: (m['diskusi_count'] ?? 0) as int,
      );
    }).toList();
  }

  TugasCourse _parseCourse(Map<String, dynamic> json) {
    return TugasCourse(
      id: (json['id'] ?? 0) as int,
      nama: (json['nama'] ?? '') as String,
      dosen: json['dosen'] as String?,
    );
  }

  TugasDetail _parseTugasDetail(Map<String, dynamic> json) {
    return TugasDetail(
      id: (json['id'] ?? 0) as int,
      judul: (json['judul'] ?? '') as String,
      deskripsi: (json['deskripsi'] ?? '') as String,
      jenis: (json['jenis'] ?? '') as String,
      deadline: (json['deadline'] ?? '') as String,
      deadlineDisplay: (json['deadline_display'] ?? '') as String,
      prioritas: (json['prioritas'] ?? '') as String,
      course: _parseCourse(json['course'] as Map<String, dynamic>? ?? {}),
      createdBy: (json['created_by'] ?? '') as String,
      isOverdue: (json['is_overdue'] ?? false) as bool,
      daysUntilDeadline: (json['days_until_deadline'] ?? 0) as int,
      isRead: (json['is_read'] ?? false) as bool,
      diskusiCount: (json['diskusi_count'] ?? 0) as int,
      instruksi: json['instruksi'] as String?,
      allowLateSubmission: (json['allow_late_submission'] ?? false) as bool,
      latePenaltyPercent: (json['late_penalty_percent'] ?? 0) as int,
      maxGrade: (json['max_grade'] ?? 0) as int,
      dosenId: json['course']?['dosen_id'] as int?,
      createdAt: (json['created_at'] ?? '') as String,
    );
  }

  TugasSubmission _parseSubmission(Map<String, dynamic> json) {
    return TugasSubmission(
      id: (json['id'] ?? 0) as int,
      content: json['content'] as String?,
      filePath: json['file_path'] as String?,
      fileName: json['file_name'] as String?,
      status: (json['status'] ?? '') as String,
      grade: (json['grade'] as num?)?.toDouble(),
      gradeLetter: json['grade_letter'] as String?,
      feedback: json['feedback'] as String?,
      submittedAt: json['submitted_at'] as String?,
      gradedAt: json['graded_at'] as String?,
    );
  }

  List<TugasDiskusi> _parseDiskusi(List list) {
    return list.map((e) {
      final m = e as Map<String, dynamic>;
      return TugasDiskusi(
        id: (m['id'] ?? 0) as int,
        senderType: (m['sender_type'] ?? '') as String,
        senderName: (m['sender_name'] ?? '') as String,
        senderAvatar: m['sender_avatar'] as String?,
        pesan: (m['pesan'] ?? '') as String,
        visibility: (m['visibility'] ?? 'public') as String,
        recipientName: m['recipient_name'] as String?,
        isPinned: (m['is_pinned'] ?? false) as bool,
        isMine: (m['is_mine'] ?? false) as bool,
        replyToId: m['reply_to_id'] as int?,
        replyTo: m['reply_to'] == null
            ? null
            : TugasDiskusiReply(
                senderName: (m['reply_to']['sender_name'] ?? '') as String,
                pesan: (m['reply_to']['pesan'] ?? '') as String,
              ),
        createdAt: (m['created_at'] ?? '') as String,
        timeAgo: (m['time_ago'] ?? '') as String,
      );
    }).toList();
  }

  TugasKelompokStats _parseTugasKelompokStats(Map<String, dynamic> json) {
    return TugasKelompokStats(
      total: (json['total'] ?? 0) as int,
      activeGroups: (json['active_groups'] ?? 0) as int,
      completed: (json['completed'] ?? 0) as int,
      notJoined: (json['not_joined'] ?? 0) as int,
      upcomingDeadline: (json['upcoming_deadline'] ?? '-') as String,
    );
  }

  List<TugasKelompokAssignment> _parseAssignments(List list) {
    return list.map((e) => _parseAssignment(e as Map<String, dynamic>)).toList();
  }

  TugasKelompokAssignment _parseAssignment(Map<String, dynamic> json) {
    return TugasKelompokAssignment(
      id: (json['id'] ?? 0) as int,
      title: (json['title'] ?? '') as String,
      description: json['description'] as String?,
      formationMode: (json['formation_mode'] ?? '') as String,
      gradingMode: json['grading_mode'] as String?,
      course: _parseCourse(json['course'] as Map<String, dynamic>? ?? {}),
      dosen: json['dosen'] == null
          ? null
          : TugasDosen(
              id: json['dosen']['id'] as int?,
              nama: (json['dosen']['nama'] ?? '') as String,
            ),
      formationDeadline: json['formation_deadline'] as String?,
      formationDeadlineDisplay: json['formation_deadline_display'] as String?,
      submissionDeadline: json['submission_deadline'] as String?,
      submissionDeadlineDisplay: json['submission_deadline_display'] as String?,
      isLocked: (json['is_locked'] ?? false) as bool,
      isOverdue: (json['is_overdue'] ?? false) as bool,
      daysUntilDeadline: (json['days_until_deadline'] as num?)?.toInt(),
      status: (json['status'] ?? 'not_joined') as String,
      canJoin: (json['can_join'] ?? false) as bool,
      hasGroup: (json['has_group'] ?? false) as bool,
      hasSubmitted: (json['has_submitted'] ?? false) as bool,
      groupName: json['group_name'] as String?,
      groupId: json['group_id'] as int?,
      memberCount: json['member_count'] as int?,
      maxMembers: json['max_members'] as int?,
      totalGroups: json['total_groups'] as int?,
      myGroup: json['my_group'] == null
          ? null
          : TugasKelompokMyGroup(
              id: (json['my_group']['id'] ?? 0) as int,
              name: (json['my_group']['name'] ?? '') as String,
              number: json['my_group']['number'] as int?,
              progress: (json['my_group']['progress'] as num?)?.toDouble() ?? 0.0,
              membersCount: (json['my_group']['members_count'] ?? 0) as int,
            ),
    );
  }

  TugasKelompokGroup _parseGroup(Map<String, dynamic> json) {
    return TugasKelompokGroup(
      id: (json['id'] ?? 0) as int,
      name: (json['name'] ?? '') as String,
      leaderId: json['leader_id'] as int?,
      slotNumber: json['slot_number'] as int?,
      members: _parseMembers(json['members'] as List? ?? []),
      messages: _parseGroupMessages(json['messages'] as List? ?? []),
      files: _parseGroupFiles(json['files'] as List? ?? []),
      tasks: _parseGroupTasks(json['tasks'] as List? ?? []),
      messageCount: json['message_count'] as int?,
      fileCount: json['file_count'] as int?,
      submission: json['submission'] == null
          ? null
          : TugasKelompokSubmission(
              submittedAt: json['submission']['submitted_at'] as String?,
              isLate: json['submission']['is_late'] as bool?,
              grade: (json['submission']['grade'] as num?)?.toDouble(),
              gradingNotes: json['submission']['grading_notes'] as String?,
            ),
      progress: (json['progress'] as num?)?.toDouble(),
    );
  }

  List<TugasKelompokMember> _parseMembers(List list) {
    return list.map((e) {
      final m = e as Map<String, dynamic>;
      return TugasKelompokMember(
        id: (m['id'] ?? 0) as int,
        nama: (m['nama'] ?? '') as String,
        nim: m['nim'] as String?,
        isLeader: (m['is_leader'] ?? false) as bool,
        role: m['role'] as String?,
        contributionPoints: m['contribution_points'] as int?,
      );
    }).toList();
  }

  List<TugasKelompokMessage> _parseGroupMessages(List list) {
    return list.map((e) {
      final m = e as Map<String, dynamic>;
      return TugasKelompokMessage(
        id: (m['id'] ?? 0) as int,
        sender: m['sender'] == null
            ? null
            : TugasKelompokMessageSender(
                id: (m['sender']['id'] ?? 0) as int,
                nama: (m['sender']['nama'] ?? '') as String,
              ),
        content: (m['content'] ?? '') as String,
        type: (m['type'] ?? 'text') as String,
        createdAt: (m['created_at'] ?? '') as String,
        attachment: m['attachment'] == null
            ? null
            : TugasKelompokMessageAttachment(
                name: m['attachment']['name'] as String?,
                url: m['attachment']['url'] as String?,
              ),
      );
    }).toList();
  }

  List<TugasKelompokFile> _parseGroupFiles(List list) {
    return list.map((e) {
      final m = e as Map<String, dynamic>;
      return TugasKelompokFile(
        id: (m['id'] ?? 0) as int,
        originalName: (m['original_name'] ?? '') as String,
        fileSizeFormatted: m['file_size_formatted'] as String?,
        uploader: m['uploader'] == null
            ? null
            : TugasKelompokFileUploader(nama: (m['uploader']['nama'] ?? '') as String),
        downloadUrl: m['download_url'] as String?,
        createdAt: m['created_at'] as String?,
      );
    }).toList();
  }

  List<TugasKelompokTask> _parseGroupTasks(List list) {
    return list.map((e) {
      final m = e as Map<String, dynamic>;
      return TugasKelompokTask(
        id: (m['id'] ?? 0) as int,
        title: (m['title'] ?? '') as String,
        description: m['description'] as String?,
        status: (m['status'] ?? 'pending') as String,
        priority: m['priority'] as String?,
        assignees: _parseAssignees(m['assignees'] as List? ?? []),
        dueDate: m['due_date'] as String?,
      );
    }).toList();
  }

  List<TugasKelompokTaskAssignee> _parseAssignees(List list) {
    return list.map((e) {
      final m = e as Map<String, dynamic>;
      return TugasKelompokTaskAssignee(
        id: (m['id'] ?? 0) as int,
        nama: (m['nama'] ?? '') as String,
      );
    }).toList();
  }

  List<TugasKelompokAvailableGroup> _parseAvailableGroups(List list) {
    return list.map((e) {
      final m = e as Map<String, dynamic>;
      return TugasKelompokAvailableGroup(
        id: (m['id'] ?? 0) as int,
        slotNumber: m['slot_number'] as int?,
        name: (m['name'] ?? '') as String,
        memberCount: (m['member_count'] ?? 0) as int,
        maxMembers: (m['max_members'] ?? 0) as int,
        isFull: (m['is_full'] ?? false) as bool,
        isMyGroup: (m['is_my_group'] ?? false) as bool,
        leader: TugasKelompokMember(
          id: (m['leader']?['id'] ?? 0) as int,
          nama: (m['leader']?['nama'] ?? '') as String,
          nim: null,
          isLeader: true,
          role: null,
          contributionPoints: null,
        ),
        members: _parseMembers(m['members'] as List? ?? []),
      );
    }).toList();
  }

  List<TugasKelompokInvitation> _parseInvitations(List list) {
    return list.map((e) {
      final m = e as Map<String, dynamic>;
      return TugasKelompokInvitation(
        id: (m['id'] ?? 0) as int,
        groupId: (m['group_id'] ?? 0) as int,
        groupName: (m['group_name'] ?? '') as String,
        inviterName: (m['inviter_name'] ?? '') as String,
        groupMemberCount: (m['group_member_count'] ?? 0) as int,
        groupMaxMembers: (m['group_max_members'] ?? 0) as int,
        groupMembers: (m['group_members'] as List? ?? []).map((gm) {
          final g = gm as Map<String, dynamic>;
          return TugasKelompokInvitationMember(
            nama: (g['nama'] ?? '') as String,
            isLeader: (g['is_leader'] ?? false) as bool,
          );
        }).toList(),
        createdAt: (m['created_at'] ?? '') as String,
      );
    }).toList();
  }

  List<TugasKelompokSentInvitation> _parseSentInvitations(List list) {
    return list.map((e) {
      final m = e as Map<String, dynamic>;
      return TugasKelompokSentInvitation(
        id: (m['id'] ?? 0) as int,
        inviteeId: (m['invitee_id'] ?? 0) as int,
        inviteeName: (m['invitee_name'] ?? '') as String,
        inviteeNim: m['invitee_nim'] as String?,
        createdAt: (m['created_at'] ?? '') as String,
      );
    }).toList();
  }

  List<TugasKelompokActivityLog> _parseActivityLogs(List list) {
    return list.map((e) {
      final m = e as Map<String, dynamic>;
      return TugasKelompokActivityLog(
        id: (m['id'] ?? 0) as int,
        type: (m['type'] ?? '') as String,
        userName: (m['user_name'] ?? '') as String,
        metadata: m['metadata'],
        createdAt: (m['created_at'] ?? '') as String,
      );
    }).toList();
  }
}
