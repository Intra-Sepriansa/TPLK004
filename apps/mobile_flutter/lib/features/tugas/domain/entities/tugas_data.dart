class TugasCourse {
  final int id;
  final String nama;
  final String? dosen;

  const TugasCourse({
    required this.id,
    required this.nama,
    this.dosen,
  });
}

class TugasStats {
  final int total;
  final int upcoming;
  final int overdue;
  final int unread;

  const TugasStats({
    required this.total,
    required this.upcoming,
    required this.overdue,
    required this.unread,
  });
}

class TugasItem {
  final int id;
  final String judul;
  final String deskripsi;
  final String jenis;
  final String deadline;
  final String deadlineDisplay;
  final String prioritas;
  final TugasCourse course;
  final String createdBy;
  final bool isOverdue;
  final int daysUntilDeadline;
  final bool isRead;
  final int diskusiCount;

  const TugasItem({
    required this.id,
    required this.judul,
    required this.deskripsi,
    required this.jenis,
    required this.deadline,
    required this.deadlineDisplay,
    required this.prioritas,
    required this.course,
    required this.createdBy,
    required this.isOverdue,
    required this.daysUntilDeadline,
    required this.isRead,
    required this.diskusiCount,
  });
}

class TugasDashboardData {
  final List<TugasItem> tugasList;
  final List<TugasCourse> courses;
  final TugasStats stats;

  const TugasDashboardData({
    required this.tugasList,
    required this.courses,
    required this.stats,
  });
}

class TugasDetail extends TugasItem {
  final String? instruksi;
  final bool allowLateSubmission;
  final int latePenaltyPercent;
  final int maxGrade;
  final int? dosenId;
  final String createdAt;

  const TugasDetail({
    required super.id,
    required super.judul,
    required super.deskripsi,
    required super.jenis,
    required super.deadline,
    required super.deadlineDisplay,
    required super.prioritas,
    required super.course,
    required super.createdBy,
    required super.isOverdue,
    required super.daysUntilDeadline,
    required super.isRead,
    required super.diskusiCount,
    required this.instruksi,
    required this.allowLateSubmission,
    required this.latePenaltyPercent,
    required this.maxGrade,
    required this.dosenId,
    required this.createdAt,
  });
}

class TugasSubmission {
  final int id;
  final String? content;
  final String? filePath;
  final String? fileName;
  final String status;
  final double? grade;
  final String? gradeLetter;
  final String? feedback;
  final String? submittedAt;
  final String? gradedAt;

  const TugasSubmission({
    required this.id,
    required this.content,
    required this.filePath,
    required this.fileName,
    required this.status,
    required this.grade,
    required this.gradeLetter,
    required this.feedback,
    required this.submittedAt,
    required this.gradedAt,
  });
}

class TugasDiskusiReply {
  final String senderName;
  final String pesan;

  const TugasDiskusiReply({
    required this.senderName,
    required this.pesan,
  });
}

class TugasDiskusi {
  final int id;
  final String senderType;
  final String senderName;
  final String? senderAvatar;
  final String pesan;
  final String visibility;
  final String? recipientName;
  final bool isPinned;
  final bool isMine;
  final int? replyToId;
  final TugasDiskusiReply? replyTo;
  final String createdAt;
  final String timeAgo;

  const TugasDiskusi({
    required this.id,
    required this.senderType,
    required this.senderName,
    required this.senderAvatar,
    required this.pesan,
    required this.visibility,
    required this.recipientName,
    required this.isPinned,
    required this.isMine,
    required this.replyToId,
    required this.replyTo,
    required this.createdAt,
    required this.timeAgo,
  });
}

class TugasDetailData {
  final TugasDetail tugas;
  final List<TugasDiskusi> diskusi;
  final TugasSubmission? submission;

  const TugasDetailData({
    required this.tugas,
    required this.diskusi,
    required this.submission,
  });
}

class TugasKelompokStats {
  final int total;
  final int activeGroups;
  final int completed;
  final int notJoined;
  final String upcomingDeadline;

