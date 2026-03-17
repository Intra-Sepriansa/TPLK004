import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/tugas_data.dart';
import '../providers/tugas_provider.dart';

class TugasKelompokDetailScreen extends ConsumerStatefulWidget {
  const TugasKelompokDetailScreen({super.key, required this.id});

  final int id;

  @override
  ConsumerState<TugasKelompokDetailScreen> createState() => _TugasKelompokDetailScreenState();
}

class _TugasKelompokDetailScreenState extends ConsumerState<TugasKelompokDetailScreen> with TickerProviderStateMixin {
  int _tabIndex = 0;
  late final TextEditingController _chatCtrl;
  late final TextEditingController _taskTitleCtrl;
  late final TextEditingController _taskDescCtrl;

  @override
  void initState() {
    super.initState();
    _chatCtrl = TextEditingController();
    _taskTitleCtrl = TextEditingController();
    _taskDescCtrl = TextEditingController();
    Future.microtask(() => ref.read(tugasKelompokDetailProvider.notifier).loadDetail(widget.id));
  }

  @override
  void dispose() {
    _chatCtrl.dispose();
    _taskTitleCtrl.dispose();
    _taskDescCtrl.dispose();
    super.dispose();
  }

  Future<void> _refresh() async {
    await ref.read(tugasKelompokDetailProvider.notifier).loadDetail(widget.id);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(tugasKelompokDetailProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.background,
      body: state.isLoading && state.data == null
          ? _buildShimmer(isDark)
          : state.errorMessage != null && state.data == null
              ? _buildError(state.errorMessage!, isDark)
              : state.data != null
                  ? _buildContent(state.data!, isDark)
                  : _buildShimmer(isDark),
    );
  }

  Widget _buildContent(TugasKelompokDetailData data, bool isDark) {
    return RefreshIndicator(
      onRefresh: _refresh,
      color: AppColors.indigo600,
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          _KelompokHeader(
            onBack: () => context.pop(),
            assignment: data.assignment,
          ),
          const SizedBox(height: 16),
          const SizedBox(height: 16),
          if (data.myGroup == null) ...[
            _buildGroupSelection(data, isDark),
          ] else ...[
            _sectionTitle('Group Dashboard'),
            _buildGroupTabs(data, isDark),
            _buildGroupTabContent(data, isDark),
            const SizedBox(height: 16),
            _sectionTitle('Submission Panel'),
            _buildSubmissionPanel(data, isDark),
            if (data.pendingInvitations.isNotEmpty) ...[
              const SizedBox(height: 16),
              _sectionTitle('Pending Invitations'),
              _buildPendingInvitations(data.pendingInvitations, isDark),
            ],
            const SizedBox(height: 16),
            _sectionTitle('Monitoring Dashboard'),
            _buildMonitoringDashboard(data, isDark),
          ],
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildGroupSelection(TugasKelompokDetailData data, bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (data.assignment.formationMode == 'self-form' || data.assignment.formationMode == 'random_and_self_form')
            Container(
              margin: const EdgeInsets.only(bottom: 24),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppColors.indigo600.withValues(alpha: 0.1),
                    AppColors.primaryLight.withValues(alpha: 0.05)
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.indigo600.withValues(alpha: 0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.indigo600.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.group_add_rounded, color: AppColors.indigo600, size: 32),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Bentuk Kelompok Sendiri',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Buat kelompok baru dan ajak teman-teman Anda untuk bergabung',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 12, color: isDark ? Colors.white70 : Colors.black54),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () {
                         // Action to create group (would require a distinct endpoint)
                         ScaffoldMessenger.of(context).showSnackBar(
                           const SnackBar(content: Text('Fungsi buat kelompok akan segera hadir'))
                         );
                      },
                      icon: const Icon(Icons.add_rounded),
                      label: const Text('Buat Kelompok Baru'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.indigo600,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                ],
              ),
            ),

          _sectionTitle('Kelompok Tersedia'),
          const SizedBox(height: 16),
          _progressBar('Progress Pembentukan Kelompok Kelas', data.stats.total == 0 ? 0 : (data.stats.total - data.stats.notJoined) / data.stats.total, isDark),
          const SizedBox(height: 16),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 0.85,
            ),
            itemCount: data.allGroups.length,
            itemBuilder: (context, index) {
              final group = data.allGroups[index];
              final isFull = group.isFull;
              final memberPct = (group.maxMembers > 0) ? group.memberCount / group.maxMembers : 0.0;
              final isWarning = memberPct >= 0.7 && !isFull;
              
              Color statusColor = const Color(0xFF10B981); // Emerald
              String statusLabel = 'Tersedia';
              if (isFull) {
                statusColor = const Color(0xFFEF4444); // Red
                statusLabel = 'Penuh';
              } else if (isWarning) {
                statusColor = const Color(0xFFF59E0B); // Amber
                statusLabel = 'Hampir Penuh';
              }

              return Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: isDark ? Colors.white10 : Colors.black12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            group.name,
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        _smallBadge(statusLabel, statusColor),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 10,
                          backgroundColor: AppColors.indigo600.withValues(alpha: 0.2),
                          child: const Icon(Icons.person_rounded, size: 12, color: AppColors.indigo600),
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            group.leader.nama,
                            style: TextStyle(fontSize: 11, color: isDark ? Colors.white70 : Colors.black54),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const Spacer(),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '${group.memberCount} / ${group.maxMembers} Anggota',
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(999),
                          child: LinearProgressIndicator(
                            value: memberPct,
                            minHeight: 6,
                            backgroundColor: isDark ? Colors.white10 : Colors.grey[200],
                            valueColor: AlwaysStoppedAnimation<Color>(statusColor),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: isFull
                            ? null
                            : () => ref.read(tugasKelompokDetailProvider.notifier).joinGroup(widget.id, group.id),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: isFull ? (isDark ? Colors.white10 : Colors.grey[300]) : AppColors.indigo600,
                          foregroundColor: isFull ? Colors.grey : Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          padding: const EdgeInsets.symmetric(vertical: 6),
                        ),
                        child: const Text('Gabung', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _smallBadge(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withValues(alpha: 0.5)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (label == 'Penuh') ...[
            Icon(Icons.lock_rounded, size: 8, color: color),
            const SizedBox(width: 2),
          ],
          Text(label, style: TextStyle(color: color, fontSize: 8, fontWeight: FontWeight.w800)),
        ],
      ),
    );
  }

  Widget _buildGroupTabs(TugasKelompokDetailData data, bool isDark) {
    final tabs = [
      {'icon': Icons.chat_bubble_outline_rounded, 'label': 'Chat', 'count': data.messages.length},
      {'icon': Icons.folder_open_rounded, 'label': 'File', 'count': data.myGroup?.files.length ?? 0},
      {'icon': Icons.assignment_outlined, 'label': 'Tugas', 'count': data.myGroup?.tasks.length ?? 0},
      {'icon': Icons.people_outline_rounded, 'label': 'Anggota', 'count': data.myGroup?.members.length ?? 0},
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        height: 60,
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E293B) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isDark ? Colors.white10 : Colors.black12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: List.generate(tabs.length, (index) {
            final active = index == _tabIndex;
            final tab = tabs[index];
            final icon = tab['icon'] as IconData;
            final label = tab['label'] as String;
            final count = tab['count'] as int;

            return Expanded(
              child: GestureDetector(
                onTap: () => setState(() => _tabIndex = index),
                behavior: HitTestBehavior.opaque,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(icon, size: 20, color: active ? AppColors.indigo600 : (isDark ? Colors.white54 : Colors.black54)),
                      const SizedBox(height: 4),
                      Text(
                        active ? '$label ($count)' : label,
                        style: TextStyle(
                          fontSize: active ? 11 : 10,
                          fontWeight: active ? FontWeight.w700 : FontWeight.w500,
                          color: active ? AppColors.indigo600 : (isDark ? Colors.white54 : Colors.black54),
                        ),
                      ),
                      if (active) ...[
                        const SizedBox(height: 4),
                        Container(
                          width: 20,
                          height: 3,
                          decoration: BoxDecoration(
                            color: AppColors.indigo600,
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            );
          }),
        ),
      ),
    );
  }

  Widget _buildGroupTabContent(TugasKelompokDetailData data, bool isDark) {
    switch (_tabIndex) {
      case 0:
        return _buildChatTab(data, isDark);
      case 1:
        return _buildFilesTab(data, isDark);
      case 2:
        return _buildTasksTab(data, isDark);
      case 3:
        return _buildMembersTab(data, isDark);
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildChatTab(TugasKelompokDetailData data, bool isDark) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          if (data.messages.isEmpty)
            Container(
              padding: const EdgeInsets.symmetric(vertical: 40),
              alignment: Alignment.center,
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.indigo600.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.forum_outlined, size: 48, color: AppColors.indigo600),
                  ),
                  const SizedBox(height: 16),
                  const Text('Belum ada diskusi', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  Text('Mulai diskusi dengan anggota kelompok Anda', style: TextStyle(fontSize: 12, color: isDark ? Colors.white70 : Colors.black54)),
                ],
              ),
            )
          else
            ...data.messages.map((msg) {
              final isMine = msg.sender?.id == null; // Simple heuristic; adjust based on real auth user ID if available
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  mainAxisAlignment: isMine ? MainAxisAlignment.end : MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    if (!isMine) ...[
                      CircleAvatar(
                        radius: 14,
                        backgroundColor: AppColors.indigo600.withValues(alpha: 0.2),
                        child: Text(msg.sender?.nama.substring(0, 1).toUpperCase() ?? 'U', style: const TextStyle(fontSize: 12, color: AppColors.indigo600, fontWeight: FontWeight.w700)),
                      ),
                      const SizedBox(width: 8),
                    ],
                    Flexible(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: isMine ? AppColors.indigo600 : (isDark ? const Color(0xFF1E293B) : Colors.white),
                          borderRadius: BorderRadius.only(
                            topLeft: const Radius.circular(16),
                            topRight: const Radius.circular(16),
                            bottomLeft: Radius.circular(isMine ? 16 : 4),
                            bottomRight: Radius.circular(isMine ? 4 : 16),
                          ),
                          border: isMine ? null : Border.all(color: isDark ? Colors.white10 : Colors.black12),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.04),
                              blurRadius: 10,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: isMine ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                          children: [
                            if (!isMine) ...[
                              Text(msg.sender?.nama ?? 'User', style: TextStyle(color: isDark ? Colors.white70 : Colors.black54, fontSize: 11, fontWeight: FontWeight.w600)),
                              const SizedBox(height: 4),
                            ],
                            Text(msg.content, style: TextStyle(color: isMine ? Colors.white : (isDark ? Colors.white : Colors.black87), fontSize: 13, height: 1.4)),
                            if (msg.attachment != null) ...[
                              const SizedBox(height: 8),
                              GestureDetector(
                                onTap: () {},
                                child: Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: (isMine ? Colors.white : (isDark ? Colors.white : AppColors.indigo600)).withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(Icons.attachment_rounded, size: 14, color: isMine ? Colors.white70 : AppColors.indigo600),
                                      const SizedBox(width: 4),
                                      Flexible(child: Text(msg.attachment!.name ?? 'Attachment', style: TextStyle(color: isMine ? Colors.white : AppColors.indigo600, fontSize: 11), maxLines: 1, overflow: TextOverflow.ellipsis)),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                            const SizedBox(height: 4),
                            Text(
                              msg.createdAt,
                              style: TextStyle(color: (isMine ? Colors.white70 : (isDark ? Colors.white54 : Colors.black45)), fontSize: 9),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }),
          const SizedBox(height: 12),
          _buildChatInput(isDark),
        ],
      ),
    );
  }

  Widget _buildFilesTab(TugasKelompokDetailData data, bool isDark) {
    final files = data.myGroup?.files ?? [];
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (files.isEmpty)
            Container(
              padding: const EdgeInsets.symmetric(vertical: 40),
              alignment: Alignment.center,
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.indigo600.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.folder_off_outlined, size: 48, color: AppColors.indigo600),
                  ),
                  const SizedBox(height: 16),
                  const Text('Belum Ada File', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  Text('Upload file referensi atau hasil kerja kelompok di sini', textAlign: TextAlign.center, style: TextStyle(fontSize: 12, color: isDark ? Colors.white70 : Colors.black54)),
                ],
              ),
            )
          else
            ...files.map((file) {
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: isDark ? Colors.white10 : Colors.black12),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 8, offset: const Offset(0, 2)),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.indigo600.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.insert_drive_file_rounded, color: AppColors.indigo600),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(file.originalName, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600), maxLines: 1, overflow: TextOverflow.ellipsis),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Text(file.fileSizeFormatted ?? 'Ukuran tidak diketahui', style: TextStyle(fontSize: 11, color: isDark ? Colors.white54 : Colors.black54)),
                              if (file.uploader?.nama != null) ...[
                                Container(margin: const EdgeInsets.symmetric(horizontal: 6), width: 4, height: 4, decoration: BoxDecoration(color: isDark ? Colors.white38 : Colors.black38, shape: BoxShape.circle)),
                                Expanded(child: Text('Oleh ${file.uploader!.nama}', style: TextStyle(fontSize: 11, color: isDark ? Colors.white54 : Colors.black54), maxLines: 1, overflow: TextOverflow.ellipsis)),
                              ],
                            ],
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: () {},
                      icon: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: isDark ? Colors.white10 : Colors.grey[100],
                          shape: BoxShape.circle,
                        ),
                        child: Icon(Icons.download_rounded, size: 18, color: isDark ? Colors.white : Colors.black87),
                      ),
                    ),
                  ],
                ),
              );
            }),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () => _showFilePickerInfo(context),
            icon: const Icon(Icons.cloud_upload_outlined),
            label: const Text('Upload File Baru'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.indigo600,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              elevation: 0,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTasksTab(TugasKelompokDetailData data, bool isDark) {
    final tasks = data.myGroup?.tasks ?? [];
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (tasks.isEmpty)
            Container(
              padding: const EdgeInsets.symmetric(vertical: 40),
              alignment: Alignment.center,
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.indigo600.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.assignment_turned_in_outlined, size: 48, color: AppColors.indigo600),
                  ),
                  const SizedBox(height: 16),
                  const Text('Belum Ada Tugas Internal', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  Text('Buat pembagian tugas untuk mempermudah kerja kelompok', textAlign: TextAlign.center, style: TextStyle(fontSize: 12, color: isDark ? Colors.white70 : Colors.black54)),
                ],
              ),
            )
          else
            ...tasks.map((task) {
              Color statusColor = const Color(0xFF64748B);
              String statusLabel = 'TODO';
              if (task.status == 'in_progress') {
                statusColor = const Color(0xFF3B82F6);
                statusLabel = 'IN PROGRESS';
              } else if (task.status == 'completed') {
                statusColor = const Color(0xFF10B981);
                statusLabel = 'COMPLETED';
              }

              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 8, offset: const Offset(0, 2)),
                  ],
                  border: Border(
                    top: BorderSide(color: isDark ? Colors.white10 : Colors.black12),
                    right: BorderSide(color: isDark ? Colors.white10 : Colors.black12),
                    bottom: BorderSide(color: isDark ? Colors.white10 : Colors.black12),
                    left: BorderSide(color: statusColor, width: 4),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(child: Text(task.title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700))),
                        const SizedBox(width: 8),
                        _smallBadge(statusLabel, statusColor),
                      ],
                    ),
                    if (task.description != null && task.description!.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Text(task.description!, style: TextStyle(fontSize: 12, color: isDark ? Colors.white70 : Colors.black54)),
                    ],
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 12),
                      child: Divider(height: 1),
                    ),
                    Row(
                      children: [
                        const Icon(Icons.people_alt_outlined, size: 14, color: AppColors.indigo600),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Wrap(
                            spacing: -8,
                            children: task.assignees.take(3).map((a) {
                              return CircleAvatar(
                                radius: 12,
                                backgroundColor: AppColors.indigo600,
                                child: Text(a.nama.substring(0, 1).toUpperCase(), style: const TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.w700)),
                              );
                            }).toList()
                              ..addAll(
                                task.assignees.length > 3
                                    ? [
                                        CircleAvatar(
                                          radius: 12,
                                          backgroundColor: isDark ? Colors.white24 : Colors.grey[300],
                                          child: Text('+${task.assignees.length - 3}', style: TextStyle(fontSize: 10, color: isDark ? Colors.white : Colors.black87, fontWeight: FontWeight.w700)),
                                        )
                                      ]
                                    : [],
                              ),
                          ),
                        ),
                        if (task.priority != null)
                          _smallBadge(task.priority!.toUpperCase(), task.priority == 'high' ? const Color(0xFFEF4444) : (task.priority == 'medium' ? const Color(0xFFF59E0B) : const Color(0xFF3B82F6))),
                      ],
                    ),
                  ],
                ),
              );
            }),
          const SizedBox(height: 16),
          _buildAddTaskForm(isDark),
        ],
      ),
    );
  }

  Widget _buildMembersTab(TugasKelompokDetailData data, bool isDark) {
    final members = data.myGroup?.members ?? [];
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: isDark ? Colors.white10 : Colors.black12),
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 8, offset: const Offset(0, 2)),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Daftar Anggota', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.indigo600.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text('${members.length} Orang', style: const TextStyle(color: AppColors.indigo600, fontSize: 12, fontWeight: FontWeight.w600)),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                ...members.map((m) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Row(
                      children: [
                        Stack(
                          clipBehavior: Clip.none,
                          children: [
                            CircleAvatar(
                              radius: 20,
                              backgroundColor: m.isLeader ? const Color(0xFFF59E0B).withValues(alpha: 0.2) : AppColors.indigo600.withValues(alpha: 0.1),
                              child: Text(
                                m.nama.isNotEmpty ? m.nama[0].toUpperCase() : '?',
                                style: TextStyle(color: m.isLeader ? const Color(0xFFD97706) : AppColors.indigo600, fontWeight: FontWeight.w700, fontSize: 16),
                              ),
                            ),
                            if (m.isLeader)
                              Positioned(
                                bottom: -2,
                                right: -2,
                                child: Container(
                                  padding: const EdgeInsets.all(2),
                                  decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                                  child: const Icon(Icons.stars_rounded, color: Color(0xFFF59E0B), size: 14),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(m.nama, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600), maxLines: 1, overflow: TextOverflow.ellipsis),
                              const SizedBox(height: 2),
                              Text(m.nim ?? '-', style: TextStyle(fontSize: 12, color: isDark ? Colors.white54 : Colors.black54)),
                            ],
                          ),
                        ),
                        if (m.isLeader) _smallBadge('Ketua', const Color(0xFFF59E0B)) else _smallBadge('Anggota', const Color(0xFF64748B)),
                      ],
                    ),
                  );
                }),
              ],
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () => _showInviteInfo(context),
            icon: const Icon(Icons.person_add_outlined),
            label: const Text('Undang Anggota'),
            style: ElevatedButton.styleFrom(
              backgroundColor: isDark ? const Color(0xFF1E293B) : Colors.white,
              foregroundColor: AppColors.indigo600,
              side: const BorderSide(color: AppColors.indigo600),
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              elevation: 0,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubmissionPanel(TugasKelompokDetailData data, bool isDark) {
    final submission = data.myGroup?.submission;
    
    // Fallback if there is no submission at all
    if (submission == null) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E293B) : Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: AppColors.indigo600.withValues(alpha: 0.2)),
            boxShadow: [
              BoxShadow(
                color: AppColors.indigo600.withValues(alpha: 0.05),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFF59E0B).withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.pending_actions_rounded, size: 48, color: Color(0xFFD97706)),
              ),
              const SizedBox(height: 20),
              const Text('Belum Dikumpulkan', textAlign: TextAlign.center, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
              const SizedBox(height: 8),
              Text(
                'Segera kumpulkan tugas kelompok Anda sebelum batas waktu berakhir.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: isDark ? Colors.white70 : Colors.black54),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: () => ref.read(tugasKelompokDetailProvider.notifier).submitAssignment(widget.id),
                icon: const Icon(Icons.cloud_upload_outlined),
                label: const Text('Kumpulkan Tugas'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.indigo600,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 0,
                ),
              ),
            ],
          ),
        ),
      );
    }

    // Submitted State
    final isGraded = submission.grade != null;
    final double gradeVal = submission.grade ?? 0.0;
    Color gradeColor = const Color(0xFF64748B); // Not graded yet (Grey)
    if (isGraded) {
      if (gradeVal >= 85) {
        gradeColor = const Color(0xFF10B981); // A (Emerald)
      } else if (gradeVal >= 70) {
        gradeColor = const Color(0xFF3B82F6); // B (Blue)
      } else if (gradeVal >= 55) {
        gradeColor = const Color(0xFFF59E0B); // C (Amber)
      } else {
        gradeColor = const Color(0xFFEF4444); // D/E (Red)
      }
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E293B) : Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.2)),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF10B981).withValues(alpha: 0.05),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 24),
                    ),
                    const SizedBox(width: 12),
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Tugas Terkumpul', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                      ],
                    ),
                  ],
                ),
                if (submission.isLate == true)
                  _smallBadge('Terlambat', const Color(0xFFEF4444)),
              ],
            ),
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 20),
              child: Divider(height: 1),
            ),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Waktu Pengumpulan', style: TextStyle(fontSize: 12, color: isDark ? Colors.white54 : Colors.black54)),
                      const SizedBox(height: 4),
                      Text(submission.submittedAt ?? 'Tidak diketahui', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
                Container(width: 1, height: 40, color: isDark ? Colors.white10 : Colors.black12, margin: const EdgeInsets.symmetric(horizontal: 16)),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Nilai', style: TextStyle(fontSize: 12, color: isDark ? Colors.white54 : Colors.black54)),
                      const SizedBox(height: 4),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(submission.grade?.toString() ?? '-', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: gradeColor, height: 1)),
                          if (isGraded) const Text(' / 100', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, height: 1.5)),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            if (submission.gradingNotes != null && submission.gradingNotes!.isNotEmpty) ...[
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? Colors.white.withValues(alpha: 0.05) : Colors.grey[50],
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: isDark ? Colors.white10 : Colors.black12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.feedback_outlined, size: 16, color: isDark ? Colors.white54 : Colors.black54),
                        const SizedBox(width: 8),
                        Text('Feedback Dosen', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: isDark ? Colors.white70 : Colors.black87)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(submission.gradingNotes!, style: TextStyle(fontSize: 13, color: isDark ? Colors.white70 : Colors.black87, height: 1.4)),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 20),
            OutlinedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.find_in_page_outlined),
              label: const Text('Lihat File yang Dikumpulkan'),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.indigo600,
                side: const BorderSide(color: AppColors.indigo600),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPendingInvitations(List<TugasKelompokInvitation> items, bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: items.map((inv) {
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF0F172A) : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: isDark ? Colors.white10 : Colors.black12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(inv.groupName, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                Text('Inviter: ${inv.inviterName}', style: TextStyle(fontSize: 11, color: isDark ? Colors.white70 : Colors.black54)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () => ref.read(tugasKelompokDetailProvider.notifier).respondInvitation(widget.id, inv.id, true),
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981), foregroundColor: Colors.white),
                        child: const Text('Accept'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => ref.read(tugasKelompokDetailProvider.notifier).respondInvitation(widget.id, inv.id, false),
                        child: const Text('Decline'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildMonitoringDashboard(TugasKelompokDetailData data, bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          _monitorCard('Completion Rate', '${data.myGroup?.progress?.toStringAsFixed(0) ?? '0'}%', const Color(0xFF10B981), isDark),
          const SizedBox(height: 12),
          _monitorCard('Collaboration Pulse', '${data.messages.length} msg/24h', const Color(0xFF3B82F6), isDark),
          const SizedBox(height: 12),
          _monitorCard('Risk Score', '${data.stats.notJoined} flags', const Color(0xFFF59E0B), isDark),
        ],
      ),
    );
  }

  Widget _monitorCard(String title, String value, Color color, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? Colors.white10 : Colors.black12),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(color: color.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
            child: Icon(Icons.insights_rounded, color: color),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                Text(value, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: color)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAddTaskForm(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF111827) : const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        children: [
          TextField(
            controller: _taskTitleCtrl,
            decoration: const InputDecoration(hintText: 'Judul tugas'),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _taskDescCtrl,
            maxLines: 2,
            decoration: const InputDecoration(hintText: 'Deskripsi singkat'),
          ),
          const SizedBox(height: 8),
          Align(
            alignment: Alignment.centerRight,
            child: ElevatedButton(
              onPressed: () {
                final title = _taskTitleCtrl.text.trim();
                if (title.isEmpty) return;
                ref.read(tugasKelompokDetailProvider.notifier).addTask(
                      widget.id,
                      title: title,
                      description: _taskDescCtrl.text.trim().isEmpty ? null : _taskDescCtrl.text.trim(),
                      priority: 'medium',
                    );
                _taskTitleCtrl.clear();
                _taskDescCtrl.clear();
              },
              child: const Text('Tambah Tugas'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChatInput(bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: isDark ? Colors.white10 : Colors.black12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          IconButton(
            onPressed: () => _showFilePickerInfo(context),
            icon: Icon(Icons.attach_file_rounded, color: isDark ? Colors.white54 : Colors.black54),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 40, minHeight: 40),
          ),
          Expanded(
            child: Container(
              margin: const EdgeInsets.only(bottom: 2),
              child: TextField(
                controller: _chatCtrl,
                minLines: 1,
                maxLines: 4,
                textInputAction: TextInputAction.send,
                onSubmitted: (_) {
                  final text = _chatCtrl.text.trim();
                  if (text.isEmpty) return;
                  _chatCtrl.clear();
                  ref.read(tugasKelompokDetailProvider.notifier).sendMessage(widget.id, text);
                },
                style: const TextStyle(fontSize: 14),
                decoration: InputDecoration(
                  hintText: 'Ketik pesan...',
                  hintStyle: TextStyle(color: isDark ? Colors.white38 : Colors.black38, fontSize: 13),
                  border: InputBorder.none,
                  isDense: true,
                  contentPadding: const EdgeInsets.symmetric(vertical: 10),
                ),
              ),
            ),
          ),
          Container(
            margin: const EdgeInsets.only(left: 8),
            decoration: const BoxDecoration(
              color: AppColors.indigo600,
              shape: BoxShape.circle,
            ),
            child: IconButton(
              onPressed: () {
                final text = _chatCtrl.text.trim();
                if (text.isEmpty) return;
                _chatCtrl.clear();
                ref.read(tugasKelompokDetailProvider.notifier).sendMessage(widget.id, text);
              },
              icon: const Icon(Icons.send_rounded, color: Colors.white, size: 18),
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(minWidth: 40, minHeight: 40),
            ),
          ),
        ],
      ),
    );
  }

  Widget _progressBar(String label, double value, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(999),
          child: LinearProgressIndicator(
            value: value,
            minHeight: 8,
            backgroundColor: isDark ? Colors.white10 : Colors.black12,
            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.indigo600),
          ),
        ),
      ],
    );
  }

  Widget _sectionTitle(String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Text(text, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
    );
  }

  Widget _buildError(String message, bool isDark) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline, color: isDark ? Colors.white70 : Colors.red, size: 40),
            const SizedBox(height: 8),
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: 12),
            ElevatedButton(onPressed: _refresh, child: const Text('Coba Lagi')),
          ],
        ),
      ),
    );
  }

  Widget _buildShimmer(bool isDark) {
    return Shimmer.fromColors(
      baseColor: isDark ? const Color(0xFF1E293B) : Colors.grey[300]!,
      highlightColor: isDark ? const Color(0xFF334155) : Colors.grey[100]!,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(height: 220, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24))),
          const SizedBox(height: 16),
          Container(height: 120, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20))),
          const SizedBox(height: 12),
          Container(height: 160, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20))),
        ],
      ),
    );
  }

  void _showFilePickerInfo(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Upload File'),
          content: const Text('Integrasi file picker akan menggunakan endpoint upload. Implementasi tambahan diperlukan.'),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('OK')),
          ],
        );
      },
    );
  }

  void _showInviteInfo(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Invite Anggota'),
          content: const Text('Fitur undang anggota menggunakan endpoint invite. Tambahkan pencarian mahasiswa untuk produksi.'),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('OK')),
          ],
        );
      },
    );
  }
}