  const TugasKelompokStats({
    required this.total,
    required this.activeGroups,
    required this.completed,
    required this.notJoined,
    required this.upcomingDeadline,
  });
}

class TugasKelompokAssignment {
  final int id;
  final String title;
  final String? description;
  final String formationMode;
  final String? gradingMode;
  final TugasCourse course;
  final TugasDosen? dosen;
  final String? formationDeadline;
  final String? formationDeadlineDisplay;
  final String? submissionDeadline;
  final String? submissionDeadlineDisplay;
  final bool isLocked;
  final bool isOverdue;
  final int? daysUntilDeadline;
  final String status;
  final bool canJoin;
  final bool hasGroup;
  final bool hasSubmitted;
  final String? groupName;
  final int? groupId;
  final int? memberCount;
  final int? maxMembers;
  final int? totalGroups;
  final TugasKelompokMyGroup? myGroup;

  const TugasKelompokAssignment({
    required this.id,
    required this.title,
    required this.description,
    required this.formationMode,
    required this.gradingMode,
    required this.course,
    required this.dosen,
    required this.formationDeadline,
    required this.formationDeadlineDisplay,
    required this.submissionDeadline,
    required this.submissionDeadlineDisplay,
    required this.isLocked,
    required this.isOverdue,
    required this.daysUntilDeadline,
    required this.status,
    required this.canJoin,
    required this.hasGroup,
    required this.hasSubmitted,
    required this.groupName,
    required this.groupId,
    required this.memberCount,
    required this.maxMembers,
    required this.totalGroups,
    required this.myGroup,
  });
}

class TugasDosen {
  final int? id;
  final String nama;

  const TugasDosen({
    required this.id,
    required this.nama,
  });
}

class TugasKelompokMyGroup {
  final int id;
  final String name;
  final int? number;
  final double progress;
  final int membersCount;

  const TugasKelompokMyGroup({
    required this.id,
    required this.name,
    required this.number,
    required this.progress,
    required this.membersCount,
  });
}

class TugasKelompokDashboardData {
  final List<TugasKelompokAssignment> assignments;
  final TugasKelompokStats stats;

  const TugasKelompokDashboardData({
    required this.assignments,
    required this.stats,
  });
}

class TugasKelompokGroup {
  final int id;
  final String name;
  final int? leaderId;
  final int? slotNumber;
  final List<TugasKelompokMember> members;
  final List<TugasKelompokMessage> messages;
  final List<TugasKelompokFile> files;
  final List<TugasKelompokTask> tasks;
  final int? messageCount;
  final int? fileCount;
  final TugasKelompokSubmission? submission;
  final double? progress;

  const TugasKelompokGroup({
    required this.id,
    required this.name,
    required this.leaderId,
    required this.slotNumber,
    required this.members,
    required this.messages,
    required this.files,
    required this.tasks,
    required this.messageCount,
    required this.fileCount,
    required this.submission,
    required this.progress,
  });
}

class TugasKelompokMember {
  final int id;
  final String nama;
  final String? nim;
  final bool isLeader;
  final String? role;
  final int? contributionPoints;

  const TugasKelompokMember({
    required this.id,
    required this.nama,
    required this.nim,
    required this.isLeader,
    required this.role,
    required this.contributionPoints,
  });
}

class TugasKelompokMessageSender {
  final int id;
  final String nama;

  const TugasKelompokMessageSender({
    required this.id,
    required this.nama,
  });
}

class TugasKelompokMessageAttachment {
  final String? name;
  final String? url;

  const TugasKelompokMessageAttachment({
    required this.name,
    required this.url,
  });
}

class TugasKelompokMessage {
  final int id;
  final TugasKelompokMessageSender? sender;
  final String content;
  final String type;
  final String createdAt;
  final TugasKelompokMessageAttachment? attachment;

  const TugasKelompokMessage({
    required this.id,
    required this.sender,
    required this.content,
    required this.type,
    required this.createdAt,
    required this.attachment,
  });
}

class TugasKelompokFileUploader {
  final String nama;

  const TugasKelompokFileUploader({
    required this.nama,
  });
}

class TugasKelompokFile {
  final int id;
  final String originalName;
  final String? fileSizeFormatted;
  final TugasKelompokFileUploader? uploader;
  final String? downloadUrl;
  final String? createdAt;

  const TugasKelompokFile({
    required this.id,
    required this.originalName,
    required this.fileSizeFormatted,
    required this.uploader,
    required this.downloadUrl,
    required this.createdAt,
  });
}

class TugasKelompokTaskAssignee {
  final int id;
  final String nama;

  const TugasKelompokTaskAssignee({
    required this.id,
    required this.nama,
  });
}

class TugasKelompokTask {
  final int id;
  final String title;
  final String? description;
  final String status;
  final String? priority;
  final List<TugasKelompokTaskAssignee> assignees;
  final String? dueDate;

  const TugasKelompokTask({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    required this.priority,
    required this.assignees,
    required this.dueDate,
  });
}

class TugasKelompokAvailableGroup {
  final int id;
  final int? slotNumber;
  final String name;
  final int memberCount;
  final int maxMembers;
  final bool isFull;
  final bool isMyGroup;
  final TugasKelompokMember leader;
  final List<TugasKelompokMember> members;

  const TugasKelompokAvailableGroup({
    required this.id,
    required this.slotNumber,
    required this.name,
    required this.memberCount,
    required this.maxMembers,
    required this.isFull,
    required this.isMyGroup,
    required this.leader,
    required this.members,
  });
}

class TugasKelompokInvitationMember {
  final String nama;
  final bool isLeader;

  const TugasKelompokInvitationMember({
    required this.nama,
    required this.isLeader,
  });
}

class TugasKelompokInvitation {
  final int id;
  final int groupId;
  final String groupName;
  final String inviterName;
  final int groupMemberCount;
  final int groupMaxMembers;
  final List<TugasKelompokInvitationMember> groupMembers;
  final String createdAt;

  const TugasKelompokInvitation({
    required this.id,
    required this.groupId,
    required this.groupName,
    required this.inviterName,
    required this.groupMemberCount,
    required this.groupMaxMembers,
    required this.groupMembers,
    required this.createdAt,
  });
}

class TugasKelompokSentInvitation {
  final int id;
  final int inviteeId;
  final String inviteeName;
  final String? inviteeNim;
  final String createdAt;

  const TugasKelompokSentInvitation({
    required this.id,
    required this.inviteeId,
    required this.inviteeName,
    required this.inviteeNim,
    required this.createdAt,
  });
}

class TugasKelompokActivityLog {
  final int id;
  final String type;
  final String userName;
  final dynamic metadata;
  final String createdAt;

  const TugasKelompokActivityLog({
    required this.id,
    required this.type,
    required this.userName,
    required this.metadata,
    required this.createdAt,
  });
}

class TugasKelompokSubmission {
  final String? submittedAt;
  final bool? isLate;
  final double? grade;
  final String? gradingNotes;

  const TugasKelompokSubmission({
    required this.submittedAt,
    required this.isLate,
    required this.grade,
    required this.gradingNotes,
  });
}

class TugasKelompokDetailData {
  final TugasKelompokAssignment assignment;
  final TugasKelompokGroup? myGroup;
  final List<TugasKelompokAvailableGroup> allGroups;
  final List<TugasKelompokMessage> messages;
  final bool hasSubmitted;
  final double? myGrade;
  final dynamic selfFormConfig;
  final dynamic leaderTools;
  final List<TugasKelompokInvitation> pendingInvitations;
  final List<TugasKelompokSentInvitation> sentInvitations;
  final TugasKelompokStats stats;
  final List<TugasKelompokActivityLog> activityLogs;

  const TugasKelompokDetailData({
    required this.assignment,
    required this.myGroup,
    required this.allGroups,
    required this.messages,
    required this.hasSubmitted,
    required this.myGrade,
    required this.selfFormConfig,
    required this.leaderTools,
    required this.pendingInvitations,
    required this.sentInvitations,
    required this.stats,
    required this.activityLogs,
  });
}