class _KelompokHeader extends StatefulWidget {
  const _KelompokHeader({required this.onBack, required this.assignment});

  final VoidCallback onBack;
  final TugasKelompokAssignment assignment;

  @override
  State<_KelompokHeader> createState() => _KelompokHeaderState();
}

class _KelompokHeaderState extends State<_KelompokHeader> with SingleTickerProviderStateMixin {
  late final AnimationController _gradientCtrl;
  late Timer _clockTimer;
  String _clock = '';

  @override
  void initState() {
    super.initState();
    _gradientCtrl = AnimationController(vsync: this, duration: const Duration(seconds: 5))..repeat(reverse: true);
    _clock = _timeNow();
    _clockTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _clock = _timeNow());
    });
  }

  @override
  void dispose() {
    _gradientCtrl.dispose();
    _clockTimer.cancel();
    super.dispose();
  }

  String _timeNow() {
    final now = DateTime.now();
    return '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
  }

  Widget _buildUrgencyBadge() {
    if (widget.assignment.submissionDeadline == null) return const SizedBox.shrink();
    final deadline = DateTime.tryParse(widget.assignment.submissionDeadline!);
    if (deadline == null) return const SizedBox.shrink();
    
    final diff = deadline.difference(DateTime.now());
    Color color;
    String label = 'Safe';
    IconData icon = Icons.timer_outlined;

    if (diff.isNegative) {
      color = Colors.redAccent;
      label = 'Terlewat';
      icon = Icons.error_outline_rounded;
    } else if (diff.inHours < 24) {
      color = Colors.orangeAccent;
      label = 'Segera';
      icon = Icons.warning_amber_rounded;
    } else {
      color = Colors.greenAccent;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withValues(alpha: 0.5)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 4),
          Text(label, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final assignment = widget.assignment;
    return AnimatedBuilder(
      animation: _gradientCtrl,
      builder: (context, child) {
        return Container(
          clipBehavior: Clip.antiAlias,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment(-1.0 + _gradientCtrl.value, -1.0),
              end: Alignment(1.0, 1.0 - _gradientCtrl.value),
              colors: [
                AppColors.primaryDark,
                AppColors.primary,
                AppColors.primaryLight.withValues(alpha: 0.8),
              ],
            ),
            borderRadius: const BorderRadius.only(
              bottomLeft: Radius.circular(32),
              bottomRight: Radius.circular(32),
            ),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withValues(alpha: 0.3),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Stack(
            children: [
              Positioned.fill(
                child: Opacity(
                  opacity: 0.08,
                  child: Image.asset('assets/images/batik_pattern.png', fit: BoxFit.cover, errorBuilder: (_, __, ___) => const SizedBox.shrink()),
                ),
              ),
              Positioned(
                top: -50,
                right: -50,
                child: Container(
                  width: 150,
                  height: 150,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [Colors.white.withValues(alpha: 0.2), Colors.transparent],
                    ),
                  ),
                ),
              ),
              SafeArea(
                bottom: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          GestureDetector(
                            onTap: widget.onBack,
                            child: const Padding(
                              padding: EdgeInsets.only(right: 8, top: 4, bottom: 4),
                              child: Icon(Icons.arrow_back_rounded, color: Colors.white, size: 24),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Tugas Kelompok', style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w500)),
                                Text(assignment.course.nama, style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w700), maxLines: 1, overflow: TextOverflow.ellipsis),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.access_time_rounded, color: Colors.white, size: 14),
                                const SizedBox(width: 4),
                                Text(_clock, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600, fontFamily: 'monospace')),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      Text(
                        assignment.title.toUpperCase(),
                        style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w800, height: 1.2),
                      ),
                      const SizedBox(height: 16),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          _badge(Icons.group_rounded, _formationLabel(assignment.formationMode)),
                          _badge(Icons.group_add_rounded, 'Min. ${assignment.course.id == 0 ? 1 : assignment.course.id} - Max. ${assignment.maxMembers ?? 0} Anggota'),
                          if (assignment.isLocked) _badge(Icons.lock_rounded, 'LOCKED', color: Colors.redAccent),
                          _buildUrgencyBadge(),
                        ],
                      ),
                      const SizedBox(height: 20),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                        ),
                        child: Column(
                          children: [
                            _deadlineRow(Icons.groups_rounded, 'Batas Pembentukan', assignment.formationDeadlineDisplay ?? '-'),
                            const Padding(
                              padding: EdgeInsets.symmetric(vertical: 8.0),
                              child: Divider(color: Colors.white10, height: 1),
                            ),
                            _deadlineRow(Icons.file_upload_rounded, 'Batas Pengumpulan', assignment.submissionDeadlineDisplay ?? '-'),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  String _formationLabel(String mode) {
    switch (mode) {
      case 'random':
        return 'Otomatis Ditentukan Sistem';
      case 'manual':
        return 'Ditentukan Dosen';
      case 'self-form':
        return 'Bentuk Sendiri Mahasiswa';
      default:
        return 'Self-Form';
    }
  }

  Widget _badge(IconData icon, String label, {Color color = Colors.white}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 6),
          Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _deadlineRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, size: 16, color: Colors.white),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(label, style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w500)),
        ),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
      ],
    );
  }
}
